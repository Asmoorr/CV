# Запуск и развёртывание

## Требования

- Node.js 24 или новее;
- npm;
- Docker — только для контейнерного запуска;
- Chromium — только для визуальных тестов.

Версии основных библиотек зафиксированы в `package-lock.json`. Для воспроизводимой установки используйте `npm ci`, а не `npm install`.

## Локальная разработка

Установите зависимости:

```bash
npm ci --legacy-peer-deps
```

Запустите сервер разработки:

```bash
npm run dev
```

После запуска доступны адреса:

- `http://localhost:3000/ru`;
- `http://localhost:3000/en`.

Адрес `http://localhost:3000` автоматически перенаправляет на русскую версию. Сервер разработки отслеживает изменения файлов и обновляет страницу во время работы.

## Production-сборка

Production-сборка требует канонический HTTPS origin. Для рабочего сайта подтверждено значение `https://artem-trikula.ru`; preview-домен, localhost, URL с путём или HTTP будут отклонены до публикации некорректных canonical URL.

В PowerShell задайте origin и создайте оптимизированную сборку:

```powershell
$env:SITE_URL="https://artem-trikula.ru"
npm run build
```

Запустите её:

```bash
npm run start
```

По умолчанию приложение слушает порт `3000`. Перед публикацией рекомендуется выполнить полный набор проверок, описанный в [документации по тестированию](../testing/README.md).

## Docker

Соберите образ (публичный `SITE_URL` не является секретом и доступен как build argument):

```bash
docker build --build-arg SITE_URL=https://artem-trikula.ru -t artem-trikula-cv .
```

Запустите контейнер:

```bash
docker run --rm -p 3000:3000 artem-trikula-cv
```

Dockerfile использует многоэтапную сборку:

1. устанавливает зависимости в образе Node.js 24 Alpine;
2. выполняет production-сборку Next.js;
3. переносит standalone-сервер и статические файлы в минимальный runtime-образ;
4. запускает приложение от непривилегированного пользователя `nextjs`.

Контейнер принимает соединения на `0.0.0.0:3000`.

## Переменные окружения

Для production-сборки обязательна переменная:

- `SITE_URL` — канонический HTTPS origin без завершающего пути, query или hash; рабочее значение: `https://artem-trikula.ru`.

Во время контейнерного запуска также используются:

- `NODE_ENV=production`;
- `NEXT_TELEMETRY_DISABLED=1`;
- `HOSTNAME=0.0.0.0`;
- `PORT=3000`.

При необходимости порт прямого запуска можно изменить стандартной переменной `PORT`.

После публикации проверьте, что `/robots.txt`, `/sitemap.xml`, canonical, hreflang, Open Graph и JSON-LD содержат именно этот origin. Значения подтверждения Google Search Console и Bing Webmaster Tools относятся к секретам deployment-окружения и не должны попадать в репозиторий.

## Автоматический production deployment

Каждый push в `main`, включая merge pull request, запускает
`.github/workflows/deploy-production.yml`:

1. выбранный commit проверяется как часть истории `main`;
2. выполняются `npm ci`, lint, typecheck, unit tests и production build;
3. Docker-образ один раз собирается и публикуется как
   `ghcr.io/asmoorr/cv:<полный-commit-sha>`;
4. GitHub Actions подключается к серверу по SSH и передаёт SHA ограниченному
   deployment entrypoint;
5. сервер загружает образ, перезапускает Compose-сервис и проверяет container
   health и `https://artem-trikula.ru/ru`;
6. при провале проверок сервер пытается автоматически вернуть предыдущий SHA.

Workflow никогда не разворачивает `latest`. Образы последнего рабочего и как
минимум нескольких предыдущих SHA должны сохраняться в GHCR: удалённый образ
невозможно использовать для rollback без повторной сборки.

### GitHub Environment

Создайте Environment `production`. По возможности включите required reviewers
и запрет deployment из веток, отличных от `main`.

Secrets Environment:

- `PRODUCTION_HOST` — hostname или IP SSH-сервера;
- `PRODUCTION_SSH_KEY` — приватный ключ отдельного пользователя `deploy`;
- `PRODUCTION_KNOWN_HOSTS` — заранее проверенная строка host key, например
  результат `ssh-keyscan`, fingerprint которого сверен через независимый канал.

Variables Environment:

- `PRODUCTION_PORT` — SSH-порт, если это не `22`;
- `PRODUCTION_USER` — имя пользователя, если это не `deploy`.

`GITHUB_TOKEN` используется только для публикации образа из workflow. Серверу
нужен отдельный fine-grained token только с чтением package; не используйте для
него личный токен с доступом к репозиториям или записью packages.

## Одноразовая подготовка сервера

Команды ниже выполняются из root-сессии на сервере. До начала установите Docker
Engine, Compose plugin, `curl`, `util-linux` (для `flock`) и `sudo`. Проверьте:

```bash
docker version
docker compose version
curl --version
flock --version
sudo --version
```

Создайте отдельного пользователя без shell-привилегий Docker:

```bash
adduser --disabled-password --gecos '' deploy
id deploy
if id -nG deploy | tr ' ' '\n' | grep -qx docker; then
  echo 'deploy unexpectedly belongs to docker group' >&2
  exit 1
fi
install -d -o deploy -g deploy -m 0700 /home/deploy/.ssh
install -o deploy -g deploy -m 0600 /dev/null /home/deploy/.ssh/authorized_keys
```

Добавьте в `authorized_keys` публичную часть ключа, приватная часть которого
хранится в `PRODUCTION_SSH_KEY`. Не копируйте приватный ключ на сервер.

