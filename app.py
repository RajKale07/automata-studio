from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dfa_engine import DFA, minimize_dfa, detect_unreachable_states
from nfa_engine import NFA, nfa_to_dfa
from regex_engine import regex_to_dfa
from turing_engine import TuringMachine
from ai_agent import AutomataAI
import os

app = Flask(__name__)
CORS(app)

# Initialize AI Agent
try:
    ai_agent = AutomataAI()
except ValueError:
    ai_agent = None
    print("Warning: GROQ_API_KEY not set. AI features will be disabled.")

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/app')
def index():
    return render_template('index.html')

@app.route('/validate', methods=['POST'])
def validate():
    data = request.json
    try:
        dfa = DFA(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        is_valid, message = dfa.validate()
        return jsonify({'valid': is_valid, 'message': message})
    except Exception as e:
        return jsonify({'valid': False, 'message': str(e)})

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    try:
        dfa = DFA(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        result = dfa.simulate(data['input_string'])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/minimize', methods=['POST'])
def minimize():
    data = request.json
    try:
        dfa = DFA(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        minimized = minimize_dfa(dfa)
        return jsonify({
            'states': minimized.states,
            'alphabet': minimized.alphabet,
            'transitions': minimized.transitions,
            'start_state': minimized.start_state,
            'final_states': minimized.final_states
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/unreachable', methods=['POST'])
def unreachable():
    data = request.json
    try:
        dfa = DFA(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        unreachable_states = detect_unreachable_states(dfa)
        return jsonify({'unreachable': unreachable_states})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/nfa/simulate', methods=['POST'])
def nfa_simulate():
    data = request.json
    try:
        nfa = NFA(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        result = nfa.simulate(data['input_string'])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/nfa/to-dfa', methods=['POST'])
def nfa_convert():
    data = request.json
    try:
        nfa = NFA(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        dfa = nfa_to_dfa(nfa)
        return jsonify({
            'states': dfa.states,
            'alphabet': dfa.alphabet,
            'transitions': dfa.transitions,
            'start_state': dfa.start_state,
            'final_states': dfa.final_states
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/regex/to-dfa', methods=['POST'])
def regex_convert():
    data = request.json
    try:
        dfa = regex_to_dfa(data['regex'])
        return jsonify({
            'states': dfa.states,
            'alphabet': dfa.alphabet,
            'transitions': dfa.transitions,
            'start_state': dfa.start_state,
            'final_states': dfa.final_states
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/turing/simulate', methods=['POST'])
def turing_simulate():
    data = request.json
    try:
        tm = TuringMachine(
            states=data['states'],
            tape_alphabet=data['tape_alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            accept_state=data['accept_state'],
            reject_state=data['reject_state']
        )
        result = tm.simulate(data['input_string'])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/turing/validate', methods=['POST'])
def turing_validate():
    data = request.json
    try:
        tm = TuringMachine(
            states=data['states'],
            tape_alphabet=data['tape_alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            accept_state=data['accept_state'],
            reject_state=data['reject_state']
        )
        is_valid, message = tm.validate()
        return jsonify({'valid': is_valid, 'message': message})
    except Exception as e:
        return jsonify({'valid': False, 'message': str(e)})

@app.route('/ai/analyze', methods=['POST'])
def ai_analyze():
    if not ai_agent:
        return jsonify({'error': 'AI agent not initialized. Please set GROQ_API_KEY.'})
    
    data = request.json
    try:
        result = ai_agent.analyze_automaton(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/ai/explain', methods=['POST'])
def ai_explain():
    if not ai_agent:
        return jsonify({'error': 'AI agent not initialized. Please set GROQ_API_KEY.'})
    
    data = request.json
    try:
        result = ai_agent.explain_transitions(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions']
        )
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/ai/optimize', methods=['POST'])
def ai_optimize():
    if not ai_agent:
        return jsonify({'error': 'AI agent not initialized. Please set GROQ_API_KEY.'})
    
    data = request.json
    try:
        result = ai_agent.suggest_optimizations(
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            final_states=data['final_states']
        )
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/ai/whatif', methods=['POST'])
def ai_whatif():
    if not ai_agent:
        return jsonify({'error': 'AI agent not initialized. Please set GROQ_API_KEY.'})
    
    data = request.json
    try:
        result = ai_agent.what_if_analysis(
            scenario=data['scenario'],
            details=data['details'],
            states=data['states'],
            alphabet=data['alphabet'],
            transitions=data['transitions'],
            start_state=data['start_state'],
            final_states=data['final_states']
        )
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/ai/query', methods=['POST'])
def ai_query():
    if not ai_agent:
        return jsonify({'error': 'AI agent not initialized. Please set GROQ_API_KEY.'})
    
    data = request.json
    try:
        result = ai_agent.custom_query(
            query=data['query'],
            automaton_data=data['automaton_data']
        )
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
