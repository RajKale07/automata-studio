# Automata Studio - Technical Documentation

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Core Automata Engines](#core-automata-engines)
3. [Algorithms & Implementation](#algorithms--implementation)
4. [Workflow & Data Flow](#workflow--data-flow)
5. [API Endpoints](#api-endpoints)
6. [Frontend Architecture](#frontend-architecture)

---

## Project Architecture

### Technology Stack
- **Backend**: Python 3.7+ with Flask 3.0.0
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Visualization**: Cytoscape.js (graph rendering)
- **AI Integration**: Groq API (Llama 3.1 70B model)
- **Deployment**: Gunicorn WSGI server

### File Structure & Responsibilities

```
Automata_Studio/
├── app.py                    # Flask server, API routes, request handling
├── dfa_engine.py            # DFA logic, validation, simulation, minimization
├── nfa_engine.py            # NFA logic, epsilon closure, NFA→DFA conversion
├── regex_engine.py          # Regex→NFA→DFA conversion (Thompson's construction)
├── turing_engine.py         # Turing Machine simulation
├── ai_agent.py              # Groq API integration for AI assistance
├── requirements.txt         # Python dependencies
├── Procfile                 # Deployment configuration (Gunicorn)
├── runtime.txt              # Python version specification
├── .env.example             # Environment variables template
├── .gitignore               # Git exclusions
├── templates/
│   └── index.html          # Single-page application UI
└── static/
    ├── css/
    │   ├── style.css       # Main styles, design system, responsive layout
    │   └── icons.css       # SVG icon definitions
    └── js/
        └── app.js          # Frontend logic, API calls, Cytoscape integration
```

---

## Core Automata Engines

### 1. DFA Engine (`dfa_engine.py`)

**Purpose**: Deterministic Finite Automaton implementation with validation, simulation, and minimization.

**Class: `DFA`**
```python
DFA(states, alphabet, transitions, start_state, final_states)
```

**Key Methods**:
- `validate()` - Checks DFA completeness and correctness
  - Verifies start state exists
  - Validates final states
  - Ensures all (state, symbol) pairs have exactly one transition
  
- `simulate(input_string)` - Processes input string through DFA
  - Returns: `{accepted: bool, path: list, final_state: str}`
  - Tracks state transitions for visualization
  
**Functions**:
- `detect_unreachable_states(dfa)` - BFS to find unreachable states
- `minimize_dfa(dfa)` - **Hopcroft's Algorithm** implementation
- `find_partition(state, partitions)` - Helper for minimization

**Algorithm: Hopcroft's Minimization**
1. Remove unreachable states (BFS traversal)
2. Initial partition: {final states, non-final states}
3. Iteratively refine partitions based on transition signatures
4. Build minimized DFA from final partitions

**Data Format**:
```python
transitions = {
    "q0,a": "q1",
    "q0,b": "q0",
    "q1,a": "q1",
    "q1,b": "q2"
}
```

---

### 2. NFA Engine (`nfa_engine.py`)

**Purpose**: Non-deterministic Finite Automaton with epsilon transitions and DFA conversion.

**Class: `NFA`**
```python
NFA(states, alphabet, transitions, start_state, final_states)
```

**Key Methods**:
- `epsilon_closure(states_set)` - Computes ε-closure using stack-based traversal
  - Returns all states reachable via ε-transitions
  
- `simulate(input_string)` - Simulates NFA execution
  - Maintains set of current states
  - Returns: `{accepted: bool, path: list, final_states: list}`

**Function: `nfa_to_dfa(nfa)`**
- **Subset Construction Algorithm**
- Converts NFA to equivalent DFA
- Each DFA state represents a set of NFA states

**Algorithm: Subset Construction**
1. Start with ε-closure of NFA start state
2. For each unmarked DFA state:
   - For each symbol in alphabet:
     - Compute next NFA states
     - Apply ε-closure
     - Create new DFA state if needed
3. Mark DFA states as final if they contain NFA final states

**Data Format**:
```python
transitions = {
    "q0,a": ["q0", "q1"],  # Multiple targets (non-deterministic)
    "q1,ε": ["q2"],        # Epsilon transition
    "q2,b": ["q3"]
}
```

---

### 3. Regex Engine (`regex_engine.py`)

**Purpose**: Convert regular expressions to NFA, then to DFA.

**Class: `RegexToNFA`**

**Key Methods**:
- `parse_regex(regex)` - Entry point for parsing
- `parse_union(regex)` - Handles `|` operator
- `parse_concat(regex)` - Handles concatenation
- `symbol(char)` - Creates NFA for single character
- `concat(nfas)` - Concatenates NFAs
- `union(nfas)` - Creates union of NFAs
- `star(nfa)` - Applies Kleene star
- `epsilon()` - Creates epsilon transition
- `to_nfa(regex)` - Converts parsed structure to NFA object

**Function: `regex_to_dfa(regex)`**
- Combines regex→NFA→DFA conversion

**Algorithm: Thompson's Construction**
1. Parse regex into syntax tree
2. Build NFA fragments for each operator:
   - **Symbol**: `start --a--> end`
   - **Concatenation**: Connect NFAs with ε-transitions
   - **Union**: New start/end with ε-transitions to alternatives
   - **Kleene Star**: Add ε-loops for repetition
3. Convert resulting NFA to DFA using subset construction

**Supported Operators**:
- `|` - Union (alternation)
- `*` - Kleene star (zero or more)
- `()` - Grouping
- Concatenation (implicit)

**Example**: `(a|b)*c`
1. Creates NFA for `a`, NFA for `b`
2. Unions them: `(a|b)`
3. Applies star: `(a|b)*`
4. Concatenates with `c`
5. Converts to DFA

---

### 4. Turing Machine Engine (`turing_engine.py`)

**Purpose**: Simulate Turing Machine execution with tape operations.

**Class: `TuringMachine`**
```python
TuringMachine(states, tape_alphabet, transitions, start_state, accept_state, reject_state)
```

**Key Methods**:
- `simulate(input_string, max_steps=1000)` - Step-by-step execution
  - Manages infinite tape (dynamic expansion)
  - Tracks head position and state
  - Returns: `{accepted: bool, steps: list, final_tape: str}`
  
- `validate()` - Checks TM configuration validity

**Tape Management**:
- Dynamic left/right expansion
- Blank symbol: `_`
- Head position tracking

**Data Format**:
```python
transitions = {
    "q0,0": "q1,1,R",  # (state, read) -> (next_state, write, direction)
    "q1,1": "q2,0,L"
}
```

**Simulation Steps**:
1. Initialize tape with input + blank
2. For each step (up to max_steps):
   - Read symbol at head
   - Look up transition
   - Write new symbol
   - Move head (L/R)
   - Change state
3. Accept if reach accept_state
4. Reject if reach reject_state or no transition

---

## Algorithms & Implementation

### 1. Hopcroft's DFA Minimization
**File**: `dfa_engine.py` → `minimize_dfa()`

**Complexity**: O(n log n) where n = number of states

**Steps**:
1. **Reachability Analysis** (BFS)
   - Start from initial state
   - Mark all reachable states
   - Remove unreachable states

2. **Initial Partitioning**
   - P = {F, Q-F} where F = final states

3. **Partition Refinement**
   - For each partition P:
     - Group states by transition signature
     - Signature = tuple of target partitions for each symbol
     - Split if different signatures exist
   - Repeat until no splits occur

4. **DFA Construction**
   - Each partition becomes a state
   - Representative state = min(partition)
   - Remap all transitions

**Example**:
```
Original: q0,q1,q2,q3,q4 (5 states)
After minimization: q0,q1,q2 (3 states)
```

---

### 2. Subset Construction (NFA→DFA)
**File**: `nfa_engine.py` → `nfa_to_dfa()`

**Complexity**: O(2^n) worst case, often much better in practice

**Steps**:
1. **Initialize**
   - DFA start = ε-closure(NFA start)

2. **State Exploration** (BFS)
   - For each unmarked DFA state S:
     - For each symbol a:
       - T = ε-closure(move(S, a))
       - Add transition S --a--> T
       - Mark T if new

3. **Final State Marking**
   - DFA state is final if it contains any NFA final state

**State Naming**:
- DFA states named as comma-separated NFA states
- Example: `"q0,q1,q2"` represents {q0, q1, q2}

---

### 3. Thompson's Construction (Regex→NFA)
**File**: `regex_engine.py` → `RegexToNFA`

**Complexity**: O(m) where m = regex length

**Building Blocks**:

1. **Symbol** (a):
```
start --a--> end
```

2. **Concatenation** (AB):
```
A.start --A--> A.end --ε--> B.start --B--> B.end
```

3. **Union** (A|B):
```
        --ε--> A.start --A--> A.end --ε-->
start                                        end
        --ε--> B.start --B--> B.end --ε-->
```

4. **Kleene Star** (A*):
```
        --ε--> A.start --A--> A.end --ε-->
       |                               |
start --ε--> end <--ε------------------
```

**Parsing Strategy**:
- Recursive descent parser
- Precedence: `*` > concatenation > `|`
- Handles nested parentheses

---

### 4. Epsilon Closure
**File**: `nfa_engine.py` → `epsilon_closure()`

**Complexity**: O(n + e) where n = states, e = epsilon transitions

**Algorithm** (Stack-based DFS):
```python
closure = initial_states
stack = initial_states
while stack not empty:
    state = stack.pop()
    for each ε-transition from state to next:
        if next not in closure:
            add next to closure
            push next to stack
return closure
```

---

## Workflow & Data Flow

### 1. DFA Creation Workflow

```
User Input (Frontend)
    ↓
[states, alphabet, transitions, start, finals]
    ↓
POST /api/dfa/create
    ↓
DFA.__init__() → DFA.validate()
    ↓
Return: {valid: bool, message: str, dfa_data: dict}
    ↓
Frontend: Render Cytoscape graph
```

### 2. String Simulation Workflow

```
User enters test string
    ↓
POST /api/dfa/simulate
    ↓
DFA.simulate(input_string)
    ↓
State-by-state traversal
    ↓
Return: {accepted: bool, path: [states], final_state: str}
    ↓
Frontend: Animate path on graph
```

### 3. Regex→DFA Workflow

```
User enters regex: "(a|b)*c"
    ↓
POST /api/regex/convert
    ↓
RegexToNFA.parse_regex()
    ↓
Thompson's Construction → NFA
    ↓
nfa_to_dfa() → Subset Construction
    ↓
Return: DFA object
    ↓
Frontend: Display DFA, render graph
```

### 4. Visual Editor Workflow

```
User edits graph (add/delete nodes/edges)
    ↓
Cytoscape event listeners
    ↓
Extract graph data
    ↓
Auto-sync to DFA tab
    ↓
Update: states, transitions, start, finals
    ↓
Populate input fields and transition table
```

### 5. AI Assistant Workflow

```
User clicks "Analyze Automaton"
    ↓
POST /api/ai/analyze
    ↓
ai_agent.analyze_automaton(dfa_data)
    ↓
Groq API call (Llama 3.1 70B)
    ↓
Return: Analysis, suggestions, insights
    ↓
Frontend: Display in AI Assistant panel
```

---

## API Endpoints

### DFA Endpoints

**POST `/api/dfa/create`**
- Input: `{states, alphabet, transitions, start_state, final_states}`
- Output: `{valid, message, dfa_data}`
- Creates and validates DFA

**POST `/api/dfa/simulate`**
- Input: `{dfa_data, input_string}`
- Output: `{accepted, path, final_state}`
- Simulates string on DFA

**POST `/api/dfa/minimize`**
- Input: `{dfa_data}`
- Output: `{minimized_dfa, original_states, minimized_states}`
- Applies Hopcroft's algorithm

**POST `/api/dfa/unreachable`**
- Input: `{dfa_data}`
- Output: `{unreachable_states}`
- Detects unreachable states

---

### NFA Endpoints

**POST `/api/nfa/create`**
- Input: `{states, alphabet, transitions, start_state, final_states}`
- Output: `{valid, message, nfa_data}`
- Creates and validates NFA

**POST `/api/nfa/simulate`**
- Input: `{nfa_data, input_string}`
- Output: `{accepted, path, final_states}`
- Simulates string on NFA

**POST `/api/nfa/to_dfa`**
- Input: `{nfa_data}`
- Output: `{dfa_data}`
- Converts NFA to DFA

---

### Regex Endpoints

**POST `/api/regex/convert`**
- Input: `{regex}`
- Output: `{dfa_data, nfa_data}`
- Converts regex to NFA and DFA

---

### Turing Machine Endpoints

**POST `/api/turing/create`**
- Input: `{states, tape_alphabet, transitions, start_state, accept_state, reject_state}`
- Output: `{valid, message, tm_data}`
- Creates and validates TM

**POST `/api/turing/simulate`**
- Input: `{tm_data, input_string, max_steps}`
- Output: `{accepted, steps, final_tape}`
- Simulates TM execution

---

### AI Endpoints

**POST `/api/ai/analyze`**
- Input: `{dfa_data}`
- Output: `{analysis: str}`
- Analyzes automaton structure

**POST `/api/ai/explain`**
- Input: `{dfa_data}`
- Output: `{explanation: str}`
- Explains transitions

**POST `/api/ai/optimize`**
- Input: `{dfa_data}`
- Output: `{suggestions: str}`
- Suggests optimizations

**POST `/api/ai/whatif`**
- Input: `{dfa_data, scenario}`
- Output: `{analysis: str}`
- What-if scenario analysis

**POST `/api/ai/custom`**
- Input: `{dfa_data, question}`
- Output: `{response: str}`
- Custom AI queries

---

## Frontend Architecture

### Main Components

**1. Tab System** (`app.js`)
- DFA Builder
- NFA Builder
- Regex Converter
- Turing Machine
- Visual Editor
- AI Assistant

**2. Cytoscape Integration**
- Graph rendering engine
- Node/edge styling
- Interactive editing
- Layout algorithms (breadthfirst, cose)

**3. Auto-Sync System**
- Visual Editor → DFA tab synchronization
- Real-time updates on graph changes
- Bidirectional data flow

**4. Resizable UI**
- Draggable sidebar divider
- Adjustable diagram height
- Min/max constraints

**5. API Communication**
- Fetch API for all backend calls
- JSON request/response format
- Error handling and user feedback

---

## Main Automata Working Files

### Critical Files for Automata Theory

1. **`dfa_engine.py`** - Core DFA implementation
   - Algorithm: Hopcroft's minimization
   - Validation and simulation logic
   - Unreachable state detection

2. **`nfa_engine.py`** - Core NFA implementation
   - Algorithm: Subset construction (NFA→DFA)
   - Epsilon closure computation
   - Non-deterministic simulation

3. **`regex_engine.py`** - Regex processing
   - Algorithm: Thompson's construction
   - Recursive descent parser
   - NFA fragment composition

4. **`turing_engine.py`** - Turing Machine
   - Tape management
   - Step-by-step execution
   - Halting detection

### Supporting Files

5. **`app.py`** - API layer connecting engines to frontend
6. **`ai_agent.py`** - AI-powered analysis using Groq
7. **`static/js/app.js`** - Frontend orchestration and visualization

---

## Key Design Decisions

1. **String-based transition keys**: `"q0,a"` instead of tuples for JSON compatibility
2. **Comma-separated DFA state names**: Represents NFA state sets in subset construction
3. **Dynamic tape expansion**: Turing Machine tape grows as needed
4. **Epsilon symbol**: `ε` for NFA epsilon transitions
5. **Max steps limit**: Prevents infinite loops in TM simulation (default: 1000)
6. **State naming**: Sequential `q0, q1, q2...` for generated states

---

## Performance Characteristics

| Operation | Complexity | File |
|-----------|-----------|------|
| DFA Simulation | O(n) | dfa_engine.py |
| NFA Simulation | O(n × m) | nfa_engine.py |
| DFA Minimization | O(n log n) | dfa_engine.py |
| NFA→DFA | O(2^n) worst | nfa_engine.py |
| Regex→NFA | O(m) | regex_engine.py |
| Epsilon Closure | O(n + e) | nfa_engine.py |
| TM Simulation | O(steps) | turing_engine.py |

Where:
- n = number of states
- m = input string length
- e = number of epsilon transitions
- steps = execution steps

---

## Testing & Validation

### DFA Validation Checks
- Start state exists in states list
- All final states exist in states list
- Complete transition function (all state-symbol pairs defined)
- All transition targets are valid states

### NFA Validation
- Similar to DFA but allows multiple targets
- Epsilon transitions validated separately

### Turing Machine Validation
- Start, accept, reject states exist
- Tape alphabet includes blank symbol
- Transition function format: `"state,symbol": "next,write,dir"`

---

## Deployment Configuration

**Production Server**: Gunicorn
```python
# Procfile
web: gunicorn app:app
```

**Environment Variables**:
- `GROQ_API_KEY` - Required for AI features
- `PORT` - Auto-assigned by hosting platform

**Supported Platforms**:
- Render.com (recommended)
- Railway
- Heroku
- PythonAnywhere

---

## Future Enhancement Possibilities

1. **PDA (Pushdown Automaton)** support
2. **Context-Free Grammar** parser
3. **Multi-tape Turing Machines**
4. **Automaton equivalence checking**
5. **Export to LaTeX/TikZ**
6. **Step-by-step animation controls**
7. **Batch string testing**
8. **Automaton library/templates**

---

## References & Algorithms

- **Hopcroft's Algorithm**: DFA minimization (1971)
- **Thompson's Construction**: Regex to NFA (1968)
- **Subset Construction**: NFA to DFA (Rabin-Scott, 1959)
- **Breadth-First Search**: Reachability analysis
- **Depth-First Search**: Epsilon closure computation

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Project**: Automata Studio  
**Author**: Educational Project
