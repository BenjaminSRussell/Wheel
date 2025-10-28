#!/bin/bash

set -e

kill_port_8080() {
    PIDS=$(lsof -ti:8080 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
    fi
    pkill -f "live-server" 2>/dev/null || true
}

clean_dependencies() {
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
    fi
    npm cache clean --force 2>/dev/null || true
}

clean_build_artifacts() {
    rm -rf dist 2>/dev/null || true
    rm -rf build 2>/dev/null || true
    rm -rf .vite 2>/dev/null || true
    rm -rf coverage 2>/dev/null || true
    rm -f *.log 2>/dev/null || true
    rm -f npm-debug.log* 2>/dev/null || true
    rm -f yarn-debug.log* 2>/dev/null || true
    rm -f yarn-error.log* 2>/dev/null || true
}

clean_temp_files() {
    rm -rf .DS_Store 2>/dev/null || true
    rm -rf Thumbs.db 2>/dev/null || true
    rm -rf *~ 2>/dev/null || true
    rm -rf .#* 2>/dev/null || true
    rm -rf .vscode/settings.json 2>/dev/null || true
    rm -rf .idea/ 2>/dev/null || true
}

main() {
    read -p "Continue? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        exit 0
    fi
    kill_port_8080
    clean_dependencies
    clean_build_artifacts
    clean_temp_files
}

main "$@"
