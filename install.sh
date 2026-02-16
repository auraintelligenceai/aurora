#!/usr/bin/env bash
set -euo pipefail

# Aura Intelligence Installer
# Usage: curl -fsSL --proto '=https' --tlsv1.2 https://auraintelligence.ai/install.sh | bash -s -- [options]

AURA_VERSION="${AURA_VERSION:-latest}"
SHARP_IGNORE_GLOBAL_LIBVIPS="${SHARP_IGNORE_GLOBAL_LIBVIPS:-1}"
NPM_LOGLEVEL="${AURA_NPM_LOGLEVEL:-error}"
INSTALL_METHOD="${AURA_INSTALL_METHOD:-npm}"
GIT_DIR="${AURA_GIT_DIR:-${HOME}/aura}"
GIT_UPDATE="${AURA_GIT_UPDATE:-1}"
JSON=0
RUN_ONBOARD=1
SET_NPM_PREFIX=0

print_usage() {
  cat <<EOF
Usage: install.sh [options]
  --json                              Emit NDJSON events (no human output)
  --install-method, --method npm|git  Install via npm (default) or from a git checkout
  --npm                               Shortcut for --install-method npm
  --git, --github                     Shortcut for --install-method git
  --git-dir, --dir <path>             Checkout directory (default: ~/aura)
  --version <ver>                     Aura Intelligence version (default: latest)
  --no-onboard                        Skip onboarding (default: runs onboard)
  --set-npm-prefix                    Force npm prefix to ~/.npm-global if current prefix is not writable (Linux)

Environment variables:
  SHARP_IGNORE_GLOBAL_LIBVIPS=0|1    Default: 1 (avoid sharp building against global libvips)
  AURA_NPM_LOGLEVEL=error|warn|notice  Default: error (hide npm deprecation noise)
  AURA_INSTALL_METHOD=git|npm
  AURA_VERSION=latest|next|<semver>
  AURA_GIT_DIR=...
  AURA_GIT_UPDATE=0|1
EOF
}

log() {
  if [[ "$JSON" -eq 0 ]]; then
    echo "$@"
  fi
}

fail() {
  if [[ "$JSON" -eq 1 ]]; then
    echo "{\"event\":\"error\",\"message\":\"$1\"}"
  else
    echo "Error: $1" >&2
  fi
  exit 1
}

emit_json() {
  if [[ "$JSON" -eq 1 ]]; then
    echo "$1"
  fi
}

is_root() {
  [[ "$(id -u)" -eq 0 ]]
}

has_sudo() {
  command -v sudo >/dev/null 2>&1 && sudo -l >/dev/null 2>&1
}

detect_downloader() {
  if command -v curl >/dev/null 2>&1; then
    DOWNLOADER="curl"
    return 0
  fi
  if command -v wget >/dev/null 2>&1; then
    DOWNLOADER="wget"
    return 0
  fi
  fail "Missing downloader (curl or wget required)"
}

download_file() {
  local url="$1"
  local output="$2"
  if [[ -z "$DOWNLOADER" ]]; then
    detect_downloader
  fi
  if [[ "$DOWNLOADER" == "curl" ]]; then
    curl -fsSL --proto '=https' --tlsv1.2 --retry 3 --retry-delay 1 --retry-connrefused -o "$output" "$url"
    return
  fi
  wget -q --https-only --secure-protocol=TLSv1_2 --tries=3 --timeout=20 -O "$output" "$url"
}

cleanup_legacy_submodules() {
  local repo_dir="${1:-${GIT_DIR:-${HOME}/aura}}"
  local legacy_dir="${repo_dir}/Peekaboo"
  if [[ -d "$legacy_dir" ]]; then
    emit_json "{\"event\":\"step\",\"name\":\"legacy-submodule\",\"status\":\"start\",\"path\":\"${legacy_dir//\"/\\\"}\"}"
    log "Removing legacy submodule checkout: ${legacy_dir}"
    rm -rf "$legacy_dir"
    emit_json "{\"event\":\"step\",\"name\":\"legacy-submodule\",\"status\":\"ok\",\"path\":\"${legacy_dir//\"/\\\"}\"}"
  fi
}

require_bin() {
  local bin="$1"
  if ! command -v "$bin" >/dev/null 2>&1; then
    fail "Missing required tool: $bin"
  fi
}

