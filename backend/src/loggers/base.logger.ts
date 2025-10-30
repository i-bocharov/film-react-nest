import { Injectable, LoggerService } from '@nestjs/common';

/**
 * Абстрактный базовый класс для всех кастомных логгеров.
 * Он реализует общую логику вызова console, избавляя от дублирования кода.
 * Классы-наследники должны реализовать только один метод - `formatMessage`.
 */
@Injectable()
export abstract class BaseLogger implements LoggerService {
  /**
   * Абстрактный метод, который должен быть реализован в каждом конкретном логгере.
   * Отвечает за преобразование данных в нужный строковый формат (JSON, TSKV и т.д.).
   */
  protected abstract formatMessage(
    level: string,
    message: unknown,
    ...optionalParams: unknown[]
  ): string;

  // --- ОБЩАЯ РЕАЛИЗАЦИЯ ДЛЯ ВСЕХ ЛОГГЕРОВ ---

  /**
   * Записывает лог уровня 'log'.
   * @param message - Сообщение или объект для логирования.
   * @param optionalParams - Контекст и другие параметры.
   */
  log(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  /**
   * Записывает лог уровня 'error'.
   * @param message - Сообщение или объект для логирования.
   * @param optionalParams - Контекст и другие параметры.
   */
  error(message: unknown, ...optionalParams: unknown[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  /**
   * Записывает лог уровня 'warn'.
   * @param message - Сообщение или объект для логирования.
   * @param optionalParams - Контекст и другие параметры.
   */
  warn(message: unknown, ...optionalParams: unknown[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  /**
   * Записывает лог уровня 'debug'.
   * @param message - Сообщение или объект для логирования.
   * @param optionalParams - Контекст и другие параметры.
   */
  debug?(message: unknown, ...optionalParams: unknown[]) {
    // В production-режиме debug-логи можно отключать
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, ...optionalParams));
    }
  }

  /**
   * Записывает лог уровня 'verbose'.
   * @param message - Сообщение или объект для логирования.
   * @param optionalParams - Контекст и другие параметры.
   */
  verbose?(message: unknown, ...optionalParams: unknown[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(this.formatMessage('verbose', message, ...optionalParams));
    }
  }
}
