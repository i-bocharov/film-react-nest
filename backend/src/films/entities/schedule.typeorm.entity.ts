import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Film } from './film.typeorm.entity';
import { Order } from 'src/order/entities/order.typeorm.entity';

// Сущность для сеансов фильма
@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  daytime: string;

  @Column()
  hall: number;

  @Column()
  rows: number;

  @Column()
  seats: number;

  @Column()
  price: number;

  @Column('simple-array')
  taken: string[];

  @ManyToOne(() => Film, (film) => film.schedule, {
    onDelete: 'CASCADE', // Удаляет сеансы при удалении фильма
  })
  film: Film; // Связь с фильмом

  @OneToMany(() => Order, (order) => order.schedule)
  orders: Order[]; // Связь с заказами
}