ensure_git() {
  if command -v git >/dev/null 2>&1; then
    emit_json '{"event":"step","name":"git","status":"ok"}'
    return
  fi

  emit_json '{"event":"step","name":"git","status":"start"}'
  log "Installing git..."

  case "$(uname -s)" in
    Linux)
      if command -v apt-get >/dev/null 2>&1; then
        if is_root; then
          apt-get update -y && apt-get install -y git
        elif has_sudo; then
          sudo apt-get update -y && sudo apt-get install -y git
        else
          fail "Git missing and sudo unavailable. Install git and retry."
        fi
      elif command -v dnf >/dev/null 2>&1; then
        if is_root; then
          dnf install -y git
        elif has_sudo; then
          sudo dnf install -y git
        else
          fail "Git missing and sudo unavailable. Install git and retry."
        fi
      elif command -v yum >/dev/null 2>&1; then
        if is_root; then
          yum install -y git
        elif has_sudo; then
          sudo yum install -y git
        else
          fail "Git missing and sudo unavailable. Install git and retry."
        fi
      else
        fail "Git missing and package manager not found. Install git and retry."
      fi
      ;;
    Darwin)
      if command -v brew >/dev/null 2>&1; then
        brew install git
      else
        fail "Git missing. Install Xcode Command Line Tools or Homebrew Git, then retry."
      fi
      ;;
  esac

  if ! command -v git >/dev/null 2>&1; then
    fail "Git install failed. Install git manually and retry."
  fi

  emit_json '{"event":"step","name":"git","status":"ok"}'
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --json)
        JSON=1
        shift
        ;;
      --version)
        AURA_VERSION="$2"
        shift 2
        ;;
      --install-method|--method)
        INSTALL_METHOD="$2"
        shift 2
        ;;
      --npm)
        INSTALL_METHOD="npm"
        shift
        ;;
      --git|--github)
        INSTALL_METHOD="git"
        shift
        ;;
      --git-dir|--dir)
        GIT_DIR="$2"
        shift 2
        ;;
      --no-git-update)
        GIT_UPDATE=0
        shift
        ;;
      --no-onboard)
        RUN_ONBOARD=0
        shift
        ;;
      --help|-h)
        print_usage
        exit 0
        ;;
      --set-npm-prefix)
        SET_NPM_PREFIX=1
        shift
        ;;
      *)
        fail "Unknown option: $1"
        ;;
    esac
  done
}

os_detect() {
  local os
  os="$(uname -s)"
  case "$os" in
    Darwin) echo "darwin" ;;
    Linux) echo "linux" ;;
    *) fail "Unsupported OS: $os" ;;
  esac
}

arch_detect() {
  local arch
  arch="$(uname -m)"
  case "$arch" in
    arm64|aarch64) echo "arm64" ;;
    x86_64|amd64) echo "x64" ;;
    *) fail "Unsupported architecture: $arch" ;;
  esac
}

ensure_node() {
  local current_version
  local major
  if command -v node >/dev/null 2>&1; then
    current_version="$(node -v 2>/dev/null)"
    if [[ -n "$current_version" ]]; then
      major="$(echo "$current_version" | tr -d 'v' | cut -d'.' -f1)"
      if [[ "$major" -ge 22 ]]; then
        emit_json "{\"event\":\"step\",\"name\":\"node\",\"status\":\"ok\",\"version\":\"${current_version}\"}"
        log "[OK] Node.js ${current_version} found"
        return
      fi
      log "[!] Node.js ${current_version} found, but v22+ required"
    fi
  else
    log "[!] Node.js not found"
  fi

  emit_json '{"event":"step","name":"node","status":"start"}'
  log "Installing Node.js 22+..."

  case "$(uname -s)" in
    Darwin)
      if command -v brew >/dev/null 2>&1; then
        brew install node@22
        brew link node@22 --force
      else
        fail "Homebrew not found. Install Node.js 22+ manually from https://nodejs.org/"
      fi
      ;;
    Linux)
      if command -v apt-get >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
      elif command -v dnf >/dev/null 2>&1; then
        curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash -
        sudo dnf install -y nodejs
      elif command -v yum >/dev/null 2>&1; then
        curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash -
        sudo yum install -y nodejs
      else
        fail "Package manager not found. Install Node.js 22+ manually from https://nodejs.org/"
      fi
      ;;
  esac

  if ! command -v node >/dev/null 2>&1; then
    fail "Node.js installation failed. Install manually from https://nodejs.org/"
  fi

  current_version="$(node -v 2>/dev/null)"
  major="$(echo "$current_version" | tr -d 'v' | cut -d'.' -f1)"
  if [[ "$major" -lt 22 ]]; then
    fail "Node.js version mismatch. Expected v22+, got ${current_version}"
  fi

  emit_json "{\"event\":\"step\",\"name\":\"node\",\"status\":\"ok\",\"version\":\"${current_version}\"}"
  log "[OK] Node.js ${current_version} installed"
}

