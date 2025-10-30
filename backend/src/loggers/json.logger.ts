import { Injectable } from '@nestjs/common';
import { BaseLogger } from './base.logger';

@Injectable()
export class JsonLogger extends BaseLogger {
  /**
   * Защищенный (protected) метод для форматирования сообщения в JSON-строку.
   * @param level - Уровень лога (log, error, warn и т.д.).
   * @param message - Основное сообщение. Может быть строкой или объектом.
   * @param optionalParams - Дополнительные параметры, включая 'context' от NestJS.
   */
  protected formatMessage(
    level: string,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    const context =
      optionalParams.length > 0 ? String(optionalParams[0]) : undefined;

    // Если message - это объект Error, извлекаем  его stack для более информативного лога
    if (message instanceof Error) {
      return JSON.stringify({
        level,
        context,
        message: message.message,
        stack: message.stack,
        timestamp: new Date().toISOString(),
      });
    }

    return JSON.stringify({
      level,
      context,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
