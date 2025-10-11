import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateBookingDto, CreateOrderResponseDto } from './dto/order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() bookingDto: CreateBookingDto,
  ): Promise<CreateOrderResponseDto> {
    const createdOrders = await this.orderService.create(bookingDto.tickets);

    return {
      total: createdOrders.length,
      items: createdOrders,
    };
  }
}
