import { Column, Entity, OneToMany, PrimaryColumn, ValueTransformer } from 'typeorm';
import { RncLocusMember } from './rnc-locus-member.entity';

export const bigintTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : parseInt(value, 10)),
};

@Entity({ name: 'rnc_locus', schema: 'rnacen' })
export class RncLocus {
  @PrimaryColumn({ name: 'id', type: 'bigint', transformer: bigintTransformer })
  id: number;

  @Column({ name: 'assembly_id', type: 'text', nullable: true })
  assemblyId: string;

  @Column({ name: 'locus_name', type: 'text', nullable: true })
  locusName: string;

  @Column({ name: 'public_locus_name', type: 'text', nullable: true })
  publicLocusName: string;

  @Column({ name: 'chromosome', type: 'text', nullable: true })
  chromosome: string;

  @Column({ name: 'strand', type: 'text', nullable: true })
  strand: string;

  @Column({ name: 'locus_start', type: 'int4', nullable: true })
  locusStart: number;

  @Column({ name: 'locus_stop', type: 'int4', nullable: true })
  locusStop: number;

  @Column({ name: 'member_count', type: 'int4', nullable: true })
  memberCount: number;

  @OneToMany(() => RncLocusMember, (member) => member.locus)
  locusMembers: RncLocusMember[];
}
