# Артём Трикула — CV

Двуязычный сайт-резюме на Next.js. Исходный `cv.html` сохранён как референс предыдущей версии.

## Запуск

Требования: Node.js 24+, npm и, для контейнерного запуска, Docker.

```bash
npm ci --legacy-peer-deps
npm run dev
```

Откройте `http://localhost:3000/ru` или `http://localhost:3000/en`.

## Проверки

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Docker

```bash
docker build -t artem-trikula-cv .
docker run --rm -p 3000:3000 artem-trikula-cv
```

После запуска проверьте `http://localhost:3000/ru` и `http://localhost:3000/en`.

## Где редактировать тексты

Русская версия находится в `src/content/ru`, английская — в `src/content/en`. Каждая секция вынесена в отдельный файл: `navigation`, `hero`, `about`, `timeline`, `projects`, `skills`, `contact` и `footer`. Общая схема данных — `src/content/schema.ts`.

Не добавляйте биографические строки непосредственно в JSX: компоненты должны оставаться независимыми от конкретного текста.

## Публикация и откат

Для публикации используйте production-сборку Next.js или Docker-образ. До окончательной приёмки не удаляйте `cv.html`. Для отката верните веб-серверу прежнюю точку входа `cv.html`; данные и код новой версии при этом остаются в репозитории.
