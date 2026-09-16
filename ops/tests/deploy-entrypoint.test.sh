#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  printf 'This integration test must run as root inside an isolated container.\n' >&2
  exit 77
fi

readonly REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly GOOD_SHA_A="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
readonly GOOD_SHA_C="cccccccccccccccccccccccccccccccccccccccc"
readonly BAD_SHA="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

fixture_root="$(mktemp -d)"
mock_bin="${fixture_root}/bin"
trap 'rm -rf -- "$fixture_root"; rm -rf -- /opt/artem-trikula; rm -f -- /run/lock/artem-trikula-deploy.lock' EXIT

install -d -m 0755 "$mock_bin" /opt/artem-trikula /run/lock
install -m 0644 "$REPOSITORY_ROOT/compose.production.yaml" /opt/artem-trikula/compose.production.yaml

cat >"${mock_bin}/docker" <<'MOCK_DOCKER'
#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${1:-}" == "compose" ]]; then
  env_file=""
  action=""
  previous=""
  for argument in "$@"; do
    if [[ "$previous" == "--env-file" ]]; then env_file="$argument"; fi
    case "$argument" in
      pull|up|ps) action="$argument" ;;
    esac
    previous="$argument"
  done
  tag="$(sed -n 's/^IMAGE_TAG=//p' "$env_file")"
  if [[ "$action" == "ps" ]]; then printf 'container-%s\n' "$tag"; fi
  exit 0
fi

if [[ "${1:-}" == "inspect" ]]; then
  container_id="${@: -1}"
  tag="${container_id#container-}"
  if [[ "$tag" == b* ]]; then printf 'unhealthy\n'; else printf 'healthy\n'; fi
  exit 0
fi

if [[ "${1:-}" == "logs" ]]; then
  printf 'mock container log\n'
  exit 0
fi

printf 'Unexpected docker invocation: %s\n' "$*" >&2
exit 2
MOCK_DOCKER

cat >"${mock_bin}/curl" <<'MOCK_CURL'
#!/usr/bin/env bash
exit 0
MOCK_CURL

cat >"${mock_bin}/sleep" <<'MOCK_SLEEP'
#!/usr/bin/env bash
exit 0
MOCK_SLEEP

chmod 0755 "${mock_bin}/docker" "${mock_bin}/curl" "${mock_bin}/sleep"
export PATH="${mock_bin}:${PATH}"

deploy="$REPOSITORY_ROOT/ops/deploy-artem-trikula"

if "$deploy" invalid >/dev/null 2>&1; then
  printf 'Invalid SHA unexpectedly succeeded.\n' >&2
  exit 1
else
  status=$?
  [[ "$status" -eq 64 ]] || { printf 'Invalid SHA returned %s, expected 64.\n' "$status" >&2; exit 1; }
fi

"$deploy" "$GOOD_SHA_A"
grep -qx "CURRENT_IMAGE_TAG=${GOOD_SHA_A}" /opt/artem-trikula/deployment.env

"$deploy" "$GOOD_SHA_A"
grep -qx "CURRENT_IMAGE_TAG=${GOOD_SHA_A}" /opt/artem-trikula/deployment.env

"$deploy" "$GOOD_SHA_C"
grep -qx "CURRENT_IMAGE_TAG=${GOOD_SHA_C}" /opt/artem-trikula/deployment.env
grep -qx "PREVIOUS_IMAGE_TAG=${GOOD_SHA_A}" /opt/artem-trikula/deployment.env

if "$deploy" "$BAD_SHA"; then
  printf 'Unhealthy candidate unexpectedly succeeded.\n' >&2
  exit 1
fi
grep -qx "CURRENT_IMAGE_TAG=${GOOD_SHA_C}" /opt/artem-trikula/deployment.env
grep -qx "PREVIOUS_IMAGE_TAG=${GOOD_SHA_A}" /opt/artem-trikula/deployment.env

printf 'deploy entrypoint integration test passed\n'

