import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export const configProvider = {
  provide: 'APP_CONFIG',
  useFactory: (configService: ConfigService): AppConfig => {
    const driver = configService.get<string>('DATABASE_DRIVER');
    const url = configService.get<string>('DATABASE_URL');

    return {
      database: {
        driver,
        url,
      },
    };
  },
  inject: [ConfigService],
};
