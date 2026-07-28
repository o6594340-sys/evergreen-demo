# CLAUDE.md — mini-app Event PWA

## Важно для работы

- **Git-корень — папка `app/`**, не корень проекта. Все `git` команды выполнять из `app/`.
- **GitHub Pages:** `https://o6594340-sys.github.io/mini-app-program/`
- **Репозиторий:** `https://github.com/o6594340-sys/mini-app-program`
- **Пароль старой админки (без ?p=):** `forum2024`
- **Текущая версия кэша SW:** `mice-v38`

После изменений в JS/CSS/HTML — **обязательно поднять версию кэша** в `sw.js` (`mice-vN`), иначе пользователи получают старый файл из Service Worker.

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
| `/admin.html` | Демо-админка (пароль `forum2024`, localStorage) |

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
- **Демо** (без `?p=`): старый flow через localStorage, пароль `forum2024`

### Auth-режимы в admin.js

- Если `_PID` (есть `?p=`): Firebase Auth (email + пароль), поле email показывается автоматически
- Если нет `?p=`: старый пароль `forum2024`

---

## Архитектура данных (legacy / демо)

`data.js` содержит дефолтные константы: `EVENT`, `HOTEL`, `DAYS`, `BUSINESS_SESSIONS`, `SIGHTS`, `RESTAURANTS`, `CUISINE`, `HISTORY`, `FAQ`, `NEARBY`, `CONTACTS`.

Панель сохраняет изменения в **localStorage** с префиксом `admin_`:
```
admin_event  admin_days  admin_business  admin_hotel
admin_sights admin_restaurants admin_cuisine admin_history
admin_announcement admin_typography admin_gradient
admin_card_style admin_motion admin_brand_kits
admin_transfers admin_contacts admin_memo admin_tabs
admin_bg admin_font_scale admin_day_tab_style
admin_splash admin_favicon admin_white_label
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
