# Tasks

## 1. Зависимость и root-интеграция Lenis

- [ ] 1.1 Добавить pinned production-зависимость `lenis` текущей совместимой стабильной версии и обновить `package-lock.json`; проверить чистую установку без дополнительных animation-библиотек.
- [ ] 1.2 Создать клиентский `SmoothScrollRoot`/`LenisRoot` на базе `ReactLenis` с `root`, `autoRaf`, `smoothWheel`, `syncTouch: false`, `respectReducedMotion`, `stopInertiaOnNavigate` и единичным wheel multiplier; не добавлять ручной `wheel` listener или второй RAF-loop.
- [ ] 1.3 Подключить root-адаптер в `src/app/[locale]/layout.tsx`, чтобы страница, Header, Footer и locale transition использовали один viewport-инстанс; проверить отсутствие двойной инициализации при переходах между `/ru` и `/en`.
- [ ] 1.4 Подключить рекомендуемый CSS Lenis в глобальный style layer и проверить совместимость с `scroll-padding-top`, no-JS fallback, `prefers-reduced-motion` и fixed Header.

## 2. Поведение ввода и программных переходов

- [ ] 2.1 Настроить публичные Lenis-хуки для пропуска `ctrlKey`/pinch-to-zoom и горизонтально доминирующих wheel-жестов; проверить, что они не меняют `window.scrollY` через smooth-scroll путь.
- [ ] 2.2 Настроить anchors с offset фиксированной шапки, проверить переходы `#main`, секции и `#top`, отсутствие двойного offset и корректный focus-visible.
- [ ] 2.3 Перенести `smooth-scroll:reset` на immediate Lenis reset с остановкой остаточной инерции; убрать из `LocaleTransition` прямой `window.scrollTo` и переключение `.is-wheel-scrolling`, сохранив детерминированное открытие локали сверху.
- [ ] 2.4 Обновить Header: выставлять `data-lenis-prevent` только на открытой мобильной панели, сохранить native `overflow-y: auto` и `overscroll-behavior: contain`; проверить wheel внутри панели и вне неё.
- [ ] 2.5 Удалить `src/components/SmoothWheelScroll.tsx`, старые `data-smooth-scroll*` ожидания и obsolete CSS-правила после того, как новый engine покрывает все сценарии.

## 3. Браузерные регрессии

- [ ] 3.1 Переписать smooth-scroll setup в `tests/visual/interactions.visual.ts`: проверять активный Lenis root и фактическую динамику `scrollY`, а не custom `data-smooth-scroll-state`.
- [ ] 3.2 Сохранить проверки discrete wheel, малых trackpad-like delta, смены направления и обеих границ документа с допусками, устойчивыми к timing Lenis.
- [ ] 3.3 Добавить проверки `ctrlKey`, горизонтального жеста, открытой nested-панели и native touch/coarse-pointer поведения без принудительной touch-инерции.
- [ ] 3.4 Добавить тесты `prefers-reduced-motion: reduce` для мгновенного wheel/anchor/reset поведения и тест фактического anchor-offset относительно fixed Header.
- [ ] 3.5 Сохранить и расширить сценарии смены локали: из верхней позиции, после scroll вниз и при оставшемся hash; проверить отсутствие остаточной инерции и `scrollY === 0` после перехода.

## 4. Проверка качества и документация

- [ ] 4.1 Обновить комментарии/локальную документацию о том, что новые nested scroll-контейнеры должны использовать `data-lenis-prevent`, а новый wheel-listener добавлять нельзя.
- [ ] 4.2 Выполнить `npm run typecheck`, `npm run lint`, `npm test`, production build и релевантный Playwright-набор; устранить timing/layout regressions в RU/EN.
- [ ] 4.3 Проверить desktop wheel/trackpad, mobile/coarse-pointer, keyboard focus, skip-link, anchors, locale transition и reduced-motion вручную или автоматизированно; зафиксировать отсутствие второго scroll engine и лишнего RAF-loop.
