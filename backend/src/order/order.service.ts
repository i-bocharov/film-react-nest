import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFilmRepository } from 'src/films/film.repository';
import { IOrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/order.dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    // Сервису заказов нужны ОБА репозитория:
    // - IFilmRepository, чтобы проверять и обновлять занятые места
    // - IOrderRepository, чтобы сохранять сам факт заказа
    @Inject(IFilmRepository) private readonly filmRepository: IFilmRepository,
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Создает новые заказы.
   * Выполняет валидацию фильма, сеансов и мест.
   * Обновляет занятые места в фильме и сохраняет заказы.
   * @param createOrderDto Массив DTO для создания заказов.
   */
  async create(createOrderDto: CreateOrderDto[]): Promise<OrderEntity[]> {
    // Получаем ID фильма из первого DTO
    const filmId = createOrderDto[0].film;
    // Ищем фильм по ID
    const film = await this.filmRepository.findById(filmId);

    if (!film) {
      throw new NotFoundException(`Фильм с ID ${filmId} не найден`);
    }

    // Проверяем доступность каждого места в каждом заказе
    for (const orderDto of createOrderDto) {
      // Ищем соответствующий сеанс в расписании фильма
      const schedule = film.schedule.find((s) => s.id === orderDto.session);

      if (!schedule) {
        throw new NotFoundException(
          `Сеанс с ID ${orderDto.session} не найден для фильма с ID ${filmId}`,
        );
      }

      // Формируем строковое представление места
      const seatString = `${orderDto.row}:${orderDto.seat}`;

      // Проверяем, занято ли место
      if (schedule.taken.includes(seatString)) {
        throw new NotFoundException(
          `Место ${seatString} уже занято на сеанс с ID ${orderDto.session}`,
        );
      }
    }

    // Если все проверки пройдены, создаем сущности заказов и обновляем расписание фильма
    const newOrderEntities: OrderEntity[] = [];

    for (const orderDto of createOrderDto) {
      const schedule = film.schedule.find((s) => s.id === orderDto.session);
      const seatString = `${orderDto.row}:${orderDto.seat}`;
      schedule.taken.push(seatString); // Отмечаем место как занятое

      // Добавляем новый заказ в список для сохранения
      newOrderEntities.push({
        id: '', // ID будет сгенерирован репозиторием при сохранении
        filmId: orderDto.film,
        scheduleId: orderDto.session,
        daytime: orderDto.daytime,
        row: orderDto.row,
        seat: orderDto.seat,
        price: orderDto.price,
      });
    }

    // Обновляем фильм в репозитории (сохраняем изменения в расписании)
    await this.filmRepository.update(film);

    // Сохраняем все новые заказы в репозитории заказов
    const createdOrders = await this.orderRepository.create(newOrderEntities);

    return createdOrders; // Возвращаем созданные заказы
  }
}
