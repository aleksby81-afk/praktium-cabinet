# ПРАКТИУМ — кабинет покупателя

Дополнительный инструмент для [магазина ПРАКТИУМ](https://aleksby81-afk.github.io/Praktium_magazin/): каталог его семи товаров, заявки, статусы, профиль и бонусы. Порядок соединения с основным сайтом и ограничения текущей статической формы описаны в [INTEGRATION.md](INTEGRATION.md).

Рабочий MVP: регистрация и вход, профиль, каталог по категориям, заявки, история бонусов и ссылки на основной магазин. Backend — FastAPI / SQLAlchemy 2, frontend — React / TypeScript / Vite / Tailwind 3. PostgreSQL — основной источник данных; SQLite используется локально, если `DATABASE_URL` пуст. Бонусы не являются платёжным балансом; оплаты и списания при заказе в MVP нет.

## Структура проекта

```text
brand-cabinet/
├── backend/
│   ├── app/
│   │   ├── main.py             # приложение, CORS, создание таблиц, health
│   │   ├── config.py           # проверяемые настройки окружения
│   │   ├── database.py         # PostgreSQL / SQLite, сессии
│   │   ├── models.py           # Client, Product, Order, BonusEvent
│   │   ├── schemas.py          # входные и выходные контракты
│   │   ├── auth.py             # bcrypt, JWT
│   │   ├── dependencies.py     # доступ клиента и администратора
│   │   ├── services.py         # статусы, атомарный кэшбэк
│   │   ├── yandex_sync.py      # отказоустойчивая выгрузка XLSX
│   │   ├── seed.py             # семь товаров ПРАКТИУМ без опубликованных цен
│   │   └── routers/            # auth, users, products, orders, admin
│   ├── tests/test_smoke.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .python-version
│   └── railway.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── pages/              # все пользовательские экраны
│   │   ├── App.tsx
│   │   ├── auth.tsx
│   │   ├── components.tsx
│   │   ├── types.ts
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── public/images/         # локальные демонстрационные SVG
│   ├── server.mjs             # production HTTP-сервер, SPA fallback
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.mjs
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── railway.json
├── .gitignore
├── VERIFICATION.md
└── README.md
```

## Локальный запуск

Требуются Python 3.12 и Node.js 22.12+ (рекомендуется Node 24), npm.

### 1. Backend

Откройте терминал в корне проекта:

```sh
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
Copy-Item .env.example .env
```

macOS/Linux:

```sh
source .venv/bin/activate
cp .env.example .env
```

Установите зависимости:

```sh
python -m pip install -r requirements.txt
```

Дважды выполните `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Полученные **разные** строки внесите в локальный `.env` как `SECRET_KEY` и `ADMIN_KEY`. Настоящие секреты не коммитьте. Приложение намеренно не стартует с пустыми или короткими ключами.

```sh
python -m app.seed
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

`seed` необязателен: добавляет семь позиций действующего каталога ПРАКТИУМ только в пустую базу. Цены на основном сайте не опубликованы, поэтому в базе они отмечены нулём и в интерфейсе отображаются как «Цена уточняется». Демопользователей нет — зарегистрируйтесь через интерфейс. Таблицы создаются автоматически. Если `DATABASE_URL` пуст, создаётся `backend/brand.db`; данные сохраняются между перезапусками. Это локальный режим, не вариант хранения данных на Railway.

API: [http://localhost:8000/docs](http://localhost:8000/docs), проверка БД: [http://localhost:8000/health](http://localhost:8000/health).

### 2. Frontend

Во втором терминале:

```sh
cd frontend
npm ci
```

Скопируйте `.env.example` в `.env`, оставьте `VITE_API_URL=http://localhost:8000`.

```sh
npm run dev
```

Откройте адрес, указанный Vite (обычно [http://localhost:5173](http://localhost:5173)). Для production-раздачи:

```sh
npm run build
npm start
```

По умолчанию сервер слушает порт 3000, либо `PORT`. Express раздаёт `dist`, хешированные assets кэшируются, HTML — нет. Прямое открытие `/catalog`, `/orders` и остальных маршрутов возвращает SPA. Отсутствующие файлы возвращают 404. `vite preview` не используется как production-сервер.

Команды используют штатный загрузчик Vite `--configLoader native` и конфигурацию `vite.config.mjs`: это устраняет лишнюю сборку конфигурации через esbuild и работает в проверенной ограниченной Windows-среде.

## API и правила данных

| Метод и путь | Доступ | Назначение |
|---|---|---|
| POST `/auth/register` | публичный | name, email, password, phone; приветственные бонусы и JWT |
| POST `/auth/login` | публичный | email + password в JSON, JWT |
| GET / PATCH `/me` | Bearer JWT | профиль; частичное изменение name и/или phone |
| GET `/me/bonuses` | Bearer JWT | операции только текущего клиента |
| GET `/me/orders` | Bearer JWT | заявки с товаром только текущего клиента |
| GET `/products?collection=…` | публичный | каталог, необязательный фильтр |
| POST `/orders` | Bearer JWT | product_id, quantity, comment |
| GET `/admin/orders` | admin_key | все заявки |
| PATCH `/admin/orders/{id}/status` | admin_key | JSON `{"status":"processing"}` |
| PATCH `/admin/orders/{id}/price` | admin_key | согласованная цена, JSON `{"unit_price":"2500.00"}` |
| POST `/admin/products` | admin_key | создание товара |
| POST `/admin/sync-all` | admin_key | полная повторная выгрузка |

Admin API принимает `?admin_key=…`. Это **упрощённая схема MVP**: ключ может попасть в историю браузера, URL и access-логи. До production желательно заменить полноценной административной авторизацией; не публикуйте ссылки с ключом. Админку можно использовать через `/docs`. Ключ не передаётся в frontend.

Пример тела товара:

```json
{"title":"Название товара","description":"Описание","price":"2900.00","collection":"Коллекция","image_url":"https://example.com/product.jpg","in_stock":true}
```

Цена и бонусы в БД — `Numeric`, в расчётах — `Decimal`, в JSON — строки. Frontend использует числа только для отображения, итоговые финансовые расчёты выполняет backend. `Order.unit_price` фиксирует цену на момент заявки. Изменение цены товара не меняет стоимость старой заявки. Количество — целое от 1 до 1000. `in_stock` — флаг доступности, не складской остаток: резервирования количества в MVP нет.

Статусы: `new → processing → confirmed → shipped → done`. Из любого незавершённого статуса разрешён `cancelled`. Обратные переходы запрещены; повтор текущего статуса безопасен. Кэшбэк = `unit_price × quantity × CASHBACK_PERCENT / 100`, округление до двух знаков `ROUND_HALF_UP`.

Изменение статуса, операция бонусов и баланс клиента фиксируются одной транзакцией. Условный атомарный UPDATE защищает конкурентные переходы, уникальный `BonusEvent.order_id` — повторное начисление; баланс обновляется выражением в БД, без потери параллельных начислений. Ставка кэшбэка берётся при завершении заказа. Изменение ставки не пересчитывает уже начисленные бонусы.

JWT подписан HS256, срок по умолчанию 24 часа. Проверяются подпись, срок и существование клиента. Пароли bcrypt: минимум 8 символов, максимум 72 байта UTF-8; пароль не обрезается и пробелы сохраняются. Email нормализуется к нижнему регистру. JWT хранится в localStorage согласно заданию. `401` завершает сессию; сеть/5xx оставляют возможность повторить запрос без цикла перенаправлений. Восстановление пароля и подтверждение email пока не реализованы.

## Yandex Disk

Без `YANDEX_DISK_TOKEN` выгрузка возвращает `skipped` и не делает сетевых запросов. С токеном после регистрации, создания заявки и изменения статуса запускается best-effort задача FastAPI после фиксации БД. `/admin/sync-all` запускает полную сверку и возвращает `synced`, `skipped` или `failed`.

Используется [официальный REST API Яндекс Диска](https://yandex.ru/dev/disk/rest/): `/resources`, `/resources/download`, `/resources/upload`. Создаётся `/brand-cabinet`, существующие `orders.xlsx` и `bonuses.xlsx` скачиваются, строки актуализируются по полному снимку БД и файлы загружаются с перезаписью. Такой подход не дублирует события при повторной выгрузке и обновляет старые статусы. Данные листов в этих двух файлах принадлежат приложению; не редактируйте их вручную. Денежные поля экспортируются точными десятичными строками. Пользовательские строки принудительно сохраняются текстом, не Excel-формулами.

Экспорт сериализован локальным lock, а для PostgreSQL дополнительно advisory lock на время транзакции. Ошибки перехватываются; в лог пишется тип ошибки без OAuth-токенов и подписанных URL. Данные остаются в БД. Два XLSX не обновляются атомарно: при частичном сбое повторите `/admin/sync-all`. Задачи пока не durable: при остановке процесса между commit и выгрузкой нужна повторная полная синхронизация. Для больших объёмов нужна отдельная очередь и потоковый экспорт.

## Переменные окружения

| Переменная | Где | Значение |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL URL через Railway Reference; пусто — локальная SQLite |
| `SECRET_KEY` | backend | криптографически случайная строка, минимум 32 символа |
| `ADMIN_KEY` | backend | отдельная случайная строка, минимум 24 символа |
| `YANDEX_DISK_TOKEN` | backend | необязательный OAuth-токен с правами чтения/записи Диска |
| `WELCOME_BONUS` | backend | по умолчанию 100, неотрицательное число, до 2 десятичных знаков |
| `CASHBACK_PERCENT` | backend | по умолчанию 5, от 0 до 100 |
| `ACCESS_TOKEN_MINUTES` | backend | по умолчанию 1440 |
| `CORS_ORIGINS` | backend | по умолчанию `*`; production: точный origin frontend, несколько через запятую |
| `VITE_API_URL` | frontend | публичный HTTPS URL backend; используется во время сборки |
| `PORT` | оба сервиса | устанавливает Railway; локально API 8000, frontend 3000 |

Все `VITE_*` публичны. Не добавляйте туда секреты. После изменения `VITE_API_URL` пересоберите frontend. Для production TODO: заменить `*` на конкретный домен frontend, без завершающего `/`.

## Deployment на Railway

1. Создайте пустой GitHub repository. Из **корня brand-cabinet** выполните `git init`, `git add .`, `git commit -m "Initial brand cabinet MVP"`, привяжите свой remote и загрузите проект. `.env`, БД, `.venv`, `node_modules`, `dist` игнорируются. Не загружайте внешнюю папку `work`.
2. Создайте Railway Project, подключите GitHub repository.
3. Создайте backend service из репозитория: **Root Directory `/backend`**. В Settings укажите Config File **`/backend/railway.json`**.
4. Создайте frontend service из того же репозитория: **Root Directory `/frontend`**, Config File **`/frontend/railway.json`**. Путь config задаётся относительно корня репозитория, независимо от Root Directory — см. [документацию Railway](https://docs.railway.com/builds/build-configuration).
5. Добавьте PostgreSQL service в этот же Project.
6. В Variables backend задайте `DATABASE_URL` через Add Reference → PostgreSQL → DATABASE_URL, например `${{Postgres.DATABASE_URL}}` (имя `Postgres` должно совпадать с вашим сервисом). Префиксы `postgres://` и `postgresql://` автоматически адаптируются для psycopg 3.
7. Установите backend `SECRET_KEY`, `ADMIN_KEY`, при необходимости бонусные настройки и OAuth-токен. Не оставляйте `DATABASE_URL` пустым: файловая система сервиса Railway не заменяет PostgreSQL.
8. Создайте публичный домен backend; дождитесь успешного `/health`. Таблицы создаст старт приложения.
9. Укажите публичный URL backend в `VITE_API_URL` frontend, например `https://your-backend.up.railway.app`. Задайте `NIXPACKS_NODE_VERSION=24` при необходимости выбора Node.
10. Разверните frontend. Сборка: `npm ci && npm run build`, запуск: `npm start`, порт берётся из `$PORT`. Backend запускает `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
11. Создайте публичный домен frontend; укажите именно его HTTPS origin в `CORS_ORIGINS` backend и перезапустите backend.
12. Добавьте семь товаров магазина в пустую базу командой `python -m app.seed` в контексте backend или создайте их через Admin API. После согласования цен задайте их через Admin API. `seed` не перезаписывает существующий каталог.
13. Зарегистрируйтесь, войдите, отредактируйте профиль, создайте заявку; через Admin API проведите её по всем статусам до `done`. Проверьте кэшбэк и повтор `done`, прямое открытие `/orders`, мобильную навигацию и CORS.
14. При подключении Диска проверьте оба XLSX и ручную повторную синхронизацию.

По заданию конфигурации используют Nixpacks ([документация Nixpacks для Railway](https://nixpacks.com/docs/deploying/railway)). Railway также предлагает Railpack; если Nixpacks недоступен в вашем проекте, смените только builder на `RAILPACK` и повторно проверьте сборку. Деплой, реальные домены, PostgreSQL и OAuth требуют вашего аккаунта и вручную здесь не выполнялись.

## Проверки

```sh
# backend, с активированным venv
python -m pytest -q
python -m compileall -q app
python -m pip check
# frontend
npm run typecheck
npm run build
```

Тесты создают временную SQLite и случайные ключи только в окружении процесса. Проверяют основной путь, недопустимые запросы, изоляцию клиентов, конкурентный кэшбэк, отсутствие токена и сбой Yandex Sync. Фактический отчёт и ограничения проверки — `VERIFICATION.md`.

## Перед публичным запуском

- Укажите согласованные цены через Admin API: магазин сейчас не публикует их. Для уже созданной заявки используется `PATCH /admin/orders/{id}/price`.
- Разместите фотографии товаров отдельными HTTPS-файлами и задайте их в `Product.image_url`; сейчас кабинет показывает иллюстрации категорий.
- Настройте публичные адреса backend/frontend и добавьте ссылку на кабинет на основной сайт по `INTEGRATION.md`.
- Определите реальную политику бонусов: сейчас `WELCOME_BONUS=100`, `CASHBACK_PERCENT=5`.

## Что можно улучшить после MVP

- Уровни программы лояльности и списание бонусов при заказе.
- Реферальная программа, push-уведомления.
- Полноценная admin-панель, роли и безопасная административная авторизация.
- Управление контентом и загрузка изображений.
- Аналитика, email / Telegram уведомления.
- Миграции Alembic: `create_all` создаёт таблицы, но не изменяет существующую схему.
- Durable фоновые задачи Yandex Sync с ретраями и наблюдаемостью.
- Расширенные автоматические тесты, E2E в CI и интеграционные тесты PostgreSQL.
- Rate limiting API, восстановление пароля, подтверждение email, управление сессиями.
- Пагинация больших каталогов/историй, складские остатки и резервирование.
- Проверка требований к персональным данным и пользовательские документы перед публичным запуском.
