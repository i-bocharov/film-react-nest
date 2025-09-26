import { Module } from '@nestjs/common';
import { InMemoryFilmRepository } from './in-memory-film.repository';
import { AppConfig, configProvider } from 'src/app.config.provider';
import { IFilmRepository } from 'src/films/film.repository';

@Module({
  providers: [
    InMemoryFilmRepository,
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
  ],
  exports: [IFilmRepository],
})
export class RepositoryModule {}
