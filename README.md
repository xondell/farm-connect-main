# AgroLink

AgroLink соединяет фермеров и потребителей: фермерам доступны данные датчиков, рекомендации и обучающие материалы, а покупатели могут проверить путь продукта по QR-коду и обратиться в чат поддержки.

## Возможности

- Кабинет фермера: показатели полей, рекомендации, обучающие видео и новости пилотных ферм.
- Раздел потребителя: поиск продукта по коду, происхождение, даты и результаты лабораторных проверок.
- Аутентификация и история обращений через Supabase.
- Потоковый AI-чат для вопросов о происхождении и качестве продуктов.
- SSR и API-роуты на TanStack Start; целевая платформа — Vercel.

## Стек

- React 19, TypeScript, Vite и TanStack Start/TanStack Router
- Tailwind CSS и Radix UI
- Supabase (Auth и PostgreSQL)
- Vercel AI SDK и Google AI Studio (Gemini API)
- Nitro с Vercel Build Output API

## Локальный запуск

Требуется Node.js 22 или новее и npm.

```bash
git clone <repository-url>
cd farm-connect-main
cp .env.example .env
npm ci
npm run dev
```

Откройте адрес, который выведет Vite (обычно `http://localhost:5173`).

### Переменные окружения

Заполните `.env` по шаблону `.env.example`:

| Переменная                      | Где используется                  | Обязательна     |
| ------------------------------- | --------------------------------- | --------------- |
| `VITE_SUPABASE_URL`             | Браузерный клиент Supabase        | Да              |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Браузерный клиент Supabase        | Да              |
| `SUPABASE_URL`                  | SSR и защищённые server functions | Да              |
| `SUPABASE_PUBLISHABLE_KEY`      | SSR и защищённые server functions | Да              |
| `GOOGLE_GENERATIVE_AI_API_KEY`  | Серверный API-ключ Google AI Studio для чата | Да |

Значения с префиксом `VITE_` публичны и попадают в клиентский JavaScript. Секреты, включая `GOOGLE_GENERATIVE_AI_API_KEY` и `SUPABASE_SERVICE_ROLE_KEY`, никогда не добавляйте с префиксом `VITE_` и не коммитьте. Ключ Gemini читается только server route `/api/chat`; в текущем приложении service role key не нужна.

Чат получает факты из данных витрины (`src/data/consumer.ts`): каталог, путь продукта и лабораторные проверки. На странице конкретного продукта в модель передаётся только его карточка, а на общей странице — весь каталог. Модель получает инструкцию не придумывать факты, отсутствующие на сайте.

## Проверки

```bash
npm run lint       # ESLint и Prettier-правила
npm run typecheck  # Проверка TypeScript
npm run build      # Полная проверка + production-сборка
npm run check      # Все проверки (эквивалент build)
```

`npm run build` намеренно запускает линтер и проверку типов до сборки: Vercel не выпустит артефакт с известной ошибкой.

## Деплой на Vercel

1. Создайте проект в Vercel и импортируйте репозиторий. Корневая директория — корень этого репозитория.
2. В **Settings → Environment Variables** добавьте переменные Supabase и `GOOGLE_GENERATIVE_AI_API_KEY` из таблицы выше для окружений Preview и Production. Создайте ключ в Google AI Studio, отметьте его как Sensitive и не используйте префикс `VITE_`.
3. Vercel использует `npm ci`, затем `npm run build`. Конфигурация в `vite.config.ts` собирает Nitro с preset `vercel` и создаёт совместимый Vercel Build Output API в `.vercel/output`.
4. Создайте Preview deployment, проверьте `/`, `/farmer`, `/consumer`, страницу продукта и при включённом ключе `/api/chat`. Затем продвигайте тот же проверенный preview в Production.

Для ручного деплоя после входа в Vercel CLI:

```bash
npx vercel
npx vercel --prod
```

Финальный шаг сборки добавляет базовые заголовки безопасности и CSP непосредственно в Vercel Build Output API. Если в будущем появятся внешние изображения, аналитика или новый провайдер API, соответствующий домен нужно явно добавить в CSP в `scripts/apply-vercel-headers.mjs`.

## Supabase

Миграции находятся в `supabase/migrations`. Применяйте их через Supabase CLI или CI до включения функций, зависящих от таблиц авторизации и истории чата. После деплоя добавьте домены Preview и Production в Supabase **Authentication → URL Configuration** (Site URL и Redirect URLs), иначе OAuth-вход и возвраты после авторизации не будут работать.

## Структура проекта

```text
src/
  routes/                 Страницы, защищённые страницы и API-маршруты
  components/             Компоненты интерфейса
  data/                   Демонстрационные данные для витрины
  integrations/supabase/  Клиенты Supabase и auth middleware
  lib/                    Общие серверные и клиентские утилиты
  assets/                 Изображения, импортируемые сборщиком
supabase/migrations/      SQL-миграции
public/                   Статические файлы
```

## Перед запуском в Production

- Включите Vercel Firewall/rate limiting для `POST /api/chat`: ограничение размера запроса в коде защищает от чрезмерного payload, но не заменяет ограничение частоты.
- Проверьте RLS-политики и OAuth redirect URLs в Supabase.
- Убедитесь, что в Vercel нет `SUPABASE_SERVICE_ROLE_KEY`, если серверные административные операции не используются.
- Проверьте внешний вид и функциональность preview URL перед promotion.
