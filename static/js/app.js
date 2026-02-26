let cy;
let animationInterval;
let currentTab = 'dfa';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDiagram();
    generateTable();
    switchTab('dfa');
});

// Switch between tabs
function switchTab(tabName) {
    currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Clear diagram when switching tabs
    if (cy) {
        cy.elements().remove();
    }
}

// Initialize Cytoscape diagram
function initializeDiagram() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#667eea',
                    'label': 'data(label)',
                    'color': '#ffffff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '20px',
                    'font-weight': 'bold',
                    'width': '70px',
                    'height': '70px',
                    'border-width': '4px',
                    'border-color': '#764ba2'
                }
            },
            {
                selector: 'node.start',
                style: {
                    'border-color': '#48bb78',
                    'border-width': '6px'
                }
            },
            {
                selector: 'node.final',
                style: {
                    'border-style': 'double',
                    'border-width': '8px',
                    'border-color': '#fc8181'
                }
            },
            {
                selector: 'node.active',
                style: {
                    'background-color': '#48bb78',
                    'border-color': '#48bb78'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 4,
                    'line-color': '#667eea',
                    'target-arrow-color': '#667eea',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'color': '#2d3748',
                    'text-background-color': '#ffffff',
                    'text-background-opacity': 1,
                    'text-background-padding': '6px',
                    'font-size': '16px',
                    'font-weight': 'bold',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px',
                    'loop-direction': '0deg',
                    'loop-sweep': '60deg',
                    'control-point-step-size': 40
                }
            },
            {
                selector: 'edge.active',
                style: {
                    'line-color': '#48bb78',
                    'target-arrow-color': '#48bb78',
                    'width': 6
                }
            }
        ],
        layout: { name: 'circle' }
    });

    // Enable editing only in Visual Editor tab
    cy.on('tap', 'edge', function(evt) {
        if (currentTab === 'editor') {
            const edge = evt.target;
            const newLabel = prompt('Edit transition symbol:', edge.data('label'));
            if (newLabel !== null && newLabel.trim()) {
                edge.data('label', newLabel);
                autoSyncFromDiagram();
            }
        }
    });

    cy.on('dbltap', 'node', function(evt) {
        if (currentTab === 'editor') {
            const node = evt.target;
            const newLabel = prompt('Edit state name:', node.data('label'));
            if (newLabel !== null && newLabel.trim()) {
                const oldId = node.id();
                node.data('label', newLabel);
                node.data('id', newLabel);
                autoSyncFromDiagram();
            }
        }
    });

    cy.on('cxttap', 'node', function(evt) {
        if (currentTab === 'editor') {
            const node = evt.target;
            if (node.hasClass('final')) {
                node.removeClass('final');
            } else {
                node.addClass('final');
            }
            autoSyncFromDiagram();
        }
    });

    // Drag event for auto-sync
    cy.on('dragfree', 'node', function(evt) {
        if (currentTab === 'editor') {
            autoSyncFromDiagram();
        }
    });
}

