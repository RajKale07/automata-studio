# Automata Studio

Professional web-based platform for building, visualizing, and simulating finite automata with AI-powered assistance.

## Features

- **DFA Builder** - Create deterministic finite automata
- **NFA Builder** - Build non-deterministic automata with epsilon transitions
- **Regular Expression Converter** - Convert regex to DFA automatically
- **Turing Machine Simulator** - Define and simulate Turing machines
- **Visual Editor** - Interactive diagram editing with auto-sync
- **AI Assistant** - Groq-powered intelligent analysis and insights
- **Professional UI** - Modern, clean interface with SVG icons

## Quick Start

### Prerequisites
- Python 3.7+
- Groq API key (get from https://console.groq.com/keys)

### Installation

1. **Set up environment**
```bash
# Set Groq API key
setx GROQ_API_KEY "your_key_here"

# Install dependencies
pip install -r requirements.txt
```

2. **Run application**
```bash
# Windows
START.bat

# Or manually
python app.py
```

3. **Open browser**
```
http://127.0.0.1:5000
```

## Usage

### Building Automata
1. Choose tab (DFA/NFA/Regex/Turing Machine)
2. Define states, alphabet, transitions
3. Generate and draw diagram
4. Test with input strings

### Visual Editor
1. Switch to Visual Editor tab
2. Click "Load Current Automaton"
3. Edit interactively (add/delete states, transitions)
4. Changes sync automatically to DFA tab
5. Export diagram as PNG image

### AI Assistant
1. Build your automaton
2. Switch to AI Assistant tab
3. Click analysis buttons or ask custom questions
4. Get intelligent insights and recommendations

## Project Structure

```
Automata_Studio/
├── app.py                 # Flask backend
├── ai_agent.py           # Groq AI integration
├── dfa_engine.py         # DFA logic
├── nfa_engine.py         # NFA logic
├── regex_engine.py       # Regex converter
├── turing_engine.py      # Turing machine
├── requirements.txt      # Dependencies
├── templates/
│   └── index.html       # Main UI
└── static/
    ├── css/
    │   ├── style.css    # Main styles
    │   └── icons.css    # Icon styles
    └── js/
        └── app.js       # Frontend logic
```

## Documentation

- **QUICKSTART.md** - Beginner tutorial
- **FEATURES.md** - Complete feature list
- **GROQ_SETUP.md** - AI setup guide

## Technology Stack

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Visualization**: Cytoscape.js
- **AI**: Groq API (Llama 3.1)
- **Fonts**: Inter

## License

Open-source for educational purposes.

## Author

Built for learning and teaching automata theory.
