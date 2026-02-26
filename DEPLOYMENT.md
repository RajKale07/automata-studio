# Deployment Guide - Automata Studio

## Quick Deploy Options

### Option 1: Render (Recommended - Free)

**Steps:**
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Sign up/Login
4. Click "New +" → "Web Service"
5. Connect your GitHub repo
6. Configure:
   - **Name**: automata-studio
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment Variables**: Add `GROQ_API_KEY`
7. Click "Create Web Service"

**Time**: 5 minutes | **Cost**: Free

---

### Option 2: Railway (Easy)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Add environment variable: `GROQ_API_KEY`
6. Deploy automatically

**Time**: 3 minutes | **Cost**: Free tier available

---

### Option 3: Heroku (Popular)

**Steps:**
1. Install Heroku CLI
2. Run commands:
```bash
heroku login
heroku create automata-studio
heroku config:set GROQ_API_KEY=your_key_here
git push heroku main
```

**Time**: 10 minutes | **Cost**: Free tier available

---

### Option 4: PythonAnywhere (Simple)

**Steps:**
1. Go to [pythonanywhere.com](https://pythonanywhere.com)
2. Sign up for free account
3. Upload your code
4. Configure WSGI file
5. Set environment variables
6. Reload web app

**Time**: 15 minutes | **Cost**: Free

---

## Detailed Instructions

### Render Deployment (Recommended)

#### Step 1: Prepare Your Code

Create `Procfile`:
```
web: gunicorn app:app
```

Update `requirements.txt`:
```
Flask==3.0.0
flask-cors==4.0.0
groq==0.4.2
gunicorn==21.2.0
```

#### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/automata-studio.git
git push -u origin main
```

#### Step 3: Deploy on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub
4. Select repository
5. Settings:
   - **Name**: automata-studio
   - **Region**: Choose closest
   - **Branch**: main
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Add Environment Variable:
   - Key: `GROQ_API_KEY`
   - Value: your_actual_key
7. Click "Create Web Service"

#### Step 4: Access Your App
- URL: `https://automata-studio.onrender.com`
- Wait 2-3 minutes for first deploy

---

### Railway Deployment

#### Step 1: Prepare Files

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn app:app",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### Step 2: Deploy
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repo
4. Add variable: `GROQ_API_KEY`
5. Deploy

---

### Heroku Deployment

#### Step 1: Install Heroku CLI
```bash
# Windows
choco install heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Create Files

`Procfile`:
```
web: gunicorn app:app
```

`runtime.txt`:
```
python-3.11.0
```

#### Step 3: Deploy
```bash
heroku login
heroku create automata-studio
heroku config:set GROQ_API_KEY=your_key_here
git push heroku main
heroku open
```

---

### PythonAnywhere Deployment

#### Step 1: Upload Code
1. Sign up at https://pythonanywhere.com
2. Go to "Files" tab
3. Upload your project folder

#### Step 2: Install Dependencies
Open Bash console:
```bash
cd automata-studio
pip install --user -r requirements.txt
```

#### Step 3: Configure Web App
1. Go to "Web" tab
2. "Add a new web app"
3. Choose "Flask"
4. Configure WSGI file:
```python
import sys
path = '/home/yourusername/automata-studio'
if path not in sys.path:
    sys.path.append(path)

from app import app as application
```

#### Step 4: Set Environment Variables
In WSGI file, add:
```python
import os
os.environ['GROQ_API_KEY'] = 'your_key_here'
```

#### Step 5: Reload
Click "Reload" button

---

## Production Configuration

### Update app.py for Production

```python
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dfa_engine import DFA, minimize_dfa, detect_unreachable_states
from nfa_engine import NFA, nfa_to_dfa
from regex_engine import regex_to_dfa
from turing_engine import TuringMachine
from ai_agent import AutomataAI

app = Flask(__name__)
CORS(app)

# Production settings
app.config['DEBUG'] = False
app.config['TESTING'] = False

# Initialize AI Agent
try:
    ai_agent = AutomataAI()
except ValueError:
    ai_agent = None
    print("Warning: GROQ_API_KEY not set. AI features will be disabled.")

# ... rest of your routes ...

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

---

## Environment Variables

Set these on your hosting platform:

```
GROQ_API_KEY=your_actual_groq_api_key
PORT=5000
FLASK_ENV=production
```

---

## Custom Domain (Optional)

### Render
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

### Heroku
```bash
heroku domains:add www.yourdomain.com
```

---

## Monitoring & Logs

### Render
- Dashboard → Logs tab
- Real-time log streaming

### Railway
- Project → Deployments → View Logs

### Heroku
```bash
heroku logs --tail
```

---

## Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Render | 750 hours/month | $7/month |
| Railway | $5 credit/month | Pay as you go |
| Heroku | 550 hours/month | $7/month |
| PythonAnywhere | 1 web app | $5/month |

---

## Troubleshooting

### App won't start
- Check logs for errors
- Verify `requirements.txt` is complete
- Ensure `GROQ_API_KEY` is set

### AI features not working
- Verify API key is correct
- Check Groq API quota
- Review error logs

### Slow performance
- Upgrade to paid tier
- Enable caching
- Optimize database queries

---

## Quick Start Commands

### Render
```bash
# Add to requirements.txt
echo "gunicorn==21.2.0" >> requirements.txt

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Push to GitHub
git add .
git commit -m "Deploy to Render"
git push
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Heroku
```bash
# Quick deploy
heroku create
heroku config:set GROQ_API_KEY=your_key
git push heroku main
```

---

## Recommended: Render

**Why Render?**
- ✅ Free tier (750 hours/month)
- ✅ Auto-deploy from GitHub
- ✅ Easy environment variables
- ✅ Free SSL certificate
- ✅ Good performance
- ✅ Simple interface

**Deploy in 5 minutes!**

---

## Support

- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Heroku: https://devcenter.heroku.com
- PythonAnywhere: https://help.pythonanywhere.com

---

**Choose Render for easiest deployment!** 🚀
