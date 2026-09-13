# Contributing to Spatchy AI

Thank you for your interest in contributing to Spatchy AI! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. macOS 13.0]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- List any alternatives you've considered

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Update documentation** as needed
6. **Submit a pull request**

**Pull Request Template:**

```markdown
**Description**
Brief description of changes.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Manual testing completed
- [ ] Added/updated tests
- [ ] All tests pass

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git
- Supabase CLI (for backend work)

### Local Development

```bash
# Clone your fork
git clone https://github.com/your-username/spatchy-ai-web.git
cd spatchy-ai-web

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Backend Development

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Serve edge functions locally
supabase functions serve
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide type annotations where helpful
- Avoid `any` types when possible
- Use interfaces for object shapes

### React

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for reusable logic
- Follow React Query patterns for data fetching

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`)
- **Functions**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile`)

### File Organization

```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── dashboard/       # Dashboard-specific
│   └── [feature]/       # Feature-specific
├── pages/               # Route components
├── hooks/               # Custom hooks
├── services/            # API services
├── types/               # TypeScript types
├── context/             # React contexts
└── lib/                 # Utilities
```

### Comments

- Write self-documenting code
- Add comments for complex logic
- Document public APIs
- Use JSDoc for function documentation

```typescript
/**
 * Fetches user profile from the database
 * @param userId - The unique user identifier
 * @returns Promise resolving to user profile
 */
export async function getUserProfile(userId: string): Promise<Profile> {
  // Implementation
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- user-profile.test.ts
```

### Writing Tests

- Test files should be adjacent to source files: `user-profile.test.ts`
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

```typescript
describe('getUserProfile', () => {
  it('should return user profile when user exists', async () => {
    // Arrange
    const userId = '123';

    // Act
    const profile = await getUserProfile(userId);

    // Assert
    expect(profile).toBeDefined();
    expect(profile.id).toBe(userId);
  });
});
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi colons, etc
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(dashboard): add real-time driver status updates

Implemented WebSocket connection to show live driver locations
on the dispatcher dashboard.

Closes #123
```

```
fix(auth): resolve token refresh issue

Fixed bug where auth tokens weren't being refreshed properly,
causing users to be logged out prematurely.
```

---

## Documentation

- Update README.md for significant changes
- Add/update JSDoc comments for new functions
- Update deployment guides if deployment process changes
- Keep CHANGELOG.md updated

---

## Review Process

### What We Look For

1. **Code Quality**
   - Follows coding standards
   - Well-structured and maintainable
   - Properly typed (TypeScript)

2. **Testing**
   - Adequate test coverage
   - Tests are meaningful
   - Edge cases covered

3. **Documentation**
   - Code is documented
   - README updated if needed
   - Breaking changes noted

4. **Performance**
   - No unnecessary re-renders
   - Optimized queries
   - Efficient algorithms

### Review Timeline

- Initial review: Within 2-3 business days
- Follow-up reviews: Within 1-2 business days
- Merge: After approval from 1-2 maintainers

---

## License

By contributing to Spatchy AI, you agree that your contributions will be licensed under the same license as the project.

---

## Questions?

- Open an issue for questions
- Join our Discord community (link TBD)
- Email: support@spatchy.ai

---

**Thank you for contributing to Spatchy AI! 🚀**
