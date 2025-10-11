import { Module } from '@nestjs/common';
import { RepositoryModule } from 'src/repository/repository.module';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

@Module({
  imports: [RepositoryModule],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
