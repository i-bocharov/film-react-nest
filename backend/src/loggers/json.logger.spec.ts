import { JsonLogger } from './json.logger';

/**
 * Тестовый набор для класса JsonLogger.
 *
 * @description
 * Этот набор тестов проверяет, что JsonLogger корректно форматирует
 * лог-сообщения в JSON-строки при различных условиях:
 * - С наличием и отсутствием контекста.
 * - Для разных типов сообщений (строка и объект Error).
 */
describe('JsonLogger', () => {
  let logger: JsonLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  // Перед каждым тестом создается новый инстанс логгера и "шпионы" для методов console.
  // Это обеспечивает полную изоляцию тестов друг от друга.
  beforeEach(() => {
    logger = new JsonLogger();

    // Перехватываем вызовы console, чтобы проверить их аргументы и предотвратить вывод в консоль.
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // После каждого теста восстанавливаем оригинальные методы console.
  // Это критически важно, чтобы не нарушить работу других тестов.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created correctly', () => {
    expect(logger).toBeInstanceOf(JsonLogger);
  });

  // --- Блок 1: Тестирование логирования стандартных сообщений (не Error) ---
  describe('when logging a standard message', () => {
    it('should format correctly with a context', () => {
      // Arrange
      const message = 'Application has started';
      const context = 'Bootstrap';

      // Act
      logger.log(message, context);

      // Assert
      expect(logSpy).toHaveBeenCalledTimes(1);
      const logOutput = logSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      expect(parsedLog).toHaveProperty('timestamp');
      expect(parsedLog).toEqual(
        expect.objectContaining({
          level: 'log',
          message: message,
          context: context,
        }),
      );
    });

    it('should format correctly without a context', () => {
      // Arrange
      const message = 'A message without any context';

      // Act: Вызов без контекста для проверки соответствующей ветки кода.
      logger.log(message);

      // Assert
      expect(logSpy).toHaveBeenCalledTimes(1);
      const logOutput = logSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      // Проверяем, что поле `context` отсутствует (равно undefined).
      expect(parsedLog.context).toBeUndefined();
      expect(parsedLog.message).toBe(message);
    });
  });

  // --- Блок 2: Тестирование логирования объектов Error ---
  describe('when logging an Error object', () => {
    it('should include a stack trace when a context is provided', () => {
      // Arrange
      const error = new Error('Database connection failed');
      const context = 'DatabaseModule';

      // Act: Вызов с объектом Error для проверки ветки `instanceof Error`.
      logger.error(error, context);

      // Assert
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logOutput = errorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      // Ключевые проверки для объекта Error.
      expect(parsedLog).toHaveProperty('stack');
      expect(parsedLog.message).toBe('Database connection failed');
      expect(parsedLog.context).toBe(context);
    });

    it('should include a stack trace when no context is provided', () => {
      // Arrange
      const error = new Error('An error without any context');

      // Act
      logger.error(error);

      // Assert
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const logOutput = errorSpy.mock.calls[0][0];
      const parsedLog = JSON.parse(logOutput);

      // Проверяем, что поле `context` отсутствует.
      expect(parsedLog.context).toBeUndefined();
      expect(parsedLog).toHaveProperty('stack');
      expect(parsedLog.message).toBe('An error without any context');
    });
  });
});
