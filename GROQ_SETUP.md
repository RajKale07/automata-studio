# 🤖 Groq AI Setup Guide

## What is Groq?

Groq provides ultra-fast AI inference with powerful language models. We're using it to power the AI Assistant in Automata Studio.

## Getting Your API Key

### Step 1: Create Groq Account
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Generate API Key
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Automata Studio")
4. Copy the API key (you won't see it again!)

## Setting Up the API Key

### Option 1: Environment Variable (Recommended)

**Windows:**
```cmd
# Temporary (current session only)
set GROQ_API_KEY=your_api_key_here

# Permanent
setx GROQ_API_KEY "your_api_key_here"
```

**macOS/Linux:**
```bash
# Temporary (current session only)
export GROQ_API_KEY=your_api_key_here

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export GROQ_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

### Option 2: .env File

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your key:
   ```
   GROQ_API_KEY=your_actual_api_key_here
   ```

3. Install python-dotenv:
   ```bash
   pip install python-dotenv
   ```

4. Update `app.py` to load .env:
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

## Installing Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `groq` - Groq Python SDK
- `flask` - Web framework
- `flask-cors` - CORS support

## Testing the Setup

1. Start the server:
   ```bash
   python app.py
   ```

2. Open browser to `http://127.0.0.1:5000`

3. Build a simple DFA (or use the example)

4. Go to **AI Assistant** tab

5. Click **Analyze Current Automaton**

6. If you see AI-generated analysis, it's working! 🎉

## Troubleshooting

### Error: "GROQ_API_KEY not found"

**Solution:**
- Make sure you set the environment variable
- Restart your terminal/command prompt
- Verify with: `echo %GROQ_API_KEY%` (Windows) or `echo $GROQ_API_KEY` (Mac/Linux)

### Error: "AI agent not initialized"

**Solution:**
- Check that your API key is valid
- Make sure you installed the groq package: `pip install groq`
- Restart the Flask server

### Error: "Rate limit exceeded"

**Solution:**
- Groq free tier has rate limits
- Wait a few seconds between requests
- Consider upgrading your Groq plan

### AI responses are slow

**Note:**
- First request may be slower (cold start)
- Subsequent requests should be fast (Groq is optimized for speed)
- Check your internet connection

## Features Powered by Groq AI

### 1. Analyze Automaton
- Comprehensive analysis of your DFA/NFA
- Completeness checking
- Language description
- Optimization suggestions

### 2. Explain Transitions
- Natural language explanation of transition function
- Easy-to-understand descriptions
- Educational insights

### 3. Suggest Optimizations
- Smart recommendations
- Minimization suggestions
- Best practices

### 4. What-If Analysis
- Predict impact of changes
- Understand consequences
- Make informed decisions

### 5. Custom Questions
- Ask anything about your automaton
- Get intelligent answers
- Learn automata theory

## Example Questions to Ask

### Basic Questions
- "What strings does this automaton accept?"
- "Is this DFA minimal?"
- "What language does this recognize?"

### Advanced Questions
- "How can I modify this to accept strings with even number of 0s?"
- "What's the difference between this and a minimal DFA?"
- "Can you suggest test cases for this automaton?"

### Learning Questions
- "Explain how this automaton works"
- "What is the time complexity of this DFA?"
- "How does this relate to regular expressions?"

## API Usage Limits

### Free Tier (Groq)
- Generous free tier
- Fast inference
- Multiple models available

### Rate Limits
- Check [Groq documentation](https://console.groq.com/docs/rate-limits) for current limits
- Implement retry logic if needed

## Privacy & Security

### Your Data
- Automaton data is sent to Groq for analysis
- Groq processes requests and returns responses
- No data is permanently stored by this application

### API Key Security
- Never commit `.env` file to git
- Keep your API key secret
- Regenerate if compromised

### Best Practices
- Use environment variables
- Don't share your API key
- Monitor usage in Groq console

## Advanced Configuration

### Changing the Model

Edit `ai_agent.py`:
```python
self.model = "llama-3.1-70b-versatile"  # Default
# or
self.model = "mixtral-8x7b-32768"       # Alternative
```

### Adjusting Temperature

Edit `ai_agent.py`:
```python
temperature=0.7  # Default (balanced)
# Lower (0.1-0.3) = More focused, deterministic
# Higher (0.8-1.0) = More creative, varied
```

### Increasing Max Tokens

Edit `ai_agent.py`:
```python
max_tokens=1000  # Default
# Increase for longer responses
# Decrease for shorter, faster responses
```

## Cost Considerations

### Groq Pricing
- Check [Groq pricing](https://groq.com/pricing) for current rates
- Free tier is generous for learning/development
- Pay-as-you-go for production use

### Optimizing Costs
- Cache common queries
- Limit max_tokens
- Use appropriate temperature
- Batch similar requests

## Support

### Groq Support
- Documentation: [https://console.groq.com/docs](https://console.groq.com/docs)
- Discord: [Groq Community](https://groq.com/discord)
- Email: support@groq.com

### Automata Studio Issues
- Check TROUBLESHOOTING.md
- Review error messages
- Test with simple examples first

## Next Steps

1. ✅ Get Groq API key
2. ✅ Set environment variable
3. ✅ Install dependencies
4. ✅ Test AI features
5. 🎓 Explore and learn!

---

**Happy Learning with AI! 🤖✨**
