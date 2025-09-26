import { FilmEntity } from './entities/film.entity';

// Это АБСТРАКТНЫЙ класс, который служит контрактом (интерфейсом)
// и токеном для внедрения зависимостей.
// Сервисы будут зависеть от него, а не от конкретной реализации.
export abstract class IFilmRepository {
  abstract findAll(): Promise<FilmEntity[]>;
  abstract findById(id: string): Promise<FilmEntity | null>;
}
