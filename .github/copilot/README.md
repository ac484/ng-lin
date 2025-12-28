# GitHub Copilot Configuration

GitHub Copilot configuration for the GigHub project.

## Directory Structure

```
.github/
├── copilot-instructions.md      # Main entry point
├── instructions/                 # Scoped instructions
├── copilot/                      # Configuration files
│   ├── mcp-servers.yml          # MCP server config
│   ├── security-rules.yml       # Security rules
│   ├── constraints.md           # Forbidden patterns
│   ├── agents/                  # Agent auto-triggers
│   └── shortcuts/               # Chat shortcuts
└── agents/                       # Custom agent definitions
```

## How It Works

### Entry Point: `copilot-instructions.md`
- Project overview (Angular 20, ng-alain, Firebase)
- MCP tool usage policy
- Code standards and architecture
- Development commands

### Scoped Instructions: `.github/instructions/`
Domain-specific files with `applyTo` directives:
- `angular.instructions.md` - Angular 20 best practices
- `typescript-5-es2022.instructions.md` - TypeScript standards
- `ng-alain-delon.instructions.md` - ng-alain integration
- `ng-zorro-antd.instructions.md` - UI components

### MCP Servers: `copilot/mcp-servers.yml`
Configured tools:
- **context7**: Latest library documentation
- **sequential-thinking**: Complex problem solving
- **software-planning-tool**: Feature planning

### Custom Agents: `agents/`
Specialized agents for:
- Architecture design
- Code review
- Testing
- Security
- Documentation

## Quick Start

1. Review `copilot-instructions.md`
2. Check relevant instruction files for your work
3. Use MCP tools when needed
4. Follow custom agents for specialized tasks
