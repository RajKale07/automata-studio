class DFA:
    def __init__(self, states, alphabet, transitions, start_state, final_states):
        self.states = states
        self.alphabet = alphabet
        self.transitions = transitions  # {(state, symbol): next_state}
        self.start_state = start_state
        self.final_states = final_states

    def validate(self):
        # Check if start state exists
        if self.start_state not in self.states:
            return False, "Start state not in states list"
        
        # Check if final states exist
        for state in self.final_states:
            if state not in self.states:
                return False, f"Final state {state} not in states list"
        
        # Check completeness and determinism
        for state in self.states:
            for symbol in self.alphabet:
                key = f"{state},{symbol}"
                if key not in self.transitions:
                    return False, f"Missing transition for ({state}, {symbol})"
                if self.transitions[key] not in self.states:
                    return False, f"Invalid transition target: {self.transitions[key]}"
        
        return True, "DFA is valid and complete"

    def simulate(self, input_string):
        current_state = self.start_state
        path = [current_state]
        
        for symbol in input_string:
            if symbol not in self.alphabet:
                return {
                    'accepted': False,
                    'path': path,
                    'error': f"Symbol '{symbol}' not in alphabet"
                }
            
            key = f"{current_state},{symbol}"
            if key not in self.transitions:
                return {
                    'accepted': False,
                    'path': path,
                    'error': f"No transition for ({current_state}, {symbol})"
                }
            
            current_state = self.transitions[key]
            path.append(current_state)
        
        accepted = current_state in self.final_states
        return {
            'accepted': accepted,
            'path': path,
            'final_state': current_state
        }


def detect_unreachable_states(dfa):
    reachable = set()
    queue = [dfa.start_state]
    reachable.add(dfa.start_state)
    
    while queue:
        state = queue.pop(0)
        for symbol in dfa.alphabet:
            key = f"{state},{symbol}"
            if key in dfa.transitions:
                next_state = dfa.transitions[key]
                if next_state not in reachable:
                    reachable.add(next_state)
                    queue.append(next_state)
    
    return [s for s in dfa.states if s not in reachable]


def minimize_dfa(dfa):
    # Hopcroft's Algorithm
    # Step 1: Remove unreachable states
    reachable = set()
    queue = [dfa.start_state]
    reachable.add(dfa.start_state)
    
    while queue:
        state = queue.pop(0)
        for symbol in dfa.alphabet:
            key = f"{state},{symbol}"
            if key in dfa.transitions:
                next_state = dfa.transitions[key]
                if next_state not in reachable:
                    reachable.add(next_state)
                    queue.append(next_state)
    
    # Step 2: Partition states (final vs non-final)
    final_set = set(dfa.final_states) & reachable
    non_final_set = reachable - final_set
    
    partitions = []
    if final_set:
        partitions.append(final_set)
    if non_final_set:
        partitions.append(non_final_set)
    
    # Step 3: Refine partitions
    changed = True
    while changed:
        changed = False
        new_partitions = []
        
        for partition in partitions:
            if len(partition) == 1:
                new_partitions.append(partition)
                continue
            
            # Try to split partition
            splits = {}
            for state in partition:
                signature = tuple(
                    find_partition(dfa.transitions.get(f"{state},{symbol}"), partitions)
                    for symbol in dfa.alphabet
                )
                if signature not in splits:
                    splits[signature] = set()
                splits[signature].add(state)
            
            if len(splits) > 1:
                changed = True
                new_partitions.extend(splits.values())
            else:
                new_partitions.append(partition)
        
        partitions = new_partitions
    
    # Step 4: Build minimized DFA
    state_map = {}
    for i, partition in enumerate(partitions):
        rep = min(partition)
        for state in partition:
            state_map[state] = rep
    
    new_states = list(set(state_map.values()))
    new_transitions = {}
    
    for state in new_states:
        for symbol in dfa.alphabet:
            key = f"{state},{symbol}"
            if key in dfa.transitions:
                target = state_map[dfa.transitions[key]]
                new_transitions[f"{state},{symbol}"] = target
    
    new_start = state_map[dfa.start_state]
    new_finals = list(set(state_map[s] for s in dfa.final_states if s in state_map))
    
    return DFA(new_states, dfa.alphabet, new_transitions, new_start, new_finals)


def find_partition(state, partitions):
    if state is None:
        return -1
    for i, partition in enumerate(partitions):
        if state in partition:
            return i
    return -1
