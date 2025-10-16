import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryModule } from 'src/repository/repository.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const isPostgresDriver = process.env.DATABASE_DRIVER === 'postgres';

@Module({
  imports: [
    RepositoryModule,
    ...(isPostgresDriver ? [TypeOrmModule.forFeature([])] : []),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
