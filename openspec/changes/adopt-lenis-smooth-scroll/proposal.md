# Proposal

## Why

Проект уже содержит собственный `SmoothWheelScroll`, который вручную перехватывает `wheel`, ведёт целевую позицию и запускает animation-frame цикл. Решение работает для базовых сценариев и покрыто браузерными тестами, но теперь дублирует ответственность полноценного scroll engine: отдельно приходится поддерживать нормализацию delta, nested-scroll, синхронизацию с программными переходами и доступность.

При этом текущая CSS-ветка учитывает `prefers-reduced-motion`, а JavaScript-контроллер продолжает сглаживать wheel-ввод. Переход на Lenis должен убрать этот разрыв и дать единый, документированный lifecycle для wheel, touch, anchors, смены локали и вложенного мобильного меню.

## What Changes

- Добавить зависимость `lenis` и подключить официальный React-интеграционный слой `ReactLenis`.
- Заменить самописный `SmoothWheelScroll` на один root-инстанс Lenis с `autoRaf`, native scrollbar и сохранением обычного document scroll.
- Настроить плавность только для wheel-ввода; touch-позиционирование оставить нативным, не включая экспериментальную touch-инерцию.
- Включить Lenis anchors с отступом фиксированной шапки и сохранить рабочие fragment-ссылки, skip-link и переход к `#top`.
- Настроить `prefers-reduced-motion`, pinch-to-zoom, горизонтальные жесты и вложенную прокрутку мобильного меню.
- Перенести существующий reset-протокол смены локали на Lenis и удалить obsolete CSS-класс, data-атрибуты и ручной animation-frame контроллер.
- Обновить Playwright-проверки для Lenis-классов, wheel/trackpad-поведения, reduced-motion, anchors, nested-scroll и смены языка.

## Capabilities

### New Capabilities

Нет: изменение уточняет существующую capability `site-interactions`.

### Modified Capabilities

- `site-interactions`: заменить контракт самописного wheel-контроллера на единый Lenis-based smooth-scroll engine с теми же пользовательскими гарантиями и более полным поведением для accessibility и навигации.

## Impact

- `package.json` и `package-lock.json`: новая production-зависимость `lenis`.
- `src/components/SmoothWheelScroll.tsx`: удаление ручного контроллера и замена на небольшой root-адаптер Lenis.
- `src/app/[locale]/layout.tsx`, `src/app/globals.css`, `src/styles/base.css`: подключение Lenis на клиентской границе и согласование глобальных scroll-стилей.
- `src/components/LocaleTransition.tsx`: reset/scroll-to-top через Lenis без прямого управления старым wheel-state.
- `src/components/Header.tsx`: явная маркировка открытой мобильной панели как области, которую Lenis не должен перехватывать.
- `tests/visual/interactions.visual.ts`: перенос проверок с custom data-state на фактическое поведение Lenis и браузера.
- Серверный рендеринг, URL-структура, локализованный контент и backend/API не меняются.
