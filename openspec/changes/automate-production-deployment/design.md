## Context

См. мотивацию в `proposal.md` и контракт поведения в `specs/continuous-production-deployment/spec.md`.

Сейчас репозиторий `Asmoorr/CV` содержит Next.js 16.3.5 с `output: "standalone"`, многоэтапный `Dockerfile` на Node 24 Alpine и команды `lint`, `typecheck`, `test`, `build`. Compose-конфигурации и GitHub Actions нет. На сервере Nginx завершает TLS для `artem-trikula.ru`, перенаправляет HTTP на HTTPS и проксирует запросы в `127.0.0.1:3000`; эту границу менять не требуется.

## Goals / Non-Goals

**Goals:**

- Один проверяемый путь от commit в `main` до запущенного production-образа с тем же SHA.
- Минимум постоянного состояния на сервере и отсутствие checkout репозитория для обычного deployment.
- Fail-fast до изменения production и проверка результата после изменения.
- Ограниченная поверхность SSH-доступа и отсутствие секретов в репозитории/логах.
- Повторяемый ручной deployment/rollback существующего SHA.

**Non-Goals:**

- Zero-downtime, blue-green или canary deployment; при `docker compose up` допустим короткий разрыв соединений.
- Управление DNS, Nginx, firewall и жизненным циклом сертификатов Certbot из GitHub Actions.
- Оркестрация нескольких серверов, Kubernetes и автоматическое масштабирование.
- Автоматическое применение произвольных инфраструктурных изменений с правами root.

## Decisions

### 1. GitHub Actions строит образ один раз и публикует его в GHCR

Workflow с событиями `push` для `main` и `workflow_dispatch` выполняет `npm ci --legacy-peer-deps`, lint, typecheck, unit tests и production build. После проверок BuildKit собирает образ и публикует `ghcr.io/asmoorr/cv:<full-sha>`. Deployment использует ровно этот tag.

Это исключает различия между повторной сборкой на сервере и проверенным артефактом, а также не требует Git/Node toolchain на сервере. Альтернатива — SSH, `git pull` и `docker build` на сервере — проще начать, но хуже воспроизводится, требует больше ресурсов сервера и связывает выпуск с изменяемым checkout.

Workflow получает `contents: read` и `packages: write`; deployment job использует GitHub Environment `production`. `concurrency` с общей production-группой и `cancel-in-progress: false` не допускает параллельных удалённых операций. Более новый запуск ждёт завершения уже начатого, а затем разворачивает свой SHA.

### 2. Production описывается Docker Compose, Nginx остаётся на хосте

В репозитории появляется `compose.production.yaml` с одним сервисом приложения, `restart: unless-stopped`, образом `${IMAGE_REPOSITORY}:${IMAGE_TAG}` и публикацией `127.0.0.1:3000:3000`. Health check выполняет HTTP-запрос к `/ru` средствами Node внутри контейнера, поэтому runtime-образ не требует установки `curl`.

На сервере root-owned каталог `/opt/artem-trikula` содержит проверенную копию Compose-файла и state-файл с текущим/предыдущим SHA. Nginx продолжает проксировать на тот же loopback endpoint. Альтернатива — запуск `docker run` — требует вручную воспроизводить параметры контейнера и усложняет идемпотентное обновление.

Compose-файл меняется существенно реже образа. Его первоначальная установка входит в bootstrap, а дальнейшие изменения инфраструктурного файла применяются отдельным явно документированным административным шагом до совместимого deployment. Это не даёт каждому push незаметно менять root-level конфигурацию сервера.

### 3. SSH вызывает узкий root-owned deploy entrypoint

GitHub Actions подключается отдельным пользователем `deploy` по ключу, сверяя server host key из environment secret. Пользователь не включается в группу `docker`, поскольку Docker socket практически эквивалентен root-доступу. В `/etc/sudoers.d/artem-trikula-deploy` разрешается без пароля только root-owned скрипт `/usr/local/sbin/deploy-artem-trikula`. Поскольку установленный на Ubuntu 26.04 `sudo-rs` не поддерживает regex аргументов в sudoers, проверка единственного полного SHA выполняется первой операцией самого неизменяемого для `deploy` entrypoint.

Скрипт принимает единственный аргумент — полный hexadecimal SHA — валидирует формат, формирует заранее разрешённое имя GHCR-образа, выполняет `docker compose pull/up`, ожидает healthy state и проверяет `https://artem-trikula.ru/ru`. Произвольный image URL или shell-фрагмент передать нельзя. Registry credential с `read:packages` хранится только в root Docker config на сервере; SSH-ключ хранится в GitHub Environment.

