import { Injectable } from '@nestjs/common';
import { OrderEntity } from 'src/order/entities/order.entity';
import { IOrderRepository } from 'src/order/order.repository';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  // Наша "таблица" с заказами в памяти
  private readonly orders: OrderEntity[] = [];

  /**
   * Метод для создания новых заказов.
   * Принимает массив данных заказов, генерирует для каждого уникальный ID
   * и добавляет их в хранилище в памяти.
   * @param ordersData Массив объектов OrderEntity без ID.
   */
  async create(ordersData: OrderEntity[]): Promise<OrderEntity[]> {
    const newOrders = ordersData.map((order) => ({
      ...order, // Копируем все существующие данные заказа
      id: uuid4(), // Генерируем уникальный ID для каждого заказа
    }));

    this.orders.push(...newOrders);

    // Возвращаем копию новых заказов, чтобы защитить внутреннее состояние репозитория.
    return JSON.parse(JSON.stringify(newOrders));
  }
}
