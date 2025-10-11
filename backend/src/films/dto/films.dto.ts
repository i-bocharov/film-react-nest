import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// DTO для описания одного фильма (в списке)
export class FilmDto {
  @ApiProperty({
    description: 'Уникальный идентификатор фильма',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string;

  @ApiProperty({ description: 'Рейтинг фильма', example: 2.9 })
  rating: number;

  @ApiProperty({ description: 'Режиссер', example: 'Итан Райт' })
  director: string;

  @ApiProperty({
    description: 'Жанры фильма',
    example: ['Документальный'],
  })
  tags: string[];

  @ApiProperty({
    description: 'Название фильма',
    example: 'Архитекторы общества',
  })
  title: string;

  @ApiProperty({
    description: 'Краткое описание фильма',
    example:
      'Документальный фильм, исследующий влияние искусственного интеллекта на общество и этические, философские и социальные последствия технологии.',
  })
  about: string;

  @ApiProperty({
    description: 'Подробное описание фильма',
    example:
      'Документальный фильм Итана Райта исследует влияние технологий на современное общество, уделяя особое внимание роли искусственного интеллекта в формировании нашего будущего. Фильм исследует этические, философские и социальные последствия гонки технологий ИИ и поднимает вопрос: какой мир мы создаём для будущих поколений.',
  })
  description: string;

  @ApiProperty({
    description: 'Путь к постеру (маленькое изображение)',
    example: '/images/bg1s.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Путь к обложке (большое изображение)',
    example: '/images/bg1c.jpg',
  })
  cover: string;
}

// DTO для ответа со списком всех фильмов (GET /api/afisha/films/)
export class FindAllFilmsResponseDto {
  @ApiProperty({
    description: 'Общее количество найденных фильмов',
    example: 8,
  })
  total: number;

  @ApiProperty({
    description: 'Массив объектов с информацией о фильмах',
    type: [FilmDto],
  })
  items: FilmDto[];
}

// DTO для описания одного сеанса фильма
export class ScheduleDto {
  @ApiProperty({
    description: 'Уникальный идентификатор сеанса',
    example: '95ab4a20-9555-4a06-bfac-184b8c53fe70',
  })
  id: string;

  @ApiProperty({
    description: 'Время начала сеанса',
    example: '2023-05-29T10:30:00.001Z',
  })
  daytime: string;

  @ApiProperty({
    description: 'Номер зала',
    example: '2',
  })
  hall: number;

  @ApiProperty({
    description: 'Количество рядов в зале',
    example: 5,
  })
  rows: number;

  @ApiProperty({
    description: 'Количество мест в ряду',
    example: 10,
  })
  seats: number;

  @ApiProperty({
    description: 'Цена за билет',
    example: 350,
  })
  price: number;

  @ApiProperty({
    description: 'Массив занятых мест в формате "ряд:место"',
    example: ['1:2', '3:5'],
  })
  taken: string[];
}

// DTO для ответа с расписанием сеансов конкретного фильма (GET /api/afisha/films/:id/schedule)
export class FindFilmScheduleResponseDto {
  @ApiProperty({
    description: 'Общее количество сеансов для данного фильма',
    example: 9,
  })
  total: number;

  @ApiProperty({
    description: 'Массив объектов с информацией о сеансах',
    type: [ScheduleDto],
  })
  items: ScheduleDto[];
}

// DTO для валидации ID фильма в параметрах URL
export class FilmIdParamDto {
  @ApiProperty({
    description: 'Уникальный идентификатор фильма',
  })
  @IsString()
  id: string;
}
