# Design

## Context

Мотивация описана в proposal.md. Hero.tsx содержит две HeroDissolveItem-ссылки с motionId experience/contact. Hero.module.css задаёт pill-форму, высоту минимум 48px, gap .8rem и вертикальную раскладку до 620px. Sticky hero занимает 200svh / 180svh. HeroTextDissolve изменяет transform/opacity самой ссылки через useLenis и возвращает её при focus-visible. HeroField уже использует canvas 2D, ограничение DPR 2 и остановку вне viewport/в скрытой вкладке. EntryExperience переводит html[data-entry-state] между required/opening/entered/bypassed и переносит клавиатурный фокус на первую CTA. LocaleTransition предоставляет busy и 2200ms scramble с анимацией размеров ссылок.

Canvas UI Flame Wrap, источник https://canvasui.dev/docs/components/flame-wrap, прочитан 2026-09-30: WebGL2/GLSL без runtime-зависимостей, отдельный uHasContent=0 путь для декоративного огня, ResizeObserver/IntersectionObserver, API setOptions/resize/destroy. Стандартные height=170, distortion=10, melt=4.5 слишком агрессивны для этих CTA. Обёртка переносит children в canvas при html-in-canvas; публичного pause API нет. Нужна локальная адаптация, а не установка неизменённой обёртки.

## Goals / Non-Goals

**Goals:** сохранить узнаваемую форму пламени Canvas UI, устойчивую геометрию, обычный DOM текста и единое движение CTA с декором. Изолировать GPU-ресурсы и дать проверяемую остановку рендера.

**Non-Goals:** перенос сайта на Tailwind/shadcn, WebGPU, html-in-canvas, изменение Lenis, общего курсора, hero-высоты, текста, contact-формы или локализации. Не исправлять в этой работе расхождение старой language spec и текущей in-place реализации.

## Decisions

### 1. Декоративный renderer внутри существующей ссылки

Добавить клиентский HeroActionFlame и отдельный модуль renderer с атрибуцией источника и проверенной при переносе лицензией. Сохранить HeroDissolveItem as="a" владельцем transform/opacity/ref, href и data-dissolve-item. Внутрь ссылки добавить нефокусируемый aria-hidden canvas и span с исходным текстом; ссылка остаётся единственным интерактивным элементом. Canvas абсолютный, pointer-events:none, под текстом, в локальном stacking context. Родитель ссылки position:relative; не обрезать пламя overflow:hidden.

Из upstream взять shader и декоративную ветку uHasContent=0, исключить захват HTML и условное перемещение children. CSS-имитация огня не обеспечивает тот же рисунок; исходная обёртка создаёт риски hydration, scramble и доступности. Новых npm-зависимостей не нужно.

Геометрию считать по непреобразованным layout-размерам ссылки (ResizeObserver/offsetWidth/offsetHeight), не по getBoundingClientRect после perspective dissolve. Canvas и ссылка затем преобразуются вместе. Радиус — половина фактической высоты pill. Размер canvas включает технические поля шейдера, но не участвует в layout/hitbox. Пересчитать при загрузке шрифта, resize, изменении локали и перед возобновлением.

### 2. Визуальная настройка в существующей палитре

