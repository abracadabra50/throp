#!/bin/bash

# Fix TypeScript build errors

# Remove unused month variable
sed -i '' 's/const month = now.getMonth();//g' src/api/hot-takes-endpoint.ts

# Comment out unused import
sed -i '' 's/import { handleTrendingPrompts }/\/\/ import { handleTrendingPrompts }/g' src/api/server.ts

echo "Fixed build errors"
