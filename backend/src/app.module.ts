import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'node:path';

import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import { RepositoryModule } from './repository/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
    RepositoryModule,
    FilmsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
