#!/bin/bash

# 3D Carnival Spinning Wheel - Easy Run Script
# This script helps you run the project and perform code quality checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Main menu
show_menu() {
    echo ""
    echo "=========================================="
    echo "  3D Carnival Spinning Wheel"
    echo "=========================================="
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "1) Install dependencies"
    echo "2) Run code quality checks"
    echo "3) Start development server"
    echo "4) Start production server"
    echo "5) Run everything (install + quality + dev server)"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies..."
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed successfully!"
}

# Run code quality checks
run_quality_checks() {
    print_status "Running code quality checks..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Make sure you're in the project root directory."
        exit 1
    fi
    
    echo ""
    print_status "Running ESLint..."
    if npm run lint:ci; then
        print_success "ESLint passed!"
    else
        print_error "ESLint failed!"
        return 1
    fi
    
    echo ""
    print_status "Running Prettier format check..."
    if npm run format:check; then
        print_success "Prettier format check passed!"
    else
        print_error "Prettier format check failed!"
        return 1
    fi
    
    echo ""
    print_status "Running security audit..."
    if npm run audit:ci; then
        print_success "Security audit passed!"
    else
        print_warning "Security audit found issues (check output above)"
    fi
    
    print_success "All code quality checks completed!"
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    # Check if http-server is available
    if ! command_exists npx; then
        print_error "npx is not available. Please install Node.js."
        exit 1
    fi
    
    # Try different ports if 8080 is busy
    PORT=8080
    while port_in_use $PORT; do
        print_warning "Port $PORT is in use, trying port $((PORT + 1))..."
        PORT=$((PORT + 1))
    done
    
    print_status "Starting server on port $PORT..."
    print_status "Open your browser and go to: http://localhost:$PORT"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    # Set up cleanup trap
    cleanup() {
        print_status "Shutting down server..."
        # Kill any child processes
        jobs -p | xargs -r kill
        # Kill the http-server process specifically
        pkill -f "http-server.*$PORT" 2>/dev/null || true
        print_success "Server stopped cleanly!"
        exit 0
    }
    
    # Set trap for cleanup on script exit
    trap cleanup SIGINT SIGTERM EXIT
    
    # Start the server
    npx http-server . -p $PORT -o &
    SERVER_PID=$!
    
    # Wait for the server process
    wait $SERVER_PID
}

# Start production server (with caching)
start_prod_server() {
    print_status "Starting production server with caching..."
    
    PORT=8080
    while port_in_use $PORT; do
        print_warning "Port $PORT is in use, trying port $((PORT + 1))..."
        PORT=$((PORT + 1))
    done
    
    print_status "Starting production server on port $PORT..."
    print_status "Open your browser and go to: http://localhost:$PORT"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    # Set up cleanup trap
    cleanup() {
        print_status "Shutting down server..."
        # Kill any child processes
        jobs -p | xargs -r kill
        # Kill the http-server process specifically
        pkill -f "http-server.*$PORT" 2>/dev/null || true
        print_success "Server stopped cleanly!"
        exit 0
    }
    
    # Set trap for cleanup on script exit
    trap cleanup SIGINT SIGTERM EXIT
    
    # Start the server
    npx http-server . -p $PORT -c-1 -o &
    SERVER_PID=$!
    
    # Wait for the server process
    wait $SERVER_PID
}

# Run everything
run_everything() {
    print_status "Running complete setup..."
    install_deps
    echo ""
    run_quality_checks
    echo ""
    start_dev_server
}

# Main script logic
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # If arguments are provided, run specific commands
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
        "prod")
            start_prod_server
            ;;
        "all")
            run_everything
            ;;
        *)
            # Interactive mode
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
                        start_prod_server
                        ;;
                    5)
                        run_everything
                        ;;
                    6)
                        print_status "Goodbye!"
                        exit 0
                        ;;
                    *)
                        print_error "Invalid choice. Please enter 1-6."
                        ;;
                esac
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

# Run main function with all arguments
main "$@"
