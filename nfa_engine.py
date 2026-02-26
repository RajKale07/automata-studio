class NFA:
    def __init__(self, states, alphabet, transitions, start_state, final_states):
        self.states = states
        self.alphabet = alphabet
        self.transitions = transitions  # {(state, symbol): [next_states]}
        self.start_state = start_state
        self.final_states = final_states

    def epsilon_closure(self, states_set):
        closure = set(states_set)
        stack = list(states_set)
        while stack:
            state = stack.pop()
            key = f"{state},ε"
            if key in self.transitions:
                for next_state in self.transitions[key]:
                    if next_state not in closure:
                        closure.add(next_state)
                        stack.append(next_state)
        return closure

    def simulate(self, input_string):
        current_states = self.epsilon_closure([self.start_state])
        path = [sorted(list(current_states))]
        
        for symbol in input_string:
            if symbol not in self.alphabet:
                return {'accepted': False, 'path': path, 'error': f"Symbol '{symbol}' not in alphabet"}
            
            next_states = set()
            for state in current_states:
                key = f"{state},{symbol}"
                if key in self.transitions:
                    for next_state in self.transitions[key]:
                        next_states.add(next_state)
            
            current_states = self.epsilon_closure(next_states)
            path.append(sorted(list(current_states)))
        
        accepted = any(state in self.final_states for state in current_states)
        return {'accepted': accepted, 'path': path, 'final_states': sorted(list(current_states))}


def nfa_to_dfa(nfa):
    from dfa_engine import DFA
    
    dfa_states = []
    dfa_transitions = {}
    dfa_final_states = []
    
    start_closure = tuple(sorted(nfa.epsilon_closure([nfa.start_state])))
    dfa_start = ','.join(start_closure)
    
    unmarked = [start_closure]
    marked = []
    state_map = {start_closure: dfa_start}
    
    while unmarked:
        current = unmarked.pop(0)
        marked.append(current)
        current_name = state_map[current]
        dfa_states.append(current_name)
        
        if any(s in nfa.final_states for s in current):
            dfa_final_states.append(current_name)
        
        for symbol in nfa.alphabet:
            if symbol == 'ε':
                continue
            
            next_states = set()
            for state in current:
                key = f"{state},{symbol}"
                if key in nfa.transitions:
                    for ns in nfa.transitions[key]:
                        next_states.add(ns)
            
            if next_states:
                next_closure = tuple(sorted(nfa.epsilon_closure(next_states)))
                if next_closure not in state_map:
                    state_map[next_closure] = ','.join(next_closure)
                    unmarked.append(next_closure)
                
                dfa_transitions[f"{current_name},{symbol}"] = state_map[next_closure]
    
    return DFA(dfa_states, [s for s in nfa.alphabet if s != 'ε'], dfa_transitions, dfa_start, dfa_final_states)
