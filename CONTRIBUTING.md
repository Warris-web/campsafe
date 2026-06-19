# Contributing to CampSafe

Thank you for your interest in contributing to CampSafe! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and grow
- Report issues constructively

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use a clear title** that describes the problem
3. **Provide detailed description** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, browser, Node version)
   - Screenshots/error logs if applicable

### Suggesting Enhancements

1. **Describe the use case** - Why would this be useful?
2. **Explain expected behavior** - What should happen?
3. **Provide examples** - Show how it would be used
4. **List alternatives** - Are there other solutions?

### Submitting Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/campsafe.git
   cd campsafe
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Keep commits atomic and well-documented
   - Follow the existing code style
   - Add comments for complex logic

4. **Test your changes**
   - Frontend: `npm run build` should succeed
   - Backend: Test API endpoints
   - No console errors or warnings

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add user authentication"
   git commit -m "fix: resolve map zoom issue"
   git commit -m "docs: update API documentation"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes
   - Ensure CI checks pass

## 📋 Pull Request Checklist

- [ ] Code follows project style
- [ ] No console errors/warnings
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No breaking changes (or documented if necessary)

## 🎨 Code Style

### JavaScript/React
- Use ES6+ features
- Use meaningful variable names
- Max line length: 100 characters
- Use single quotes for strings
- Add JSDoc comments for functions

```javascript
/**
 * Fetches user location from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} User location data
 */
function getUserLocation(lat, lng) {
  // Implementation
}
```

### Naming Conventions
- `PascalCase` for components: `UserProfile.jsx`
- `camelCase` for functions: `getUserData()`
- `UPPER_SNAKE_CASE` for constants: `MAX_RETRIES`
- `camelCase` for variables: `isLoading`

## 🧪 Testing Guidelines

- Write tests for new features
- Update tests for bug fixes
- Run tests before submitting PR
- Aim for >80% code coverage on new code

```bash
# Frontend
npm run test

# Backend
npm run test
```

## 📚 Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying environment variables
- Fixing known issues

Documentation locations:
- **Setup**: `README.md`
- **API**: Add to appropriate section
- **Troubleshooting**: `README.md` → Troubleshooting
- **Architecture**: Create `ARCHITECTURE.md` if needed

## 🚀 Getting Help

- **Questions**: Open a discussion
- **Issues**: Check existing issues first
- **Discord/Chat**: Join our community (if available)
- **Email**: contact via GitHub

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` (to be created)
- Release notes for significant contributions
- GitHub contributors page

Thank you for making CampSafe better! 🎉
