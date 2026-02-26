class RegexToNFA:
    def __init__(self):
        self.state_counter = 0
    
    def new_state(self):
        state = f"q{self.state_counter}"
        self.state_counter += 1
        return state
    
    def parse_regex(self, regex):
        # Simple regex parser for basic operations
        return self.parse_union(regex)
    
    def parse_union(self, regex):
        # Handle | (union)
        parts = []
        current = ""
        depth = 0
        
        for char in regex:
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
            elif char == '|' and depth == 0:
                parts.append(current)
                current = ""
                continue
            current += char
        
        if current:
            parts.append(current)
        
        if len(parts) > 1:
            nfas = [self.parse_concat(part) for part in parts]
            return self.union(nfas)
        return self.parse_concat(regex)
    
    def parse_concat(self, regex):
        # Handle concatenation
        if not regex:
            return self.epsilon()
        
        nfas = []
        i = 0
        while i < len(regex):
            if regex[i] == '(':
                depth = 1
                j = i + 1
                while j < len(regex) and depth > 0:
                    if regex[j] == '(':
                        depth += 1
                    elif regex[j] == ')':
                        depth -= 1
                    j += 1
                sub_nfa = self.parse_union(regex[i+1:j-1])
                if j < len(regex) and regex[j] == '*':
                    sub_nfa = self.star(sub_nfa)
                    j += 1
                nfas.append(sub_nfa)
                i = j
            else:
                nfa = self.symbol(regex[i])
                if i + 1 < len(regex) and regex[i+1] == '*':
                    nfa = self.star(nfa)
                    i += 2
                else:
                    i += 1
                nfas.append(nfa)
        
        if not nfas:
            return self.epsilon()
        return self.concat(nfas) if len(nfas) > 1 else nfas[0]
    
    def symbol(self, char):
        start = self.new_state()
        end = self.new_state()
        return {
            'start': start,
            'end': end,
            'transitions': {f"{start},{char}": [end]}
        }
    
    def concat(self, nfas):
        if not nfas:
            return self.epsilon()
        
        result = nfas[0]
        for nfa in nfas[1:]:
            result['transitions'][f"{result['end']},ε"] = [nfa['start']]
            result['transitions'].update(nfa['transitions'])
            result['end'] = nfa['end']
        return result
    
    def union(self, nfas):
        start = self.new_state()
        end = self.new_state()
        transitions = {}
        
        for nfa in nfas:
            transitions[f"{start},ε"] = transitions.get(f"{start},ε", []) + [nfa['start']]
            transitions[f"{nfa['end']},ε"] = [end]
            transitions.update(nfa['transitions'])
        
        return {'start': start, 'end': end, 'transitions': transitions}
    
    def star(self, nfa):
        start = self.new_state()
        end = self.new_state()
        transitions = nfa['transitions'].copy()
        transitions[f"{start},ε"] = [nfa['start'], end]
        transitions[f"{nfa['end']},ε"] = [nfa['start'], end]
        return {'start': start, 'end': end, 'transitions': transitions}
    
    def epsilon(self):
        start = self.new_state()
        end = self.new_state()
        return {'start': start, 'end': end, 'transitions': {f"{start},ε": [end]}}
    
    def to_nfa(self, regex):
        from nfa_engine import NFA
        
        nfa_struct = self.parse_regex(regex)
        
        states = set()
        alphabet = set()
        transitions = {}
        
        for key, values in nfa_struct['transitions'].items():
            state, symbol = key.split(',')
            states.add(state)
            if symbol != 'ε':
                alphabet.add(symbol)
            for v in values:
                states.add(v)
            transitions[key] = values
        
        states.add(nfa_struct['start'])
        states.add(nfa_struct['end'])
        
        return NFA(
            list(states),
            list(alphabet) + ['ε'],
            transitions,
            nfa_struct['start'],
            [nfa_struct['end']]
        )


def regex_to_dfa(regex):
    from nfa_engine import nfa_to_dfa
    converter = RegexToNFA()
    nfa = converter.to_nfa(regex)
    return nfa_to_dfa(nfa)
