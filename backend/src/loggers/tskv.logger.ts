import { Injectable } from '@nestjs/common';
import { BaseLogger } from './base.logger';

@Injectable()
export class TskvLogger extends BaseLogger {
  /**
   * Экранирует специальные символы в значении для TSKV формата.
   * Заменяет \ на \\, \n на \n, \t на \t, \r на \r, = на \=.
   */
  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\r/g, '\\r')
      .replace(/=/g, '\\=');
  }

  /**
   * "Расплющивает" объект в плоский набор ключ-значение.
   * Например, { user: { id: 1, name: 'John' } } превратится в
   * ['user_id=1', 'user_name=John'].
   */
  private flattenObject(obj: object, prefix = ''): string[] {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        pairs.push(...this.flattenObject(value, newKey));
      } else {
        pairs.push(`${this.escape(newKey)}=${this.escape(String(value))}`);
      }
    }
    return pairs;
  }

  /**
   * Реализует форматирование сообщения в TSKV-строку.
   */
  protected formatMessage(
    level: string,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    const context =
      optionalParams.length > 0 ? String(optionalParams[0]) : undefined;

    const pairs: string[] = [
      'tskv_format=NEST_LOG',
      `timestamp=${new Date().toISOString()}`,
      `level=${level}`,
    ];

    if (context) {
      pairs.push(`context=${this.escape(context)}`);
    }

    if (message instanceof Error) {
      pairs.push(`message=${this.escape(message.message)}`);
      if (message.stack) {
        pairs.push(`stack=${this.escape(message.stack)}`);
      }
    } else if (typeof message === 'object' && message !== null) {
      pairs.push(...this.flattenObject(message));
    } else {
      pairs.push(`message=${this.escape(String(message))}`);
    }

    return pairs.join('\t');
  }
}
