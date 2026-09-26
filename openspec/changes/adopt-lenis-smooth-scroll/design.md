# Design

## Context

Приложение работает на Next.js 16.3.5 и React 19.3.0 с App Router. Страница локали собирается из преимущественно серверных компонентов, а клиентскими точками уже являются `LocaleTransition`, `FinePointerCursor`, `HeroField`, reveal-логика Timeline и `SmoothWheelScroll`. Главная страница использует обычный viewport/document scroll; отдельный scroll-контейнер есть у мобильной панели Header.

Текущий `SmoothWheelScroll` слушает `window` с `passive: false`, вручную фильтрует `ctrlKey`, горизонтальные жесты и nested-scroll, а затем вызывает `window.scrollTo` в собственном `requestAnimationFrame`. `LocaleTransition` посылает `smooth-scroll:reset`, временно переключает CSS-класс и сам сбрасывает `scrollY`. Базовые стили оставляют `scroll-behavior: smooth` для якорей и отключают его при reduced motion.

Lenis выбран как специализированный engine, а не Locomotive Scroll или GSAP: проекту пока не нужны parallax, scroll-trigger orchestration, fake-scroll layout или отдельная animation ecosystem. Официальный `lenis/react` даёт root-инстанс и `useLenis`, а core поддерживает anchors, prevent-области и автоматическое уважение `prefers-reduced-motion`.

## Goals / Non-Goals

**Goals:**

- Сделать Lenis единственным JavaScript-слоем, который сглаживает wheel-ввод страницы.
- Сохранить native document scroll, native scrollbar и естественное touch-поведение.
- Сохранить текущие пользовательские свойства: точность малых delta, быструю смену направления, отсутствие отскока на границах и независимость горизонтальных/zoom-жестов.
- Централизовать anchors и программный reset в одном Lenis-инстансе.
- Корректно пропускать прокрутку открытой мобильной панели и другие явно отмеченные вложенные области.
- Отключать сглаживание и делать программные переходы мгновенными при `prefers-reduced-motion: reduce`.
- Удалить ручной animation-frame цикл, старые `data-smooth-scroll*` состояния и временный `.is-wheel-scrolling` обход.

**Non-Goals:**

- Parallax, scroll-linked effects, scroll snapping, section-by-section paging или горизонтальный smooth scroll.
- Перевод всех reveal-анимаций, кастомного курсора или locale transition на Lenis events.
- Замена `IntersectionObserver` в Timeline и добавление GSAP/Motion/Locomotive Scroll.
- Изменение дизайна шапки, структуры локалей или поведения мобильного меню за пределами передачи scroll-ввода.
- Принудительное сглаживание touch-жестов на телефонах.

## Decisions

### 1. Root-интеграция Lenis на уровне locale layout

Создать клиентский `SmoothScrollRoot`/`LenisRoot`, который рендерит `<ReactLenis root />` и монтируется в `src/app/[locale]/layout.tsx` рядом с `LocaleTransitionProvider`, а не внутри страницы. Это исключает повторную установку listeners при смене содержимого страницы и оставляет scroll engine одной инфраструктурной точкой для Header, main, Footer и locale transition.

Использовать `autoRaf: true`, не добавлять второй `requestAnimationFrame` и не синхронизировать Lenis с React render cycle. Базовая конфигурация должна явно зафиксировать `smoothWheel: true`, `syncTouch: false`, `respectReducedMotion: true`, `stopInertiaOnNavigate: true` и единичный `wheelMultiplier: 1`, если они нужны для читаемости контракта.

Рассматривалось сохранение ручного `SmoothWheelScroll` рядом с Lenis, но это создаёт двойной перехват wheel и непредсказуемую сумму инерции, поэтому такой режим запрещён.

### 2. Фильтрация ввода через публичные хуки Lenis

Не перехватывать `wheel` самостоятельно. Для совместимости с текущими гарантиями использовать публичные опции Lenis:

- `virtualScroll` — пропускать pinch-to-zoom (`ctrlKey`) и горизонтально доминирующие жесты, чтобы браузер обработал их нативно;
- `prevent`/`data-lenis-prevent` — исключать открытые вложенные scroll-контейнеры;
- `syncTouch: false` — оставить touch scroll браузеру и не вводить iOS-специфичную инерцию.

Нормализацию `deltaMode`, clamp, ручное определение границ и остановку frame-loop не переносить в новый код: это теперь ответственность engine. Поведение проверяется через реальные browser scenarios, а не через внутренние поля Lenis.

