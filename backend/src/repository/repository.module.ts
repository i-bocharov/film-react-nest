import { Abstract, Module, Provider, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, configProvider } from 'src/app.config.provider';

// Импорты интерфейсов (абстракций) репозиториев
import { IFilmRepository } from 'src/films/film.repository';
import { IOrderRepository } from 'src/order/order.repository';

// Импорты конкретных реализаций репозиториев
import { InMemoryFilmRepository } from './in-memory-film.repository';
import { MongoFilmRepository } from './mongo-film.repository';
import { InMemoryOrderRepository } from './in-memory-order.repository';
import { MongoOrderRepository } from './mongo-order.repository';

// Импорты Mongoose-схем, необходимых для Mongo-реализаций
import { Film, FilmSchema } from 'src/films/schemas/film.schema';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';

/**
 * Определяем режим работы (драйвер) на самом раннем этапе.
 * Эта переменная используется для условного включения/выключения модулей и провайдеров,
 * которые зависят от конкретной базы данных (в данном случае, MongoDB).
 * `dotenv/config` должен быть импортирован в main.ts как можно раньше.
 */
const isMongoDriver = process.env.DATABASE_DRIVER === 'mongodb';

/**
 * Универсальная функция-генератор для создания провайдеров репозиториев.
 * Устраняет дублирование кода и централизует логику выбора реализации
 * в зависимости от настроек приложения.
 * @param provideToken - Токен зависимости (абстрактный класс, например IFilmRepository).
 * @param inMemoryClass - Класс-реализация для режима in-memory.
 * @param mongoClass - Класс-реализация для режима mongodb.
 * @returns Готовый объект провайдера для NestJS.
 */
function createRepositoryProvider<T, M extends T, I extends T>(
  provideToken: Abstract<T>,
  inMemoryClass: Type<I>,
  mongoClass: Type<M>,
): Provider<T> {
  return {
    provide: provideToken,
    useFactory: (config: AppConfig, inMemoryRepo: I, mongoRepo?: M): T => {
      switch (config.database.driver) {
        case 'mongodb':
          if (mongoRepo) return mongoRepo;
        default:
          return inMemoryRepo;
      }
    },
    inject: [
      configProvider.provide,
      inMemoryClass,
      {
        token: mongoClass,
        optional: true,
      },
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

    createRepositoryProvider(
      IFilmRepository,
      InMemoryFilmRepository,
      MongoFilmRepository,
    ),
    createRepositoryProvider(
      IOrderRepository,
      InMemoryOrderRepository,
      MongoOrderRepository,
    ),
  ],
  exports: [IFilmRepository, IOrderRepository],
})
export class RepositoryModule {}
