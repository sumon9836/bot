#!/bin/bash

# 🚀 Vercel Deployment Script for Kaisen-MD Dashboard
echo "🤖 Kaisen-MD Dashboard - Vercel Deployment"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Are you in the correct directory?"
    exit 1
fi

# Display project info
echo "📁 Project Structure:"
echo "   ├── api/index.js (Node.js server)"
echo "   ├── public/ (Static files)"
echo "   ├── vercel.json (Configuration)" 
echo "   └── package.json (Dependencies)"
echo ""

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "1) Development deployment (preview)"
echo "2) Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🔧 Deploying to development..."
        vercel
        ;;
    2)
        echo "🌟 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Defaulting to development deployment."
        vercel
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo "📱 Your WhatsApp Bot Dashboard is now live!"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the dashboard functionality"
echo "   2. Configure custom domain (optional)"
echo "   3. Set up monitoring (optional)"
echo ""
echo "💡 Tip: Use 'vercel --prod' for production deployments"