### 3. Anchors и фиксированная шапка

Включить `anchors` у Lenis и настроить отступ для header высотой 88px. Оставить `scroll-padding-top: 88px` как progressive-enhancement/fallback для сценария без JavaScript, но проверить, что активный Lenis не применяет отступ дважды. Переходы по `#main`, `#about`, `#contact`, `#top` и ссылки из Header должны использовать единый smooth-scroll путь.

При `prefers-reduced-motion: reduce` anchor-переходы должны быть мгновенными. Клавиатурный focus и skip-link не должны зависеть от декоративной плавности и обязаны оставаться видимыми.

### 4. Reset и смена локали

Сохранить существующее событие `smooth-scroll:reset` как узкий внутренний bridge, но изменить его реализацию: адаптер Lenis вызывает immediate scroll-to-top, останавливает остаточную инерцию перед навигацией и запускает instance снова. `LocaleTransition` больше не должен напрямую вызывать `window.scrollTo` и переключать `.is-wheel-scrolling`.

Это позволяет не протаскивать Lenis ref через `LocaleTransitionProvider`, который находится на другой клиентской границе, и сохраняет детерминированный переход `/ru` ↔ `/en`. Если во время реализации станет возможным безопасно использовать общий context без изменения layout-границ, bridge можно заменить на typed hook, но отдельный глобальный event остаётся допустимым минимальным контрактом.

### 5. Nested-scroll мобильного меню

Когда мобильная панель открыта, она получает `data-lenis-prevent`. В закрытом состоянии атрибут не выставляется, поэтому hover над обычной шапкой не отключает smoothing всего документа. Нативный `overflow-y: auto` и `overscroll-behavior: contain` панели остаются без изменений.

В дальнейшем новые вложенные scroll-контейнеры должны явно использовать тот же маркер, а не добавлять собственные wheel-listeners.

### 6. CSS и DOM-контракт

Подключить рекомендуемый CSS Lenis в глобальном клиентском стилевом слое. Удалить правила и тестовые ожидания, завязанные только на `.is-wheel-scrolling`, `data-smooth-scroll` и `data-smooth-scroll-state`. Сохранить базовый `scroll-behavior` для no-JS fallback и reduced-motion override, если итоговый computed style не конфликтует с Lenis CSS.

Стабильным признаком активного engine в browser-тестах считать стандартный Lenis-класс на `html` и наблюдаемое поведение scroll, а не внутреннее состояние `isScrolling` или приватные поля инстанса.

## Risks / Trade-offs

- **[Risk]** Lenis может иначе интерпретировать малые trackpad delta, чем текущий адаптивный коэффициент. → **Mitigation:** сохранить `wheelMultiplier: 1`, проверить малые события и подобрать только публичные `lerp`/`duration` параметры без ручного усиления delta.
- **[Risk]** Anchor-offset и `scroll-padding-top` могут сложиться. → **Mitigation:** добавить отдельный тест фактической позиции заголовка после перехода к секции и оставить только одну активную коррекцию в runtime.
- **[Risk]** Прямой dispatch reset до router navigation может не попасть в новый instance при смене locale layout. → **Mitigation:** проверить reset до push, первый кадр после pathname change и запуск с `window.scrollY === 0`; при необходимости повторить immediate reset после commit pathname.
- **[Risk]** `data-lenis-prevent` на слишком широком элементе отключит smoothing там, где нужен document scroll. → **Mitigation:** выставлять атрибут только для открытой мобильной панели и закрепить тестом wheel вне/внутри панели.
- **[Risk]** Удаление custom data-state усложнит ожидание завершения анимации в тестах. → **Mitigation:** использовать polling фактического `scrollY` с разумным timeout и отдельную проверку, что позиция стабилизировалась.
- **[Risk]** Браузерная версия/Lenis patch update изменит внутренние CSS-классы. → **Mitigation:** pin-ить зависимость в lockfile и не строить продуктовую логику на приватных именах/объектах Lenis.

## Migration Plan

Изменение не требует миграции данных. Порядок: добавить зависимость и root-адаптер, подключить его в layout, перенести reset/anchors/nested-scroll, затем удалить старый контроллер и обновить тесты. Откат — вернуть `SmoothWheelScroll`, старые CSS-правила и тестовые ожидания, удалить `lenis` из package manifest/lockfile; серверные маршруты и контент при этом не затрагиваются.
