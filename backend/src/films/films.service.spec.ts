import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { IFilmRepository } from './film.repository';
import { FilmEntity, ScheduleEntity } from './entities/film.entity';

// 1. Arrange (Общая подготовка): Мок для зависимости - репозитория
const mockFilmRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
};

// Тестовые данные
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
 * Набор тестов для FilmsService.
 * Задача - проверить, что сервис корректно делегирует вызовы своему репозиторию.
 * В данном случае, бизнес-логика минимальна, поэтому тесты проверяют именно "проброс" вызовов.
 */
describe('FilmsService', () => {
  let service: FilmsService;
  let repository: IFilmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: IFilmRepository, // Используем инъекционный токен
          useValue: mockFilmRepository, // Подставляем наш мок
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    repository = module.get<IFilmRepository>(IFilmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should call repository.findAll and return the result', async () => {
      // Arrange
      const films = [mockFilm];
      (repository.findAll as jest.Mock).mockResolvedValue(films);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(films);
    });
  });

  describe('findOne()', () => {
    it('should call repository.findById with correct id and return the film', async () => {
      // Arrange
      (repository.findById as jest.Mock).mockResolvedValue(mockFilm);

      // Act
      const result = await service.findOne(mockFilm.id);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(mockFilm.id);
      expect(result).toBe(mockFilm);
    });

    it('should return null if repository returns null', async () => {
      // Arrange
      (repository.findById as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findOne('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});
