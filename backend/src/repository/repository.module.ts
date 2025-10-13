import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig, configProvider } from 'src/app.config.provider';

// Импорты для фильмов
import { IFilmRepository } from 'src/films/film.repository';
import { InMemoryFilmRepository } from './in-memory-film.repository';
import { MongoFilmRepository } from './mongo-film.repository';
import { Film, FilmSchema } from 'src/films/schemas/film.schema';

// Импорты для заказов
import { IOrderRepository } from 'src/order/order.repository';
import { InMemoryOrderRepository } from './in-memory-order.repository';
import { MongoOrderRepository } from './mongo-order.repository';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';

const isMongoDriver = process.env.DATABASE_DRIVER === 'mongodb';

@Module({
  imports: [
    ...(isMongoDriver
      ? [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              uri: configService.get<string>('DATABASE_URL'),
            }),
            inject: [ConfigService],
          }),
          MongooseModule.forFeature([
            { name: Film.name, schema: FilmSchema },
            { name: Order.name, schema: OrderSchema },
          ]),
        ]
      : []),
  ],
  providers: [
    configProvider,
    InMemoryFilmRepository,
    InMemoryOrderRepository,
    ...(isMongoDriver ? [MongoFilmRepository, MongoOrderRepository] : []),
    {
      // Предоставляем IFilmRepository, используя фабрику для условного выбора реализации.
      provide: IFilmRepository,
      useFactory: (
        config: AppConfig,
        inMemoryRepo: InMemoryFilmRepository,
        mongoRepo?: MongoFilmRepository,
      ) => {
        // Если драйвер MongoDB, вернется соответствующий репозиторий.
        // Иначе используется In-Memory репозиторий.
        switch (config.database.driver) {
          case 'mongodb':
            return mongoRepo;
          default:
            return inMemoryRepo;
        }
      },
      inject: [
        configProvider.provide,
        InMemoryFilmRepository,
        {
          token: MongoFilmRepository,
          optional: true,
        },
      ],
    },
    {
      // Предоставляем IOrderRepository, используя фабрику для условного выбора реализации.
      provide: IOrderRepository,
      useFactory: (
        config: AppConfig,
        inMemoryRepo: InMemoryOrderRepository,
        mongoRepo?: MongoOrderRepository,
      ) => {
        // Если драйвер MongoDB, вернется соответствующий репозиторий.
        // Иначе используется In-Memory репозиторий.
        switch (config.database.driver) {
          case 'mongodb':
            return mongoRepo;
          default:
            return inMemoryRepo;
        }
      },
      inject: [
        configProvider.provide,
        InMemoryOrderRepository,
        {
          token: MongoOrderRepository,
          optional: true,
        },
      ],
    },
  ],
  exports: [IFilmRepository, IOrderRepository],
})
export class RepositoryModule {}
