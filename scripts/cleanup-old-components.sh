#!/bin/bash

# Cleanup old/duplicate component files from frontend tools
# These are common UI components that are duplicated across tools
# Each tool should only have its main Tool component

FRONTEND_TOOLS="/Users/onelastai/Documents/VictoryKit/frontend/tools"

echo "============================================"
echo "  Frontend Components Cleanup Script"
echo "============================================"
echo ""

# List of old/duplicate component files to remove
OLD_COMPONENTS=(
    "NeuralLinkInterface.tsx"
    "Header.tsx"
    "Footer.tsx"
    "Sidebar.tsx"
    "Overlay.tsx"
    "NavigationDrawer.tsx"
    "ChatBox.tsx"
    "SettingsPanel.tsx"
    "Navigation.tsx"
    "Enhanced*.tsx"
)

echo "Files to remove:"
total=0

for component in "${OLD_COMPONENTS[@]}"; do
    count=$(find "$FRONTEND_TOOLS" -path "*/src/components/*" -name "$component" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        echo "  - $component: $count files"
        total=$((total + count))
    fi
done

echo ""
echo "Total files to remove: $total"
echo ""

# Remove the old component files
echo "Removing old component files..."

for component in "${OLD_COMPONENTS[@]}"; do
    find "$FRONTEND_TOOLS" -path "*/src/components/*" -name "$component" -type f -delete 2>/dev/null
done

echo ""
echo "============================================"
echo "      Components Cleanup Complete!"
echo "============================================"

# Show remaining component count
remaining=$(find "$FRONTEND_TOOLS" -path "*/src/components/*" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "Remaining component files: $remaining"
echo "Frontend tools size: $(du -sh "$FRONTEND_TOOLS" | cut -f1)"
