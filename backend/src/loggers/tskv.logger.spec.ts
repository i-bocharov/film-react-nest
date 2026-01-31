import { TskvLogger } from './tskv.logger';

/**
 * Набор тестов для TskvLogger.
 * Проверяем корректность форматирования в TSKV-строку, включая экранирование,
 * "расплющивание" объектов и обработку ошибок.
 */
describe('TskvLogger', () => {
  let logger: TskvLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Arrange: Настраиваем окружение для каждого теста
    logger = new TskvLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Очищаем моки после теста, чтобы избежать "утечек" между тестами
    jest.restoreAllMocks();
  });

  it('should be created correctly', () => {
    expect(logger).toBeInstanceOf(TskvLogger);
  });

  it('should format a simple message into a TSKV string', () => {
    // Arrange
    const message = 'Request received';
    const context = 'RequestLogger';

    // Act
    logger.log(message, context);

    // Assert
    expect(logSpy).toHaveBeenCalledTimes(1);
    const logOutput = logSpy.mock.calls[0][0];

    // Проверяем, что строка содержит все необходимые key=value пары
    expect(logOutput).toContain('tskv_format=NEST_LOG');
    expect(logOutput).toContain('level=log');
    expect(logOutput).toContain(`message=${message}`);
    expect(logOutput).toContain(`context=${context}`);
    expect(logOutput).toContain('timestamp=');
  });

  it('should correctly escape special characters in message', () => {
    // Arrange: Готовим строку со всеми спецсимволами, которые обрабатывает наш логгер
    const messageWithSpecialChars = 'key=value\tnewline\nslash\\end';

    // Act
    logger.log(messageWithSpecialChars);

    // Assert
    const logOutput = logSpy.mock.calls[0][0];
    // Проверяем, что каждый спецсимвол был корректно заэкранирован
    expect(logOutput).toContain('message=key\\=value\\tnewline\\nslash\\\\end');
  });

  it('should flatten a nested object message', () => {
    // Arrange: Вложенный объект, который должен быть преобразован в плоский набор ключей
    const nestedObject = {
      user: { id: 'user-123', role: 'admin' },
      action: 'login',
    };

    // Act
    logger.log(nestedObject, 'Auth');

    // Assert
    const logOutput = logSpy.mock.calls[0][0];

    // Проверяем, что ключи объекта стали плоскими (user.id -> user_id)
    expect(logOutput).toContain('user_id=user-123');
    expect(logOutput).toContain('user_role=admin');
    expect(logOutput).toContain('action=login');
    expect(logOutput).toContain('context=Auth');
    // Важно: при логировании объекта, ключа "message" быть не должно
    expect(logOutput).not.toContain('message=');
  });

  it('should format an Error object with an escaped stack', () => {
    // Arrange
    const error = new Error('Failed to process data');
    error.stack = 'Error: Failed to process data\n    at app.js:10:1'; // Стек с переносом строки

    // Act
    logger.error(error);

    // Assert
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logOutput = errorSpy.mock.calls[0][0];

    expect(logOutput).toContain('message=Failed to process data');
    // Проверяем, что символ переноса строки `\n` был заэкранирован в `\\n`
    expect(logOutput).toContain(
      'stack=Error: Failed to process data\\n    at app.js:10:1',
    );
  });
});
