-- Включаем расширение, чтобы можно было генерировать UUID для ID.
-- Эту команду нужно выполнить один раз под админом (postgres).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*
-- Этот блок для первоначальной настройки сервера.
-- Его выполняет админ (postgres), чтобы создать пользователя и базу для проекта.

-- 1. Создаем пользователя 'afisha_dev_user' с паролем 'your_password' (пароль нужно придумать свой).
CREATE ROLE afisha_dev_user WITH LOGIN PASSWORD 'your_password';

-- 2. Создаем базу данных 'afisha' и сразу делаем 'afisha_dev_user' ее владельцем.
CREATE DATABASE afisha WITH OWNER afisha_dev_user;
*/


-- Дальше все команды нужно выполнять, подключившись к базе 'afisha' под пользователем 'afisha_dev_user'.


-- --- Таблица для Фильмов ---
-- Удаляем таблицу, если она уже есть, чтобы скрипт можно было запускать несколько раз.
DROP TABLE IF EXISTS public.films CASCADE;

CREATE TABLE public.films
(
    -- ID фильма, генерируется автоматически
    id          uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,

    -- Обязательные поля
    rating      real                            NOT NULL,
    director    varchar                         NOT NULL,
    tags        text[]                          NOT NULL, -- Массив строк для тегов
    title       varchar                         NOT NULL UNIQUE, -- Название фильма должно быть уникальным

    -- Необязательные поля, могут быть пустыми (NULL)
    about       varchar,
    description varchar,
    image       varchar,
    cover       varchar
);

-- Указываем, что таблицей владеет наш пользователь 'afisha_dev_user'.
ALTER TABLE public.films OWNER TO afisha_dev_user;


-- --- Таблица для Сеансов ---
DROP TABLE IF EXISTS public.schedules CASCADE;

CREATE TABLE public.schedules
(
    id      uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    daytime varchar                         NOT NULL,
    hall    integer                         NOT NULL,
    "rows"  integer                         NOT NULL, -- "rows" в кавычках, потому что это ключевое слово
    seats   integer                         NOT NULL,
    price   real                            NOT NULL,
    taken   text[]                          NOT NULL, -- Массив строк для занятых мест, например '{"1:5", "1:6"}'

    -- Связь с таблицей фильмов (внешний ключ)
    "filmId" uuid,
    
    -- Указываем, что "filmId" ссылается на "id" в таблице "films".
    -- ON DELETE CASCADE означает, что если удалить фильм, все его сеансы тоже удалятся.
    CONSTRAINT "FK_schedules_to_films"
        FOREIGN KEY ("filmId") REFERENCES public.films(id) ON DELETE CASCADE
);

ALTER TABLE public.schedules OWNER TO afisha_dev_user;


-- --- Таблица для Заказов ---
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders
(
    id          uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    "row"       integer                         NOT NULL, -- "row" тоже в кавычках
    seat        integer                         NOT NULL,
    price       real                            NOT NULL,
    "createdAt" timestamptz DEFAULT now()       NOT NULL, -- Дата создания, ставится автоматически

    -- Необязательные поля для информации о покупателе
    email       varchar,
    phone       varchar,

    -- Связи с другими таблицами
    "filmId"     uuid,
    "scheduleId" uuid,

    -- Если фильм удалят, в заказе это поле просто станет NULL.
    CONSTRAINT "FK_orders_to_films"
        FOREIGN KEY ("filmId") REFERENCES public.films(id) ON DELETE SET NULL,

    -- Если сеанс удалят, то и заказ на этот сеанс тоже удалится.
    CONSTRAINT "FK_orders_to_schedules"
        FOREIGN KEY ("scheduleId") REFERENCES public.schedules(id) ON DELETE CASCADE
);

ALTER TABLE public.orders OWNER TO afisha_dev_user;