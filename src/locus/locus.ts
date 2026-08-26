import { Request, Response } from 'express';
import { AppDataSource } from '../db';
import { RncLocus } from '../entities/rnc-locus.entity';
import { RncLocusMember } from '../entities/rnc-locus-member.entity';

export const LIMITED_ALLOWED_REGION_IDS = [86118093, 86696489, 88186467];
const SORT_FIELDS = ['id', 'locusStart', 'locusStop', 'memberCount'];

function toIntArray(value: any) {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v: string) => parseInt(v, 10)).filter((v: number) => !isNaN(v));
}

function wantsLocusMembers(value: any) {
  if (!value) return false;
  const arr = Array.isArray(value) ? value : [value];
  return arr.includes('locusMembers');
}

export async function getLocusList(req: Request, res: Response) {
  const user = (req as any).user as { username: string; role: string };
  const query = req.query;

  const wantsSideloading = wantsLocusMembers(query.sideloading);
  const id = toIntArray(query.id);
  const assemblyId = query.assemblyId as string | undefined;
  let regionId = toIntArray(query.regionId);
  const membershipStatus = query.membershipStatus as string | undefined;
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit
    ? Math.min(parseInt(query.limit as string, 10), 1000)
    : 1000;
  const sortBy = SORT_FIELDS.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : 'id';
  const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

  if (user.role === 'normal') {
    if (wantsSideloading) {
      return res.status(403).json({ message: 'This role cannot use sideloading' });
    }
    if ((regionId && regionId.length) || membershipStatus) {
      return res
        .status(403)
        .json({ message: 'This role cannot filter by regionId or membershipStatus' });
    }
  }

  if (user.role === 'limited') {
    const allowedRegionIds = new Set(LIMITED_ALLOWED_REGION_IDS);
    regionId =
      regionId && regionId.length
        ? regionId.filter((regionIdValue) => allowedRegionIds.has(regionIdValue))
        : [...LIMITED_ALLOWED_REGION_IDS];
    if (regionId.length === 0) {
      return res.json({ data: [], total: 0, page, limit });
    }
  }

  const locusRepository = AppDataSource.getRepository(RncLocus);
  const memberRepository = AppDataSource.getRepository(RncLocusMember);

  const locusQueryBuilder = locusRepository.createQueryBuilder('locus');

  if (id && id.length) {
    locusQueryBuilder.andWhere('locus.id IN (:...ids)', { ids: id });
  }
  if (assemblyId) {
    locusQueryBuilder.andWhere('locus.assemblyId = :assemblyId', { assemblyId });
  }
  if ((regionId && regionId.length) || membershipStatus) {
    const matchingLocusIdsSubQuery = locusQueryBuilder
      .subQuery()
      .select('member.locusId', 'locusId')
      .from(RncLocusMember, 'member');
    if (regionId && regionId.length) {
      matchingLocusIdsSubQuery.andWhere('member.regionId IN (:...regionIds)', {
        regionIds: regionId,
      });
    }
    if (membershipStatus) {
      matchingLocusIdsSubQuery.andWhere('member.membershipStatus = :membershipStatus', {
        membershipStatus,
      });
    }
    locusQueryBuilder.andWhere(`locus.id IN (${matchingLocusIdsSubQuery.getQuery()})`);
    locusQueryBuilder.setParameters(matchingLocusIdsSubQuery.getParameters());
  }

  locusQueryBuilder.orderBy(`locus.${sortBy}`, sortOrder as 'ASC' | 'DESC');
  locusQueryBuilder.skip((page - 1) * limit).take(limit);

  const [locusRows, total] = await locusQueryBuilder.getManyAndCount();

  const canSideload = wantsSideloading && (user.role === 'admin' || user.role === 'limited');
  const membersByLocusId = new Map<number, RncLocusMember[]>();

  if (canSideload && locusRows.length) {
    const memberQueryBuilder = memberRepository
      .createQueryBuilder('member')
      .where('member.locusId IN (:...locusIds)', {
        locusIds: locusRows.map((locus) => locus.id),
      });
    if (user.role === 'limited' && regionId && regionId.length) {
      memberQueryBuilder.andWhere('member.regionId IN (:...regionIds)', {
        regionIds: regionId,
      });
    }
    const members = await memberQueryBuilder.getMany();
    for (const member of members) {
      const membersForLocus = membersByLocusId.get(member.locusId) ?? [];
      membersForLocus.push(member);
      membersByLocusId.set(member.locusId, membersForLocus);
    }
  }

  const data = locusRows.map((locus) => {
    const locusResponse: Record<string, unknown> = {
      id: locus.id,
      assemblyId: locus.assemblyId,
      locusName: locus.locusName,
      publicLocusName: locus.publicLocusName,
      chromosome: locus.chromosome,
      strand: locus.strand,
      locusStart: locus.locusStart,
      locusStop: locus.locusStop,
      memberCount: locus.memberCount,
    };
    if (canSideload) {
      locusResponse.locusMembers = (membersByLocusId.get(locus.id) ?? []).map((member) => ({
        locusMemberId: member.id,
        regionId: member.regionId,
        locusId: member.locusId,
        membershipStatus: member.membershipStatus,
        ursTaxid: member.ursTaxid,
      }));
    }
    return locusResponse;
  });

  res.json({ data, total, page, limit });
}
