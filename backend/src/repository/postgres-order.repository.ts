import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { IOrderRepository } from 'src/order/order.repository';
import { OrderEntity } from 'src/order/entities/order.entity';
import { Film as FilmOrm } from 'src/films/entities/film.typeorm.entity';
import { Schedule as ScheduleOrm } from 'src/films/entities/schedule.typeorm.entity';
import { Order as OrderOrm } from 'src/order/entities/order.typeorm.entity';

@Injectable()
export class PostgresOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrm)
    private readonly orderRepo: Repository<OrderOrm>,
  ) {}

  /**
   * Преобразует сущность TypeORM в простой объект OrderEntity.
   */
  private toOrderEntity(order: OrderOrm): OrderEntity {
    const { id, row, seat, price, film, schedule } = order;

    return {
      id,
      row,
      seat,
      price,
      film: film.id,
      session: schedule.id,
      daytime: schedule.daytime,
    };
  }

  /**
   * Создает заказы. Предназначен для вызова из транзакции в OrderService.
   */
  async create(
    ordersData: OrderEntity[],
    bookingInfo?: { email: string; phone: string },
    manager?: EntityManager,
  ): Promise<OrderEntity[]> {
    const repository = manager
      ? manager.getRepository(OrderOrm)
      : this.orderRepo;

    const newOrdersToSave = ordersData.map((order) =>
      repository.create({
        row: order.row,
        seat: order.seat,
        price: order.price,
        film: { id: order.film } as FilmOrm,
        schedule: { id: order.session } as ScheduleOrm,
        ...(bookingInfo && {
          email: bookingInfo.email,
          phone: bookingInfo.phone,
        }),
      }),
    );

    const savedOrders = await repository.save(newOrdersToSave);

    // Перезагружаем, чтобы получить связанные `film` и `schedule` для корректного ответа.
    const reloadedOrders = await repository.find({
      where: { id: In(savedOrders.map((o) => o.id)) },
      relations: ['film', 'schedule'],
    });

    return reloadedOrders.map(this.toOrderEntity);
  }
}
