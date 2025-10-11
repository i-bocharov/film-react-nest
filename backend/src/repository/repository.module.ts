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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Film.name, schema: FilmSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [
    configProvider,
    InMemoryFilmRepository,
    MongoFilmRepository,
    InMemoryOrderRepository,
    MongoOrderRepository,
    {
      // Предоставляем IFilmRepository, используя фабрику для условного выбора реализации.
      provide: IFilmRepository,
      useFactory: (
        config: AppConfig,
        inMemoryRepo: InMemoryFilmRepository,
        mongoRepo: MongoFilmRepository,
      ) => {
        // Если драйвер MongoDB, вернется соответствующий репозиторий.
        // Иначе используется In-Memory репозиторий.
        if (config.database.driver === 'mongodb') {
          return mongoRepo;
        }

        return inMemoryRepo;
      },
      inject: [
        configProvider.provide,
        InMemoryFilmRepository,
        MongoFilmRepository,
      ],
    },
    {
      // Предоставляем IOrderRepository, используя фабрику для условного выбора реализации.
      provide: IOrderRepository,
      useFactory: (
        config: AppConfig,
        inMemoryRepo: InMemoryOrderRepository,
        mongoRepo: MongoOrderRepository,
      ) => {
        // Если драйвер MongoDB, вернется соответствующий репозиторий.
        // Иначе используется In-Memory репозиторий.
        if (config.database.driver === 'mongodb') {
          return mongoRepo;
        }

        return inMemoryRepo;
      },
      inject: [
        configProvider.provide,
        InMemoryOrderRepository,
        MongoOrderRepository,
      ],
    },
  ],
  exports: [IFilmRepository, IOrderRepository],
})
export class RepositoryModule {}
