# 🔒 Security & Release Guide for Trauma-AI

## ⚠️ CRITICAL: API Key Rotation MUST Happen Before Public Release

Your OpenRouter API key has been visible in local `.env` file(s) during development. **You MUST rotate this key immediately before pushing to GitHub.**

### API Key Rotation Steps

#### 1. Generate New OpenRouter API Key
1. Go to [https://openrouter.ai/account/api-keys](https://openrouter.ai/account/api-keys)
2. Click **"Create New"** or **"+ New API Key"**
3. Name it something like `trauma-ai-prod` or `trauma-ai-v2`
4. Copy the new key immediately (it won't be shown again)

#### 2. Revoke Old Key
1. In the same OpenRouter API keys page
2. Find your old key (should show `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` or similar)
3. Click **"Delete"** or **"Revoke"** button
4. Confirm the deletion

#### 3. Update Local .env Files
Update `VLM/.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_NEW_KEY_HERE
```

That's it! Root `.env` is already deleted (frontend doesn't need OpenRouter key).

#### 4. Verify New Key Works
Run a quick test:
```bash
cd VLM
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✅ Key loaded:' + os.getenv('OPENROUTER_API_KEY', '')[:20] + '...')"
```

---

## ✅ Pre-Release Security Checklist

Before pushing to GitHub public:

- [ ] **API Key Rotated** - Old key revoked, new key in `.env`
- [ ] **No .env in Git** - Verified with `git ls-files | grep "\.env$"`  
  Should show NO actual .env files (only .env.example is OK)
- [ ] **.env.example Files Present** - Templates exist for contributors
  - [ ] `.env.example` (root)
  - [ ] `VLM/.env.example` (root)
- [ ] **.gitignore Configured** - Both files have `.env` in .gitignore
- [ ] **No Hardcoded Keys** - Run search:
  ```bash
  git grep -i "sk-or\|openrouter_api\|api.key\|secret" -- ':!.git' ':!node_modules'
  ```
  Should find NO matches (except comments)
- [ ] **Documentation Clear** - README explains:
  - [ ] How to set up `.env` from `.env.example`
  - [ ] Where API keys come from
  - [ ] How to get OpenRouter API key

---

## 🚀 Final Release Steps

### Step 1: Commit Security Updates
```bash
cd c:/Users/admin/trauma-ai
git add -A
git commit -m "Security: Remove .env from tracking, update .gitignore for public release"
git log --oneline -3  # Verify commit
```

### Step 2: Final Safety Check
```bash
git status  # Should show "nothing to commit, working tree clean"
git ls-files | grep "\.env$"  # Should return NOTHING
```

### Step 3: Push to GitHub
```bash
git push origin main
# or your default branch
```

---

## 📋 For New Contributors (Include in README)

After cloning the repository:

```bash
# 1. Install dependencies
npm install
cd VLM && pip install -r requirements.txt && cd ..

# 2. Set up environment variables
# Copy template and add YOUR OWN keys
cp VLM/.env.example VLM/.env
# Edit VLM/.env and add your OpenRouter API key

# 3. Run locally
npm run dev &
cd VLM && python main.py
```

---

## 🔐 Security Best Practices Going Forward

1. **Never commit .env files** - .gitignore will prevent accidents
2. **Always create .env.example** - Template for new developers
3. **Rotate keys regularly** - Every 3-6 months for production
4. **Monitor API usage** - Check OpenRouter dashboard for unusual activity
5. **Use different keys per environment** - Local dev, staging, production
6. **Add to CI/CD with secrets** - GitHub Secrets, environment variables, etc.

---

## 🆘 If You Accidentally Commit Sensitive Data

If you realize you committed the API key to GitHub before rotating:

```bash
# Option 1: Force push (if no one has pulled yet)
git reset HEAD~1  # Undo the commit
# Make changes
git push -f origin main

# Option 2: Use git-filter-branch (more thorough)
# Contact: https://docs.github.com/en/rest/reference/data-ingestion
```

**Always rotate the API key immediately if exposed.**

---

## 📞 Project Contact & Handoff

For team members taking over:
- Backend improvements in `VLM/REFACTORING_GUIDE.md`
- Frontend integration in `VLM/FRONTEND_INTEGRATION.md`  
- Quick reference in `VLM/REFACTORING_SUMMARY.md`
- All security details in this file

**Questions?** Review these guides first, then check git history: `git log --oneline VLM/`
