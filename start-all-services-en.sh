#!/bin/bash
# Script to start all services for Linux/macOS
# Smart Building Management System

echo "🚀 Starting Smart Building Management System..."

# Check Java
echo "📋 Checking Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✅ Java: $JAVA_VERSION"
else
    echo "❌ Java is not installed or not added to PATH"
    echo "Please install Java 20 and configure JAVA_HOME"
    exit 1
fi

# Check Node.js
echo "📋 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check MySQL
echo "📋 Checking MySQL..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    echo "✅ MySQL: $MYSQL_VERSION"
else
    echo "❌ MySQL is not installed or not added to PATH"
    echo "Please install MySQL 8.0+ and configure PATH"
    exit 1
fi

# Create logs directory if not exists
mkdir -p logs

# Start Backend
echo "🔧 Starting Backend API..."
cd apartment-portal-BE
gnome-terminal -- bash -c "echo '🔧 Backend API is starting...'; ./gradlew bootRun; exec bash" 2>/dev/null || \
xterm -e "echo '🔧 Backend API is starting...'; ./gradlew bootRun; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'; echo \"🔧 Backend API is starting...\"; ./gradlew bootRun"' 2>/dev/null || \
./gradlew bootRun &
sleep 3

# Start Admin Portal
echo "🎨 Starting Admin Portal..."
cd ../apartment-portal-Fe
gnome-terminal -- bash -c "echo '🎨 Admin Portal is starting...'; npm run dev; exec bash" 2>/dev/null || \
xterm -e "echo '🎨 Admin Portal is starting...'; npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'; echo \"🎨 Admin Portal is starting...\"; npm run dev"' 2>/dev/null || \
npm run dev &
sleep 2

# Start User Portal
echo "👥 Starting User Portal..."
cd ../apartment-user-portal
gnome-terminal -- bash -c "echo '👥 User Portal is starting...'; npm run dev; exec bash" 2>/dev/null || \
xterm -e "echo '👥 User Portal is starting...'; npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'; echo \"👥 User Portal is starting...\"; npm run dev"' 2>/dev/null || \
npm run dev &

# Return to root directory
cd ..

echo "✅ All services have been started!"
echo ""
echo "🌐 Access applications:"
echo "   Backend API:    http://localhost:8080"
echo "   Admin Portal:   http://localhost:3000"
echo "   User Portal:    http://localhost:3001"
echo ""
echo "📝 Note: Please wait a few minutes for all services to start completely"
echo "🔍 Check logs in terminals to monitor startup progress"

# Open browser after 30 seconds
sleep 30
echo "🌐 Opening browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
    xdg-open http://localhost:3001
elif command -v open &> /dev/null; then
    open http://localhost:3000
    open http://localhost:3001
fi
