# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in CampSafe, please **DO NOT** open a public GitHub issue. Instead, email ibrahimwarris1@gmail.com or contact the maintainers privately.

### What to Include

Please provide:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will acknowledge your report within 48 hours and work on a fix promptly.

## Security Best Practices

### For Users

1. **Keep dependencies updated**
   ```bash
   npm update
   ```

2. **Use strong passwords**
   - Min 12 characters
   - Mix of upper, lower, numbers, symbols

3. **Protect your API keys**
   - Never commit `.env` files
   - Use environment variables
   - Rotate keys regularly

4. **Enable HTTPS**
   - Always use HTTPS in production
   - Use valid SSL certificates

### For Developers

1. **Authentication**
   - Use JWT with strong secrets
   - Implement token expiration
   - Validate on every request

2. **Data Protection**
   - Never log sensitive data
   - Hash passwords with bcrypt
   - Encrypt sensitive fields

3. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use CORS appropriately
   - Implement request size limits

4. **Dependencies**
   - Audit dependencies regularly
   ```bash
   npm audit
   npm audit fix
   ```
   - Update critical patches immediately

5. **Environment**
   - Use `.env` for secrets
   - Never commit credentials
   - Rotate secrets regularly

6. **Database**
   - Use connection strings with credentials
   - Enable MongoDB authentication
   - Regular backups
   - Principle of least privilege

## Vulnerability Disclosure Timeline

- **Day 1**: Report received, acknowledgment sent
- **Day 3-5**: Initial assessment
- **Day 7-14**: Fix development
- **Day 15-21**: Testing and validation
- **Day 22-28**: Release patch version
- **Day 30**: Public disclosure (after patch release)

## Security Checklist for Deployment

- [ ] All environment variables configured
- [ ] HTTPS/SSL enabled
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] Input validation in place
- [ ] CORS properly configured
- [ ] Secrets not in version control
- [ ] Dependencies audited
- [ ] Logs configured (no sensitive data)
- [ ] Monitoring enabled

## Compliance

CampSafe aims to comply with:
- OWASP Top 10 security practices
- GDPR for user data
- Common security standards

## Contact

**Email**: ibrahimwarris1@gmail.com
**GitHub**: [Report via Security Advisory](https://github.com/Warris-web/campsafe/security/advisories)

## Acknowledgments

We thank all security researchers who responsibly disclose vulnerabilities.

---

Last Updated: 2026-06-19
