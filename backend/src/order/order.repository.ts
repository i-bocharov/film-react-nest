import { OrderEntity } from './entities/order.entity';

// Это АБСТРАКТНЫЙ класс, который служит контрактом (интерфейсом)
// и токеном для внедрения зависимостей.
// Сервисы будут зависеть от него, а не от конкретной реализации.
export abstract class IOrderRepository {
  // Мы будем создавать много заказов за раз, так что метод принимает массив
  abstract create(orders: OrderEntity[]): Promise<OrderEntity[]>;
}
