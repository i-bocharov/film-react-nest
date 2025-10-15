import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Schedule } from './schedule.typeorm.entity';
import { Order } from 'src/order/entities/order.typeorm.entity';

// Сущность для фильма
@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  rating: number;

  @Column()
  director: string;

  @Column('simple-array')
  tags: string[];

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  cover: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true, // Позволяет сохранять/обновлять сеансы вместе с фильмом
  })
  schedule: Schedule[]; // Массив сеансов

  @OneToMany(() => Order, (order) => order.film)
  orders: Order[]; // Массив заказов
}
