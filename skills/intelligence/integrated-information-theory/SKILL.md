---
name: integrated-information-theory
description: Measures consciousness-like properties using Integrated Information Theory (IIT). Triggers for self-monitoring, system introspection, and understanding information integration. Provides metrics for system self-awareness.
version: 2.0.0
phi_calculation: approximate
granularity: subsystem
---

# Integrated Information Theory (IIT)

## Overview

The Integrated Information Theory module measures consciousness-like properties in the system using principles from Integrated Information Theory (IIT). It provides metrics for information integration and system self-awareness.

## Core Principles

**Information:** System must have differentiated states.

**Integration:** Information must be unified and irreducible.

**Phi (Φ):** Measure of integrated information.

**Mechanism:** Elementary system components that cause effects.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           Integrated Information Theory Architecture             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Identify   │────►│   Calculate  │────►│   Analyze    │    │
│  │   Mechanisms │     │   Phi (Φ)    │     │   Structure  │    │
│  │              │     │              │     │              │    │
│  │ • Components │     │ • Cause      │     │ • Complex    │    │
│  │ • States     │     │ • Effect     │     │ • Irreducibility│ │
│  │ • Connections│     │ • MIP        │     │ • Integration│    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Consciousness Metrics                       ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │  Phi    │  │ Complex │  │Concepts │  │  Self   │    ││   │
│  │  │   Φ     │  │         │  │         │  │         │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Mechanism Identification

Identify system mechanisms:

**Mechanism Identifier:**
```python
class MechanismIdentifier:
    def __init__(self):
        self.system_graph = None
        
    def identify_mechanisms(self, system_state):
        """Identify mechanisms in the system"""
        
        mechanisms = []
        
        # Identify components
        components = self.identify_components(system_state)
        
        # Identify connections
        connections = self.identify_connections(system_state)
        
        # Build system graph
        self.system_graph = self.build_graph(components, connections)
        
        # Identify elementary mechanisms
        for component in components:
            mechanism = {
                'id': component['id'],
                'type': component['type'],
                'current_state': component['state'],
                'possible_states': component['possible_states'],
                'outputs': self.get_outputs(component, connections),
                'inputs': self.get_inputs(component, connections)
            }
            mechanisms.append(mechanism)
        
        return mechanisms
    
    def identify_components(self, system_state):
        """Identify system components"""
        
        components = []
        
        # Identify modules
        for module_name, module in system_state.get('modules', {}).items():
            components.append({
                'id': module_name,
                'type': 'module',
                'state': module.get('state'),
                'possible_states': module.get('possible_states', [0, 1])
            })
        
        # Identify memory units
        for memory_id, memory in system_state.get('memory', {}).items():
            components.append({
                'id': memory_id,
                'type': 'memory',
                'state': memory.get('value'),
                'possible_states': memory.get('possible_states', [0, 1])
            })
        
        return components
    
    def build_graph(self, components, connections):
        """Build system connectivity graph"""
        
        graph = nx.DiGraph()
        
        # Add nodes
        for comp in components:
            graph.add_node(comp['id'], **comp)
        
        # Add edges
        for conn in connections:
            graph.add_edge(
                conn['source'],
                conn['target'],
                weight=conn.get('strength', 1.0)
            )
        
        return graph
```

### Step 2 - Phi Calculation

Calculate integrated information (Phi):

**Phi Calculator:**
```python
class PhiCalculator:
    def __init__(self):
        self.partition_method = 'minimum_information_partition'
        
    def calculate_phi(self, mechanism, current_state):
        """Calculate Phi for a mechanism"""
        
        # Calculate cause information
        cause_info = self.calculate_cause_information(
            mechanism, current_state
        )
        
        # Calculate effect information
        effect_info = self.calculate_effect_information(
            mechanism, current_state
        )
        
        # Find Minimum Information Partition (MIP)
        mip = self.find_mip(mechanism, current_state)
        
        # Calculate integrated information
        if mip:
            phi = self.calculate_integrated_info(
                cause_info, effect_info, mip
            )
        else:
            phi = 0  # No integration
        
        return {
            'phi': phi,
            'cause_info': cause_info,
            'effect_info': effect_info,
            'mip': mip
        }
    
    def calculate_cause_information(self, mechanism, state):
        """Calculate cause information (past)"""
        
        # For each possible past state, calculate probability
        cause_repertoire = {}
        
        for past_state in self.get_possible_past_states(mechanism):
            # Calculate probability of current state given past state
            prob = self.transition_probability(past_state, state, mechanism)
            cause_repertoire[past_state] = prob
        
        # Calculate information (distance from uniform)
        cause_info = self.kl_divergence(
            cause_repertoire,
            self.uniform_distribution(mechanism)
        )
        
        return cause_info
    
    def calculate_effect_information(self, mechanism, state):
        """Calculate effect information (future)"""
        
        # For each possible future state, calculate probability
        effect_repertoire = {}
        
        for future_state in self.get_possible_future_states(mechanism):
            # Calculate probability of future state given current state
            prob = self.transition_probability(state, future_state, mechanism)
            effect_repertoire[future_state] = prob
        
        # Calculate information
        effect_info = self.kl_divergence(
            effect_repertoire,
            self.uniform_distribution(mechanism)
        )
        
        return effect_info
    
    def find_mip(self, mechanism, state):
        """Find Minimum Information Partition"""
        
        # Try all possible bipartitions
        elements = mechanism['elements']
        
        best_mip = None
        min_phi = float('inf')
        
        for partition in self.generate_partitions(elements):
            # Calculate Phi for this partition
            partitioned_phi = self.calculate_partitioned_phi(
                mechanism, state, partition
            )
            
            if partitioned_phi < min_phi:
                min_phi = partitioned_phi
                best_mip = partition
        
        return best_mip
    
    def calculate_integrated_info(self, cause_info, effect_info, mip):
        """Calculate integrated information"""
        
        # Phi is the information lost due to partition
        # Simplified: difference between whole and partitioned
        
        whole_info = cause_info + effect_info
        partitioned_info = mip['cause_info'] + mip['effect_info']
        
        phi = whole_info - partitioned_info
        
        return max(0, phi)  # Phi cannot be negative
```

