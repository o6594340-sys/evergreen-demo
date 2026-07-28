# CLAUDE.md — Evergreen Life demo (форк mini-app Event PWA)

## Важно для работы

- Это отдельный репозиторий-форк основного mini-app для демо клиенту Evergreen Life. Git-корень — корень этого репозитория.
- **GitHub Pages:** `https://o6594340-sys.github.io/evergreen-demo/`
- **Репозиторий:** `https://github.com/o6594340-sys/evergreen-demo`
- **Пароль админки (без ?p=):** `evergreen2026`
- **Текущая версия кэша SW:** `evergreen-v1`
- **Брендинг:** акцент `#94A86B` (зелёный Evergreen Life), лого — эмодзи 🌿

После изменений в JS/CSS/HTML — **обязательно поднять версию кэша** в `sw.js` (`evergreen-vN`), иначе пользователи получают старый файл из Service Worker.

---

## Структура

```
app/
├── index.html        # Сайт участника
├── admin.html        # Панель организатора
├── dashboard.html    # Личный кабинет (SaaS) — логин + список проектов
├── sw.js             # Service Worker — кэш mice-v38
├── manifest.json
├── css/
│   ├── main.css        # Стили участника
│   ├── admin.css       # Стили панели организатора
│   └── dashboard.css   # Стили личного кабинета
└── js/
    ├── firebase.js     # Инициализация Firebase (Auth + Firestore)
    ├── data.js         # Дефолтные данные (константы) — демо Стамбул
    ├── app.js          # Логика сайта участника
    ├── templates.js    # HTML-шаблоны рендеринга
    ├── admin.js        # Логика панели (IIFE, возвращает Admin)
    └── dashboard.js    # Логика личного кабинета
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

Файл `sw.js`. Кэширует только same-origin запросы (внешние URL пропускает).

При изменении любого JS/CSS/HTML файла **поднять версию**:
```js
const CACHE = 'mice-v38'; // → mice-v39 и т.д.
```

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

**Firestore правила:** сейчас в test mode (30 дней). Перед production обновить:
```
allow read: if true;  // участники читают без auth
allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
allow create: if request.auth != null;
```

---

## Бизнес-контекст

**Бизнес-модель:** SaaS-подписка для MICE-агентств.

**Текущее состояние:** MVP с Firebase Auth + Firestore. Каждый проект — документ в Firestore, доступен с любого устройства.

**Следующие шаги:**
- Firebase Storage для фото агентств (сейчас фото — URL или base64)
- Firestore security rules для production
- Платёжная интеграция (подписка)
- Ограничение количества проектов по тарифу
