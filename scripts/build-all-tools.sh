#!/bin/bash
# ===========================================
# Build All Tools Script
# Builds all 50 frontend tools
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"
OUTPUT_DIR="/Users/onelastai/Documents/VictoryKit/deploy-tools"

# Create output directory
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
    
    # Install deps if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        npm install --silent 2>/dev/null
    fi
    
    # Try to build
    if npm run build --silent 2>/dev/null; then
        # Copy dist to output
        if [ -d "dist" ]; then
            mkdir -p "$OUTPUT_DIR/$tool"
            cp -r dist/* "$OUTPUT_DIR/$tool/"
            echo "   ✅ Success"
            ((SUCCESS++))
        else
            echo "   ⚠️  No dist folder"
            ((FAILED++))
            FAILED_TOOLS="$FAILED_TOOLS $tool"
        fi
    else
        echo "   ❌ Build failed"
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
