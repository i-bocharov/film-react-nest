import { Controller, Get, Param } from '@nestjs/common';

@Controller('films')
export class FilmsController {
  /**
   * Этот метод будет обрабатывать GET-запросы на /api/afisha/films
   * и возвращать список всех фильмов
   */
  @Get()
  findAll(): string {
    return 'Этот метод возвращает список всех фильмов';
  }

  /**
   * Этот метод будет обрабатывать GET-запросы на /api/afisha/films/:id/schedule
   * и возвращать расписание для конкретного фильма по его id
   * @param id - динамический параметр из URL
   */
  @Get(':id/schedule')
  findFilmSchedule(@Param('id') id: string): string {
    return `Этот метод вернёт расписание для фильма с id ${id}`;
  }
}