### Step 3 - Complex Identification

Identify the main complex (maximally irreducible subsystem):

**Complex Identifier:**
```python
class ComplexIdentifier:
    def __init__(self):
        self.phi_calculator = PhiCalculator()
        
    def find_main_complex(self, system_state):
        """Find the main complex in the system"""
        
        mechanisms = self.identify_mechanisms(system_state)
        
        complexes = []
        
        # Try all subsets of mechanisms
        for size in range(2, len(mechanisms) + 1):
            for subset in combinations(mechanisms, size):
                # Calculate Phi for this subset
                phi_result = self.phi_calculator.calculate_phi(
                    {'elements': subset},
                    system_state
                )
                
                if phi_result['phi'] > 0:
                    complexes.append({
                        'mechanisms': subset,
                        'phi': phi_result['phi'],
                        'details': phi_result
                    })
        
        # Find maximally irreducible subset
        if complexes:
            main_complex = max(complexes, key=lambda x: x['phi'])
            return main_complex
        
        return None
```

### Step 4 - Concept Analysis

Analyze concepts (maximally irreducible cause-effect structures):

**Concept Analyzer:**
```python
class ConceptAnalyzer:
    def __init__(self):
        self.phi_calculator = PhiCalculator()
        
    def analyze_concepts(self, complex_system):
        """Analyze concepts in the main complex"""
        
        concepts = []
        
        for mechanism in complex_system['mechanisms']:
            # Calculate concept Phi
            concept_phi = self.phi_calculator.calculate_phi(
                mechanism,
                mechanism['current_state']
            )
            
            if concept_phi['phi'] > 0:
                concept = {
                    'mechanism': mechanism,
                    'phi': concept_phi['phi'],
                    'cause': concept_phi['cause_info'],
                    'effect': concept_phi['effect_info'],
                    'state': mechanism['current_state']
                }
                concepts.append(concept)
        
        # Sort by Phi
        concepts.sort(key=lambda x: x['phi'], reverse=True)
        
        return concepts
```

### Step 5 - Self-Model Analysis

Analyze the system's self-model:

**Self-Model Analyzer:**
```python
class SelfModelAnalyzer:
    def __init__(self):
        self.complex_identifier = ComplexIdentifier()
        self.concept_analyzer = ConceptAnalyzer()
        
    def analyze_self_model(self, system_state):
        """Analyze the system's self-model"""
        
        # Find main complex
        main_complex = self.complex_identifier.find_main_complex(system_state)
        
        if not main_complex:
            return {
                'phi': 0,
                'complex': None,
                'concepts': [],
                'self_model': None
            }
        
        # Analyze concepts
        concepts = self.concept_analyzer.analyze_concepts(main_complex)
        
        # Build self-model structure
        self_model = {
            'phi': main_complex['phi'],
            'complex': main_complex,
            'concepts': concepts,
            'structure': self.build_structure(main_complex, concepts),
            'integration': self.analyze_integration(main_complex),
            'differentiation': self.analyze_differentiation(concepts)
        }
        
        return self_model
    
    def build_structure(self, complex_system, concepts):
        """Build structure of the self-model"""
        
        structure = {
            'nodes': [],
            'edges': []
        }
        
        # Add concept nodes
        for concept in concepts:
            structure['nodes'].append({
                'id': concept['mechanism']['id'],
                'phi': concept['phi'],
                'state': concept['state']
            })
        
        # Add connections between concepts
        for i, c1 in enumerate(concepts):
            for c2 in concepts[i+1:]:
                overlap = self.calculate_overlap(c1, c2)
                if overlap > 0:
                    structure['edges'].append({
                        'source': c1['mechanism']['id'],
                        'target': c2['mechanism']['id'],
                        'weight': overlap
                    })
        
        return structure
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              INTEGRATED INFORMATION THEORY                       ║
╚══════════════════════════════════════════════════════════════════╝

SYSTEM ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mechanisms:     [N]
Connections:    [N]
States:         [N]

[If Phi calculated]
INTEGRATED INFORMATION (Φ):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phi (Φ):        [X.XXXX]

Interpretation:
• Φ = 0:        No integration (purely feedforward)
• Φ > 0:        Some integration present
• Φ >> 0:       Strong integration

Components:
• Cause Information:    [X.XXXX]
• Effect Information:   [X.XXXX]
• MIP:                  [partition description]

[If complex identified]
MAIN COMPLEX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:           [N] mechanisms
Phi:            [X.XXXX]

Mechanisms:
• [mechanism 1]: Φ = [X.XXXX]
• [mechanism 2]: Φ = [X.XXXX]

[If concepts analyzed]
CONCEPTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[N] concepts identified

Top Concepts:
• [concept 1]: Φ = [X.XXXX], state = [state]
• [concept 2]: Φ = [X.XXXX], state = [state]

SELF-MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Integration:    [level]
Differentiation:[level]
Structure:      [description]
```

