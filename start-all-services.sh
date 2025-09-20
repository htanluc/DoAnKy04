#!/bin/bash
# Script khởi động tất cả services cho Linux/macOS
# Smart Building Management System

echo "🚀 Đang khởi động Smart Building Management System..."

# Kiểm tra Java
echo "📋 Kiểm tra Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✅ Java: $JAVA_VERSION"
else
    echo "❌ Java chưa được cài đặt hoặc chưa được thêm vào PATH"
    echo "Vui lòng cài đặt Java 20 và cấu hình JAVA_HOME"
    exit 1
fi

# Kiểm tra Node.js
echo "📋 Kiểm tra Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js chưa được cài đặt"
    echo "Vui lòng cài đặt Node.js 18+ từ https://nodejs.org"
    exit 1
fi

# Kiểm tra MySQL
echo "📋 Kiểm tra MySQL..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    echo "✅ MySQL: $MYSQL_VERSION"
else
    echo "❌ MySQL chưa được cài đặt hoặc chưa được thêm vào PATH"
    echo "Vui lòng cài đặt MySQL 8.0+ và cấu hình PATH"
    exit 1
fi

# Tạo thư mục logs nếu chưa có
mkdir -p logs

# Khởi động Backend
echo "🔧 Đang khởi động Backend API..."
cd apartment-portal-BE
gnome-terminal -- bash -c "echo '🔧 Backend API đang khởi động...'; ./gradlew bootRun; exec bash" 2>/dev/null || \
xterm -e "echo '🔧 Backend API đang khởi động...'; ./gradlew bootRun; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'; echo \"🔧 Backend API đang khởi động...\"; ./gradlew bootRun"' 2>/dev/null || \
./gradlew bootRun &
sleep 3

# Khởi động Admin Portal
echo "🎨 Đang khởi động Admin Portal..."
cd ../apartment-portal-Fe
gnome-terminal -- bash -c "echo '🎨 Admin Portal đang khởi động...'; npm run dev; exec bash" 2>/dev/null || \
xterm -e "echo '🎨 Admin Portal đang khởi động...'; npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'; echo \"🎨 Admin Portal đang khởi động...\"; npm run dev"' 2>/dev/null || \
npm run dev &
sleep 2

# Khởi động User Portal
echo "👥 Đang khởi động User Portal..."
cd ../apartment-user-portal
gnome-terminal -- bash -c "echo '👥 User Portal đang khởi động...'; npm run dev; exec bash" 2>/dev/null || \
xterm -e "echo '👥 User Portal đang khởi động...'; npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'; echo \"👥 User Portal đang khởi động...\"; npm run dev"' 2>/dev/null || \
npm run dev &

# Quay về thư mục gốc
cd ..

echo "✅ Tất cả services đã được khởi động!"
echo ""
echo "🌐 Truy cập các ứng dụng:"
echo "   Backend API:    http://localhost:8080"
echo "   Admin Portal:   http://localhost:3000"
echo "   User Portal:    http://localhost:3001"
echo ""
echo "📝 Lưu ý: Vui lòng đợi vài phút để tất cả services khởi động hoàn tất"
echo "🔍 Kiểm tra logs trong các terminal để theo dõi quá trình khởi động"

# Mở trình duyệt sau 30 giây
sleep 30
echo "🌐 Đang mở trình duyệt..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
    xdg-open http://localhost:3001
elif command -v open &> /dev/null; then
    open http://localhost:3000
    open http://localhost:3001
fi
