class TuringMachine:
    def __init__(self, states, tape_alphabet, transitions, start_state, accept_state, reject_state):
        self.states = states
        self.tape_alphabet = tape_alphabet
        self.transitions = transitions  # {(state, symbol): (next_state, write_symbol, direction)}
        self.start_state = start_state
        self.accept_state = accept_state
        self.reject_state = reject_state
    
    def simulate(self, input_string, max_steps=1000):
        tape = list(input_string) + ['_']
        head = 0
        current_state = self.start_state
        steps = []
        
        for step in range(max_steps):
            if head < 0:
                tape.insert(0, '_')
                head = 0
            if head >= len(tape):
                tape.append('_')
            
            current_symbol = tape[head]
            steps.append({
                'step': step,
                'state': current_state,
                'tape': ''.join(tape),
                'head': head,
                'symbol': current_symbol
            })
            
            if current_state == self.accept_state:
                return {'accepted': True, 'steps': steps, 'final_tape': ''.join(tape)}
            
            if current_state == self.reject_state:
                return {'accepted': False, 'steps': steps, 'final_tape': ''.join(tape)}
            
            key = f"{current_state},{current_symbol}"
            if key not in self.transitions:
                return {'accepted': False, 'steps': steps, 'error': f'No transition for ({current_state}, {current_symbol})'}
            
            next_state, write_symbol, direction = self.transitions[key].split(',')
            tape[head] = write_symbol
            current_state = next_state
            
            if direction == 'R':
                head += 1
            elif direction == 'L':
                head -= 1
        
        return {'accepted': False, 'steps': steps, 'error': 'Maximum steps exceeded'}
    
    def validate(self):
        if self.start_state not in self.states:
            return False, "Start state not in states list"
        if self.accept_state not in self.states:
            return False, "Accept state not in states list"
        if self.reject_state not in self.states:
            return False, "Reject state not in states list"
        return True, "Turing Machine is valid"
