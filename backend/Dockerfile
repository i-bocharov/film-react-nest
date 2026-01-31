# --- Этап 1: Сборка (Builder) ---
# Этот этап отвечает за компиляцию TypeScript в JavaScript.
# Используем образ 'slim' на основе Debian для максимальной совместимости
# с зависимостями, необходимыми для сборки (например, @nestjs/cli).
FROM node:24-slim AS builder

# Устанавливаем рабочую директорию внутри контейнера для всех последующих команд.
WORKDIR /app

# Копируем файлы package.json и package-lock.json.
# Этот шаг вынесен наверх для использования кэширования слоев Docker.
COPY package*.json ./

# Устанавливаем ВСЕ зависимости, включая devDependencies,
# так как они необходимы для процесса сборки (например, для команды `nest build`).
RUN npm ci

# Копируем все остальные файлы исходного кода в рабочую директорию.
COPY . .

# Компилируем TypeScript-код в JavaScript.
# Результат будет помещен в директорию /app/dist.
RUN npm run build


# --- Этап 2: Установка Production-зависимостей ---
# Этот промежуточный этап создает "чистую" папку node_modules,
# содержащую только production-зависимости.
FROM node:24-alpine AS production-deps

WORKDIR /app
COPY package*.json ./
# Устанавливаем только production-зависимости.
RUN npm ci --only=production


# --- Этап 3: Финальный образ (Runtime) ---
# Финальный образ для запуска приложения также базируется на легком alpine
# для сохранения минимального размера и поверхности атаки.
FROM node:24-alpine

WORKDIR /app

# Копируем package.json, который содержит скрипт "start:prod" для запуска приложения.
COPY package.json ./

# Копируем "чистые" production-зависимости из этапа 'production-deps'.
COPY --from=production-deps /app/node_modules ./node_modules

# Копируем скомпилированный JavaScript-код из этапа 'builder'.
COPY --from=builder /app/dist ./dist

# Информируем Docker о том, что контейнер будет слушать порт 3000 в своей сети.
EXPOSE 3000

# Определяем команду по умолчанию для запуска приложения при старте контейнера.
CMD ["npm", "run", "start:prod"]