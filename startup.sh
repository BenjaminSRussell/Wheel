#!/bin/bash

# 🎡 3D Carnival Wheel - Startup Script
# This script starts the development server and opens the app

echo "🎡 Starting 3D Carnival Wheel..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

# Display versions
echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Kill any existing server on port 8080
echo -e "${BLUE}🔍 Checking for existing server...${NC}"
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${BLUE}⚠️  Stopping existing server on port 8080...${NC}"
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the server
echo -e "${GREEN}🚀 Starting development server...${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   🎡 3D Carnival Wheel is ready!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   Main app:       ${GREEN}http://127.0.0.1:8080${NC}"
echo -e "   Diagnostic:     ${GREEN}http://127.0.0.1:8080/diagnostic.html${NC}"
echo -e "   Simple version: ${GREEN}http://127.0.0.1:8080/index-simple.html${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo ""

# Open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2
    open "http://127.0.0.1:8080"
fi

# Start npm server
npm start
