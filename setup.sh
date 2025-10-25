#!/bin/bash

echo "🚀 Setting up Country Currency & Exchange API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if pnpm is installed, if not install it
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one with SQLite configuration:"
    echo "DATABASE_URL=\"file:./data/countries.db\"" > .env
    echo "PORT=3000" >> .env
    echo "✅ Created .env file with SQLite configuration"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma db push (creates SQLite database)"
echo "2. Start the server: pnpm run start:dev"
echo ""
echo "For testing, you can run: node test-api.js"
