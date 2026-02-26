# 🎯 Complete Features Guide - Automata Studio

## 📑 Table of Contents
1. [DFA (Deterministic Finite Automaton)](#dfa)
2. [NFA (Nondeterministic Finite Automaton)](#nfa)
3. [Regular Expressions](#regex)
4. [Turing Machine](#turing)
5. [Diagram Editing](#editing)

---

## 🔷 DFA (Deterministic Finite Automaton)

### What is a DFA?
A DFA is a finite state machine where:
- Each state has exactly ONE transition for each input symbol
- No epsilon (ε) transitions
- Deterministic behavior - predictable next state

### How to Build
1. **States**: `q0,q1,q2`
2. **Alphabet**: `0,1`
3. **Start State**: `q0`
4. **Final States**: `q2`
5. **Transitions**: One next state per (state, symbol) pair

### Operations
- ✅ **Validate**: Check completeness and determinism
- 🔄 **Minimize**: Reduce to minimum equivalent DFA (Hopcroft's Algorithm)
- 🔍 **Detect Unreachable**: Find unreachable states
- ▶️ **Simulate**: Test with input strings

### Example: Strings ending with "01"
```
States: q0,q1,q2
Alphabet: 0,1
Start: q0
Final: q2

Transitions:
q0 + 0 → q1
q0 + 1 → q0
q1 + 0 → q1
q1 + 1 → q2
q2 + 0 → q1
q2 + 1 → q0
```

---

## 🔶 NFA (Nondeterministic Finite Automaton)

### What is an NFA?
An NFA is a finite state machine where:
- States can have MULTIPLE transitions for the same symbol
- Epsilon (ε) transitions allowed
- Nondeterministic - multiple possible paths

### How to Build
1. **States**: `q0,q1,q2`
2. **Alphabet**: `0,1,ε` (include epsilon)
3. **Start State**: `q0`
4. **Final States**: `q2`
5. **Transitions**: Multiple next states allowed (comma-separated)

### Key Features
- **Epsilon Transitions**: Use `ε` symbol for transitions without input
- **Multiple Targets**: Enter `q1,q2` for multiple next states
- **Epsilon Closure**: Automatically computed during simulation

### Operations
- 🔄 **Convert to DFA**: Automatic conversion using subset construction
- ▶️ **Simulate**: Test with input strings (explores all paths)

### Example: Strings containing "01"
```
States: q0,q1,q2
Alphabet: 0,1,ε
Start: q0
Final: q2

Transitions:
q0 + 0 → q0,q1  (nondeterministic!)
q0 + 1 → q0
q1 + 1 → q2
q2 + 0 → q2
q2 + 1 → q2
```

### NFA to DFA Conversion
The system uses **subset construction**:
1. Start with epsilon closure of start state
2. For each subset and symbol, compute next subset
3. Mark subsets containing final states as final
4. Result: Equivalent DFA (may have more states)

---

## 📝 Regular Expressions

### What are Regular Expressions?
Compact notation for describing regular languages using operators.

### Supported Operators
- `*` - Kleene star (zero or more repetitions)
- `|` - Union (OR operation)
- `()` - Grouping
- Concatenation (implicit)

### How to Use
1. Enter regex pattern: `(0|1)*01`
2. Click **Convert to DFA**
3. System automatically:
   - Converts regex → NFA (Thompson's construction)
   - Converts NFA → DFA (subset construction)
   - Displays resulting DFA

### Examples

#### Binary strings
```
Regex: (0|1)*
Meaning: Any string of 0s and 1s
```

#### Strings ending with "01"
```
Regex: (0|1)*01
Meaning: Any binary string ending with 01
```

#### 0s followed by 1s
```
Regex: 0*1*
Meaning: Zero or more 0s, then zero or more 1s
```

#### Contains at least one 0
```
Regex: (0|1)*0(0|1)*
Meaning: Any string with at least one 0
```

### Conversion Process
```
Regular Expression
    ↓ (Thompson's Construction)
NFA with ε-transitions
    ↓ (Subset Construction)
DFA (minimal form)
```

---

## 🎰 Turing Machine

### What is a Turing Machine?
A theoretical model of computation with:
- Infinite tape (memory)
- Read/write head
- State-based control
- Can move left or right

### Components
- **States**: Including accept and reject states
- **Tape Alphabet**: Symbols on tape (include `_` for blank)
- **Transitions**: (state, read) → (next_state, write, direction)

### How to Build
1. **States**: `q0,q1,qaccept,qreject`
2. **Tape Alphabet**: `0,1,_`
3. **Start State**: `q0`
4. **Accept State**: `qaccept`
5. **Reject State**: `qreject`
6. **Transitions**: For each (state, symbol):
   - Write symbol
   - Move direction (L or R)
   - Next state

### Transition Format
```
Current State: q0
Read Symbol: 0
Write Symbol: 1
Move: R (right) or L (left)
Next State: q1
```

### Operations
- ▶️ **Simulate**: Run on input tape
- 📊 **Visualize**: See state diagram
- 📝 **View Steps**: See each computation step

### Example: Binary Increment
Adds 1 to a binary number
```
States: q0,q1,qaccept,qreject
Tape Alphabet: 0,1,_

Transitions:
q0 + _ → qaccept, _, R  (empty tape)
q0 + 0 → q0, 0, R       (skip 0s)
q0 + 1 → q0, 1, R       (skip 1s)
q1 + 0 → qaccept, 1, L  (found 0, change to 1)
q1 + 1 → q1, 0, L       (carry over)
q1 + _ → qaccept, 1, L  (all 1s, add 1 at start)
```

### Simulation Output
- ✅ **Accepted**: Reached accept state
- ❌ **Rejected**: Reached reject state or no transition
- 📊 **Steps**: Number of computation steps
- 📝 **Final Tape**: Tape contents after execution

---

## ✏️ Diagram Editing

### Interactive Editing Features

#### 1. Move Nodes
- **Action**: Click and drag nodes
- **Purpose**: Rearrange diagram layout
- **Tip**: Organize for better visualization

#### 2. Edit Transitions
- **Action**: Click on edges (arrows)
- **Purpose**: Change transition labels
- **Example**: Change "0" to "1" or "0,1"

#### 3. Rename States
- **Action**: Double-click on nodes
- **Purpose**: Change state names
- **Updates**: Automatically updates all references

#### 4. Toggle Final States
- **Action**: Right-click on nodes
- **Purpose**: Make state final or non-final
- **Visual**: Adds/removes double red border

#### 5. Zoom Controls
- **Zoom In**: Click 🔍+ button
- **Zoom Out**: Click 🔍- button
- **Reset Layout**: Click 🔄 button (circle layout)

### Visual Indicators
- 🟢 **Green Border**: Start state
- 🔴 **Double Red Border**: Final/accepting state
- 🟣 **Purple**: Regular state
- 💚 **Green Highlight**: Active state during simulation

### Editing Workflow
1. Build automaton with forms
2. Generate and draw diagram
3. Edit visually:
   - Drag to organize
   - Click edges to fix transitions
   - Double-click nodes to rename
   - Right-click to toggle final
4. Changes sync back to transition table

---

## 🎓 Learning Path

### Beginner
1. Start with **DFA** - simplest model
2. Build example: strings ending with "01"
3. Practice simulation
4. Try minimization

### Intermediate
1. Move to **NFA** - understand nondeterminism
2. Build NFA with epsilon transitions
3. Convert NFA to DFA
4. Compare state counts

### Advanced
1. Use **Regular Expressions** - compact notation
2. See how regex converts to automata
3. Build **Turing Machines** - universal computation
4. Understand computational power differences

---

## 💡 Tips & Tricks

### DFA Tips
- Always ensure completeness (transition for every symbol)
- Use minimize to find simplest equivalent DFA
- Check for unreachable states before minimizing

### NFA Tips
- Use epsilon transitions for convenience
- Multiple targets make construction easier
- Convert to DFA for deterministic simulation

### Regex Tips
- Use parentheses for grouping
- `*` applies to immediately preceding element
- Test with simple strings first

### Turing Machine Tips
- Use `_` for blank symbol
- Plan tape usage carefully
- Limit steps to avoid infinite loops
- Accept/reject states are terminal

### Diagram Editing Tips
- Organize nodes before adding many transitions
- Use zoom for complex diagrams
- Right-click is fastest way to toggle final states
- Double-click to quickly fix typos in state names

---

## 🔧 Keyboard Shortcuts

- **Tab**: Switch between input fields
- **Enter**: Submit forms
- **Esc**: Cancel edit dialogs
- **Ctrl + Scroll**: Zoom diagram (in canvas)

---

## 📚 Theory References

### Chomsky Hierarchy
1. **Type 3** (Regular): DFA, NFA, Regex
2. **Type 2** (Context-Free): Pushdown Automata
3. **Type 1** (Context-Sensitive): Linear Bounded Automata
4. **Type 0** (Recursively Enumerable): Turing Machines

### Equivalences
- DFA ≡ NFA ≡ Regular Expression (same power)
- Turing Machine = Universal computation model
- DFA ⊂ Turing Machine (TM more powerful)

---

**Happy Learning! 🚀**
