export class ScheduleEntity {
  id: string;
  daytime: string;
  hall: string;
  rows: number;
  seats: number;
  price: number;
  taken: string[]; // Массив занятых мест "ряд:место"
}

export class FilmEntity {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
  schedule: ScheduleEntity[];
}
