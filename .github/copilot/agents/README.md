# Copilot Agents Configuration

GitHub Copilot agent configurations with MCP tool integration.

## File Structure

```
.github/
├─ copilot-instructions.md        # Main instructions
├─ copilot/
│  ├─ mcp-servers.yml             # MCP config
│  ├─ security-rules.yml          # Security rules
│  ├─ agents/                     # Auto-triggers (*.yml)
│  │     auto-triggers.yml        # Trigger rules
│  │     config.yml               # Agent settings
│  │     default.yml              # Default agent
│  │     mcp.yml                  # MCP tools
│  │     review.yml               # Code review
│  │     tests.yml                # Test generation
│  │     security.yml             # Security checks
│  └─ workflows/                  # Workflow templates
└─ agents/                        # Custom agents (*.agent.md)
```

## Agent Files

### Core Configuration
- **auto-triggers.yml**: MCP tool auto-triggering
- **config.yml**: Agent settings
- **default.yml**: Default behavior

### Specialized Agents
- **mcp.yml**: MCP tool usage
- **review.yml**: Code review
- **tests.yml**: Test generation
- **security.yml**: Security validation
- **ci.yml**: CI/CD management
- **docs.yml**: Documentation

## Custom Agents (`.github/agents/`)

Specialized markdown-based agents:
- GigHub.agent.md - Project-specific agent
- context7.agent.md - Library documentation
- firebase.agent.md - Firebase integration
- And more...

## Usage

Agents auto-load based on triggers and patterns.
See `copilot-instructions.md` for full usage guide.
