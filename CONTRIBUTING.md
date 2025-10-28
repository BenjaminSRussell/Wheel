# Contributing to 2D Tech Wheel

Thank you for your interest in contributing! This document outlines our coding standards, style guide, and development workflow.

## Comment & Style Guide

### Comment Policy

Focus comments on **why**, tradeoffs, assumptions, invariants, external constraints, edge cases, and temporary workarounds. Keep comments concise and use complete sentences.

**Good comments:**
```javascript
// Retry with exponential backoff because the upstream API returns 429s under burst load
// Using median to reduce impact of outliers observed in field tests (>10x spikes)
// Normalize angles to handle wraparound at 2π boundary
```

**Bad comments:**
```javascript
// Get the user name
const name = user.name;

// Add 1 to counter
counter = counter + 1;

// Set the color (obvious from context)
color = 'red';
```

### Code Style

- **Self-documenting code**: Use intention-revealing names instead of comments
- **No emojis**: Remove emojis from source code, comments, and developer-facing strings
- **Consistent naming**: Use camelCase for variables/functions, PascalCase for classes
- **Early returns**: Prefer early returns to reduce nesting
- **Avoid redundant code**: Delete verbose code that restates the obvious

### Examples

**Simplify conditionals:**
```javascript
// Bad
if (condition) {
  return true;
} else {
  return false;
}

// Good
return Boolean(condition);
```

**Improve naming:**
```javascript
// Bad
const result_list = [];
const temp = data.value;
const df1 = processData(x);

// Good
const processedItems = [];
const configValue = data.value;
const formattedData = processData(x);
```

**Flatten nesting:**
```javascript
// Bad
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        return sendEmail(user);
      }
    }
  }
}

// Good
function processUser(user) {
  if (!user?.isActive) return;
  if (!user.email) return;
  return sendEmail(user);
}
```

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm start`
4. Run tests: `npm test`

## Code Quality Checks

The project uses automated tooling to maintain code quality:

- **ESLint**: Linting with modern rules
- **Prettier**: Code formatting
- **Jest**: Unit testing with coverage
- **Husky**: Pre-commit hooks
- **lint-staged**: Run linters on staged files

### Pre-commit Hooks

Before each commit, the following checks run:
- ESLint with auto-fix
- Prettier formatting
- Jest tests for changed files

### Quality Checks

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code
npm run test        # Run tests with coverage
npm run check:quality # Run all quality checks
```

## Testing

Write tests for:
- New features
- Bug fixes
- Edge cases (empty, null, malformed inputs)
- Core logic and utilities

Tests should be:
- Deterministic
- Offline (no network calls)
- Fast and focused
- Well-named and descriptive

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run quality checks: `npm run check:quality`
5. Ensure all tests pass
6. Submit a pull request with a clear description

## Configuration

All runtime constants are defined in `src/config/appConfig.js`. Avoid hardcoding values throughout the codebase.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

