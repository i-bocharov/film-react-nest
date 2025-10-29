import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { CreateBookingDto } from './dto/order.dto';
import { AppConfig } from 'src/app.config.provider';
import { Film as FilmOrm } from 'src/films/entities/film.typeorm.entity';
import { Schedule as ScheduleOrm } from 'src/films/entities/schedule.typeorm.entity';
import { Order as OrderOrm } from 'src/order/entities/order.typeorm.entity';
import { OrderEntity } from './entities/order.entity';
import { IFilmRepository } from 'src/films/film.repository';
import { IOrderRepository } from 'src/order/order.repository';

@Injectable()
export class OrderService {
  constructor(
    @Inject('APP_CONFIG') private readonly appConfig: AppConfig,
    @Inject(IFilmRepository) private readonly filmRepository: IFilmRepository,
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @Optional() private readonly dataSource: DataSource | null, // Опционально для Mongo/In-Memory
  ) {}

  /**
   * Точка входа: выбирает нужную логику в зависимости от драйвера БД.
   */
  async create(bookingDto: CreateBookingDto): Promise<OrderEntity[]> {
    if (this.appConfig.database.driver === 'postgres' && this.dataSource) {
      return this.createInPostgres(bookingDto);
    }

    return this.createInMongoOrMemory(bookingDto);
  }

  /**
   * Логика создания заказа для PostgreSQL.
   * Выполняет все проверки и операции в одной атомарной транзакции.
   */
  private async createInPostgres(
    bookingDto: CreateBookingDto,
  ): Promise<OrderEntity[]> {
    const { tickets, email, phone } = bookingDto;

    return this.dataSource.transaction(async (manager) => {
      const filmId = tickets[0].film;
      const scheduleIds = [...new Set(tickets.map((t) => t.session))];

      // Загружаем фильм и все нужные сеансы одним пакетом с блокировкой
      const film = await manager.findOneBy(FilmOrm, { id: filmId });
      const schedules = await manager.find(ScheduleOrm, {
        where: { id: In(scheduleIds) },
        lock: { mode: 'pessimistic_write' },
      });

      if (!film) {
        throw new NotFoundException(`Фильм с ID ${filmId} не найден`);
      }
      if (schedules.length !== scheduleIds.length) {
        throw new NotFoundException('Один или несколько сеансов не найдены');
      }

      // Используем хеш-таблицу для мгновенного доступа к сеансам
      const scheduleMap = new Map(schedules.map((s) => [s.id, s]));

      // Проверяем места и обновляем `taken` в объектах (в памяти)
      for (const ticket of tickets) {
        const schedule = scheduleMap.get(ticket.session)!;
        const seatString = `${ticket.row}:${ticket.seat}`;

        if (schedule.taken.includes(seatString)) {
          throw new ConflictException(`Место ${seatString} уже занято`);
        }

        schedule.taken.push(seatString);
      }

      // Сохраняем все измененные сеансы одним запросом
      await manager.save(schedules);

      // Готовим и сохраняем все новые заказы одним запросом
      const newOrders = tickets.map((t) =>
        manager.create(OrderOrm, {
          row: t.row,
          seat: t.seat,
          price: t.price,
          film: film,
          schedule: scheduleMap.get(t.session)!,
          email,
          phone,
        }),
      );
      const savedOrders = await manager.save(newOrders);

      // Преобразуем результат в OrderEntity для ответа
      return savedOrders.map((o) => ({
        id: o.id,
        film: o.film.id,
        session: o.schedule.id,
        daytime: scheduleMap.get(o.schedule.id)!.daytime,
        row: o.row,
        seat: o.seat,
        price: o.price,
      }));
    });
  }

  /**
   * Логика создания заказа для MongoDB и In-Memory.
   */
  private async createInMongoOrMemory(
    bookingDto: CreateBookingDto,
  ): Promise<OrderEntity[]> {
    const { tickets, email, phone } = bookingDto;
    const filmId = tickets[0].film;

    // 1. Находим фильм через репозиторий
    const film = await this.filmRepository.findById(filmId);

    if (!film) {
      throw new NotFoundException(`Фильм с ID ${filmId} не найден`);
    }

    // Используем хеш-таблицу для быстрой проверки
    const scheduleMap = new Map(film.schedule.map((s) => [s.id, s]));

    // 2. Проверяем все места
    for (const ticket of tickets) {
      const schedule = scheduleMap.get(ticket.session);
      const seatString = `${ticket.row}:${ticket.seat}`;

      if (!schedule) {
        throw new NotFoundException(`Сеанс с ID ${ticket.session} не найден`);
      }

      if (schedule.taken.includes(seatString)) {
        throw new ConflictException(`Место ${seatString} уже занято`);
      }
    }

    // 3. Создаем заказы через репозиторий
    const newOrderEntities = tickets.map((t) => ({
      id: '',
      film: t.film,
      session: t.session,
      daytime: t.daytime,
      row: t.row,
      seat: t.seat,
      price: t.price,
    }));
    const createdOrders = await this.orderRepository.create(newOrderEntities, {
      email,
      phone,
    });

    // 4. Обновляем `taken` в объекте фильма
    for (const order of createdOrders) {
      const schedule = scheduleMap.get(order.session);

      if (schedule) {
        schedule.taken.push(`${order.row}:${order.seat}`);
      }
    }

    // 5. Сохраняем обновленный фильм
    await this.filmRepository.update(film);
    return createdOrders;
  }
}
