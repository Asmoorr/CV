## 1. Подготовка контейнерного контракта

- [x] 1.1 Добавить `compose.production.yaml` с SHA-tagged образом, `restart: unless-stopped`, переменными `IMAGE_REPOSITORY`/`IMAGE_TAG`, привязкой `127.0.0.1:3000:3000` и Node-based health check `/ru`; проверить итог через `docker compose -f compose.production.yaml config`.
- [x] 1.2 Собрать текущий `Dockerfile`, запустить его через production Compose и проверить healthy state, ответы `/ru` и `/en`, а также отсутствие публикации порта 3000 на внешнем интерфейсе.
- [x] 1.3 Добавить автоматическую проверку production Compose/health contract в подходящий тест или validation script и убедиться, что она падает при замене loopback binding на публичный.

## 2. Безопасный серверный deployment

- [x] 2.1 Добавить в репозиторий эталон root-owned deploy-скрипта, принимающего только полный hexadecimal SHA, формирующего фиксированный GHCR image ref и отклоняющего прочие аргументы; проверить shell syntax и негативные случаи невалидного ввода.
- [x] 2.2 Реализовать в deploy-скрипте сохранение текущего SHA, `docker compose pull/up`, ожидание healthy state и ограниченную retry-проверку `https://artem-trikula.ru/ru`; проверить успешный идемпотентный повтор для одного SHA.
- [x] 2.3 Реализовать автоматический возврат на предыдущий SHA при провале локального или публичного health check, диагностические логи без секретов и ненулевой exit code; проверить управляемой заведомо нерабочей версией/health check.
- [x] 2.4 Добавить шаблон ограниченного sudoers rule, разрешающего пользователю `deploy` запускать только root-owned entrypoint, и проверить `visudo -cf` плюс невозможность выполнить через это правило произвольную Docker/shell-команду.

## 3. GitHub Actions pipeline

- [x] 3.1 Добавить workflow для `push` в `main` и `workflow_dispatch` с production concurrency group; проверить синтаксис workflow и соответствие обоих trigger требованиям.
- [x] 3.2 Добавить quality-gate job с `npm ci --legacy-peer-deps`, lint, typecheck, unit tests и production build; проверить, что намеренно сломанный тест блокирует все jobs публикации/deployment.
- [ ] 3.3 Добавить BuildKit-сборку и публикацию `ghcr.io/asmoorr/cv:<full-sha>` с permissions `contents: read` и `packages: write`; проверить в тестовом запуске, что опубликованный tag равен SHA запуска и плавающий `latest` не используется для deployment.
- [ ] 3.4 Добавить deployment job с GitHub Environment `production`, pinned `known_hosts`, временным SSH key и вызовом только разрешённого entrypoint с SHA; проверить, что mismatch host key останавливает job до удалённой команды.
- [ ] 3.5 Добавить workflow summary с deployed SHA, endpoint и итогом rollback без вывода secrets; проверить маскирование значений и полезность summary на успешном и неуспешном тестовых запусках.

## 4. Документация и bootstrap production

- [x] 4.1 Расширить `docs/running/README.md` перечнем GitHub Environment secrets/variables, retention требований GHCR и схемой ежедневного deployment; проверить документацию по чистому checklist без неописанных значений из репозитория.
- [ ] 4.2 Документировать одноразовый server bootstrap: Docker/Compose, пользователь `deploy` без docker group, `/opt/artem-trikula`, root-owned Compose/entrypoint, sudoers, SSH authorized key и root GHCR `read:packages` login; проверить команды на staging/production сервере и права каждого файла.
- [ ] 4.3 Документировать проверку `nginx -t`, сохранение upstream `127.0.0.1:3000`, HTTP→HTTPS, firewall/listener и Certbot; проверить реальными запросами, что обе локали доступны только через Nginx.
- [x] 4.4 Документировать операции просмотра текущего SHA/логов, ручного deployment выбранного SHA, rollback и ротации SSH/GHCR credentials; провести tabletop-проверку инструкции от обнаружения сбоя до восстановленного endpoint.

## 5. Сквозная приёмка

- [ ] 5.1 Выполнить первый deployment известного SHA через тот же entrypoint, который использует automation, и сопоставить SHA в GitHub, GHCR, server state и запущенном image inspect.
- [ ] 5.2 Слить тестовый pull request в `main` и проверить полный автоматический путь: quality gates → SHA-образ → SSH deployment → healthy контейнер → успешный `https://artem-trikula.ru/ru` и `/en`.
- [ ] 5.3 Запустить два deployment подряд и проверить по журналу GitHub Actions/сервера, что удалённые критические секции не выполнялись конкурентно и production завершил работу на ожидаемом более новом SHA.
- [ ] 5.4 Выполнить ручной rollback на сохранённый предыдущий SHA без пересборки и проверить healthy state и публичный HTTPS endpoint после отката.
