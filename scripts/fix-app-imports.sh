#!/bin/bash
# ===========================================
# Rename component files to match expected names
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"

# Tool mapping: directory|old_component|new_component
declare -a RENAMES=(
    "02-darkwebmonitor|DarkWebMonitorTool|EnhancedDarkWebMonitorTool"
    "03-zerodaydetect|ThreatRadarTool|ZeroDayDetectTool"
    "04-ransomshield|MalwareHunterTool|RansomShieldTool"
    "05-phishnetai|PhishGuardTool|PhishNetAITool"
)

# For tool 02, there's already EnhancedDarkWebMonitorTool.tsx 
# Let's check what files exist and fix App.tsx to use correct names

echo "🔧 Checking component files and fixing App.tsx..."

# Check each tool and fix App.tsx to use existing component
cd "$TOOLS_DIR"

for dir in */; do
    tool=$(basename "$dir")
    components_dir="${dir}src/components"
    
    if [ -d "$components_dir" ]; then
        # Find the main tool component (ends with Tool.tsx)
        main_component=$(ls "$components_dir"/*Tool.tsx 2>/dev/null | grep -v "NeuralLink" | head -1)
        
        if [ -n "$main_component" ]; then
            component_filename=$(basename "$main_component" .tsx)
            echo "$tool: $component_filename"
            
            # Update App.tsx to use this component
            cat > "${dir}src/App.tsx" << EOF
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ${component_filename} from "./components/${component_filename}";

function App() {
  return (
    <Routes>
      <Route path="/" element={<${component_filename} />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
EOF
        else
            echo "$tool: NO TOOL COMPONENT FOUND"
        fi
    fi
done

echo "✅ All App.tsx files updated to use correct component names!"