fix_npm_prefix_if_needed() {
  if [[ "$(os_detect)" != "linux" ]]; then
    return
  fi

  local prefix
  prefix="$(npm config get prefix 2>/dev/null || true)"
  if [[ -z "$prefix" ]]; then
    return
  fi

  if [[ -w "$prefix" || -w "${prefix}/lib" ]]; then
    return
  fi

  local target="${HOME}/.npm-global"
  mkdir -p "$target"
  npm config set prefix "$target"

  local path_line="export PATH=\"${target}/bin:\$PATH\""
  for rc in "${HOME}/.bashrc" "${HOME}/.zshrc"; do
    if [[ -f "$rc" ]] && ! grep -q ".npm-global" "$rc"; then
      echo "$path_line" >> "$rc"
    fi
  done

  export PATH="${target}/bin:${PATH}"
  emit_json "{\"event\":\"step\",\"name\":\"npm-prefix\",\"status\":\"ok\",\"prefix\":\"${target//\"/\\\"}\"}"
  log "Configured npm prefix to ${target}"
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    local current_version
    current_version="$(pnpm --version 2>/dev/null || true)"
    if [[ "$current_version" =~ ^10\. ]]; then
      return 0
    fi
    log "Found pnpm ${current_version:-unknown}; upgrading to pnpm@10..."
  fi

  if command -v corepack >/dev/null 2>&1; then
    emit_json "{\"event\":\"step\",\"name\":\"pnpm\",\"status\":\"start\",\"method\":\"corepack\"}"
    log "Installing pnpm via Corepack..."
    corepack enable >/dev/null 2>&1 || true
    corepack prepare pnpm@10 --activate
    if command -v pnpm >/dev/null 2>&1 && [[ "$(pnpm --version 2>/dev/null || true)" =~ ^10\. ]]; then
      emit_json "{\"event\":\"step\",\"name\":\"pnpm\",\"status\":\"ok\"}"
      return 0
    fi
  fi

  emit_json "{\"event\":\"step\",\"name\":\"pnpm\",\"status\":\"start\",\"method\":\"npm\"}"
  log "Installing pnpm via npm..."
  npm install -g pnpm@10
  emit_json "{\"event\":\"step\",\"name\":\"pnpm\",\"status\":\"ok\"}"
  return 0
}

install_aura() {
  local requested="${AURA_VERSION:-latest}"
  local npm_args=(
    --loglevel "$NPM_LOGLEVEL"
    --no-fund
    --no-audit
  )
  emit_json "{\"event\":\"step\",\"name\":\"aura\",\"status\":\"start\",\"version\":\"${requested}\"}"
  log "Installing Aura Intelligence (${requested})..."
  if [[ "$SET_NPM_PREFIX" -eq 1 ]]; then
    fix_npm_prefix_if_needed
  fi

  if [[ "${requested}" == "latest" ]]; then
    if ! SHARP_IGNORE_GLOBAL_LIBVIPS="$SHARP_IGNORE_GLOBAL_LIBVIPS" npm install -g "${npm_args[@]}" "aura_intelligence@latest"; then
      log "npm install aura_intelligence@latest failed; retrying aura_intelligence@next"
      emit_json "{\"event\":\"step\",\"name\":\"aura\",\"status\":\"retry\",\"version\":\"next\"}"
      SHARP_IGNORE_GLOBAL_LIBVIPS="$SHARP_IGNORE_GLOBAL_LIBVIPS" npm install -g "${npm_args[@]}" "aura_intelligence@next"
      requested="next"
    fi
  else
    SHARP_IGNORE_GLOBAL_LIBVIPS="$SHARP_IGNORE_GLOBAL_LIBVIPS" npm install -g "${npm_args[@]}" "aura_intelligence@${requested}"
  fi

  emit_json "{\"event\":\"step\",\"name\":\"aura\",\"status\":\"ok\",\"version\":\"${requested}\"}"
}

