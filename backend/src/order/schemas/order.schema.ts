import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * "Document" тип для Order. Объединяет наш класс Order
 * со стандартным типом Document из Mongoose для строгой типизации.
 */
export type OrderDocument = Order & Document;

/**
 * Описываем основную схему для документа Order.
 * @Schema({ collection: 'orders', timestamps: true }) - опции схемы:
 * - `collection: 'orders'`: Явно указываем, что коллекция в MongoDB
 *   будет называться 'orders'.
 * - `timestamps: true`: Mongoose будет автоматически добавлять и управлять
 *   полями `createdAt` и `updatedAt`.
 */
@Schema({ collection: 'orders', timestamps: true })
export class Order {
  // Поле `id` (которое было в OrderEntity) здесь не нужно.
  // Mongoose автоматически создает уникальное поле `_id`.
  // Наш MongoOrderRepository будет преобразовывать `_id` в `id`.
  @Prop({ required: true })
  film: string;

  @Prop({ required: true })
  session: string;

  @Prop({ required: true })
  daytime: string;

  @Prop({ required: true })
  row: number;

  @Prop({ required: true })
  seat: number;

  @Prop({ required: true })
  price: number;
}

// Создаем саму Mongoose-схему из класса Order
export const OrderSchema = SchemaFactory.createForClass(Order);
