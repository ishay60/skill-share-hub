#!/bin/bash

# Setup script for SkillShareHub development aliases

echo "🚀 Setting up SkillShareHub development aliases..."

# Determine shell configuration file
if [[ "$SHELL" == *"zsh"* ]]; then
    CONFIG_FILE="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [[ "$SHELL" == *"bash"* ]]; then
    CONFIG_FILE="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    echo "❌ Unsupported shell: $SHELL"
    echo "Please manually add the contents of .dev-aliases to your shell configuration file"
    exit 1
fi

# Check if aliases are already added
if grep -q "SkillShareHub Development Aliases" "$CONFIG_FILE"; then
    echo "✅ Aliases already configured in $CONFIG_FILE"
else
    # Add aliases to shell config
    echo "" >> "$CONFIG_FILE"
    echo "# SkillShareHub Development Aliases" >> "$CONFIG_FILE"
    echo "source $(pwd)/.dev-aliases" >> "$CONFIG_FILE"
    echo "✅ Aliases added to $CONFIG_FILE"
fi

echo ""
echo "🎯 Setup complete! Here are your new shortcuts:"
echo ""
echo "Quick Commands:"
echo "  dev-all     - Start all services"
echo "  dev-api     - Start API server only"
echo "  dev-web     - Start Web server only"
echo "  dev-stop    - Stop all services"
echo "  status      - Check service status"
echo ""
echo "Quick Navigation:"
echo "  s           - Go to project root"
echo "  sa          - Go to API directory"
echo "  sw          - Go to Web directory"
echo ""
echo "📝 To use these commands, either:"
echo "   1. Restart your terminal, or"
echo "   2. Run: source $CONFIG_FILE"
echo ""
echo "🔧 For help: ./dev.sh help"
