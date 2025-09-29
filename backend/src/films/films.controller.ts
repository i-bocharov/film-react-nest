import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import {
  FilmIdParamDto,
  FindAllFilmsResponseDto,
  FindFilmScheduleResponseDto,
} from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  /**
   * Обрабатывает GET-запросы на /api/afisha/films.
   * Возвращает список всех фильмов в формате FindAllFilmsResponseDto.
   */
  @Get()
  async findAll(): Promise<FindAllFilmsResponseDto> {
    const films = await this.filmsService.findAll();

    return {
      total: films.length,
      items: films,
    };
  }

  /**
   * Обрабатывает GET-запросы на /api/afisha/films/:id/schedule.
   * Возвращает расписание для конкретного фильма по его id в формате FindFilmScheduleResponseDto.
   * @param params - Объект, содержащий динамический параметр 'id' из URL.
   */
  @Get(':id/schedule')
  async findFilmSchedule(
    @Param() params: FilmIdParamDto,
  ): Promise<FindFilmScheduleResponseDto> {
    const film = await this.filmsService.findOne(params.id);

    if (!film) {
      throw new NotFoundException(`Фильм с ID ${params.id} не найден`);
    }

    return {
      total: film.schedule.length,
      items: film.schedule,
    };
  }
}
