#!/bin/bash

# 2D Tech Wheel - Clean Shutdown Script
# This script completely cleans the project for a fresh reinstall

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

# Function to kill processes on port 8080
kill_port_8080() {
    print_status "Killing all processes on port 8080..."
    
    # Find and kill processes using port 8080
    PIDS=$(lsof -ti:8080 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        print_success "Killed processes on port 8080"
    else
        print_status "No processes found on port 8080"
    fi
    
    # Kill any vite processes
    pkill -f "vite" 2>/dev/null || true
    pkill -f "live-server" 2>/dev/null || true
    pkill -f "http-server" 2>/dev/null || true
}

# Function to clean node_modules and package-lock
clean_dependencies() {
    print_status "Cleaning dependencies..."
    
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_success "Removed node_modules directory"
    fi
    
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        print_success "Removed package-lock.json"
    fi
    
    # Clean npm cache
    npm cache clean --force 2>/dev/null || true
    print_success "Cleaned npm cache"
}

# Function to clean build artifacts
clean_build_artifacts() {
    print_status "Cleaning build artifacts..."
    
    # Remove common build directories
    rm -rf dist 2>/dev/null || true
    rm -rf build 2>/dev/null || true
    rm -rf .vite 2>/dev/null || true
    rm -rf coverage 2>/dev/null || true
    
    # Remove log files
    rm -f *.log 2>/dev/null || true
    rm -f npm-debug.log* 2>/dev/null || true
    rm -f yarn-debug.log* 2>/dev/null || true
    rm -f yarn-error.log* 2>/dev/null || true
    
    print_success "Cleaned build artifacts"
}

# Function to clean temporary files
clean_temp_files() {
    print_status "Cleaning temporary files..."
    
    # Remove OS-specific temp files
    rm -rf .DS_Store 2>/dev/null || true
    rm -rf Thumbs.db 2>/dev/null || true
    rm -rf *~ 2>/dev/null || true
    rm -rf .#* 2>/dev/null || true
    
    # Remove editor temp files
    rm -rf .vscode/settings.json 2>/dev/null || true
    rm -rf .idea/ 2>/dev/null || true
    
    print_success "Cleaned temporary files"
}

# Main cleanup function
main() {
    echo ""
    echo "=========================================="
    echo "  2D Tech Wheel - Clean Shutdown"
    echo "=========================================="
    echo ""
    
    print_warning "This will completely clean the project for a fresh reinstall."
    read -p "Are you sure you want to continue? (y/N): " confirm
    
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
    
    echo ""
    print_status "Starting complete cleanup..."
    
    # Kill all running processes
    kill_port_8080
    
    # Clean dependencies
    clean_dependencies
    
    # Clean build artifacts
    clean_build_artifacts
    
    # Clean temporary files
    clean_temp_files
    
    echo ""
    print_success "Cleanup completed successfully!"
    print_status "You can now run './run.sh install' for a fresh install."
    echo ""
}

# Run main function
main "$@"
