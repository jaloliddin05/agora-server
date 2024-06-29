import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";

import { IConfig } from './config.interface';

dotenv.config();

const database = {
  host: process.env.DB_HOST,
  type: process.env.DB_TYPE,
  name: 'default',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
  autoLoadEntities: true,
  entities: ['./dist/**/*.entity.js'],
  synchronize: true,
  migrations: [`./dist/src/db/migrations/*{.ts,.js}`],
  migrationsTableName: 'migration',
}

const agora = {
  appId: process.env.appId,
  appCertificate:process.env.appCertificate,
  customerKey: process.env.customerKey,
  customerSecret: process.env.customerSecret
}

export default (): IConfig => ({
  port: parseInt(process.env.PORT, 10) || 8000,
  database,
  agora,
  newPasswordBytes: 4,
  codeBytes: 2,
  HTTP_TIMEOUT: 20000,
  HTTP_MAX_REDIRECTS: 5,
});


export const connectionSource = new DataSource(database as DataSourceOptions);