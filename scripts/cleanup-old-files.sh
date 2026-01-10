#!/bin/bash

# Cleanup old/unnecessary files from tool directories
# This script removes:
# 1. Old config files with wrong tool names
# 2. .original.tsx backup files
# 3. node_modules directories (can be reinstalled)
# 4. dist directories (can be rebuilt)
# 5. package-lock.json files (will regenerate)

FRONTEND_TOOLS="/Users/onelastai/Documents/VictoryKit/frontend/tools"
BACKEND_TOOLS="/Users/onelastai/Documents/VictoryKit/backend/tools"

echo "============================================"
echo "       VictoryKit Tools Cleanup Script"
echo "============================================"
echo ""

# Function to cleanup a single tool directory
cleanup_tool() {
    local tool_dir="$1"
    local tool_name=$(basename "$tool_dir")
    
    echo "Cleaning: $tool_name"
    
    # Remove node_modules
    if [ -d "$tool_dir/node_modules" ]; then
        echo "  - Removing node_modules..."
        rm -rf "$tool_dir/node_modules"
    fi
    
    # Remove dist folder
    if [ -d "$tool_dir/dist" ]; then
        echo "  - Removing dist..."
        rm -rf "$tool_dir/dist"
    fi
    
    # Remove package-lock.json
    if [ -f "$tool_dir/package-lock.json" ]; then
        echo "  - Removing package-lock.json..."
        rm -f "$tool_dir/package-lock.json"
    fi
    
    # Remove .original files
    find "$tool_dir" -name "*.original.*" -type f 2>/dev/null | while read file; do
        echo "  - Removing: $(basename "$file")"
        rm -f "$file"
    done
    
    # Remove old config files that don't match the current tool name
    # Extract expected config name from directory
    local expected_config="${tool_name#*-}-config.json"
    
    find "$tool_dir" -maxdepth 1 -name "*-config.json" -type f 2>/dev/null | while read file; do
        local filename=$(basename "$file")
        # Check if this is an old/mismatched config file
        if [ "$filename" != "$expected_config" ]; then
            echo "  - Removing old config: $filename"
            rm -f "$file"
        fi
    done
    
    # Remove Dockerfile if exists (not needed for frontend static builds)
    if [ -f "$tool_dir/Dockerfile" ]; then
        echo "  - Removing Dockerfile..."
        rm -f "$tool_dir/Dockerfile"
    fi
    
    # Remove nginx.conf if exists (nginx config is on server)
    if [ -f "$tool_dir/nginx.conf" ]; then
        echo "  - Removing nginx.conf..."
        rm -f "$tool_dir/nginx.conf"
    fi
}

# Cleanup frontend tools
echo ""
echo "========== Cleaning Frontend Tools =========="
for tool_dir in "$FRONTEND_TOOLS"/[0-9][0-9]-*; do
    if [ -d "$tool_dir" ]; then
        cleanup_tool "$tool_dir"
    fi
done

# Cleanup backend tools (similar process)
echo ""
echo "========== Cleaning Backend Tools =========="
for tool_dir in "$BACKEND_TOOLS"/[0-9][0-9]-*; do
    if [ -d "$tool_dir" ]; then
        tool_name=$(basename "$tool_dir")
        echo "Cleaning: $tool_name"
        
        # Remove node_modules
        if [ -d "$tool_dir/node_modules" ]; then
            echo "  - Removing node_modules..."
            rm -rf "$tool_dir/node_modules"
        fi
        
        # Remove dist folder
        if [ -d "$tool_dir/dist" ]; then
            echo "  - Removing dist..."
            rm -rf "$tool_dir/dist"
        fi
        
        # Remove package-lock.json
        if [ -f "$tool_dir/package-lock.json" ]; then
            echo "  - Removing package-lock.json..."
            rm -f "$tool_dir/package-lock.json"
        fi
    fi
done

echo ""
echo "============================================"
echo "              Cleanup Complete!"
echo "============================================"
echo ""
echo "Summary of removed items:"
echo "  - node_modules directories"
echo "  - dist directories"
echo "  - package-lock.json files"
echo "  - *.original.* backup files"
echo "  - Mismatched *-config.json files"
echo "  - Dockerfile files"
echo "  - nginx.conf files"
echo ""
echo "You can now run 'npm install && npm run build' in each tool to rebuild."
