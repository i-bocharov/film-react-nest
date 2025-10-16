import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Film as FilmOrmEntity } from 'src/films/entities/film.typeorm.entity';
import { FilmEntity } from 'src/films/entities/film.entity';
import { IFilmRepository } from 'src/films/film.repository';

@Injectable()
export class PostgresFilmRepository implements IFilmRepository {
  constructor(
    @InjectRepository(FilmOrmEntity)
    private readonly filmRepo: Repository<FilmOrmEntity>,
  ) {}

  /**
   * Преобразует сущность TypeORM в простой объект FilmEntity.
   */
  private toFilmEntity(film: FilmOrmEntity): FilmEntity {
    const {
      id,
      rating,
      director,
      tags,
      title,
      about,
      description,
      image,
      cover,
    } = film;
    const schedule = film.schedule
      ? film.schedule.map((s) => ({
          id: s.id,
          daytime: s.daytime,
          hall: s.hall,
          rows: s.rows,
          seats: s.seats,
          price: s.price,
          taken: s.taken,
        }))
      : [];

    return {
      id,
      rating,
      director,
      tags,
      title,
      about,
      description,
      image,
      cover,
      schedule,
    };
  }

  /**
   * Находит все фильмы с их расписаниями.
   */
  async findAll(): Promise<FilmEntity[]> {
    const films = await this.filmRepo.find({ relations: ['schedule'] });

    return films.map(this.toFilmEntity);
  }

  /**
   * Находит один фильм по ID с его расписанием.
   */
  async findById(id: string): Promise<FilmEntity | null> {
    const film = await this.filmRepo.findOne({
      where: { id },
      relations: ['schedule'],
    });

    return film ? this.toFilmEntity(film) : null;
  }

  /**
   * Обновляет фильм. Предназначен для вызова из транзакции в OrderService.
   * Если manager не передан, использует свой обычный репозиторий.
   */
  async update(
    filmEntity: FilmEntity,
    manager?: EntityManager,
  ): Promise<FilmEntity> {
    const repository = manager
      ? manager.getRepository(FilmOrmEntity)
      : this.filmRepo;

    // `preload` безопасно мержит новые данные в существующую сущность.
    const filmToUpdate = await repository.preload({
      id: filmEntity.id,
      ...filmEntity,
    });

    if (!filmToUpdate) {
      throw new NotFoundException(`Фильм с ID ${filmEntity.id} не найден`);
    }

    const savedFilm = await repository.save(filmToUpdate);

    return this.toFilmEntity(savedFilm);
  }
}