Установите root-owned deployment-файлы из проверенного checkout этого же SHA:

```bash
install -d -o root -g root -m 0755 /opt/artem-trikula
install -o root -g root -m 0644 compose.production.yaml \
  /opt/artem-trikula/compose.production.yaml
install -o root -g root -m 0755 ops/deploy-artem-trikula \
  /usr/local/sbin/deploy-artem-trikula
install -o root -g root -m 0440 ops/artem-trikula-deploy.sudoers \
  /etc/sudoers.d/artem-trikula-deploy
visudo -cf /etc/sudoers.d/artem-trikula-deploy
```

Sudoers-шаблон совместим с Ubuntu `sudo-rs`: он разрешает повышение прав только
для фиксированного root-owned entrypoint. Сам entrypoint до privileged-операций
принимает только один полный lowercase SHA, поэтому пользователь `deploy` не
может напрямую вызвать Docker или произвольную root-команду.

Войдите в GHCR от root, чтобы credential не был доступен пользователю `deploy`:

```bash
read -rsp 'GHCR read-only token: ' GHCR_TOKEN
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u '<github-user>' --password-stdin
unset GHCR_TOKEN
chmod 0700 /root/.docker
chmod 0600 /root/.docker/config.json
```

Для private package токену требуется только `read:packages`. Если package
публичный, анонимный pull можно проверить до создания постоянного credential.

После изменения `compose.production.yaml`, entrypoint или sudoers-файла не
обновляйте их автоматически из Actions. Сначала вручную просмотрите diff,
установите root-owned копию командами выше, выполните `visudo -cf` и только
затем выпускайте образ, который зависит от новой конфигурации.

## Nginx и сетевые проверки

Существующий Nginx остаётся TLS-терминатором и проксирует в
`http://127.0.0.1:3000`. Перед первым deployment сохраните резервную копию
конфига и проверьте его:

```bash
cp -a /etc/nginx/sites-available/artem-trikula.ru \
  /etc/nginx/sites-available/artem-trikula.ru.pre-container-deploy
nginx -t
systemctl reload nginx
```

После запуска контейнера проверьте loopback binding и отсутствие публичного
listener на 3000:

```bash
ss -ltnp | grep '127.0.0.1:3000'
! ss -ltn | grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\[::\]):3000([[:space:]]|$)'
curl --fail --silent --show-error http://127.0.0.1:3000/ru >/dev/null
curl --fail --silent --show-error https://artem-trikula.ru/ru >/dev/null
curl --fail --silent --show-error https://artem-trikula.ru/en >/dev/null
curl --head http://artem-trikula.ru/ru
```

Последняя команда должна вернуть redirect на HTTPS. Не открывайте TCP/3000 во
внешнем firewall. Certbot продолжает управлять существующими сертификатами;
проверьте `certbot renew --dry-run` отдельно от deployment.

## Первый deployment и ежедневные операции

Узнайте полный SHA образа, уже опубликованного workflow, и выполните тот же
entrypoint, который вызывает GitHub Actions:

```bash
sudo -- /usr/local/sbin/deploy-artem-trikula \
  0123456789abcdef0123456789abcdef01234567
```

Проверка текущей версии и контейнера:

```bash
sudo cat /opt/artem-trikula/deployment.env
sudo docker inspect artem-trikula-app-1 \
  --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}'
sudo docker logs --tail 100 artem-trikula-app-1
```

Имя контейнера уточняйте через
`sudo docker compose -p artem-trikula -f /opt/artem-trikula/compose.production.yaml ps`.

Ручной deployment или rollback выполняется в GitHub Actions через **Run
workflow**: укажите полный SHA из `main`. При стандартном `rebuild: false`
workflow проверит наличие готового SHA-образа и развернёт его без пересборки. Для
повторного прогона quality gates и восстановления отсутствующего образа явно
выберите `rebuild: true`. В обоих случаях workflow проверит принадлежность SHA
ветке и вызовет тот же entrypoint. Можно также выполнить entrypoint
непосредственно на сервере, если образ нужного SHA ещё присутствует в GHCR.

При инциденте:

1. посмотрите deploy step и строку `Rollback succeeded` или `Rollback failed`;
2. сравните `CURRENT_IMAGE_TAG` и `PREVIOUS_IMAGE_TAG` в state-файле;
3. проверьте container logs и оба HTTPS-маршрута;
4. если автоматический rollback не удался, вызовите entrypoint с последним
   известным рабочим SHA;
5. не удаляйте неисправный образ и логи до завершения диагностики.

Для ротации SSH-ключа сначала добавьте новый public key на сервер, замените
`PRODUCTION_SSH_KEY`, проверьте ручной workflow и только затем удалите старый
ключ. Для ротации GHCR token выполните новый `docker login` от root, проверьте
`docker pull` известного SHA и отзовите старый token.

До окончательной приёмки не удаляйте `cv.html`: это референс предыдущей версии.

## Частые проблемы

### Не устанавливаются зависимости

Убедитесь, что используется Node.js 24+ и команда `npm ci --legacy-peer-deps`. Если `package-lock.json` не соответствует `package.json`, сначала выясните причину изменения lock-файла, а не пересоздавайте его без проверки.

### Порт 3000 занят

Остановите процесс, занимающий порт, либо запустите приложение на другом порту. В PowerShell:

```powershell
$env:PORT=3001
npm run dev
```

### Docker-контейнер недоступен из браузера

Проверьте публикацию порта через `-p 3000:3000` и убедитесь, что локальный порт не занят другим процессом.
