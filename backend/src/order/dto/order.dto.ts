import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * DTO для описания ОДНОГО билета в массиве tickets ВХОДЯЩЕГО запроса.
 */
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

/**
 * DTO для описания ВСЕГО тела ВХОДЯЩЕГО запроса на создание бронирования.
 */
export class CreateBookingDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@ya.ru',
  })
  @IsEmail({}, { message: 'Поле email должно быть валидным email' })
  @IsNotEmpty({ message: 'Поле email не должно быть пустым' })
  email: string;

  @ApiProperty({
    description: 'Номер телефона пользователя',
    example: '+79999999999',
  })
  @IsPhoneNumber(undefined, {
    message:
      'Поле phone должно быть валидным номером телефона в международном формате (например, +79991234567)',
  })
  @IsNotEmpty({ message: 'Поле phone не должно быть пустым' })
  phone: string;

  @ApiProperty({ type: [CreateOrderDto] })
  @IsArray({ message: 'Поле tickets должно быть массивом' })
  @ValidateNested({ each: true }) // Говорим валидатору проверить каждый объект в массиве
  @Type(() => CreateOrderDto) // Говорим class-transformer использовать CreateOrderDto для объектов в массиве
  tickets: CreateOrderDto[];
}

/**
 * DTO для описания ОДНОГО созданного заказа в ИСХОДЯЩЕМ ответе.
 */
export class CreatedOrderItemDto {
  @ApiProperty({ description: 'Уникальный ID созданного заказа' })
  id: string;

  @ApiProperty({ description: 'ID фильма, на который куплен билет' })
  filmId: string;

  @ApiProperty({ description: 'ID сеанса, на который куплен билет' })
  scheduleId: string;

  @ApiProperty({ description: 'Дата и время сеанса' })
  daytime: string;

  @ApiProperty({ description: 'Номер ряда' })
  row: number;

  @ApiProperty({ description: 'Номер места' })
  seat: number;

  @ApiProperty({ description: 'Цена билета' })
  price: number;
}

/**
 * DTO для описания ВСЕГО тела ИСХОДЯЩЕГО ответа при успешном создании заказа.
 */
export class CreateOrderResponseDto {
  @ApiProperty({
    description: 'Общее количество созданных заказов',
    example: 1,
  })
  total: number;

  @ApiProperty({
    description: 'Массив объектов с информацией о созданных заказах',
    type: [CreatedOrderItemDto], // <-- Указываем Swagger, что это массив из CreatedOrderItemDto
  })
  items: CreatedOrderItemDto[];
}
