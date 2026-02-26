# 🚀 Quick Start Guide - Automata Studio

## Getting Started in 3 Easy Steps

### Step 1: Install Python
- Download Python 3.7+ from [python.org](https://www.python.org/)
- Make sure to check "Add Python to PATH" during installation

### Step 2: Install Dependencies
Open terminal/command prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

### Step 3: Start the Application
**Windows Users:** Simply double-click `START.bat`

**All Users:** Run in terminal:
```bash
python app.py
```

Then open your browser and go to: **http://127.0.0.1:5000**

---

## 📖 How to Use Automata Studio

### Building Your First DFA

1. **Define States** (Step 1)
   - Enter state names separated by commas
   - Example: `q0,q1,q2`

2. **Define Alphabet**
   - Enter input symbols separated by commas
   - Example: `0,1`

3. **Set Start State**
   - Enter the initial state
   - Example: `q0`

4. **Set Final States**
   - Enter accepting states separated by commas
   - Example: `q2`

5. **Generate Transition Table**
   - Click "Generate Transition Table"
   - Fill in the transitions for each (state, symbol) pair

6. **Draw Diagram**
   - Click "Draw Diagram" to visualize your DFA
   - Drag nodes to rearrange them
   - Click edges to edit transition symbols

### Testing Your DFA

1. Enter an input string (e.g., `0110`)
2. Click "▶️ Run Simulation"
3. Watch the animation as it processes each symbol
4. See if the string is ACCEPTED or REJECTED

### Advanced Operations

- **Validate DFA**: Check if your DFA is complete and valid
- **Minimize DFA**: Reduce to the smallest equivalent DFA
- **Detect Unreachable**: Find states that can't be reached

---

## 🎨 Visual Guide

### State Colors
- **Purple nodes**: Regular states
- **Green border**: Start state
- **Double red border**: Final/accepting states
- **Green highlight**: Currently active state during simulation

### Graph Controls
- **🔄 Reset Layout**: Rearrange nodes in a circle
- **🔍+ Zoom In**: Zoom into the diagram
- **🔍- Zoom Out**: Zoom out of the diagram

---

## 💡 Example: DFA for Strings Ending with "01"

Try this example to get started:

1. **States**: `q0,q1,q2`
2. **Alphabet**: `0,1`
3. **Start State**: `q0`
4. **Final States**: `q2`
5. **Transitions**:
   - q0 on 0 → q1
   - q0 on 1 → q0
   - q1 on 0 → q1
   - q1 on 1 → q2
   - q2 on 0 → q1
   - q2 on 1 → q0

**Test Strings**:
- `01` → ✅ ACCEPTED
- `101` → ✅ ACCEPTED
- `0101` → ✅ ACCEPTED
- `10` → ❌ REJECTED
- `11` → ❌ REJECTED

---

## ❓ Troubleshooting

### Server won't start
- Make sure Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5000 is available

### Can't access the website
- Make sure the server is running
- Try: http://localhost:5000 or http://127.0.0.1:5000
- Check your firewall settings

### Diagram not showing
- Make sure you clicked "Draw Diagram"
- Check browser console for errors (F12)
- Try refreshing the page

---

## 📚 Learn More

For detailed theory and advanced features, see [README.md](README.md)

**Happy Automating! 🤖**
