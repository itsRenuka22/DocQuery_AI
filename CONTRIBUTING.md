# Contributing to AskMyPDF

Thank you for your interest in contributing to AskMyPDF! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, etc.)
- Relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature already exists
- Clearly describe the feature and its benefits
- Explain your use case

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/itsRenuka22/askmypdf-gemini-aws.git
   cd askmypdf-gemini-aws
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Start the application
   docker-compose up -d

   # Run smoke tests
   ./scripts/smoke.sh

   # Test manually in browser
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

   Commit message format:
   - `Add: ` - New feature
   - `Fix: ` - Bug fix
   - `Update: ` - Enhancement to existing feature
   - `Docs: ` - Documentation only
   - `Refactor: ` - Code restructuring

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots if UI changes

## 📝 Code Style

### Python
- Follow PEP 8 guidelines
- Use type hints where appropriate
- Maximum line length: 100 characters
- Use meaningful variable names

### Documentation
- Update README.md for feature changes
- Add docstrings to new functions
- Update API documentation for endpoint changes

## 🧪 Testing

Before submitting a PR:
- [ ] Code runs without errors
- [ ] All existing features still work
- [ ] New features have been tested
- [ ] Documentation is updated

## 🔐 Security

- Never commit secrets or credentials
- Use `.env` for sensitive data
- Report security vulnerabilities privately

## 📞 Questions?

Feel free to open an issue for:
- Questions about the codebase
- Help with setup
- Discussion about potential features

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!
