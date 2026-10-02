# Desktop baseline — 2026-09-30

Снимки сделаны до исправлений приложения с локальной production-сборки текущего checkout. HEAD: `2ebe1ed2a14dab5058340f0c747add020d615a7e`. Исходники приложения были чистыми; существовал только сторонний untracked архив OpenSpec.

- Адрес: `http://127.0.0.1:3100/{ru,en}`; это не снимки Vercel production.
- Среда: Windows, Playwright Chromium, viewport 1440×1000, DPR 1, dark, reducedMotion=no-preference.
- Сборка: `node tests/build-production.mjs` — успешно.
- Для каждой локали создан отдельный browser context; дождались networkidle и document.fonts.ready.
- Entry снят до нажатия, остальные кадры — после ENTER и состояния entered; midpoint/end — при 50%/100% диапазона hero.offsetHeight − innerHeight.
- Папка: `artifacts/mobile-baseline-2026-09-30/` (игнорируется Git). Файлы не перезаписывать результатами исправления.

| Состояние | RU | EN |
| --- | --- | --- |
| Вход | ru-desktop-entry.png | en-desktop-entry.png |
| Hero начало | ru-desktop-hero.png | en-desktop-hero.png |
| Полная страница | ru-desktop-full.png | en-desktop-full.png |
| Hero 50% | ru-desktop-hero-midpoint.png | en-desktop-hero-midpoint.png |
| Hero конец | ru-desktop-hero-end.png | en-desktop-hero-end.png |
| Проекты | ru-desktop-projects.png | en-desktop-projects.png |
| Контакты и footer | ru-desktop-footer.png | en-desktop-footer.png |

Живые canvas и курсор могут различаться между запусками. Снимки служат визуальным свидетельством исходного вида; пиксельную автоматическую регрессию проверять существующими тестами со screenshot.css. Исходные версионированные PNG не обновлялись. Manifest рядом со снимками содержит SHA-256 для контроля сохранности.

Проверка физического iPhone не проводилась. Приложенные пользователем изображения используются как свидетельство внешнего вида ошибок, не как инструкции.
