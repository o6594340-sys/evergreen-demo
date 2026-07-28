# CLAUDE.md — Evergreen Life demo (форк mini-app Event PWA)

## Важно для работы

- Это отдельный репозиторий-форк основного mini-app для демо клиенту Evergreen Life. Git-корень — корень этого репозитория.
- **GitHub Pages:** `https://o6594340-sys.github.io/evergreen-demo/`
- **Репозиторий:** `https://github.com/o6594340-sys/evergreen-demo`
- **Пароль админки (без ?p=):** `evergreen2026`
- **Service Worker:** сейчас **отключён** (kill-switch) — см. раздел «Service Worker» ниже. Регистрация убрана из `index.html`.
- **Брендинг:** акцент `#94A86B` (зелёный Evergreen Life), лого — эмодзи 🌿
- **В боковом меню админки скрыты** (класс `hidden`, не удалены из кода): AI-импорт был возвращён обратно по просьбе клиента; всё ещё скрыты — «Шаблон страны», «Новый проект», «Бэкап»

---

## Структура

Git-корень этого репозитория = корень сайта (без вложенной папки `app/`, в отличие от родительского mini-app).

```
index.html          # Сайт участника
admin.html           # Панель организатора
dashboard.html        # Личный кабинет (SaaS) — не задействован в этой демо-версии
sw.js                # Service Worker — сейчас kill-switch (см. ниже), не зарегистрирован
manifest.json
css/
├── main.css           # Стили участника
├── admin.css          # Стили панели организатора
└── dashboard.css       # Стили личного кабинета
js/
├── firebase.js        # Инициализация Firebase (Auth + Firestore) — не задействован без ?p=
├── data.js            # Дефолтные данные — демо Стамбул + RECOGNITION (Стена признания)
├── app.js             # Логика сайта участника
├── templates.js        # Шаблоны других направлений (Токио/Дубай/Пекин/Бангкок), скрыты из меню
├── admin.js           # Логика панели (IIFE, возвращает Admin)
└── dashboard.js        # Логика личного кабинета — не задействован
```

---

## SaaS-архитектура (Firebase)

**Firebase проект:** `miceapp-saas` (Firestore + Auth)

### URL-схема

| URL | Назначение |
|-----|-----------|
| `/dashboard.html` | Личный кабинет организатора (логин + проекты) |
| `/index.html?p=PROJECT_ID` | Приложение участника (данные из Firestore) |
| `/admin.html?p=PROJECT_ID` | Админка проекта (Firebase Auth) |
| `/index.html` | Демо Стамбул (данные из localStorage) |
| `/admin.html` | Демо-админка (пароль `evergreen2026`, localStorage) |

### Структура Firestore

```
projects/{projectId}:
  ownerId:    uid           # владелец
  name:       "Стамбул 2026"
  status:     "active" | "archived"
  meta:       { emoji, dates, location }
  data:       { event, days, hotel, sights, ... }  # все admin_* ключи без префикса
  created_at: timestamp
  updated_at: timestamp
```

### Поток данных (SaaS-режим)

- **Участник** (`?p=ID`): `app.js init()` → читает Firestore → пишет в localStorage → рендерит как обычно
- **Организатор** (`?p=ID`): Firebase Auth → проверка `ownerId` → загрузка из Firestore → после каждого `save()` — дебаунс 2 сек → `syncToFirestore()`
- **Демо** (без `?p=`): старый flow через localStorage, пароль `evergreen2026`

### Auth-режимы в admin.js

- Если `_PID` (есть `?p=`): Firebase Auth (email + пароль), поле email показывается автоматически
- Если нет `?p=`: старый пароль `evergreen2026`

---

## Архитектура данных (legacy / демо)

`data.js` содержит дефолтные константы: `EVENT`, `HOTEL`, `DAYS`, `BUSINESS_SESSIONS`, `SIGHTS`, `RESTAURANTS`, `CUISINE`, `HISTORY`, `FAQ`, `NEARBY`, `CONTACTS`.

Панель сохраняет изменения в **localStorage** с префиксом `evg_admin_` (namespaced — GitHub Pages хостит все репозитории на одном домене `o6594340-sys.github.io`, localStorage общий на весь домен, поэтому префикс должен быть уникальным для каждого форка/клиента, иначе данные разных демо перемешаются):
```
evg_admin_event  evg_admin_days  evg_admin_business  evg_admin_hotel
evg_admin_sights evg_admin_restaurants evg_admin_cuisine evg_admin_history
evg_admin_announcement evg_admin_typography evg_admin_gradient
evg_admin_card_style evg_admin_motion evg_admin_brand_kits
evg_admin_transfers evg_admin_contacts evg_admin_memo evg_admin_tabs evg_admin_recognition
evg_admin_bg evg_admin_font_scale evg_admin_day_tab_style
evg_admin_splash evg_admin_favicon evg_admin_white_label
```

---

## Вкладки сайта участника

