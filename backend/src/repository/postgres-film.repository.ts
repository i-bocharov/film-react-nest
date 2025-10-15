import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Film as FilmOrmEntity } from 'src/films/entities/film.typeorm.entity';
import { Schedule as ScheduleOrmEntity } from 'src/films/entities/schedule.typeorm.entity';
import { FilmEntity } from 'src/films/entities/film.entity';
import { IFilmRepository } from 'src/films/film.repository';

@Injectable()
export class PostgresFilmRepository implements IFilmRepository {
  constructor(
    // Получаем от NestJS готовый инструмент для работы с таблицей 'films'.
    @InjectRepository(FilmOrmEntity)
    private readonly filmRepo: Repository<FilmOrmEntity>,

    // Получаем доступ к самому подключению к БД, чтобы делать транзакции.
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Вспомогательный метод, чтобы превратить объект из базы данных
   * в простой объект FilmEntity, который используется в сервисах.
   */
  private toFilmEntity(film: FilmOrmEntity): FilmEntity {
    // Деструктуризируем поля из объекта фильма для краткости
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

    // Если у фильма есть расписание, преобразуем его в нужный формат.
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
      : []; // Если расписания нет, возвращаем пустой массив.

    // Собираем и возвращаем итоговый "чистый" объект.
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
   * Находит все фильмы в базе данных.
   */
  async findAll(): Promise<FilmEntity[]> {
    // `relations: ['schedule']` говорит TypeORM подгрузить связанные сеансы для каждого фильма.
    const films = await this.filmRepo.find({ relations: ['schedule'] });
    // Превращаем каждый полученный фильм в наш "чистый" формат FilmEntity.
    return films.map(this.toFilmEntity);
  }

  /**
   * Находит один фильм по его ID.
   */
  async findById(id: string): Promise<FilmEntity | null> {
    const film = await this.filmRepo.findOne({
      where: { id },
      relations: ['schedule'], // Также подгружаем его сеансы.
    });
    // Если фильм нашелся - превращаем его в FilmEntity, если нет - возвращаем null.
    return film ? this.toFilmEntity(film) : null;
  }

  /**
   * Обновляет данные фильма и его сеансов.
   * Все операции выполняются как единое целое (в транзакции).
   */
  async update(filmEntity: FilmEntity): Promise<FilmEntity> {
    // `dataSource.transaction` гарантирует, что либо все действия внутри пройдут успешно,
    // либо ни одно из них не сохранится в базе.
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // 1. Находим фильм, который хотим обновить, вместе с его сеансами.
      // `lock` нужен, чтобы никто другой не мог изменить этот фильм, пока мы с ним работаем.
      const film = await transactionalEntityManager.findOne(FilmOrmEntity, {
        where: { id: filmEntity.id },
        relations: ['schedule'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!film) {
        throw new NotFoundException(`Фильм с ID ${filmEntity.id} не найден`);
      }

      // 2. Обновляем основные поля фильма данными из filmEntity.
      film.rating = filmEntity.rating;
      film.director = filmEntity.director;
      film.tags = filmEntity.tags;
      film.title = filmEntity.title;
      film.about = filmEntity.about;
      film.description = filmEntity.description;
      film.image = filmEntity.image;
      film.cover = filmEntity.cover;

      // 3. Используем Map для быстрого поиска сеансов, которые нужно обновить.
      const scheduleMap = new Map(film.schedule.map((s) => [s.id, s]));
      const updatedSchedules: ScheduleOrmEntity[] = [];

      // Проходим по сеансам из обновленных данных...
      for (const scheduleEntity of filmEntity.schedule) {
        // ...находим соответствующий сеанс в Map (это очень быстро)...
        const scheduleToUpdate = scheduleMap.get(scheduleEntity.id);

        // ...и если нашли, обновляем в нем массив занятых мест.
        if (scheduleToUpdate) {
          scheduleToUpdate.taken = scheduleEntity.taken;
          updatedSchedules.push(scheduleToUpdate);
        }
      }

      // 4. Сохраняем все измененные сущности (фильм и сеансы) одним запросом.
      // TypeORM сам разберется, какие из них новые, а какие нужно обновить.
      await transactionalEntityManager.save([film, ...updatedSchedules]);

      // 5. Возвращаем полностью обновленный фильм.
      return this.toFilmEntity(film);
    });
  }
}
