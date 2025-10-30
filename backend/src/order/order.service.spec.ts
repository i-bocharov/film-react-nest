import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderService } from './order.service';
import { IFilmRepository } from '../films/film.repository';
import { IOrderRepository } from './order.repository';
import { CreateBookingDto } from './dto/order.dto';
import { FilmEntity, ScheduleEntity } from '../films/entities/film.entity';
import { OrderEntity } from './entities/order.entity';
import { AppConfig } from '../app.config.provider';

// Моки для внешних зависимостей.
const mockFilmRepository = { findById: jest.fn(), update: jest.fn() };
const mockOrderRepository = { create: jest.fn() };
const mockDataSource = { transaction: jest.fn() };

// "Фабрика" для создания "чистых" тестовых данных для каждого теста.
// Предотвращает взаимовлияние тестов через мутацию общих объектов.
const createTestData = () => {
  const bookingDto: CreateBookingDto = {
    email: 'test@example.com',
    phone: '+79998887766',
    tickets: [
      {
        film: 'film-1',
        session: 'session-1',
        daytime: '2025-10-31T19:00:00.000Z',
        row: 5,
        seat: 10,
        price: 500,
      },
    ],
  };
  const mockSchedule: ScheduleEntity = {
    id: 'session-1',
    daytime: '2025-10-31T19:00:00.000Z',
    hall: 1,
    rows: 10,
    seats: 20,
    price: 500,
    taken: [],
  };
  const mockFilm: FilmEntity = {
    id: 'film-1',
    rating: 8.5,
    director: 'Режиссер',
    tags: [],
    title: 'Тестовый Фильм',
    about: '',
    description: '',
    image: '',
    cover: '',
    schedule: [mockSchedule],
  };
  const createdOrders: OrderEntity[] = [
    { id: 'order-1', ...bookingDto.tickets[0] },
  ];
  return { bookingDto, mockSchedule, mockFilm, createdOrders };
};

/**
 * Тестовый набор для OrderService.
 *
 * @description
 * Проверяет основную бизнес-логику создания заказов, включая:
 * - Разделение логики для разных драйверов БД (Mongo/In-Memory и Postgres).
 * - Корректную обработку успешных сценариев.
 * - Выбрасывание ожидаемых исключений (NotFoundException, ConflictException).
 */
describe('OrderService', () => {
  let service: OrderService;

  // Helper-функция для инициализации сервиса с нужной конфигурацией.
  const setupService = async (driver: 'postgres' | 'mongo') => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: 'APP_CONFIG',
          useValue: { database: { driver } } as AppConfig,
        },
        { provide: IFilmRepository, useValue: mockFilmRepository },
        { provide: IOrderRepository, useValue: mockOrderRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Блок 1: Тесты для драйвера Mongo / In-Memory ---
  describe('create (with Mongo/In-Memory driver)', () => {
    beforeEach(async () => {
      await setupService('mongo');
    });

    it('should create an order successfully', async () => {
      // Arrange
      const { bookingDto, mockFilm, createdOrders } = createTestData();
      (mockFilmRepository.findById as jest.Mock).mockResolvedValue(mockFilm);
      (mockOrderRepository.create as jest.Mock).mockResolvedValue(
        createdOrders,
      );

      // Act
      const result = await service.create(bookingDto);

      // Assert
      expect(mockFilmRepository.update).toHaveBeenCalled();
      expect(result).toEqual(createdOrders);
    });

    it('should throw NotFoundException if film is not found', async () => {
      // Arrange
      const { bookingDto } = createTestData();
      (mockFilmRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(bookingDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if session is not found', async () => {
      // Arrange
      const { bookingDto, mockFilm } = createTestData();
      const bookingWithInvalidSession = {
        ...bookingDto,
        tickets: [{ ...bookingDto.tickets[0], session: 'invalid-session-id' }],
      };
      (mockFilmRepository.findById as jest.Mock).mockResolvedValue(mockFilm);

      // Act & Assert
      await expect(service.create(bookingWithInvalidSession)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if a seat is already taken', async () => {
      // Arrange
      const { bookingDto, mockFilm } = createTestData();
      mockFilm.schedule[0].taken.push('5:10');
      (mockFilmRepository.findById as jest.Mock).mockResolvedValue(mockFilm);

      // Act & Assert
      await expect(service.create(bookingDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // --- Блок 2: Тесты для драйвера PostgreSQL ---
  describe('create (with Postgres driver)', () => {
    beforeEach(async () => {
      await setupService('postgres');
    });

    it('should create an order successfully within a transaction', async () => {
      // Arrange
      const { bookingDto, mockSchedule } = createTestData();
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue({ id: 'film-1' }),
        find: jest.fn().mockResolvedValue([{ ...mockSchedule }]),
        save: jest
          .fn()
          .mockImplementation((entities) => Promise.resolve(entities)),
        create: jest.fn((_, data) => data),
      };
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      // Act
      await service.create(bookingDto);

      // Assert
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if film is not found in transaction', async () => {
      // Arrange
      const { bookingDto } = createTestData();
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue(null),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
      };
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      // Act & Assert
      await expect(service.create(bookingDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if some schedules are not found in transaction', async () => {
      // Arrange
      const { bookingDto } = createTestData();
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue({ id: 'film-1' }),
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        create: jest.fn(),
      };
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      // Act & Assert
      await expect(service.create(bookingDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if a seat is taken (inside transaction)', async () => {
      // Arrange
      const { bookingDto, mockSchedule } = createTestData();
      mockSchedule.taken.push('5:10');
      const mockManager = {
        findOneBy: jest.fn().mockResolvedValue({ id: 'film-1' }),
        find: jest.fn().mockResolvedValue([{ ...mockSchedule }]),
        save: jest.fn(),
        create: jest.fn(),
      };
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      // Act & Assert
      await expect(service.create(bookingDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