Цвет читать из --signal (#48c7f4), преобразовать в нормализованный RGB. Primary сохраняет signal/carbon, secondary — graphite/paper и border --rule. Не вводить оранжевый акцент. Огонь ограничить внешней каймой; внутреннюю область pill маскировать в shader, чтобы текст и фон оставались неизменны. distortion/melt/scorch/smoke=0; sparks=0 в покое. Учесть, что upstream использует минимальные значения height=24, spread=8 и meltPx>=1: одного присваивания нулей недостаточно для исключения внутреннего подгорания, нужна внешняя маска.

Стартовые параметры для визуальной доводки, не жёсткий API-контракт:

| Параметр | Primary idle | Secondary idle | Hover / focus-visible |
| --- | --- | --- | --- |
| height | 24px | 24px | 32px |
| intensity | .30 | .18 | .45 / .32 |
| spread | 8px | 8px | 8px |
| speed | .20 | .18 | .25 |
| rim | .65 | .40 | .90 / .65 |
| sparks | 0 | 0 | .12 |

Усиление за 200ms с принятой cubic-bezier(.22,1,.36,1), без масштабирования кнопки. Техническое поле canvas не равно видимой высоте пламени: проверить реальную область свечения рядом с summary и второй CTA. На touch оставить тихий idle, без hover-залипания и ожидания анимации перед переходом. При вертикальных CTA погасить верхний хвост secondary до безопасной области межкнопочного интервала, сохранить gap/размеры и не перекрывать primary. Проверить читаемость текста и focus ring во всех кадрах, контраст текста не ниже 4.5:1.

### 3. Приоритет существующих переходов

| Состояние | Поведение Flame Wrap |
| --- | --- |
| required/opening | canvas скрыт, RAF остановлен |
| entered/bypassed, CTA видна | idle или hover/focus |
| hero dissolve | canvas наследует transform/opacity ссылки, без отдельного движения |
| opacity CTA <= .01, без focus-visible | RAF остановлен, pointer-events остаётся под управлением dissolve |
| focus-visible на исчезнувшей CTA | существующая ссылка возвращается; декор следует ей, outline остаётся сверху |
| locale busy | декор скрыт, RAF остановлен; HTML scramble работает как сейчас |
| locale idle | повторный замер, мягкий возврат текущего состояния |
| document.hidden / вне viewport | RAF остановлен, время заморожено |
| reduced motion | статическая CSS-кайма, без GPU-цикла и переходов |

Добавить renderer pause/resume с идемпотентной остановкой RAF, reset previousTime и destroy. Использовать busy из существующего контекста, наблюдение за entry-state и visibilitychange. Для dissolve добавить узкий канал состояния непосредственно из applyProgress (например, событие/атрибут активности, меняемый только при пересечении порога); не вычислять вторую независимую кривую scroll. Отдельно учитывать focus-visible и blur. Проверка IntersectionObserver одна недостаточна: opacity=0 и entry не исключают геометрическую видимость.

Динамически импортировать renderer после hydration при доступном hero; browser API только на клиенте. SSR сразу отдаёт рабочие ссылки. Перед кодированием прочитать актуальные локальные Next guides для client/server boundaries и lazy loading в node_modules/next/dist/docs/ согласно AGENTS.md.

### 4. Производительность и fallback

Не больше двух canvas/контекстов; DPR <=2, на coarse pointer <=1.5, рендер ограничить 30 fps; per-frame состояние не проводить через React. setOptions не должен вызывать layout measurement каждый кадр усиления (upstream делает syncCanvasSize); resize отделить от обновления uniforms. При shader/link/context ошибке либо contextlost остановить и освободить renderer, оставить CSS fallback до remount. Unmount очищает RAF, observers, listeners, GPU objects; повторный mount не размножает циклы. Если профиль на мобильном покажет перегрузку, уменьшать разрешение/детализацию, сохраняя договорённое поведение.

### 5. Проверка

Сохранить текущие проверки dissolve, entry focus, Lenis и locale. Добавить точечные Playwright-сценарии для двух CTA в RU/EN: href и Enter, hover/focus, возврат dissolve, entry pause, locale busy/resize, hidden/offscreen, reduced-motion live change, отказ WebGL/context loss и cleanup. Для детерминированного screenshot нужен тестовый фиксированный shader-time через внутренний seam: CSS screenshot.css не останавливает RAF. Основная матрица уже Chromium 1440x1000, 768x1024, 320x800 с reducedMotion=reduce; добавить отдельные effect snapshots с no-preference, а не отключать эффект во всех тестах. Визуально проверить idle, усиление, середину dissolve и вертикальные CTA. Smoke в Firefox/WebKit при наличии окружения, отдельно проверить корректный fallback.

Профиль 10 секунд idle и scroll с двумя эффектами на том же устройстве до/после: оценить p95 frame interval, main-thread long tasks, GPU/число рендеров. Критерий — нет устойчивого ухудшения p95 более 10% относительно baseline, нет добавленных long tasks >50ms от эффекта; в приостановленных состояниях счётчик render не растёт. Зафиксировать устройство/браузер, не объявлять замеры эмулятора доказательством работы на реальном телефоне.

## Risks / Trade-offs

- Высокий огонь конфликтует с лаконичным hero → компактные параметры, слабее secondary, внешняя маска и визуальная проверка обеих раскладок.
- Perspective и locale resize отрывают контур → локальные layout-координаты, общее transform-дерево, pause на scramble и замер после него.
- Дополнительная GPU-нагрузка поверх HeroField → ограничение DPR/fps, lazy init, явные pause и cleanup, измеримый бюджет.
- Старые spec о локализации расходятся с кодом → добавлять независимые требования Flame Wrap через ADDED, не переписывать старые сценарии смены языка в этой работе.
- Копирование upstream создаёт локально поддерживаемый fork → сохранить URL, дату/ревизию и лицензию, описать отличия; автоматические обновления не подключать.

## Migration Plan

Внедрить renderer, затем подключить к обеим ссылкам, согласовать жизненный цикл и выполнить проверки. Миграций данных/конфигурации нет. Откат — удалить декоративные children/адаптер и связанные стили, сохранив исходные HeroDissolveItem-ссылки. Обновлять visual baselines только после просмотра изменений.
