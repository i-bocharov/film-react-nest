import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Film } from 'src/films/entities/film.typeorm.entity';
import { Schedule } from 'src/films/entities/schedule.typeorm.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  row: number;

  @Column()
  seat: number;

  @Column('float')
  price: number;

  @ManyToOne(() => Film, (film) => film.orders, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'filmId' })
  film: Film;

  @ManyToOne(() => Schedule, (schedule) => schedule.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @CreateDateColumn()
  createdAt: Date;
}
