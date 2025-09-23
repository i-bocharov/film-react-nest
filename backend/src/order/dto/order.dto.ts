import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID фильма',
    example: '64145bb0-996a-4644-b351-af6dc1266514',
  })
  @IsUUID('4', { message: 'Поле film должно быть валидным UUID' })
  @IsNotEmpty({ message: 'Поле film не должно быть пустым' })
  film: string;

  @ApiProperty({
    description: 'ID сеанса',
    example: '373452c8-e4c6-450a-a2ca-30d46a27e81e',
  })
  @IsUUID('4', { message: 'Поле session должно быть валидным UUID' })
  @IsNotEmpty({ message: 'Поле session не должно быть пустым' })
  session: string;

  @ApiProperty({
    description: 'Дата и время сеанса',
    example: '2023-05-29T10:30:00.001Z',
  })
  @IsDateString(
    {},
    { message: 'Поле daytime должно быть строкой в формате ISO 8601' },
  )
  @IsNotEmpty({ message: 'Поле daytime не должно быть пустым' })
  daytime: string;

  @ApiProperty({
    description: 'Номер ряда',
    example: 1,
  })
  @IsInt({ message: 'Поле row должно быть целым числом' })
  @Min(1, { message: 'Поле row должно быть не меньше 1' })
  row: number;

  @ApiProperty({
    description: 'Номер места в ряду',
    example: 1,
  })
  @IsInt({ message: 'Поле seat должно быть целым числом' })
  @Min(1, { message: 'Поле seat должно быть не меньше 1' })
  seat: number;

  @ApiProperty({
    description: 'Цена билета',
    example: 350,
  })
  @IsNumber({}, { message: 'Поле price должно быть числом' })
  @IsPositive({ message: 'Поле price должно быть положительным числом' })
  price: number;
}
