import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LoggerService } from '@nestjs/common';
import { AppModule } from './app.module';

// Импортируем логгеры
import { DevLogger } from './loggers/dev.logger';
import { JsonLogger } from './loggers/json.logger';
import { TskvLogger } from './loggers/tskv.logger';

/**
 * Фабричная функция для создания экземпляра логгера
 * в зависимости от переменной окружения LOGGER_TYPE.
 */
function createLogger(): LoggerService {
  switch (process.env.LOGGER_TYPE) {
    case 'json':
      return new JsonLogger();
    case 'tskv':
      return new TskvLogger();
    case 'dev': // 'dev' или любое другое/неуказанное значение
    default:
      // В режиме разработки используем DevLogger, который расширяет стандартный ConsoleLogger.
      // Он цветной и удобный для глаз.
      return new DevLogger();
  }
}

async function bootstrap() {
  // Создаем логгер до создания приложения
  const logger = createLogger();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Подключаем наш кастомный логгер.
  // Теперь все логи NestJS (старт, ошибки и т.д.) пойдут через него.
  app.useLogger(logger);

  app.setGlobalPrefix('api/afisha');

  // Разрешаем кросс-доменные запросы с фронтенда
  app.enableCors({
    // Мы разрешаем запросы только с этого конкретного адреса.
    origin: process.env.FRONTEND_URL,
    // Перечисляем разрешенные HTTP-методы.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // Разрешаем отправку "credentials" (например, cookies или заголовки авторизации).
    // Это может понадобиться в будущем для аутентификации.
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}
bootstrap();
