import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderEntity } from 'src/order/entities/order.entity';
import { IOrderRepository } from 'src/order/order.repository';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';

@Injectable()
export class MongoOrderRepository implements IOrderRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Приватный метод для преобразования Mongoose Document в OrderEntity.
   */
  private toEntity(orderDoc: OrderDocument): OrderEntity {
    return {
      id: orderDoc.id,
      film: orderDoc.film,
      session: orderDoc.session,
      daytime: orderDoc.daytime,
      row: orderDoc.row,
      seat: orderDoc.seat,
      price: orderDoc.price,
    };
  }

  /**
   * Создает один или несколько документов заказов в коллекции.
   * @param orders Массив сущностей заказов для создания.
   */
  async create(orders: OrderEntity[]): Promise<OrderEntity[]> {
    // Метод `insertMany` - это эффективный способ вставить сразу несколько
    // документов в коллекцию за один запрос к базе данных.
    const createdDocs = await this.orderModel.insertMany(orders);

    return createdDocs.map(this.toEntity);
  }
}
