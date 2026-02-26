import os
from groq import Groq

class AutomataAI:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found. Set it in environment or pass as parameter.")
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-70b-versatile"
    
    def analyze_automaton(self, states, alphabet, transitions, start_state, final_states):
        prompt = f"""You are an expert in automata theory. Analyze this automaton:

States: {', '.join(states)}
Alphabet: {', '.join(alphabet)}
Start State: {start_state}
Final States: {', '.join(final_states)}
Transitions: {len(transitions)} defined

Provide a detailed analysis including:
1. Completeness check
2. Potential issues
3. Language description (what strings it accepts)
4. Optimization suggestions

Keep response concise and educational."""

        return self._get_completion(prompt)
    
    def explain_transitions(self, states, alphabet, transitions):
        prompt = f"""Explain the transition function of this automaton in simple terms:

States: {', '.join(states)}
Alphabet: {', '.join(alphabet)}
Transitions: {transitions}

Describe what happens from each state for each input symbol. Make it easy to understand."""

        return self._get_completion(prompt)
    
    def suggest_optimizations(self, states, alphabet, transitions, final_states):
        prompt = f"""Suggest optimizations for this automaton:

States: {len(states)} states
Alphabet: {len(alphabet)} symbols
Transitions: {len(transitions)} defined
Final States: {len(final_states)}

Provide specific, actionable optimization suggestions."""

        return self._get_completion(prompt)
    
    def what_if_analysis(self, scenario, details, states, alphabet, transitions, start_state, final_states):
        prompt = f"""Analyze this what-if scenario for an automaton:

Current Automaton:
- States: {', '.join(states)}
- Alphabet: {', '.join(alphabet)}
- Start: {start_state}
- Final: {', '.join(final_states)}

Scenario: {scenario}
Details: {details}

Explain:
1. What will change
2. Impact on accepted language
3. Potential issues
4. Recommendations

Be specific and educational."""

        return self._get_completion(prompt)
    
    def custom_query(self, query, automaton_data):
        prompt = f"""You are an automata theory expert. Answer this question about the automaton:

Automaton: {automaton_data}

Question: {query}

Provide a clear, educational answer."""

        return self._get_completion(prompt)
    
    def _get_completion(self, prompt):
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert in automata theory, formal languages, and computation. Provide clear, educational explanations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"
