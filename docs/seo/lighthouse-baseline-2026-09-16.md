# Lighthouse baseline — 2026-09-16

Это лабораторный baseline, а не полевые Core Web Vitals. Он снят с production build данного изменения на `http://127.0.0.1:3100` через Lighthouse 13.4.1 и Headless Chrome 153 на Windows 10; raw JSON хранится локально в игнорируемом каталоге `artifacts/lighthouse`.

## Результаты

| Страница | Режим | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/ru` | Mobile, simulated throttling | 94 | 100 | 100 | 100 | 922 мс | 3 059 мс | 46 мс | 0 | 922 мс |
| `/en` | Mobile, simulated throttling | 94 | 100 | 100 | 100 | 909 мс | 3 022 мс | 47 мс | 0 | 909 мс |
| `/ru` | Desktop | 100 | 100 | 100 | 100 | 248 мс | 644 мс | 0 мс | 0 | 248 мс |
| `/en` | Desktop | 100 | 100 | 100 | 100 | 248 мс | 652 мс | 0 мс | 0 | 329 мс |

INP отсутствует: одиночный Lighthouse navigation run не создаёт репрезентативных пользовательских взаимодействий. TBT указан только как лабораторный proxy и не заменяет field INP.

## Наблюдения

- В mobile-профиле LCP около 3,0 с превышает лабораторный ориентир 2,5 с, но при этом Performance остаётся 94, TBT — 46–47 мс, CLS — 0.
- LCP-кандидатом Lighthouse выбрал декоративный номер `01` секции About на нижней границе эмулируемого viewport, а не сетевое изображение. Breakdown показывает 201–217 мс element render delay и 11–59 мс TTFB; отдельного медленного LCP request нет.
- Render-blocking insight указывает два небольших локальных CSS-файла (примерно 4,9 и 1,3 КиБ) с оценкой потенциальной экономии 140–150 мс. Шрифты имеют корректный `font-display`, внешних origin и кандидатов для preconnect нет.
- Unused JavaScript insight оценивает около 29 КиБ framework/client bundle; основной контент при этом остаётся server-rendered, а main-thread work получает проходную оценку.
- Одинаковые RU/EN результаты и отсутствие ухудшения desktop/CLS/TBT не указывают на материальную регрессию от локализованных metadata, JSON-LD или нового hero-текста. Менять layout ради одного lab LCP-кандидата без field data нецелесообразно.

## Следующий контроль

После deployment повторить Lighthouse по публичному HTTPS URL и сравнить одинаковые профили. Отдельно проверить полевые LCP, INP и CLS в Search Console/CrUX при достаточном трафике; отсутствие данных обозначать `N/A`, а не `0`.
