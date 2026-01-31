import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateBookingDto } from './dto/order.dto';
import { OrderEntity } from './entities/order.entity';

// 1. Arrange (Общая подготовка): Создаем мок-объект для OrderService.
// Вместо реального сервиса с логикой БД мы будем использовать эту "заглушку".
const mockOrderService = {
  create: jest.fn(),
};

// Создаем реалистичные тестовые данные для DTO и ответа сервиса
const bookingDto: CreateBookingDto = {
  email: 'test@example.com',
  phone: '+79998887766',
  tickets: [
    {
      film: 'film-1',
      session: 'session-1',
      row: 5,
      seat: 10,
      price: 500,
      daytime: '19:00',
    },
  ],
};

const createdOrders: OrderEntity[] = [
  {
    id: 'order-uuid-1',
    daytime: '19:00',
    film: 'film-1',
    session: 'session-1',
    row: 5,
    seat: 10,
    price: 500,
  },
];

/**
 * Набор тестов для OrderController.
 * Задача - убедиться, что контроллер правильно:
 * 1. Принимает DTO из тела запроса.
 * 2. Вызывает соответствующий метод сервиса с этим DTO.
 * 3. Формирует корректный ответ на основе результата от сервиса.
 */
describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    // Создаем тестовый модуль, который имитирует DI-контейнер NestJS
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService, // Когда Nest нужен будет OrderService...
          useValue: mockOrderService, // ...он получит наш мок-объект.
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    // Очищаем историю вызовов моков после каждого теста для изоляции
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should call service.create with dto and return orders wrapped in DTO', async () => {
      // Arrange (Подготовка): Настраиваем мок-сервис, чтобы он возвращал предопределенные данные
      (service.create as jest.Mock).mockResolvedValue(createdOrders);

      // Act (Действие): Вызываем тестируемый метод контроллера
      const result = await controller.create(bookingDto);

      // Assert (Проверка)
      // 1. Убеждаемся, что метод сервиса был вызван ровно один раз и с правильными данными
      expect(service.create).toHaveBeenCalledWith(bookingDto);

      // 2. Убеждаемся, что ответ контроллера имеет правильную структуру
      expect(result).toEqual({
        total: createdOrders.length,
        items: createdOrders,
      });
    });
  });
});