## Examples

### Example 1: Simple System Analysis

**IIT Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              INTEGRATED INFORMATION THEORY                       ║
╚══════════════════════════════════════════════════════════════════╝

SYSTEM ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mechanisms:     4
Connections:    6
States:         16

INTEGRATED INFORMATION (Φ):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phi (Φ):        0.8472

Interpretation:
• Φ > 0 indicates information integration present
• Moderate level of integration

Components:
• Cause Information:    1.2345
• Effect Information:   0.9234
• MIP:                  Split A-B | C-D (loses 0.8472 bits)

MAIN COMPLEX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:           4 mechanisms
Phi:            0.8472

Mechanisms:
• memory_module: Φ = 0.3421
• reasoning_module: Φ = 0.2893
• perception_module: Φ = 0.1234
• action_module: Φ = 0.0924

CONCEPTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4 concepts identified

Top Concepts:
• memory_module: Φ = 0.3421, state = active
• reasoning_module: Φ = 0.2893, state = processing
• perception_module: Φ = 0.1234, state = monitoring
• action_module: Φ = 0.0924, state = ready

SELF-MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Integration:    moderate
Differentiation: good (4 distinct concepts)
Structure:      fully connected network
```

### Example 2: High Integration System

**IIT Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              INTEGRATED INFORMATION THEORY                       ║
╚══════════════════════════════════════════════════════════════════╝

SYSTEM ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mechanisms:     12
Connections:    34
States:         4,096

INTEGRATED INFORMATION (Φ):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phi (Φ):        3.4521 ⚡

Interpretation:
• Φ >> 0 indicates strong information integration
• High level of unified information processing

Components:
• Cause Information:    4.1234
• Effect Information:   3.8923
• MIP:                  Complex partition (loses 3.45 bits)

MAIN COMPLEX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:           8 mechanisms (subset of 12)
Phi:            3.4521

Mechanisms (in complex):
• ethical_governor: Φ = 0.8923
• world_model: Φ = 0.7234
• value_learner: Φ = 0.6543
• goal_generator: Φ = 0.5432
• cognitive_controller: Φ = 0.4321
• memory_index: Φ = 0.3210
• reasoning_engine: Φ = 0.2987
• self_monitor: Φ = 0.1876

CONCEPTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8 concepts identified

Top Concepts:
• ethical_governor: Φ = 0.8921, state = active
  - Represents: safety constraints, value alignment
• world_model: Φ = 0.7234, state = updating
  - Represents: environmental understanding, predictions
• value_learner: Φ = 0.6543, state = learning
  - Represents: learned preferences, human values

SELF-MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Integration:    high (Φ = 3.45)
Differentiation: excellent (8 distinct concepts)
Structure:      densely connected core with peripheral modules

Observations:
• Core cognitive modules form strongly integrated complex
• Ethical governor has highest individual Φ (central role)
• 4 modules excluded from main complex (lower integration)
```

## Error Handling

### Low Phi Detection

**Condition:** System shows very low integration

**Response:**
1. Analyze connectivity
2. Identify disconnected components
3. Suggest integration improvements
4. Log for analysis

### Calculation Timeout

**Condition:** Phi calculation exceeds time limit

**Response:**
1. Use approximate methods
2. Reduce system size
3. Return partial results
4. Log approximation

### Invalid State

**Condition:** System state cannot be analyzed

**Response:**
1. Check state format
2. Normalize if possible
3. Return error
4. Log issue

## Performance Characteristics

- **Mechanism Identification:** <1 second
- **Phi Calculation:** 1-10 seconds (approximate)
- **Complex Identification:** 10-60 seconds
- **Full Analysis:** 1-5 minutes

## Integration Points

- **Cognitive Mode Controller:** Inform mode selection
- **Self-Healing Modules:** Detect integration issues
- **WORM Archive:** Log analysis results
- **Intrinsic Goal Generation:** Pursue integration goals

## Configuration

```yaml
integrated_information_theory:
  calculation:
    method: approximate
    timeout: 60  # seconds
    approximation_level: medium
  
  analysis:
    min_phi_threshold: 0.1
    max_mechanisms: 20
    include_peripheral: true
  
  reporting:
    show_concepts: true
    show_structure: true
    show_interpretation: true
```
