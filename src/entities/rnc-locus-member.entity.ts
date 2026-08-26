import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { bigintTransformer, RncLocus } from './rnc-locus.entity';

@Entity({ name: 'rnc_locus_members', schema: 'rnacen' })
export class RncLocusMember {
  @PrimaryColumn({ name: 'id', type: 'bigint', transformer: bigintTransformer })
  id: number;

  @Column({ name: 'urs_taxid', type: 'text', nullable: true })
  ursTaxid: string;

  @Column({ name: 'region_id', type: 'int4', nullable: true })
  regionId: number;

  @Column({ name: 'locus_id', type: 'bigint', transformer: bigintTransformer })
  locusId: number;

  @Column({ name: 'membership_status', type: 'text', nullable: true })
  membershipStatus: string;

  @ManyToOne(() => RncLocus, (locus) => locus.locusMembers)
  @JoinColumn({ name: 'locus_id' })
  locus: RncLocus;
}
