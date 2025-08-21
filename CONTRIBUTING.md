# Contributing to NuMark

First off, thank you for considering contributing to NuMark! It's people like you that make NuMark such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Setting Up Your Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/numark-dev/NuMark.git`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

### Making Changes

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes thoroughly
4. Commit your changes: `git commit -m "Add your feature"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

### Coding Standards

- Use ES6+ features where appropriate
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure your code is properly formatted

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Project Structure

```
dev/
├── bin/              # CLI components
├── content/          # Data models for generator
├── public/           # Application pages
├── src/              # Data management for framework
├── templates/        # Utility functions
└── ...
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Include both unit tests and integration tests where appropriate

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update component documentation

## Questions?

Don't hesitate to ask questions by creating an issue with the "question" label.

Thank you for contributing! 🎉
