import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmEntity, ScheduleEntity } from './entities/film.entity';

// 1. Arrange (Общая подготовка): Создаем мок-объект для FilmsService.
// Его методы - это jest-функции, которые мы можем контролировать в тестах.
const mockFilmsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

// Создаем реалистичные тестовые данные
const mockSchedule: ScheduleEntity[] = [
  {
    id: 'sched-1',
    daytime: '10:00',
    hall: 1,
    rows: 10,
    seats: 20,
    price: 350,
    taken: [],
  },
];
const mockFilm: FilmEntity = {
  id: 'film-1',
  rating: 8.5,
  director: 'Режиссер',
  tags: [],
  title: 'Фильм',
  about: '',
  description: '',
  image: '',
  cover: '',
  schedule: mockSchedule,
};

/**
 * Набор тестов для FilmsController.
 * Так как это "тонкий" контроллер, наша главная задача - убедиться, что он:
 * 1. Правильно вызывает методы сервиса.
 * 2. Корректно преобразует ответ от сервиса в DTO.
 * 3. Выбрасывает правильные HTTP-исключения в ошибочных сценариях.
 */
describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  beforeEach(async () => {
    // Создаем тестовый модуль, имитирующий модуль NestJS
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService, // Когда Nest попытается внедрить FilmsService...
          useValue: mockFilmsService, // ...он получит наш мок-объект.
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService); // Получаем инстанс мока для удобства
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищаем историю вызовов моков
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should call service.findAll and return films wrapped in a DTO', async () => {
      // Arrange
      const films = [mockFilm];
      (service.findAll as jest.Mock).mockResolvedValue(films);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ total: films.length, items: films });
    });
  });

  describe('findFilmSchedule()', () => {
    it('should return schedule if film is found', async () => {
      // Arrange
      (service.findOne as jest.Mock).mockResolvedValue(mockFilm);

      // Act
      const result = await controller.findFilmSchedule({ id: mockFilm.id });

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(mockFilm.id);
      expect(result).toEqual({
        total: mockFilm.schedule.length,
        items: mockFilm.schedule,
      });
    });

    it('should throw NotFoundException if film is not found', async () => {
      // Arrange: Сервис "говорит", что фильм не найден
      (service.findOne as jest.Mock).mockResolvedValue(null);
      const filmId = 'non-existent-id';

      // Act & Assert: Проверяем, что промис будет отклонен с ошибкой нужного типа
      await expect(controller.findFilmSchedule({ id: filmId })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
