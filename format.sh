#!/bin/bash

# Format all files with Prettier
echo "🔍 Formatting code with Prettier..."
npx prettier --write .

# Run ESLint with auto-fix
echo "🔧 Running ESLint with auto-fix..."
npx eslint . --ext .js,.jsx,.ts,.tsx --fix

echo "✅ Code formatting complete!" 