// Generate transition table
function generateTable() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (states.length === 0 || alphabet.length === 0) {
        document.getElementById('transition-table').innerHTML = '<p style="color: #e53e3e;">Please enter states and alphabet first</p>';
        return;
    }

    let html = '<table><thead><tr><th>State</th>';
    alphabet.forEach(symbol => {
        html += `<th>On "${symbol}"</th>`;
    });
    html += '</tr></thead><tbody>';

    states.forEach(state => {
        html += `<tr><td><strong>${state}</strong></td>`;
        alphabet.forEach(symbol => {
            html += `<td><input type="text" id="t-${state}-${symbol}" placeholder="→"></td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('transition-table').innerHTML = html;
}

// Draw diagram from table
function drawDiagram() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const startState = document.getElementById('start-state').value.trim();
    const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();

    cy.elements().remove();

    // Add nodes
    states.forEach(state => {
        const classes = [];
        if (state === startState) classes.push('start');
        if (finalStates.includes(state)) classes.push('final');
        
        cy.add({
            group: 'nodes',
            data: { id: state, label: state },
            classes: classes.join(' ')
        });
    });

    // Add edges
    const edgeMap = {};
    Object.keys(transitions).forEach(key => {
        const [state, symbol] = key.split(',');
        const target = transitions[key];
        const edgeKey = `${state}-${target}`;
        
        if (edgeMap[edgeKey]) {
            edgeMap[edgeKey] += `, ${symbol}`;
        } else {
            edgeMap[edgeKey] = symbol;
        }
    });

    Object.keys(edgeMap).forEach(edgeKey => {
        const [source, target] = edgeKey.split('-');
        cy.add({
            group: 'edges',
            data: { id: edgeKey, source, target, label: edgeMap[edgeKey] }
        });
    });

    cy.layout({ name: 'circle', animate: true, animationDuration: 500 }).run();
    showMessage('Diagram drawn! Drag nodes to rearrange.', 'info');
}

// Get transitions from table
function getTransitions() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = {};

    states.forEach(state => {
        alphabet.forEach(symbol => {
            const input = document.getElementById(`t-${state}-${symbol}`);
            if (input && input.value.trim()) {
                transitions[`${state},${symbol}`] = input.value.trim();
            }
        });
    });

    return transitions;
}

// Update table from diagram edits
function updateTableFromDiagram() {
    const edges = cy.edges();
    edges.forEach(edge => {
        const source = edge.source().id();
        const target = edge.target().id();
        const labels = edge.data('label').split(',').map(s => s.trim());
        
        labels.forEach(label => {
            const input = document.getElementById(`t-${source}-${label}`);
            if (input) input.value = target;
        });
    });
}

// Simulate DFA
async function simulate() {
    const inputString = document.getElementById('input-string').value;
    if (!inputString) {
        showMessage('Please enter an input string', 'reject');
        return;
    }

    const data = {
        states: document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s),
        alphabet: document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getTransitions(),
        start_state: document.getElementById('start-state').value.trim(),
        final_states: document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s),
        input_string: inputString
    };

    try {
        const response = await fetch('/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
            return;
        }

        animateSimulation(result, inputString);
    } catch (error) {
        showMessage('Connection error: ' + error, 'reject');
    }
}

// Animate simulation
function animateSimulation(result, inputString) {
    let step = 0;
    const path = result.path;
    
    cy.nodes().removeClass('active');
    cy.edges().removeClass('active');
    
    if (animationInterval) clearInterval(animationInterval);
    
    animationInterval = setInterval(() => {
        cy.nodes().removeClass('active');
        cy.edges().removeClass('active');
        
        if (step < path.length) {
            cy.getElementById(path[step]).addClass('active');
            
            if (step > 0) {
                const edgeId = `${path[step-1]}-${path[step]}`;
                cy.getElementById(edgeId).addClass('active');
            }
            
            step++;
        } else {
            clearInterval(animationInterval);
            displayResult(result);
        }
    }, 1000);
}

// Display result
function displayResult(result) {
    const resultDiv = document.getElementById('result');
    
    if (result.accepted) {
        resultDiv.className = 'result-box result-accept';
        resultDiv.innerHTML = `
            <strong>✅ ACCEPTED</strong><br>
            Final State: ${result.final_state}<br>
            Path: ${result.path.join(' → ')}
        `;
    } else {
        resultDiv.className = 'result-box result-reject';
        resultDiv.innerHTML = `
            <strong>❌ REJECTED</strong><br>
            Final State: ${result.final_state}<br>
            Path: ${result.path.join(' → ')}
        `;
    }
}

// Reset simulation
function resetSim() {
    if (animationInterval) clearInterval(animationInterval);
    cy.nodes().removeClass('active');
    cy.edges().removeClass('active');
    document.getElementById('result').innerHTML = '';
    document.getElementById('input-string').value = '';
}

// Show message
function showMessage(msg, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = `result-box result-${type}`;
    resultDiv.innerHTML = msg;
}

// Validate DFA
async function validateDFA() {
    const data = {
        states: document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s),
        alphabet: document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getTransitions(),
        start_state: document.getElementById('start-state').value.trim(),
        final_states: document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
        const response = await fetch('/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        showMessage(result.valid ? '✅ ' + result.message : '❌ ' + result.message, result.valid ? 'accept' : 'reject');
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

// Minimize DFA
async function minimizeDFA() {
    const data = {
        states: document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s),
        alphabet: document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getTransitions(),
        start_state: document.getElementById('start-state').value.trim(),
        final_states: document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
        const response = await fetch('/minimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
            return;
        }

        document.getElementById('states').value = result.states.join(',');
        document.getElementById('start-state').value = result.start_state;
        document.getElementById('final-states').value = result.final_states.join(',');
        
        generateTable();
        
        setTimeout(() => {
            Object.keys(result.transitions).forEach(key => {
                const [state, symbol] = key.split(',');
                const input = document.getElementById(`t-${state}-${symbol}`);
                if (input) input.value = result.transitions[key];
            });
            drawDiagram();
            showMessage(`✅ Minimized to ${result.states.length} states`, 'accept');
        }, 100);
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

// Detect unreachable states
async function detectUnreachable() {
    const data = {
        states: document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s),
        alphabet: document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getTransitions(),
        start_state: document.getElementById('start-state').value.trim(),
        final_states: document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
        const response = await fetch('/unreachable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
            return;
        }

        if (result.unreachable.length === 0) {
            showMessage('✅ No unreachable states found', 'accept');
        } else {
            showMessage(`⚠️ Unreachable states: ${result.unreachable.join(', ')}`, 'info');
        }
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

// Layout controls
function resetLayout() {
    cy.layout({ name: 'circle', animate: true, animationDuration: 500 }).run();
}

function zoomIn() {
    cy.zoom(cy.zoom() * 1.2);
}

function zoomOut() {
    cy.zoom(cy.zoom() * 0.8);
}

// Update states after editing node
function updateStatesAfterEdit(oldId, newId) {
    const statesInput = document.getElementById('states');
    if (statesInput) {
        const states = statesInput.value.split(',').map(s => s.trim());
        const index = states.indexOf(oldId);
        if (index !== -1) {
            states[index] = newId;
            statesInput.value = states.join(',');
        }
    }
}

// Update final states from diagram
function updateFinalStatesFromDiagram() {
    const finalStates = [];
    cy.nodes('.final').forEach(node => {
        finalStates.push(node.id());
    });
    const finalInput = document.getElementById('final-states');
    if (finalInput) {
        finalInput.value = finalStates.join(',');
    }
}

// ===== NFA FUNCTIONS =====
function generateNFATable() {
    const states = document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfa-alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (states.length === 0 || alphabet.length === 0) {
        document.getElementById('nfa-transition-table').innerHTML = '<p style="color: #e53e3e;">Please enter states and alphabet first</p>';
        return;
    }

    let html = '<table><thead><tr><th>State</th>';
    alphabet.forEach(symbol => {
        html += `<th>On "${symbol}"</th>`;
    });
    html += '</tr></thead><tbody>';

    states.forEach(state => {
        html += `<tr><td><strong>${state}</strong></td>`;
        alphabet.forEach(symbol => {
            html += `<td><input type="text" id="nfa-t-${state}-${symbol}" placeholder="q1,q2"></td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('nfa-transition-table').innerHTML = html;
}

function getNFATransitions() {
    const states = document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('nfa-alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = {};

    states.forEach(state => {
        alphabet.forEach(symbol => {
            const input = document.getElementById(`nfa-t-${state}-${symbol}`);
            if (input && input.value.trim()) {
                transitions[`${state},${symbol}`] = input.value.split(',').map(s => s.trim()).filter(s => s);
            }
        });
    });

    return transitions;
}

function drawNFADiagram() {
    const states = document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s);
    const startState = document.getElementById('nfa-start').value.trim();
    const finalStates = document.getElementById('nfa-final').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getNFATransitions();

    cy.elements().remove();

    states.forEach(state => {
        const classes = [];
        if (state === startState) classes.push('start');
        if (finalStates.includes(state)) classes.push('final');
        
        cy.add({
            group: 'nodes',
            data: { id: state, label: state },
            classes: classes.join(' ')
        });
    });

    const edgeMap = {};
    Object.keys(transitions).forEach(key => {
        const [state, symbol] = key.split(',');
        const targets = transitions[key];
        targets.forEach(target => {
            const edgeKey = `${state}-${target}`;
            if (edgeMap[edgeKey]) {
                edgeMap[edgeKey] += `, ${symbol}`;
            } else {
                edgeMap[edgeKey] = symbol;
            }
        });
    });

    Object.keys(edgeMap).forEach(edgeKey => {
        const [source, target] = edgeKey.split('-');
        cy.add({
            group: 'edges',
            data: { id: edgeKey, source, target, label: edgeMap[edgeKey] }
        });
    });

    cy.layout({ name: 'circle', animate: true, animationDuration: 500 }).run();
    showMessage('NFA diagram drawn!', 'info');
}

async function simulateNFA() {
    const inputString = document.getElementById('nfa-input-string').value;
    const data = {
        states: document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s),
        alphabet: document.getElementById('nfa-alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getNFATransitions(),
        start_state: document.getElementById('nfa-start').value.trim(),
        final_states: document.getElementById('nfa-final').value.split(',').map(s => s.trim()).filter(s => s),
        input_string: inputString
    };

    try {
        const response = await fetch('/nfa/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
        } else {
            showMessage(result.accepted ? '✅ ACCEPTED' : '❌ REJECTED', result.accepted ? 'accept' : 'reject');
        }
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

async function convertNFAtoDFA() {
    const data = {
        states: document.getElementById('nfa-states').value.split(',').map(s => s.trim()).filter(s => s),
        alphabet: document.getElementById('nfa-alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getNFATransitions(),
        start_state: document.getElementById('nfa-start').value.trim(),
        final_states: document.getElementById('nfa-final').value.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
        const response = await fetch('/nfa/to-dfa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
            return;
        }

        // Switch to DFA tab and populate
        switchTab('dfa');
        document.querySelector('.tab-btn').click();
        
        document.getElementById('states').value = result.states.join(',');
        document.getElementById('alphabet').value = result.alphabet.join(',');
        document.getElementById('start-state').value = result.start_state;
        document.getElementById('final-states').value = result.final_states.join(',');
        
        generateTable();
        setTimeout(() => {
            Object.keys(result.transitions).forEach(key => {
                const [state, symbol] = key.split(',');
                const input = document.getElementById(`t-${state}-${symbol}`);
                if (input) input.value = result.transitions[key];
            });
            drawDiagram();
            showMessage('✅ Converted NFA to DFA', 'accept');
        }, 100);
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

// ===== REGEX FUNCTIONS =====
async function convertRegexToDFA() {
    const regex = document.getElementById('regex-input').value.trim();
    if (!regex) {
        showMessage('Please enter a regular expression', 'reject');
        return;
    }

    try {
        const response = await fetch('/regex/to-dfa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regex })
        });
        
        const result = await response.json();
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
            return;
        }

        // Switch to DFA tab and populate
        switchTab('dfa');
        document.querySelector('.tab-btn').click();
        
        document.getElementById('states').value = result.states.join(',');
        document.getElementById('alphabet').value = result.alphabet.join(',');
        document.getElementById('start-state').value = result.start_state;
        document.getElementById('final-states').value = result.final_states.join(',');
        
        generateTable();
        setTimeout(() => {
            Object.keys(result.transitions).forEach(key => {
                const [state, symbol] = key.split(',');
                const input = document.getElementById(`t-${state}-${symbol}`);
                if (input) input.value = result.transitions[key];
            });
            drawDiagram();
            showMessage('✅ Converted Regex to DFA', 'accept');
        }, 100);
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

// ===== TURING MACHINE FUNCTIONS =====
function generateTMTable() {
    const states = document.getElementById('tm-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('tm-alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (states.length === 0 || alphabet.length === 0) {
        document.getElementById('tm-transition-table').innerHTML = '<p style="color: #e53e3e;">Please enter states and alphabet first</p>';
        return;
    }

    let html = '<table><thead><tr><th>State</th><th>Read</th><th>Write</th><th>Move</th><th>Next</th></tr></thead><tbody>';

    states.forEach(state => {
        alphabet.forEach(symbol => {
            html += `<tr>
                <td><strong>${state}</strong></td>
                <td><strong>${symbol}</strong></td>
                <td><input type="text" id="tm-w-${state}-${symbol}" placeholder="0" style="width:40px;"></td>
                <td><select id="tm-d-${state}-${symbol}" style="width:50px;padding:4px;">
                    <option value="R">R</option>
                    <option value="L">L</option>
                </select></td>
                <td><input type="text" id="tm-n-${state}-${symbol}" placeholder="q1" style="width:60px;"></td>
            </tr>`;
        });
    });

    html += '</tbody></table>';
    document.getElementById('tm-transition-table').innerHTML = html;
}

function getTMTransitions() {
    const states = document.getElementById('tm-states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('tm-alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = {};

    states.forEach(state => {
        alphabet.forEach(symbol => {
            const write = document.getElementById(`tm-w-${state}-${symbol}`);
            const dir = document.getElementById(`tm-d-${state}-${symbol}`);
            const next = document.getElementById(`tm-n-${state}-${symbol}`);
            
            if (write && dir && next && next.value.trim()) {
                const writeVal = write.value.trim() || symbol;
                transitions[`${state},${symbol}`] = `${next.value.trim()},${writeVal},${dir.value}`;
            }
        });
    });

    return transitions;
}

function drawTMDiagram() {
    const states = document.getElementById('tm-states').value.split(',').map(s => s.trim()).filter(s => s);
    const startState = document.getElementById('tm-start').value.trim();
    const acceptState = document.getElementById('tm-accept').value.trim();
    const transitions = getTMTransitions();

    cy.elements().remove();

    states.forEach(state => {
        const classes = [];
        if (state === startState) classes.push('start');
        if (state === acceptState) classes.push('final');
        
        cy.add({
            group: 'nodes',
            data: { id: state, label: state },
            classes: classes.join(' ')
        });
    });

    const edgeMap = {};
    Object.keys(transitions).forEach(key => {
        const [state, symbol] = key.split(',');
        const [nextState, write, dir] = transitions[key].split(',');
        const edgeKey = `${state}-${nextState}`;
        const label = `${symbol}→${write},${dir}`;
        
        if (edgeMap[edgeKey]) {
            edgeMap[edgeKey] += `\n${label}`;
        } else {
            edgeMap[edgeKey] = label;
        }
    });

    Object.keys(edgeMap).forEach(edgeKey => {
        const [source, target] = edgeKey.split('-');
        cy.add({
            group: 'edges',
            data: { id: edgeKey, source, target, label: edgeMap[edgeKey] }
        });
    });

    cy.layout({ name: 'circle', animate: true, animationDuration: 500 }).run();
    showMessage('Turing Machine diagram drawn!', 'info');
}

async function simulateTM() {
    const inputString = document.getElementById('tm-input-string').value;
    const data = {
        states: document.getElementById('tm-states').value.split(',').map(s => s.trim()).filter(s => s),
        tape_alphabet: document.getElementById('tm-alphabet').value.split(',').map(s => s.trim()).filter(s => s),
        transitions: getTMTransitions(),
        start_state: document.getElementById('tm-start').value.trim(),
        accept_state: document.getElementById('tm-accept').value.trim(),
        reject_state: document.getElementById('tm-reject').value.trim(),
        input_string: inputString
    };

    try {
        const response = await fetch('/turing/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.error) {
            showMessage('Error: ' + result.error, 'reject');
        } else {
            const msg = result.accepted ? 
                `✅ ACCEPTED<br>Final tape: ${result.final_tape}<br>Steps: ${result.steps.length}` :
                `❌ REJECTED<br>Final tape: ${result.final_tape}<br>Steps: ${result.steps.length}`;
            document.getElementById('result').innerHTML = msg;
            document.getElementById('result').className = `result-box result-${result.accepted ? 'accept' : 'reject'}`;
        }
    } catch (error) {
        showMessage('Error: ' + error, 'reject');
    }
}

// ===== VISUAL EDITOR FUNCTIONS =====
let selectedElement = null;
let autoSyncEnabled = true;

function loadCurrentDiagram() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const startState = document.getElementById('start-state').value.trim();
    const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();

    if (states.length === 0) {
        showEditorStatus('Please build a DFA first in the DFA tab', 'error');
        return;
    }

    cy.elements().remove();

    // Add nodes
    states.forEach(state => {
        const classes = [];
        if (state === startState) classes.push('start');
        if (finalStates.includes(state)) classes.push('final');
        
        cy.add({
            group: 'nodes',
            data: { id: state, label: state },
            classes: classes.join(' ')
        });
    });

    // Add edges
    const edgeMap = {};
    Object.keys(transitions).forEach(key => {
        const [state, symbol] = key.split(',');
        const target = transitions[key];
        const edgeKey = `${state}-${target}`;
        
        if (edgeMap[edgeKey]) {
            edgeMap[edgeKey] += `, ${symbol}`;
        } else {
            edgeMap[edgeKey] = symbol;
        }
    });

    Object.keys(edgeMap).forEach(edgeKey => {
        const [source, target] = edgeKey.split('-');
        cy.add({
            group: 'edges',
            data: { id: edgeKey, source, target, label: edgeMap[edgeKey] }
        });
    });

    cy.layout({ name: 'circle', animate: true, animationDuration: 500 }).run();
    showEditorStatus('Diagram loaded! Edit it and changes will sync automatically.', 'success');
}

function generateDiagramImage() {
    if (cy.elements().length === 0) {
        showEditorStatus('No diagram to export. Load a diagram first.', 'error');
        return;
    }

    const png = cy.png({
        output: 'blob',
        bg: '#f7fafc',
        full: true,
        scale: 2
    });

    const url = URL.createObjectURL(png);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'automaton-diagram.png';
    link.click();
    URL.revokeObjectURL(url);
    
    showEditorStatus('Diagram image downloaded!', 'success');
}

function autoSyncFromDiagram() {
    if (!autoSyncEnabled || currentTab !== 'editor') return;
    
    const states = [];
    const alphabet = new Set();
    let startState = '';
    const finalStates = [];
    const transitions = {};
    
    cy.nodes().forEach(node => {
        states.push(node.id());
        if (node.hasClass('start')) startState = node.id();
        if (node.hasClass('final')) finalStates.push(node.id());
    });
    
    cy.edges().forEach(edge => {
        const source = edge.source().id();
        const target = edge.target().id();
        const labels = edge.data('label').split(',').map(l => l.trim());
        
        labels.forEach(symbol => {
            alphabet.add(symbol);
            transitions[`${source},${symbol}`] = target;
        });
    });
    
    // Update DFA tab inputs
    document.getElementById('states').value = states.join(',');
    document.getElementById('alphabet').value = Array.from(alphabet).join(',');
    document.getElementById('start-state').value = startState;
    document.getElementById('final-states').value = finalStates.join(',');
    
    // Regenerate table
    generateTable();
    
    // Update table values
    setTimeout(() => {
        Object.keys(transitions).forEach(key => {
            const [state, symbol] = key.split(',');
            const input = document.getElementById(`t-${state}-${symbol}`);
            if (input) input.value = transitions[key];
        });
    }, 100);
    
    showEditorStatus('Changes synced automatically!', 'success');
    
    // Auto-hide status after 2 seconds
    setTimeout(() => {
        const status = document.getElementById('editor-status');
        if (status) status.style.display = 'none';
    }, 2000);
}

function showEditorStatus(message, type) {
    const status = document.getElementById('editor-status');
    if (!status) return;
    
    status.style.display = 'block';
    status.className = `result-box result-${type === 'error' ? 'reject' : type === 'success' ? 'accept' : 'info'}`;
    status.innerHTML = message;
}

function addStateVisually() {
    const stateName = document.getElementById('editor-state-name').value.trim();
    const isStart = document.getElementById('editor-is-start').checked;
    const isFinal = document.getElementById('editor-is-final').checked;
    
    if (!stateName) {
        showEditorStatus('Please enter a state name', 'error');
        return;
    }
    
    const classes = [];
    if (isStart) classes.push('start');
    if (isFinal) classes.push('final');
    
    cy.add({
        group: 'nodes',
        data: { id: stateName, label: stateName },
        classes: classes.join(' '),
        position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 }
    });
    
    autoSyncFromDiagram();
    document.getElementById('editor-state-name').value = '';
    document.getElementById('editor-is-start').checked = false;
    document.getElementById('editor-is-final').checked = false;
}

function addTransitionVisually() {
    const from = document.getElementById('editor-from').value.trim();
    const to = document.getElementById('editor-to').value.trim();
    const symbol = document.getElementById('editor-symbol').value.trim();
    
    if (!from || !to || !symbol) {
        showEditorStatus('Please fill all fields', 'error');
        return;
    }
    
    const edgeId = `${from}-${to}`;
    const existing = cy.getElementById(edgeId);
    
    if (existing.length > 0) {
        const currentLabel = existing.data('label');
        existing.data('label', currentLabel + ',' + symbol);
    } else {
        cy.add({
            group: 'edges',
            data: { id: edgeId, source: from, target: to, label: symbol }
        });
    }
    
    autoSyncFromDiagram();
    document.getElementById('editor-symbol').value = '';
}

function deleteSelected() {
    if (selectedElement) {
        selectedElement.remove();
        autoSyncFromDiagram();
        selectedElement = null;
        showEditorStatus('Element deleted', 'success');
    } else {
        showEditorStatus('Please select an element first (click on it)', 'error');
    }
}

function clearDiagram() {
    if (confirm('Clear entire diagram?')) {
        cy.elements().remove();
        autoSyncFromDiagram();
        showEditorStatus('Diagram cleared', 'success');
    }
}

function saveChangesToDFA() {
    autoSyncFromDiagram();
    switchTab('dfa');
    document.querySelectorAll('.tab-btn')[0].click();
    drawDiagram();
    showMessage('Changes saved to DFA tab!', 'accept');
}

// Track selected element
cy.on('tap', 'node, edge', function(evt) {
    if (currentTab === 'editor') {
        selectedElement = evt.target;
        cy.elements().removeClass('selected');
        selectedElement.addClass('selected');
    }
});

// ===== AI ASSISTANT FUNCTIONS =====
async function analyzeAutomaton() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();
    const startState = document.getElementById('start-state').value.trim();
    const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s);
    
    document.getElementById('ai-response').innerHTML = '<p style="color: #667eea;">🤖 AI is analyzing... Please wait.</p>';
    
    try {
        const response = await fetch('/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                states,
                alphabet,
                transitions,
                start_state: startState,
                final_states: finalStates
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ ${result.error}</p>`;
        } else {
            document.getElementById('ai-response').innerHTML = `
                <h4 style="color: #667eea; margin-bottom: 10px;">🤖 AI Analysis</h4>
                <div style="white-space: pre-wrap; line-height: 1.6;">${result.response}</div>
            `;
        }
    } catch (error) {
        document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ Error: ${error}</p>`;
    }
}

async function explainTransition() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();
    
    document.getElementById('ai-response').innerHTML = '<p style="color: #667eea;">🤖 AI is explaining... Please wait.</p>';
    
    try {
        const response = await fetch('/ai/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ states, alphabet, transitions })
        });
        
        const result = await response.json();
        
        if (result.error) {
            document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ ${result.error}</p>`;
        } else {
            document.getElementById('ai-response').innerHTML = `
                <h4 style="color: #667eea; margin-bottom: 10px;">🤖 AI Explanation</h4>
                <div style="white-space: pre-wrap; line-height: 1.6;">${result.response}</div>
            `;
        }
    } catch (error) {
        document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ Error: ${error}</p>`;
    }
}

async function suggestOptimizations() {
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();
    const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s);
    
    document.getElementById('ai-response').innerHTML = '<p style="color: #667eea;">🤖 AI is thinking... Please wait.</p>';
    
    try {
        const response = await fetch('/ai/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ states, alphabet, transitions, final_states: finalStates })
        });
        
        const result = await response.json();
        
        if (result.error) {
            document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ ${result.error}</p>`;
        } else {
            document.getElementById('ai-response').innerHTML = `
                <h4 style="color: #667eea; margin-bottom: 10px;">🤖 AI Suggestions</h4>
                <div style="white-space: pre-wrap; line-height: 1.6;">${result.response}</div>
            `;
        }
    } catch (error) {
        document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ Error: ${error}</p>`;
    }
}

function whatIfAnalysis() {
    let analysis = '<h4 style="color: #667eea; margin-bottom: 10px;">🔍 What-If Analysis</h4>';
    analysis += '<p>Use the controls below to explore different scenarios:</p>';
    analysis += '<ul style="margin: 15px 0; padding-left: 20px;">';
    analysis += '<li><strong>Add a new state:</strong> See how it affects the automaton</li>';
    analysis += '<li><strong>Remove a state:</strong> Understand dependencies</li>';
    analysis += '<li><strong>Change a transition:</strong> See impact on accepted strings</li>';
    analysis += '<li><strong>Make state final:</strong> Expand accepted language</li>';
    analysis += '<li><strong>Remove final state:</strong> Restrict accepted language</li>';
    analysis += '</ul>';
    analysis += '<p style="color: #718096;">Select a scenario and enter details, then click "Run What-If"</p>';
    
    document.getElementById('ai-response').innerHTML = analysis;
}

async function runWhatIf() {
    const scenario = document.getElementById('whatif-scenario').value;
    const details = document.getElementById('whatif-details').value.trim();
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();
    const startState = document.getElementById('start-state').value.trim();
    const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s);
    
    if (!details) {
        document.getElementById('ai-response').innerHTML = '<p style="color: #fc8181;">❌ Please enter state name or details</p>';
        return;
    }
    
    document.getElementById('ai-response').innerHTML = '<p style="color: #667eea;">🤖 AI is analyzing scenario... Please wait.</p>';
    
    const scenarioMap = {
        'add-state': `Adding a new state "${details}"`,
        'remove-state': `Removing state "${details}"`,
        'change-transition': `Changing transition involving "${details}"`,
        'add-final': `Making state "${details}" a final state`,
        'remove-final': `Removing "${details}" as a final state`
    };
    
    try {
        const response = await fetch('/ai/whatif', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario: scenarioMap[scenario],
                details,
                states,
                alphabet,
                transitions,
                start_state: startState,
                final_states: finalStates
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ ${result.error}</p>`;
        } else {
            document.getElementById('ai-response').innerHTML = `
                <h4 style="color: #667eea; margin-bottom: 10px;">🤖 AI What-If Analysis</h4>
                <div style="white-space: pre-wrap; line-height: 1.6;">${result.response}</div>
                <p style="margin-top: 15px; padding: 10px; background: #edf2f7; border-radius: 6px;">
                💡 <strong>Tip:</strong> Use the Visual Editor tab to make these changes and see the results immediately!
                </p>
            `;
        }
    } catch (error) {
        document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ Error: ${error}</p>`;
    }
}

async function askCustomQuestion() {
    const query = document.getElementById('custom-query').value.trim();
    
    if (!query) {
        document.getElementById('ai-response').innerHTML = '<p style="color: #fc8181;">❌ Please enter a question</p>';
        return;
    }
    
    const states = document.getElementById('states').value.split(',').map(s => s.trim()).filter(s => s);
    const alphabet = document.getElementById('alphabet').value.split(',').map(s => s.trim()).filter(s => s);
    const transitions = getTransitions();
    const startState = document.getElementById('start-state').value.trim();
    const finalStates = document.getElementById('final-states').value.split(',').map(s => s.trim()).filter(s => s);
    
    const automatonData = {
        states,
        alphabet,
        transitions,
        start_state: startState,
        final_states: finalStates
    };
    
    document.getElementById('ai-response').innerHTML = '<p style="color: #667eea;">🤖 AI is thinking... Please wait.</p>';
    
    try {
        const response = await fetch('/ai/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                automaton_data: JSON.stringify(automatonData)
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ ${result.error}</p>`;
        } else {
            document.getElementById('ai-response').innerHTML = `
                <h4 style="color: #667eea; margin-bottom: 10px;">🤖 AI Response</h4>
                <div style="background: #edf2f7; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                    <strong>Your Question:</strong> ${query}
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6;">${result.response}</div>
            `;
        }
    } catch (error) {
        document.getElementById('ai-response').innerHTML = `<p style="color: #fc8181;">❌ Error: ${error}</p>`;
    }
}
