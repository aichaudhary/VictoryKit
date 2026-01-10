#!/bin/bash
# ===========================================
# Build All Tools Script - With Dependency Install
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"
OUTPUT_DIR="/Users/onelastai/Documents/VictoryKit/deploy-tools"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "🔨 Building all 50 tools..."
echo ""

cd "$TOOLS_DIR"

SUCCESS=0
FAILED=0
FAILED_TOOLS=""

for dir in */; do
    tool=$(basename "$dir")
    echo "📦 Building $tool..."
    
    cd "$TOOLS_DIR/$tool"
    
    # Always install deps to ensure they're up to date
    npm install --silent 2>/dev/null
    
    # Add axios if missing (common issue)
    npm install axios --save --silent 2>/dev/null
    
    # Try to build - capture errors
    BUILD_OUTPUT=$(npm run build 2>&1)
    BUILD_EXIT=$?
    
    if [ $BUILD_EXIT -eq 0 ] && [ -d "dist" ]; then
        mkdir -p "$OUTPUT_DIR/$tool"
        cp -r dist/* "$OUTPUT_DIR/$tool/"
        echo "   ✅ Success"
        ((SUCCESS++))
    else
        echo "   ❌ Build failed"
        echo "$BUILD_OUTPUT" | tail -5
        ((FAILED++))
        FAILED_TOOLS="$FAILED_TOOLS $tool"
    fi
done

echo ""
echo "========================================="
echo "BUILD SUMMARY"
echo "========================================="
echo "✅ Successful: $SUCCESS"
echo "❌ Failed: $FAILED"
if [ -n "$FAILED_TOOLS" ]; then
    echo "Failed tools:$FAILED_TOOLS"
fi
echo ""
echo "Output directory: $OUTPUT_DIR"
