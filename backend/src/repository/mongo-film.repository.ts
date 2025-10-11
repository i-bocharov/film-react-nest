import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilmEntity } from 'src/films/entities/film.entity';
import { IFilmRepository } from 'src/films/film.repository';
import { Film, FilmDocument } from 'src/films/schemas/film.schema';

@Injectable()
export class MongoFilmRepository implements IFilmRepository {
  constructor(
    // Внедряем Mongoose-модель 'Film' для взаимодействия с коллекцией 'films'.
    // `Film.name` - это безопасный способ получить имя модели ('Film').
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  /**
   * Приватный метод для преобразования Mongoose Document в нашу доменную сущность FilmEntity.
   * Это ключевой момент для разделения слоев: наш сервис ничего не знает о Mongoose.
   * @param filmDoc Документ из MongoDB.
   */
  private toEntity(filmDoc: FilmDocument): FilmEntity {
    return {
      // Mongoose добавляет `id` как виртуальное свойство, которое является строковой версией `_id`.
      id: filmDoc.id,
      rating: filmDoc.rating,
      director: filmDoc.director,
      tags: filmDoc.tags,
      title: filmDoc.title,
      about: filmDoc.about,
      description: filmDoc.description,
      image: filmDoc.image,
      cover: filmDoc.cover,
      // Mongoose-документы - это не простые объекты, их нужно преобразовать.
      // Метод `.toObject()` помогает получить чистый JS-объект из вложенных документов.
      schedule: filmDoc.schedule.map((s) => s.toObject()),
    };
  }

  /**
   * Находит все фильмы в коллекции.
   */
  async findAll(): Promise<FilmEntity[]> {
    const filmDocs = await this.filmModel.find().exec();

    return filmDocs.map(this.toEntity);
  }

  /**
   * Находит один фильм по его `_id`.
   * @param id Уникальный идентификатор фильма.
   */
  async findById(id: string): Promise<FilmEntity | null> {
    const filmDoc = await this.filmModel.findById(id).exec();

    return filmDoc ? this.toEntity(filmDoc) : null;
  }

  /**
   * Обновляет документ фильма.
   * @param filmEntity Сущность фильма с обновленными данными.
   */
  async update(filmEntity: FilmEntity): Promise<FilmEntity> {
    // `findByIdAndUpdate` находит документ по ID и обновляет его.
    // Опция `{ new: true }` говорит Mongoose вернуть обновленную версию документа.
    const updatedDoc = await this.filmModel
      .findByIdAndUpdate(filmEntity.id, filmEntity, { new: true })
      .exec();

    return this.toEntity(updatedDoc);
  }
}