install_aura_from_git() {
  local repo_dir="$1"
  local repo_url="https://github.com/auraintelligenceai/aurora.git"

  if [[ -z "$repo_dir" ]]; then
    fail "Git install dir cannot be empty"
  fi
  if [[ "$repo_dir" != /* ]]; then
    repo_dir="$(pwd)/$repo_dir"
  fi
  mkdir -p "$(dirname "$repo_dir")"
  repo_dir="$(cd "$(dirname "$repo_dir")" && pwd)/$(basename "$repo_dir")"

  emit_json "{\"event\":\"step\",\"name\":\"aura\",\"status\":\"start\",\"method\":\"git\",\"repo\":\"${repo_url//\"/\\\"}\"}"
  if [[ -d "$repo_dir/.git" ]]; then
    log "Installing Aura Intelligence from git checkout: ${repo_dir}"
  else
    log "Installing Aura Intelligence from GitHub (${repo_url})..."
  fi

  ensure_git
  ensure_pnpm

  if [[ -d "$repo_dir/.git" ]]; then
    :
  elif [[ -d "$repo_dir" ]]; then
    if [[ -z "$(ls -A "$repo_dir" 2>/dev/null || true)" ]]; then
      git clone "$repo_url" "$repo_dir"
    else
      fail "Git install dir exists but is not a git repo: ${repo_dir}"
    fi
  else
    git clone "$repo_url" "$repo_dir"
  fi

  if [[ "$GIT_UPDATE" == "1" ]]; then
    if [[ -z "$(git -C "$repo_dir" status --porcelain 2>/dev/null || true)" ]]; then
      git -C "$repo_dir" pull --rebase || true
    else
      log "Repo is dirty; skipping git pull"
    fi
  fi

  cleanup_legacy_submodules "$repo_dir"

  SHARP_IGNORE_GLOBAL_LIBVIPS="$SHARP_IGNORE_GLOBAL_LIBVIPS" pnpm -C "$repo_dir" install

  if ! pnpm -C "$repo_dir" ui:build; then
    log "UI build failed; continuing (CLI may still work)"
  fi
  pnpm -C "$repo_dir" build

  local bin_dir="${HOME}/.local/bin"
  mkdir -p "$bin_dir"

  cat > "${bin_dir}/aura_intelligence" <<EOF
#!/usr/bin/env bash
set -euo pipefail
exec "$(which node)" "${repo_dir}/dist/entry.js" "\$@"
EOF
  chmod +x "${bin_dir}/aura_intelligence"

  if [[ ":$PATH:" != *":${bin_dir}:"* ]]; then
    local path_line="export PATH=\"${bin_dir}:\$PATH\""
    for rc in "${HOME}/.bashrc" "${HOME}/.zshrc"; do
      if [[ -f "$rc" ]] && ! grep -q "$bin_dir" "$rc"; then
        echo "$path_line" >> "$rc"
      fi
    done
    export PATH="${bin_dir}:${PATH}"
  fi

  emit_json "{\"event\":\"step\",\"name\":\"aura\",\"status\":\"ok\",\"method\":\"git\"}"
}

run_doctor() {
  if command -v aura_intelligence >/dev/null 2>&1; then
    emit_json '{"event":"step","name":"doctor","status":"start"}'
    log "Running doctor to migrate settings..."
    aura_intelligence doctor --non-interactive 2>/dev/null || true
    emit_json '{"event":"step","name":"doctor","status":"ok"}'
    log "[OK] Migration complete"
  fi
}

resolve_aura_version() {
  local version=""
  if command -v aura_intelligence >/dev/null 2>&1; then
    version="$(aura_intelligence --version 2>/dev/null | head -n 1 | tr -d '\r')"
  fi
  echo "$version"
}

main() {
  parse_args "$@"

  if [[ "${AURA_NO_ONBOARD:-0}" == "1" ]]; then
    RUN_ONBOARD=0
  fi

  cleanup_legacy_submodules

  ensure_node

  local is_upgrade=0
  if command -v aura_intelligence >/dev/null 2>&1; then
    is_upgrade=1
    log "[*] Existing Aura Intelligence installation detected"
  fi

  if [[ "$INSTALL_METHOD" == "git" ]]; then
    install_aura_from_git "$GIT_DIR"
  elif [[ "$INSTALL_METHOD" == "npm" ]]; then
    ensure_git
    if [[ "$SET_NPM_PREFIX" -eq 1 ]]; then
      fix_npm_prefix_if_needed
    fi
    install_aura
  else
    fail "Unknown install method: ${INSTALL_METHOD} (use npm or git)"
  fi

  if [[ "$is_upgrade" -eq 1 || "$INSTALL_METHOD" == "git" ]]; then
    run_doctor
  fi

  local installed_version
  installed_version="$(resolve_aura_version)"
  if [[ -n "$installed_version" ]]; then
    emit_json "{\"event\":\"done\",\"ok\":true,\"version\":\"${installed_version//\"/\\\"}\"}"
    log "Aura Intelligence installed (${installed_version})."
  else
    emit_json "{\"event\":\"done\",\"ok\":true}"
    log "Aura Intelligence installed."
  fi

  if [[ "$RUN_ONBOARD" -eq 1 ]]; then
    aura_intelligence onboard
  fi
}

main "$@"