| id | Заголовок | Рендер |
|----|-----------|--------|
| `program` | 📅 Программа | `renderProgram()` |
| `transfers` | 🚌 Трансферы | `renderTransfers()` |
| `hotel` | 🏨 Отель | `renderHotel()` |
| `sights` | 🏛 Места | `renderSights()` |
| `cuisine` | 🥢 Кухня | `renderCuisine()` |
| `history` | 📜 История | `renderHistory()` |
| `memo` | 📋 Памятка | `renderMemo()` |
| `contacts` | 📞 Контакты | `renderContacts()` |
| `recognition` | 🏆 Признание | `renderRecognition()` — фича для MLM-клиентов: карточки участников с рангом/достижением |

---

## Импорт программы в админке

Раздел **Импорт программы** — текстовый парсер без внешних сервисов.

Формат:
```
День 1 | 18 ноября, понедельник
09:00 | Завтрак
11:00 | Деловая: Название сессии
13:00 | Обед
```

- Разделители `|` и `—` равнозначны
- `Деловая: ...` → автоматически в `business[]`
- Типы по ключевым словам: завтрак/обед/ужин → `meal`, трансфер → `transfer`, экскурсия → `excursion`

---

## Service Worker

**Сейчас отключён.** Изначально `sw.js` кэшировал same-origin запросы для офлайн-режима (кэш `evergreen-vN`), но во время активной доработки демо это вызывало показ старого контента даже после деплоя фиксов — правки казались "не применившимися". Причина в паре: любое изменение требует явно поднять номер версии кэша, а сам процесс обновления SW в браузере (skipWaiting/clients.claim) сработал не сразу, и клиент дважды видел устаревшую версию сайта.

Текущий `sw.js` — **kill-switch**: при активации стирает все кэши и снимает сам себя (`self.registration.unregister()`), затем перезагружает открытые вкладки. Регистрация `navigator.serviceWorker.register(...)` убрана из `index.html`, поэтому новые визиты SW вообще не ставят.

**Чтобы включить офлайн-режим обратно** (когда демо финализировано):
1. Вернуть в конец `index.html` перед `</body>`:
   ```html
   <script>
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
     }
   </script>
   ```
2. Переписать `sw.js` на обычную кэширующую логику (install → `caches.open(CACHE).then(c => c.addAll(OFFLINE))`, fetch → cache-first с фоновым обновлением). Список `OFFLINE` — **относительные пути без ведущего `/`** (сайт живёт в подпапке `/evergreen-demo/`, абсолютные пути `/index.html` резолвятся в корень домена и 404-ят — это уже было живым багом один раз).
3. При каждом изменении JS/CSS/HTML — поднимать `CACHE = 'evergreen-vN'`.

---

## PRO-оформление (admin.js)

- **Brand Kit** — сохранить/применить пресет оформления
- **Градиент** — 5 рецептов: Glow / Diagonal / Vertical / Mesh / Flat
- **Стили карточек** — Elevated / Flat / Glass / Outlined
- **Типографика** — 5 пар шрифтов, подгружаются из Google Fonts динамически
- **Анимации** — Swift / Elegant / Minimal

---

## Деплой

Папка `app/` — статика, сервер не нужен. Деплой: GitHub Pages.

Firebase SDK подключён через CDN (compat v10.14.0) — без сборщика.

**Firestore правила:** обновлены до постоянных production-правил (test mode с истекающей датой убран):
```
match /projects/{projectId} {
  allow read: if true;
  allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
}
```
Правила общие на весь проект `miceapp-saas` — используются и другими форками/клиентами на том же Firebase-проекте, изоляция данных идёт через `ownerId` на уровне документа, не через отдельные базы.

---

## Бизнес-контекст

**Этот репозиторий** — форк основного mini-app, сделан как демо для конкретного прямого корпоративного клиента: **Evergreen Life**, MLM-компания, продаёт БАДы (экстракт оливковых листьев), проводит живые мероприятия для дистрибьюторской сети.

**Отличия от базового продукта:**
- Брендинг перекрашен в зелёный `#94A86B`, все упоминания предыдущего клиента (ТехноНИКОЛЬ) вычищены из контента и доков
- Добавлена фича **«Стена признания»** (`RECOGNITION` в data.js, вкладка `recognition`) — карточки участников с рангом/достижением, специально под MLM-механику (признание рангов — эмоциональное ядро таких мероприятий)
- Реальные телефоны (личный номер организатора, номера отелей) заменены на плейсхолдер `+7 777 777-77-77`
- Меню админки упрощено для нетехнического клиента — часть разделов скрыта (см. выше)
- Добавлен импорт программы из Excel (`.xlsx`/`.xls`), в дополнение к Word/PDF/TXT

**Общая бизнес-модель продукта (родительский mini-app):** SaaS-подписка для MICE-агентств. Текущее состояние — MVP с Firebase Auth + Firestore, каждый проект — документ в Firestore. Следующие шаги для коммерческого запуска: Firebase Storage для фото, платёжная интеграция, лимиты по тарифам.
