#!/bin/bash

set -e

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

show_menu() {
    echo ""
    echo "1) Install dependencies"
    echo "2) Run code quality checks"
    echo "3) Start server"
    echo "4) Run everything (install + quality + server)"
    echo "5) Exit"
    echo ""
    read -p "Choice: " choice
}

install_deps() {
    if ! command_exists npm; then
        echo "npm not found. Install Node.js first."
        exit 1
    fi
    npm install
}

run_quality_checks() {
    if [ ! -f "package.json" ]; then
        echo "package.json not found."
        exit 1
    fi
    npm run lint:ci
    npm run format:check
    npm run audit:ci
}

start_dev_server() {
    if ! command_exists npm; then
        echo "npm not found. Install Node.js first."
        exit 1
    fi
    PORT=8080
    while port_in_use $PORT; do
        PORT=$((PORT + 1))
    done
    cleanup() {
        jobs -p | xargs -r kill
        pkill -f "live-server.*$PORT" 2>/dev/null || true
        exit 0
    }
    trap cleanup SIGINT SIGTERM EXIT
    npm start &
    SERVER_PID=$!
    wait $SERVER_PID
}

run_everything() {
    install_deps
    run_quality_checks
    start_dev_server
}

main() {
    if [ ! -f "package.json" ]; then
        echo "package.json not found. Run from project root."
        exit 1
    fi
    case "$1" in
        "install")
            install_deps
            ;;
        "quality")
            run_quality_checks
            ;;
        "dev")
            start_dev_server
            ;;
        "all")
            run_everything
            ;;
        *)
            while true; do
                show_menu
                case $choice in
                    1)
                        install_deps
                        ;;
                    2)
                        run_quality_checks
                        ;;
                    3)
                        start_dev_server
                        ;;
                    4)
                        run_everything
                        ;;
                    5)
                        exit 0
                        ;;
                    *)
                        echo "Invalid choice."
                        ;;
                esac
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

main "$@"