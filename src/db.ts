import { DataSource } from 'typeorm';
import { RncLocus } from './entities/rnc-locus.entity';
import { RncLocusMember } from './entities/rnc-locus-member.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [RncLocus, RncLocusMember],
});
