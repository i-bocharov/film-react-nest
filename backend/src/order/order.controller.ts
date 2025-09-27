import { Controller, Post, Body, ParseArrayPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Этот метод будет обрабатывать POST-запросы на /api/afisha/order
   * и создавать новый заказ на основе данных, переданных в теле запроса.
   * @param createOrdersDto - Массив объектов с данными для создания заказа.
   */
  @Post()
  create(
    @Body(new ParseArrayPipe({ items: CreateOrderDto }))
    createOrdersDto: CreateOrderDto[],
  ) {
    // Просто передаем DTO в сервис и возвращаем результат
    return this.orderService.create(createOrdersDto);
  }
}
