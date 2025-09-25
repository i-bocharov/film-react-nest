import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  /**
   * Этот метод будет обрабатывать GET-запросы на /api/afisha/films
   * и возвращать список всех фильмов
   */
  @Get()
  findAll(): string {
    return this.filmsService.findAll();
  }

  /**
   * Этот метод будет обрабатывать GET-запросы на /api/afisha/films/:id/schedule
   * и возвращать расписание для конкретного фильма по его id
   * @param id - динамический параметр из URL
   */
  @Get(':id/schedule')
  findFilmSchedule(@Param('id') id: string): string {
    return this.filmsService.findFilmSchedule(id);
  }
}
