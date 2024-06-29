
interface IDatabase {
  host: string;
  type: string;
  name: string;
  port: number;
  // url: string;
  username: string;
  password: string;
  database: string;
  entities: string[];
  synchronize: boolean;

  migrationsRun?: boolean;
  logging?: boolean;
  autoLoadEntities?: boolean;
  migrations?: string[];
  migrationsTableName: string;
  cli?: {
    migrationsDir?: string;
  };
}

interface IAgora  {
  appId:string,
  appCertificate:string,
  customerKey: string,
  customerSecret: string
}


export interface IConfig {
  port: number;
  database: IDatabase;
  agora:IAgora,
  newPasswordBytes: number;
  codeBytes: number;
  HTTP_TIMEOUT: number;
  HTTP_MAX_REDIRECTS: number,
}
