import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * @Schema({ _id: false }) - эта опция важна.
 * Она говорит Mongoose НЕ создавать автоматическое поле `_id`
 * для каждого сеанса в массиве. Мы будем полагаться на наше
 * собственное поле `id`, которое является UUID.
 */
@Schema({ _id: false })
export class Schedule {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  daytime: string;

  @Prop({ required: true })
  hall: number;

  @Prop({ required: true })
  rows: number;

  @Prop({ required: true })
  seats: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [String], required: true })
  taken: string[];
}
// Создаем саму Mongoose-схему из класса Schedule
export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

// Это говорит TypeScript, что объект Schedule в базе данных - это не просто
// класс, а Mongoose Subdocument, у которого есть методы типа .toObject()
export type ScheduleDocument = Schedule & Types.Subdocument;

/**
 * Это "Document" тип для Film. Он объединяет наш класс Film
 * со стандартным типом Document из Mongoose. Это нужно для строгой
 * типизации при работе с моделями (например, `Model<FilmDocument>`).
 */
export type FilmDocument = Film & Document;

/**
 * Описываем основную схему для документа Film.
 * @Schema({ collection: 'films', timestamps: true }) - опции схемы:
 * - `collection: 'films'`: Явно указываем Mongoose, что коллекция в MongoDB
 *   должна называться 'films' (во множественном числе).
 * - `timestamps: true`: Очень полезная опция. Mongoose будет автоматически
 *   добавлять и управлять полями `createdAt` и `updatedAt` для каждого документа.
 */
@Schema({ collection: 'films', timestamps: true })
export class Film {
  @Prop()
  rating: number;

  @Prop({ required: true })
  director: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  about: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  cover: string;

  @Prop({ type: [ScheduleSchema] })
  schedule: Types.DocumentArray<ScheduleDocument>;
}

// Создаем саму Mongoose-схему из класса Film
export const FilmSchema = SchemaFactory.createForClass(Film);
