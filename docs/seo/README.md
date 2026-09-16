# SEO: публикация и измерение

## Канонический адрес

Production origin: `https://artem-trikula.ru`.

Он передаётся сборке через `SITE_URL` и используется для canonical, hreflang, sitemap, robots, Open Graph и JSON-LD. Preview-домен нельзя назначать каноническим. Корневой `/` перенаправляет на `/ru`; индексируемые страницы — `/ru` и `/en`.

На 16 сентября 2026 года live-проверка подтвердила: `/` отвечает `307` с переходом на `/ru`, страницы `/ru` и `/en` отвечают `200`, а внешний reverse proxy сообщает `nginx/1.28.3 (Ubuntu)`. TLS и HTTP→HTTPS обслуживает Nginx, приложение по проектной схеме доступно ему на `127.0.0.1:3000`.

Текущий production всё ещё содержит предыдущую версию: `/sitemap.xml` и `/manifest.webmanifest` отвечают `404`, а страницы пока не содержат canonical, hreflang, JSON-LD и Open Graph image. Эти сигналы появятся только после deployment данного изменения.

## Автоматическая проверка перед выпуском

В PowerShell:

```powershell
$env:SITE_URL="https://artem-trikula.ru"
npm run typecheck
npm run lint
npm test
npm run build
npm run test:seo
npm run test:visual
```

`npm run test:seo` запускается после build и проверяет redirect, обе локали, metadata в исходном HTML, canonical/hreflang, JSON-LD, robots, sitemap, social images и внутренние metadata-ссылки.

## Live checklist

После deployment:

1. Проверить HTTPS-ответы `/`, `/ru`, `/en`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon.svg` и URL social images.
2. Убедиться, что `/` перенаправляет на `/ru`, неизвестная локаль возвращает 404, а `/ru` и `/en` — 200.
3. Просмотреть source HTML обеих страниц: title, description, robots, self-canonical, взаимные `ru`/`en`/`x-default`, Open Graph, Twitter и один JSON-LD payload.
4. Убедиться, что нигде нет localhost, preview-host, HTTP canonical или чужого домена.
5. Проверить JSON-LD в Google Rich Results Test и Schema.org Validator. `ProfilePage` помогает понять сущность, но не гарантирует отдельный rich result.

## Search Console и Bing Webmaster Tools

1. Подтвердить domain property либо URL-prefix property; verification tokens хранить только в DNS/deployment secrets, не в git.
2. Отправить `https://artem-trikula.ru/sitemap.xml` в Google Search Console и Bing Webmaster Tools.
3. Через URL Inspection проверить `/ru` и `/en`: доступность crawler, выбранный canonical, индексирование и rendered page.
4. Зафиксировать предупреждения sitemap, indexing, structured data и Core Web Vitals. Отсутствующее или недостаточное поле помечать `N/A — insufficient data`, а не числом `0`.

## Baseline

Заполнять после восстановления production и отправки sitemap.

| Поле | RU | EN | Источник/примечание |
| --- | --- | --- | --- |
| Дата и период | N/A | N/A | Указать одинаковое окно сравнения |
| Indexed pages | N/A | N/A | Page indexing / Bing Index Explorer |
| Queries | N/A | N/A | Разделить branded и non-branded |
| Impressions | N/A | N/A | Performance report |
| Clicks | N/A | N/A | Performance report |
| CTR | N/A | N/A | Performance report |
| Average position | N/A | N/A | Диагностический показатель, не гарантия |
| Crawl/markup issues | N/A | N/A | Записать конкретные URL и ошибки |
| Field LCP p75 | N/A | N/A | Mobile/desktop отдельно |
| Field INP p75 | N/A | N/A | Mobile/desktop отдельно |
| Field CLS p75 | N/A | N/A | Mobile/desktop отдельно |

Целевые полевые пороги при достаточном объёме данных: LCP ≤ 2,5 с, INP ≤ 200 мс, CLS ≤ 0,1 на 75-м перцентиле. Lighthouse или другой лабораторный запуск сохраняется отдельно с датой, устройством и окружением и не выдаётся за field data.

Первый локальный замер сохранён в [Lighthouse baseline от 16 сентября 2026 года](lighthouse-baseline-2026-09-16.md).

## Сравнение после переиндексации

Первый обзор проводить после накопления сопоставимого периода данных. Сравнивать одинаковые окна по page, query, locale, country и device; учитывать изменения контента, сезонность и deployment-инциденты. Следующие правки формулировать как проверяемые гипотезы — SEO-релиз не гарантирует позицию, CTR или срок индексации.
