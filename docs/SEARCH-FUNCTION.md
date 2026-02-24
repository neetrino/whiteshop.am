# Live Search (Instant Search) — описание реализации

Документ описывает, как реализован поиск «по мере ввода» (live search / instant search) в хедере сайта.

---

## Общая схема

- **Клиент:** поле ввода в хедере → хук `useInstantSearch` (debounce, запросы к API) → выпадающий список `SearchDropdown`.
- **Сервер:** Next.js API Route `GET /api/search/instant` → Prisma → PostgreSQL (поиск по названию, описанию, ингредиентам).
- **Сторонние поисковые библиотеки не используются** — только React, fetch, Prisma.

---

## Файлы

| Файл | Назначение |
|------|------------|
| `src/hooks/useInstantSearch.ts` | Хук: состояние поиска, debounce, запросы к API, навигация с клавиатуры |
| `src/app/api/search/instant/route.ts` | API: приём запроса, поиск через Prisma, ответ JSON |
| `src/components/SearchDropdown.tsx` | UI выпадающего списка результатов (карточки, лоадер, «Տեսնել բոլորը») |
| `src/components/DesktopHeader.tsx` | Десктоп-хедер: инпут + хук + SearchDropdown |
| `src/components/MobileHeader.tsx` | Мобильный хедер: то же поведение в мобильном меню |

---

## 1. Хук `useInstantSearch` (`src/hooks/useInstantSearch.ts`)

### Параметры (опции)

- **debounceMs** (по умолчанию 200) — задержка в мс перед отправкой запроса после последнего ввода.
- **minQueryLength** (по умолчанию 2, в хедере задаётся 1) — минимальная длина строки для запроса.
- **maxResults** (по умолчанию 8) — максимум результатов (в десктопе 5, в мобиле 4).

### Состояние

- `query` — строка в поле ввода.
- `results` — массив найденных товаров (`SearchResult[]`).
- `loading` — идёт запрос.
- `error` — сообщение об ошибке или `null`.
- `isOpen` — открыт ли выпадающий список.
- `selectedIndex` — индекс выбранного пункта для навигации с клавиатуры (-1 = ничего не выбрано).

### Логика

1. **Debounce:** при изменении `query` ставится таймер на `debounceMs`. Если пользователь снова печатает — таймер сбрасывается. Когда таймер срабатывает — вызывается `performSearch(query.trim())`.
2. **performSearch:**
   - Если длина запроса &lt; `minQueryLength` — очищаются результаты, запрос не отправляется.
   - Предыдущий запрос отменяется через `AbortController.abort()`.
   - Создаётся новый `AbortController`, выполняется `fetch('/api/search/instant?q=...&limit=...')` с `signal`, без кэша (`cache: 'no-store'`, заголовок `Cache-Control: no-cache`).
   - Ответ разбирается как JSON, в состояние попадает `data.results`; при ошибке (кроме AbortError) выставляется `error`, результаты очищаются.
3. **Клавиатура (`handleKeyDown`):** при открытом списке и непустых результатах:
   - **ArrowDown** — следующий пункт (по кругу).
   - **ArrowUp** — предыдущий пункт (по кругу).
   - **Enter** — закрыть список (переход по выбранному пункту обрабатывается в родительском компоненте через `onResultClick` и/или Enter в инпуте).
   - **Escape** — закрыть список и сбросить выбранный индекс.
4. **clearSearch** — обнуляет `query`, `results`, `error`, `loading`, `isOpen`, `selectedIndex`.

### Интерфейс результата `SearchResult`

- `id`, `name`, `description`, `price`, `salePrice?`, `image`, `ingredients?`, `category`, `type: 'product'`.

---

## 2. API `GET /api/search/instant` (`src/app/api/search/instant/route.ts`)

### Параметры запроса

- **q** — поисковая строка (обязательна, иначе возвращается `{ results: [] }`).
- **limit** — максимальное количество результатов (по умолчанию 8).

### Логика поиска

1. Строка приводится к нижнему регистру и обрезается: `searchQuery = query.toLowerCase().trim()`.
2. Запрос к БД через **Prisma**: `prisma.product.findMany` с условиями:
   - `isAvailable: true`, `published: true`;
   - **OR** по полям (регистронезависимо, `mode: 'insensitive'`):
     - `name` содержит `searchQuery`;
     - `description` содержит `searchQuery`;
     - `ingredients` содержит `searchQuery`;
   - `take: limit`;
   - выборка полей: id, name, description, price, salePrice, image, ingredients, category.name.
