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

1. Репозиторий уже подключён к сервису `auto-stroy` (проект `desirable-enchantment`).
2. Добавьте в переменные сервиса:
   - `DATABASE_URL` — Railway MySQL (или внешний TiDB);
   - `JWT_SECRET` — случайная строка ≥ 32 символов;
   - опционально `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`.
3. Деплой срабатывает автоматически на push в `main`. Стартовая команда: `pnpm start` (Railway также может запускать `node dist/index.js` напрямую).
4. После первого деплоя примените миграции и seed (локально против прод-БД или через one-off job):
   ```bash
   DATABASE_URL=<prod-url> pnpm db:push
   DATABASE_URL=<prod-url> pnpm seed
   ```
5. Health-check: `GET /healthz` → `{"ok":true,"database":"ok"}`.

## Безопасность

- `JWT_SECRET` обязателен в production — сервер подписывает сессионные cookie HS256.
- Cookie: `httpOnly`, `Secure` на HTTPS, `SameSite=None` только вместе с `Secure` (на HTTP — `Lax`).
- Публичный эндпоинт заявок ограничен rate-limit (30 запросов / 10 мин / IP, in-memory).
- Тело запроса ограничено 1 MB.
- Внутренние ошибки API в production маскируются (`errorFormatter`), детали только в логах сервера.
- Заметки клиента передаются в LLM как недоверенный ввод; цена/скоринг считаются только детерминированным кодом.

## Demo-режим CRM

CRM-маршруты публичны и работают на seed-компании `alatau-build` (сервер сам резолвит `companyId`, клиент не может выбрать тенант). Перед продовым запуском с реальными клиентами: перевести CRM-мутации на `protectedProcedure` и добавить проверку `crmRole` (owner/manager/analyst) — см. `docs/ARCHITECTURE.md`.
