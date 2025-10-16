import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { IOrderRepository } from 'src/order/order.repository';
import { OrderEntity } from 'src/order/entities/order.entity';
import { Film as FilmOrm } from 'src/films/entities/film.typeorm.entity';
import { Schedule as ScheduleOrm } from 'src/films/entities/schedule.typeorm.entity';
import { Order as OrderOrm } from 'src/order/entities/order.typeorm.entity';

@Injectable()
export class PostgresOrderRepository implements IOrderRepository {
  constructor(
    // Получаем доступ к самому подключению к БД, чтобы делать транзакции.
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Вспомогательный метод, чтобы превратить объект из базы данных
   * в простой объект OrderEntity, который используется в сервисах.
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
   * Создает записи о заказах в базе данных PostgreSQL.
   * Выполняется в транзакции для обеспечения целостности данных.
   */
  async create(
    ordersData: OrderEntity[],
    bookingInfo?: { email: string; phone: string },
  ): Promise<OrderEntity[]> {
    // `dataSource.transaction` гарантирует, что либо все действия внутри пройдут успешно,
    // либо ни одно из них не сохранится в базе.
    return this.dataSource.transaction(async (manager) => {
      // 1. Подготавливаем массив сущностей OrderOrm для сохранения.
      const newOrdersToSave = ordersData.map((order) =>
        manager.create(OrderOrm, {
          row: order.row,
          seat: order.seat,
          price: order.price,
          film: { id: order.film } as FilmOrm,
          schedule: { id: order.session } as ScheduleOrm,
          // Добавляем информацию о покупателе, если она передана
          ...(bookingInfo && {
            email: bookingInfo.email,
            phone: bookingInfo.phone,
          }),
        }),
      );

      // 2. Сохраняем все новые заказы одним пакетным запросом.
      const savedOrders = await manager.save(newOrdersToSave);

      const savedOrderIds = savedOrders.map((o) => o.id);

      // Если по какой-то причине ничего не сохранилось, возвращаем пустой массив.
      if (savedOrderIds.length === 0) {
        return [];
      }

      // 3. Перезагружаем созданные заказы с помощью find и оператора In.
      // Это нужно, чтобы подтянуть связанные данные (film, schedule) для ответа.
      const reloadedOrders = await manager.find(OrderOrm, {
        where: {
          id: In(savedOrderIds),
        },
        relations: ['film', 'schedule'],
      });

      // 4. Преобразуем полные сущности в формат OrderEntity и возвращаем.
      return reloadedOrders.map(this.toOrderEntity);
    });
  }
}