3. **Сортировка релевантности** (в коде после запроса): приоритет — совпадение в **названии** &gt; в **ингредиентах** &gt; в **описании**.
4. Формируется массив объектов для ответа: те же поля + `category` как строка (имя категории или «Без категории»), `type: 'product'`.
5. Ответ: `NextResponse.json({ results })` с заголовком `Cache-Control: no-store, must-revalidate`.
6. При любой ошибке — ответ 500 и `{ error, results: [], details }`.

---

## 3. Компонент `SearchDropdown` (`src/components/SearchDropdown.tsx`)

### Пропсы

- `results`, `loading`, `error`, `isOpen`, `selectedIndex`, `query`;
- `onResultClick(result)` — клик по товару;
- `onClose()` — закрыть выпадающий список;
- `className` — дополнительные классы.

### Поведение

- Если `!isOpen` — ничего не рендерится.
- Показывается список с `role="listbox"`, блок с прокруткой:
  - при `loading` — индикатор «Փնտրում...»;
  - при `error` — текст ошибки;
  - при отсутствии результатов и не loading — пустое состояние («Արտադրանք չի գտնվել» и т.п.);
  - при наличии результатов — карточки товара (изображение, название, описание, цена/скидка, категория).
- Каждая карточка — кнопка с `onClick={() => onResultClick(result)}`, подсветка по `selectedIndex`.
- Внизу при непустом `query` — ссылка «Տեսնել բոլորը» на `/products?search=...`, по клику вызывается `onClose`.

---

## 4. Использование в хедере

### DesktopHeader (`src/components/DesktopHeader.tsx`)

- Вызов хука с `debounceMs: 200`, `minQueryLength: 1`, `maxResults: 5`.
- `ref={searchRef}` на контейнер поиска для закрытия по клику вне (если есть такой обработчик).
- Инпут: `value={query}`, `onChange={(e) => setQuery(e.target.value)}`, при **Enter** — переход на `/products?search=...` и закрытие списка; `onKeyDown` передаётся в хук для стрелок и Escape.
- При фокусе и при вводе при `query.length >= 1` выпадающий список открывается (`setIsOpen(true)`).
- Кнопка очистки при непустом `query` вызывает `clearSearch`.
- `SearchDropdown` получает все состояния из хука и `onResultClick={handleResultClick}`.
- **handleResultClick:** переход на `/products/${result.id}`, закрытие списка и `clearSearch()`.

### MobileHeader (`src/components/MobileHeader.tsx`)

- Та же схема: `useInstantSearch` с `maxResults: 4`, инпут, Enter → `/products?search=...`, `handleKeyDown`, `SearchDropdown`.
- Дополнительно: при открытой панели поиска закрытие по клику вне через `searchRef` и `mousedown`.

---

## 5. Поток данных (кратко)

1. Пользователь вводит текст → `setQuery` → через debounce вызывается `performSearch`.
2. `performSearch` делает `fetch('/api/search/instant?q=...&limit=...')` → API выполняет Prisma-запрос → возвращает `{ results }`.
3. Хук записывает результаты в `results`, при необходимости открывает список (`isOpen`).
4. В инпуте Enter без выбора пункта → переход на страницу каталога с `?search=...`; клик по товару или Enter по выбранному пункту → переход на страницу товара и очистка поиска.

---

## 6. Важные детали реализации

- **Отмена запросов:** каждый новый ввод отменяет предыдущий fetch через `AbortController`, чтобы не показывать устаревшие результаты.
- **Без кэша:** ни в хуке, ни в API результат не кэшируется, чтобы новые товары из админки сразу попадали в поиск.
- **Регистронезависимый поиск:** в Prisma используется `mode: 'insensitive'` (для PostgreSQL — ILIKE под капотом).
- **Доступность:** у инпута заданы `aria-controls="search-results"`, `aria-expanded`, `aria-autocomplete="list"`; у списка — `role="listbox"`, у пунктов — `role="option"`, `aria-selected`.

---

*Документ создан для проекта welcomebaby.am. Обновлено при изменении логики поиска.*
