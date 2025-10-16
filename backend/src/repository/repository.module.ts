import { Abstract, FactoryProvider, Module, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, configProvider } from 'src/app.config.provider';

// Импорты интерфейсов (абстракций) репозиториев
import { IFilmRepository } from 'src/films/film.repository';
import { IOrderRepository } from 'src/order/order.repository';

// Импорты конкретных реализаций репозиториев
import { InMemoryFilmRepository } from './in-memory-film.repository';
import { InMemoryOrderRepository } from './in-memory-order.repository';
import { MongoFilmRepository } from './mongo-film.repository';
import { MongoOrderRepository } from './mongo-order.repository';

// Импорты схем для Mongoose
import { Film, FilmSchema } from 'src/films/schemas/film.schema';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';

// Импорты сущностей для TypeORM
import { Film as FilmOrm } from 'src/films/entities/film.typeorm.entity';
import { Schedule as ScheduleOrm } from 'src/films/entities/schedule.typeorm.entity';
import { Order as OrderOrm } from 'src/order/entities/order.typeorm.entity';
import { PostgresFilmRepository } from './postgres-film.repository';
import { PostgresOrderRepository } from './postgres-order.repository';

/**
 * Определяем режим работы (драйвер) на самом раннем этапе.
 * Эти переменные используется для условного включения/выключения модулей и провайдеров,
 * которые зависят от конкретной базы данных.
 * `dotenv/config` должен быть импортирован в main.ts как можно раньше.
 */
const isMongoDriver = process.env.DATABASE_DRIVER === 'mongodb';
const isPostgresDriver = process.env.DATABASE_DRIVER === 'postgres';

/**
 * Универсальная функция-генератор для создания провайдеров репозиториев.
 * Устраняет дублирование кода провайдеров и централизует логику выбора реализации
 * в зависимости от настроек приложения.
 * @param provideToken - Токен зависимости (абстрактный класс, например IFilmRepository).
 * @param inMemoryClass - Класс-реализация для режима in-memory.
 * @param mongoClass - Класс-реализация для режима mongodb.
 * @param postgresClass - Класс-реализация для режима postgres.
 * @returns Готовый объект провайдера для NestJS.
 */
function createRepositoryProvider<T, I extends T, M extends T, P extends T>(
  provideToken: Abstract<T>,
  inMemoryClass: Type<I>,
  mongoClass: Type<M> | null,
  postgresClass: Type<P> | null,
): FactoryProvider<T> {
  return {
    provide: provideToken,
    useFactory: (
      config: AppConfig,
      inMemoryRepo: I,
      mongoRepo?: M,
      postgresRepo?: P,
    ): T => {
      switch (config.database.driver) {
        case 'mongodb':
          if (mongoRepo) return mongoRepo;
        case 'postgres':
          if (postgresRepo) return postgresRepo;
        default:
          return inMemoryRepo;
      }
    },
    inject: [
      configProvider.provide,
      inMemoryClass,
      ...(mongoClass ? [{ token: mongoClass, optional: true }] : []),
      ...(postgresClass ? [{ token: postgresClass, optional: true }] : []),
    ],
  };
}

/**
 * RepositoryModule - центральный модуль, отвечающий за слой доступа к данным.
 * Он инкапсулирует всю логику, связанную с базами данных и репозиториями,
 * и предоставляет остальному приложению простые интерфейсы (IFilmRepository, IOrderRepository).
 */
@Module({
  imports: [
    // Условный импорт модуля для MongoDB
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
    // Условный импорт модуля для PostgreSQL
    ...(isPostgresDriver
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
              type: 'postgres',
              host: config.get<string>('POSTGRES_HOST'),
              port: config.get<number>('POSTGRES_PORT'),
              username: config.get<string>('POSTGRES_USERNAME'),
              password: config.get<string>('POSTGRES_PASSWORD'),
              database: config.get<string>('POSTGRES_DATABASE'),
              entities: [FilmOrm, ScheduleOrm, OrderOrm],
              synchronize:
                config.get<string>('POSTGRES_SYNCHRONIZE') === 'true',
            }),
            inject: [ConfigService],
          }),
          TypeOrmModule.forFeature([FilmOrm, ScheduleOrm, OrderOrm]),
        ]
      : []),
  ],
  providers: [
    configProvider,
    InMemoryFilmRepository,
    InMemoryOrderRepository,
    ...(isMongoDriver ? [MongoFilmRepository, MongoOrderRepository] : []),
    ...(isPostgresDriver
      ? [PostgresFilmRepository, PostgresOrderRepository]
      : []),

    createRepositoryProvider(
      IFilmRepository,
      InMemoryFilmRepository,
      MongoFilmRepository,
      PostgresFilmRepository,
    ),
    createRepositoryProvider(
      IOrderRepository,
      InMemoryOrderRepository,
      MongoOrderRepository,
      PostgresOrderRepository,
    ),
  ],
  exports: [IFilmRepository, IOrderRepository],
})
export class RepositoryModule {}
