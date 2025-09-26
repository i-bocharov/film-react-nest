import { Injectable } from '@nestjs/common';
import { FilmEntity } from 'src/films/entities/film.entity';
import * as initialDb from '../../test/mongodb_initial_stub.json';
import { IFilmRepository } from 'src/films/film.repository';

@Injectable()
/**
 * Реализация репозитория, хранящая данные в массиве в оперативной памяти.
 * Имитирует работу с базой данных для разработки и тестирования.
 */
export class InMemoryFilmRepository implements IFilmRepository {
  /**
   * Локальное хранилище фильмов.
   * `JSON.parse(JSON.stringify(initialDb))` создает глубокую копию исходных данных,
   * чтобы избежать их мутации между разными запросами.
   */
  private readonly films: FilmEntity[] = JSON.parse(JSON.stringify(initialDb));

  /**
   * Возвращает список всех фильмов.
   * `async/Promise` имитируют асинхронную природу реальной БД.
   */
  async findAll(): Promise<FilmEntity[]> {
    // Возвращаем копию данных, чтобы защитить внутреннее состояние репозитория.
    return JSON.parse(JSON.stringify(this.films));
  }

  /**
   * Находит фильм по его ID.
   * @param id Уникальный идентификатор фильма.
   */
  async findById(id: string): Promise<FilmEntity | null> {
    const film = this.films.find((item) => item.id === id);

    // Возвращаем копию найденного фильма или null.
    return film ? JSON.parse(JSON.stringify(film)) : null;
  }
}