Альтернатива — дать `deploy` членство в группе `docker` — короче, но фактически предоставляет неограниченное повышение привилегий. Альтернатива GitHub self-hosted runner оставляет долгоживущий агент с доступом к серверу и для одного сайта избыточна.

### 4. Ошибка после переключения инициирует автоматический возврат

Перед заменой скрипт фиксирует текущий SHA как `PREVIOUS_IMAGE_TAG`. Если новый контейнер не становится healthy или публичный HTTPS endpoint не отвечает успешно в пределах ограниченного числа попыток, скрипт возвращает предыдущий tag через ту же Compose-конфигурацию, повторяет health checks и завершает job ошибкой. Логи включают SHA, состояние/последние строки контейнера и результат rollback, но не credentials.

Успех записывает новый `CURRENT_IMAGE_TAG` только после обеих проверок. Ручной rollback использует `workflow_dispatch` с полным SHA из истории успешных deployment и вызывает тот же entrypoint; пересборка не выполняется.

Альтернатива — только пометить job красным и оставить неисправный контейнер — проще, но увеличивает простой. Полностью безразрывное переключение потребовало бы второго upstream/порта и динамического обновления Nginx, что находится вне scope.

### 5. Bootstrap и эксплуатация документируются отдельно от ежедневного deployment

Документация перечисляет установку Docker Engine/Compose plugin, создание `deploy`, root-owned файлов, ограниченного sudo rule, GHCR login, SSH `authorized_keys`, проверку `nginx -t`, firewall/loopback binding и GitHub Environment variables/secrets. Также фиксируются команды проверки текущего SHA, просмотра логов, ручного rollback и ротации ключей.

Предполагаемые GitHub значения: `PRODUCTION_HOST`, `PRODUCTION_PORT` (по умолчанию 22), `PRODUCTION_USER`, `PRODUCTION_SSH_KEY`, `PRODUCTION_KNOWN_HOSTS`; несекретные домен и image repository могут быть workflow env/variables. Точные IP, fingerprints и токены никогда не коммитятся.

## Risks / Trade-offs

- [Один контейнер создаёт короткий перерыв при замене] → health check, автоматический rollback и небольшой timeout ограничивают длительность; zero-downtime можно добавить отдельным change.
- [GHCR недоступен или image удалён политикой retention] → deployment останавливается до переключения; хранить несколько последних SHA-образов и не удалять последний рабочий.
- [Неверный health check может принять частично сломанную версию] → проверять и внутренний `/ru`, и публичный HTTPS endpoint; текущий статический сайт не имеет внешних runtime-зависимостей.
- [Скомпрометированный SSH deploy key] → отдельный пользователь, known_hosts pinning, узкий sudo entrypoint, регулярная ротация и GitHub Environment protections.
- [Root-owned deploy script сам становится критичной частью системы] → хранить его эталон в репозитории, проверять shell lint/syntax, устанавливать с владельцем root и неизменяемыми для `deploy` правами.
- [Compose-файл в репозитории и установленная копия расходятся] → документировать версию/контрольную сумму и обязательный ручной infra-step, когда меняется `compose.production.yaml`.

## Migration Plan

1. Добавить и локально проверить Compose, deploy script и CI workflow без production secrets; убедиться, что тесты и Docker build проходят.
2. В GitHub создать Environment `production`, добавить secrets/variables, включить требуемые protection rules и разрешить workflow публиковать package.
3. На сервере установить Docker/Compose, создать `deploy`, `/opt/artem-trikula`, root-owned entrypoint и узкое правило sudo; записать GHCR read credential и pinned SSH key.
4. Установить Compose-конфигурацию, проверить привязку `127.0.0.1:3000`, затем выполнить первоначальный ручной deployment SHA через тот же entrypoint.
5. Проверить контейнер, обе локали, HTTP→HTTPS, `nginx -t` и отсутствие внешнего listener на `:3000`.
6. Включить trigger на `main`, выполнить тестовый commit/merge и сопоставить SHA workflow, GHCR image и server state.
7. Проверить rollback на предыдущий SHA и зафиксировать операционную инструкцию.

Rollback изменения целиком: отключить workflow, запустить последний известный рабочий SHA через entrypoint; при необходимости вернуть прежний ручной способ запуска, не меняя Nginx upstream `127.0.0.1:3000`. Bootstrap-файлы и credentials удаляются только после подтверждения стабильной альтернативы.
