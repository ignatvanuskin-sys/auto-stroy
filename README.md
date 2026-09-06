# BuildScope AI — платформа продаж для строительной компании

Публичный сайт с многошаговым калькулятором стоимости дома и CRM (Kanban, лиды, КП, задачи, аналитика, тарифы). Deterministic-расчёты: цена и скоринг лида считаются чистыми функциями, AI только помогает квалифицировать заявку и никогда не блокирует её приём.

## Стек

- **Frontend:** React 19, Vite 7, TypeScript, Tailwind CSS 4, tRPC client + TanStack Query, wouter
- **Backend:** Express 4, tRPC 11 (superjson), Node 20+
- **БД:** MySQL/TiDB через Drizzle ORM (миграции в `drizzle/`)
- **Тесты:** Vitest
- **AI-квалификация:** серверный вызов LLM со строгой JSON-схемой и rule-based fallback

## Карта проекта

| Папка                                | Назначение                                              |
| ------------------------------------ | ------------------------------------------------------- |
| `client/src/pages`                   | Публичные страницы, калькулятор, CRM-экраны             |
| `client/src/components`              | Layout-оболочки и ui-компоненты                         |
| `server/routers.ts`                  | Все tRPC-процедуры (калькулятор + CRM)                  |
| `server/db.ts`                       | Доступ к БД, серверное разрешение тенанта (`companyId`) |
| `server/buildscope/business.ts`      | Детерминированный расчёт цены и скоринга                |
| `server/buildscope/qualification.ts` | AI-квалификация с Zod-гейтом и fallback                 |
| `server/buildscope/proposal.ts`      | Детерминированный PDF-пропозал                          |
| `drizzle/`                           | Схема и SQL-миграции                                    |
| `shared/`                            | Константы и типы, общие для клиента и сервера           |

## Локальный запуск

```bash
corepack enable                # активирует pnpm из packageManager
pnpm install

cp .env.example .env           # заполните DATABASE_URL (и JWT_SECRET для прод)

pnpm db:push                   # сгенерировать и применить миграции
pnpm seed                      # демо-данные: компания alatau-build, 12 лидов, тарифы

pnpm dev                       # http://localhost:3000
```

## Проверки

```bash
pnpm check    # tsc --noEmit
pnpm test     # vitest (19 тестов)
pnpm build    # vite build + esbuild сервера
```

## Деплой (Railway)

1. Репозиторий уже подключён к сервису `auto-stroy` (проект `desirable-enchantment`), БД — сервис `MySQL` (volume).
2. Переменные сервиса:
   - `DATABASE_URL` — reference на `${{MySQL.MYSQL_URL}}` (уже подключено);
   - `JWT_SECRET` — случайная строка ≥ 32 символов (уже установлено);
   - `CRM_DEMO_MODE=false` — включить обязательную авторизацию для CRM-мутаций;
   - опционально `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`;
   - опционально Telegram-воркер: `ENABLE_TELEGRAM_WORKER=true`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
3. Деплой срабатывает автоматически на push в `main`. Healthcheck `/healthz` настроен в Railway.
4. Для миграций/seed против прод-БД создайте временный TCP-прокси (Railway UI → MySQL → TCP Proxy), выполните команды, затем **удалите прокси**:
   ```bash
   DATABASE_URL=<proxied-url> pnpm db:push
   DATABASE_URL=<proxied-url> pnpm seed
   ```
5. Health-check: `GET /healthz` → `{"ok":true,"database":"ok"}`.

## Безопасность

- `JWT_SECRET` обязателен в production — сервер подписывает сессионные cookie HS256.
- Cookie: `httpOnly`, `Secure` на HTTPS, `SameSite=None` только вместе с `Secure` (на HTTP — `Lax`).
- Публичный эндпоинт заявок ограничен rate-limit (30 запросов / 10 мин / IP, in-memory); CRM-мутации — 60/мин/IP.
- Тело запроса ограничено 1 MB; базовые security-заголовки (nosniff, frame-options, referrer-policy).
- Внутренние ошибки API в production маскируются (`errorFormatter`), детали только в логах сервера.
- `CRM_DEMO_MODE=false` включает обязательную авторизацию для CRM-мутаций (owner/manager; analyst — read-only).
- Graceful shutdown по SIGTERM/SIGINT: сервер дорабатывает in-flight запросы перед рестартом платформы.
- Заметки клиента передаются в LLM как недоверенный ввод; цена/скоринг считаются только детерминированным кодом.
- Уникальный индекс `rateTables(companyId, version, region, material, finishTier)` защищает от гонки версий тарифов.

## Telegram outbox

Хот-лиды (score ≥ 61) попадают в очередь `notifications` (channel=Telegram, status=queued). При `ENABLE_TELEGRAM_WORKER=true` + токене бота воркер раз в 60 секунд отправляет до 10 записей: успешные помечаются `sent`, постоянные ошибки (4xx) — `failed`, сетевые/5xx остаются в очереди для повтора. Без токена очередь просто копится и видна в CRM.

## Demo-режим CRM

CRM-маршруты публичны и работают на seed-компании `alatau-build` (сервер сам резолвит `companyId`, клиент не может выбрать тенант). Перед продовым запуском с реальными клиентами: перевести CRM-мутации на `protectedProcedure` и добавить проверку `crmRole` (owner/manager/analyst) — см. `docs/ARCHITECTURE.md`.
