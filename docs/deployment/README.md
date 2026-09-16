# Автоматический deployment

Production-сайт `https://artem-trikula.ru` автоматически обновляется после
успешного push в ветку `main`, включая merge pull request. GitHub Actions
проверяет проект, публикует неизменяемый Docker-образ в GHCR и запускает на
сервере строго тот образ, чей tag равен полному commit SHA.

## Архитектура

```text
main → GitHub Actions → ghcr.io/asmoorr/cv:<commit-sha>
                         ↓ SSH
                  deploy@62.60.151.240
                         ↓ restricted sudo
              /usr/local/sbin/deploy-artem-trikula
                         ↓ Docker Compose
                 127.0.0.1:3000 → Nginx → HTTPS
```

Nginx и Certbot работают на хосте. Контейнер не принимает внешний трафик
напрямую: порт `3000` опубликован только на `127.0.0.1`.

## Файлы

- `.github/workflows/deploy-production.yml` — проверки, публикация образа и SSH deployment;
- `compose.production.yaml` — production-сервис и container health check;
- `ops/deploy-artem-trikula` — root-owned deployment/rollback entrypoint;
- `ops/artem-trikula-deploy.sudoers` — разрешение пользователю `deploy` запускать только entrypoint;
- `ops/tests/deploy-entrypoint.test.sh` — Linux-тест повторного deployment и rollback;
- `scripts/validate-deployment.mjs` — статическая проверка security-контрактов.

Установленные серверные пути:

- `/opt/artem-trikula/compose.production.yaml`;
- `/opt/artem-trikula/deployment.env`;
- `/usr/local/sbin/deploy-artem-trikula`;
- `/etc/sudoers.d/artem-trikula-deploy`.

## GitHub Environment

Workflow использует Environment `production`.

Secrets:

- `PRODUCTION_HOST`;
- `PRODUCTION_SSH_KEY`;
- `PRODUCTION_KNOWN_HOSTS`.

Variables:

- `PRODUCTION_PORT=22`;
- `PRODUCTION_USER=deploy`.

Приватный SSH-ключ хранится только как GitHub secret. Сервер содержит только
его публичную часть. `known_hosts` закрепляет проверенный ED25519 fingerprint
сервера и запрещает подключение при его неожиданной смене.

## Обычный выпуск

При push в `main` workflow последовательно выполняет:

1. проверку, что выбранный SHA принадлежит `main`;
2. `npm ci --legacy-peer-deps`;
3. lint, typecheck, unit tests и production build;
4. Linux-интеграционный тест deployment entrypoint;
5. сборку и публикацию `ghcr.io/asmoorr/cv:<sha>`;
6. сериализованный SSH deployment в Environment `production`;
7. container health check `/ru` и проверку публичного HTTPS endpoint.

Плавающий tag `latest` для deployment не используется.

## Ручной deployment и rollback

В GitHub Actions откройте workflow **Deploy production** и нажмите **Run
workflow**.

- `sha` — полный SHA commit из истории `main`;
- `rebuild: false` — использовать уже опубликованный образ без пересборки;
- `rebuild: true` — повторить проверки и заново опубликовать образ.

На сервере тот же процесс можно запустить вручную из root-сессии:

```bash
/usr/local/sbin/deploy-artem-trikula <полный-commit-sha>
```

Перед переключением entrypoint сохраняет текущий SHA. Если новый контейнер не
становится healthy либо HTTPS endpoint не отвечает, выполняется автоматическая
попытка возврата на предыдущий образ. Ручной rollback выполняется запуском
entrypoint или workflow с последним известным рабочим SHA.

## Диагностика

Проверить состояние deployment:

```bash
sudo cat /opt/artem-trikula/deployment.env
sudo docker ps \
  --filter label=com.docker.compose.project=artem-trikula \
  --filter label=com.docker.compose.service=app \
  --format 'table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
```

Найти контейнер и посмотреть логи:

```bash
container_id="$(sudo docker ps \
  --filter label=com.docker.compose.project=artem-trikula \
  --filter label=com.docker.compose.service=app \
  --quiet)"
sudo docker inspect "$container_id" \
  --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}'
sudo docker logs --tail 100 "$container_id"
```

Проверить сеть и Nginx:

```bash
sudo nginx -t
ss -ltnp | grep '127.0.0.1:3000'
curl --fail http://127.0.0.1:3000/ru >/dev/null
curl --fail https://artem-trikula.ru/ru >/dev/null
curl --fail https://artem-trikula.ru/en >/dev/null
```

## Обновление инфраструктурных файлов

Compose, entrypoint и sudoers не копируются на сервер автоматически. После
изменения этих файлов сначала просмотрите diff, затем установите их из
доверенного checkout:

```bash
sudo install -o root -g root -m 0644 compose.production.yaml \
  /opt/artem-trikula/compose.production.yaml
sudo install -o root -g root -m 0755 ops/deploy-artem-trikula \
  /usr/local/sbin/deploy-artem-trikula
sudo install -o root -g root -m 0440 ops/artem-trikula-deploy.sudoers \
  /etc/sudoers.d/artem-trikula-deploy
sudo visudo -cf /etc/sudoers.d/artem-trikula-deploy
```

Пользователь `deploy` не должен входить в группу `docker`. Root-owned
entrypoint проверяет, что ему передан ровно один полный lowercase SHA, прежде
чем выполнять Docker-команды.

## Ротация доступа

Для ротации SSH сначала добавьте новый public key пользователю `deploy`, затем
замените `PRODUCTION_SSH_KEY`, выполните ручной workflow и только после успешной
проверки удалите старый key. При неожиданной смене server host key не обновляйте
`PRODUCTION_KNOWN_HOSTS` вслепую: сначала сверьте fingerprint через консоль
провайдера или другое доверенное соединение.
