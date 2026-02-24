# Проблемы и исправления — Архитектура интернет-магазина

## Критические ошибки (исправлены)

### 1. Guest cart в Header — N API-запросов при каждом обновлении корзины
**Было:** При каждом `cart-updated` event (добавление, удаление, изменение) для КАЖДОГО товара в гостевой корзине делался отдельный `GET /api/v1/products/:slug` — полная загрузка товара со всеми вариантами. 3 товара = 3 тяжёлых запроса только для обновления иконки корзины в хедере.  
**Стало:** Цена (`price`) сохраняется в localStorage при добавлении товара. Header считает `count` и `total` из localStorage за 0 мс — без запросов в API.  
**Файлы:** `Header.tsx`, `useAddToCart.ts`

### 2. Add to Cart — лишний GET перед POST
**Было:** Клик «В корзину» → GET `/api/v1/products/:slug` (загрузка всего товара) → POST `/api/v1/cart/items`. Два запроса вместо одного.  
**Стало:** `defaultVariantId` возвращается в ответе списка товаров → карточка передаёт его в хук → один POST напрямую.  
**Файлы:** `products-find-transform.service.ts`, `ProductCard.tsx`, `useAddToCart.ts`, `products/page.tsx`

### 3. formatPrice — console.log на КАЖДЫЙ вызов
**Было:** Каждый рендер каждой карточки товара вызывал `console.log` из `formatPrice`. 24 товара × 2 цены × ре-рендеры = сотни логов в секунду. Замедляло DevTools и создавало визуальный хаос в консоли.  
**Стало:** Debug-логи из `formatPrice` и `initializeCurrencyRates` убраны.  
**Файлы:** `currency.ts`

### 4. console.log повсюду в production-коде
**Было:** API client логировал каждый GET/POST/PUT; transform service логировал для каждого товара; filter service логировал при фильтрации; products API route логировал фильтры и результат.  
**Стало:** Все debug console.log из transform, filter сервисов и products route убраны.  
**Файлы:** `products-find-transform.service.ts`, `products-find-filter.service.ts`, `api/v1/products/route.ts`, `products/page.tsx`

### 5. Нет ограничения на limit — загрузка 99990 записей из БД
**Было:** Default `perPage = 9999` на странице товаров, query executor делал `take: limit * 10 = 99990`. Загружались ВСЕ товары из БД с ВСЕМИ связями, фильтровались и сортировались в памяти.  
**Стало:** Default `perPage = 24`, максимум 200 через API. DB query грузит max `200 * 10 = 2000` записей.  
**Файлы:** `products/page.tsx`, `api/v1/products/route.ts`

### 6. Пагинация не работала
**Было:** `slice(0, limit)` — всегда первые N товаров, параметр `page` игнорировался.  
**Стало:** `slice((page - 1) * limit, page * limit)`.  
**Файлы:** `products-find.service.ts`

### 7. Нет кэширования — каждый запрос в БД
**Было:** `cache: 'no-store'` на странице, Redis подключён но не используется для товаров.  
**Стало:** Redis-кэш в products API route (TTL 2 мин), инвалидация при создании/обновлении товара в админке (`products:*` pattern delete).  
**Файлы:** `api/v1/products/route.ts`, `cache-revalidator.ts`

---

## Архитектурные рекомендации (следующие шаги)

### A. Перенести фильтры в БД (приоритет — высокий)
Сейчас фильтры по цене/цвету/размеру/бренду работают **в памяти** на сервере. Нужно:
- Перенести price filter в Prisma `where` (variants.price range)
- Перенести brand filter в Prisma `where` (brandId IN [...])
- Для color/size — добавить денормализованные поля или использовать SQL subquery
- Тогда `skip`/`take` будут работать на уровне БД и нужно грузить ровно 24 записи

### B. Облегчить product list query (приоритет — высокий)
Сейчас для списка грузятся ВСЕ связи: translations, brand.translations, variants.options.attributeValue.attribute, variants.options.attributeValue.translations, labels, categories.translations, productAttributes.attribute.translations.values.translations.  
Нужен отдельный «лёгкий» include для списка — только поля для карточки.

### C. Wishlist / Compare / Related Products — тот же паттерн (приоритет — средний)
На страницах Wishlist, Compare, RelatedProducts при клике «В корзину» тоже делается лишний GET. Нужно аналогично передавать `defaultVariantId` из ответа.

### D. API client console.log (приоритет — низкий)
В `http-methods.ts` 10+ console.log на каждый запрос (URL, status, content-type, parsed). Для production убрать или переключить на logger с уровнями.
