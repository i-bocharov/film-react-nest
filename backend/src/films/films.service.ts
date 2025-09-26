import { Inject, Injectable } from '@nestjs/common';
import { IFilmRepository } from './film.repository';
import { FilmEntity } from './entities/film.entity';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(IFilmRepository)
    private readonly filmRepository: IFilmRepository,
  ) {}

  // Метод для получения всех фильмов.
  async findAll(): Promise<FilmEntity[]> {
    return this.filmRepository.findAll();
  }

  // Метод для получения фильма по его ID.
  async findOne(id: string): Promise<FilmEntity | null> {
    return this.filmRepository.findById(id);
  }
}
