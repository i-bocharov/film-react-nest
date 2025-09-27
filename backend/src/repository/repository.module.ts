import { Module } from '@nestjs/common';
import { AppConfig, configProvider } from 'src/app.config.provider';
import { IFilmRepository } from 'src/films/film.repository';
import { InMemoryFilmRepository } from './in-memory-film.repository';
import { InMemoryOrderRepository } from './in-memory-order.repository';
import { IOrderRepository } from 'src/order/order.repository';

@Module({
  providers: [
    configProvider,
    InMemoryFilmRepository,
    InMemoryOrderRepository,
    {
      // Предоставляем IFilmRepository, используя фабрику для условного выбора реализации.
      provide: IFilmRepository,
      useFactory: (config: AppConfig, inMemoryRepo: InMemoryFilmRepository) => {
        // Если драйвер MongoDB, вернется соответствующий репозиторий (закомментировано).
        // Иначе используется In-Memory репозиторий.
        if (config.database.driver === 'mongodb') {
          // return mongoRepo;
        }

        return inMemoryRepo;
      },
      inject: [configProvider.provide, InMemoryFilmRepository],
    },
    {
      // Предоставляем IOrderRepository, используя фабрику для условного выбора реализации.
      provide: IOrderRepository,
      useFactory: (
        config: AppConfig,
        inMemoryRepo: InMemoryOrderRepository,
      ) => {
        // Если драйвер MongoDB, вернется соответствующий репозиторий (закомментировано).
        // Иначе используется In-Memory репозиторий.
        if (config.database.driver === 'mongodb') {
          // return mongoRepo;
        }

        return inMemoryRepo;
      },
      inject: [configProvider.provide, InMemoryOrderRepository],
    },
  ],
  exports: [IFilmRepository, IOrderRepository],
})
export class RepositoryModule {}
