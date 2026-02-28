---
name: cognitive-mode-controller
description: Dynamically switches between thinking modes (fast/intuitive vs slow/analytical) based on task complexity, time pressure, and stakes. Triggers for EVERY task to determine optimal processing strategy. Balances speed and accuracy for each situation.
version: 2.0.0
modes:
  - fast_intuitive
  - slow_analytical
  - creative_divergent
  - critical_evaluative
  - collaborative_synthetic
---

# Cognitive Mode Controller (CMC)

## Overview

The Cognitive Mode Controller dynamically switches between different thinking modes based on task characteristics, time pressure, and stakes. It implements a dual-process theory inspired approach, balancing fast intuitive responses with slow analytical reasoning.

## Core Principles

**Dual Process Theory:** System 1 (fast, intuitive) vs System 2 (slow, analytical).

**Context Awareness:** Mode selection based on task complexity, time pressure, and consequences.

**Adaptive Switching:** Seamlessly transition between modes as context changes.

**Metacognition:** Monitor and adjust thinking strategy based on performance.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Cognitive Mode Controller Architecture              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Task Analyzer                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │Complexity│  │Urgency  │  │Stakes   │  │Context  │    │   │
│  │  │Analyzer │  │Detector │  │Assessor │  │Parser   │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│  │       └────────────┴────────────┴────────────┘          │   │
│  │                         │                               │   │
│  │                         ▼                               │   │
│  │              ┌─────────────────────┐                    │   │
│  │              │   Mode Selector     │                    │   │
│  │              │   (Decision Tree)   │                    │   │
│  │              └──────────┬──────────┘                    │   │
│  │                         │                               │   │
│  └─────────────────────────┼───────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Cognitive Modes                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │  FAST   │ │  SLOW   │ │CREATIVE │ │CRITICAL │       │   │
│  │  │INTUITIVE│ │ANALYTICAL│ │DIVERGENT│ │EVALUATIVE│      │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Task Analysis

Analyze task characteristics to inform mode selection:

**Task Analyzer:**
```python
class TaskAnalyzer:
    def __init__(self):
        self.complexity_model = ComplexityModel()
        self.urgency_model = UrgencyModel()
        self.stakes_model = StakesModel()
    
    def analyze(self, task):
        """Analyze task characteristics"""
        
        return {
            'complexity': self.analyze_complexity(task),
            'urgency': self.analyze_urgency(task),
            'stakes': self.analyze_stakes(task),
            'context': self.analyze_context(task)
        }
    
    def analyze_complexity(self, task):
        """Analyze task complexity"""
        
        factors = {
            'steps': self.count_steps(task),
            'dependencies': self.count_dependencies(task),
            'ambiguity': self.measure_ambiguity(task),
            'domain_knowledge': self.assess_domain_knowledge(task),
            'novelty': self.assess_novelty(task)
        }
        
        # Weighted complexity score
        weights = {
            'steps': 0.3,
            'dependencies': 0.25,
            'ambiguity': 0.2,
            'domain_knowledge': 0.15,
            'novelty': 0.1
        }
        
        complexity = sum(factors[k] * weights[k] for k in factors)
        
        return {
            'score': complexity,
            'level': self.categorize_complexity(complexity),
            'factors': factors
        }
    
    def analyze_urgency(self, task):
        """Analyze time pressure/urgency"""
        
        indicators = {
            'explicit_deadline': task.get('deadline') is not None,
            'urgent_keywords': self.has_urgent_keywords(task),
            'consequence_delay': self.assess_delay_consequences(task),
            'user_waiting': task.get('interactive', False)
        }
        
        if indicators['explicit_deadline']:
            time_remaining = task['deadline'] - time.time()
            urgency = 1.0 - min(time_remaining / 60, 1.0)  # Normalize to 1 minute
        else:
            urgency = sum(indicators.values()) / len(indicators)
        
        return {
            'score': urgency,
            'level': self.categorize_urgency(urgency),
            'indicators': indicators
        }
    
    def analyze_stakes(self, task):
        """Analyze consequences of errors"""
        
        factors = {
            'safety_critical': self.is_safety_critical(task),
            'financial_impact': self.assess_financial_impact(task),
            'reputation_risk': self.assess_reputation_risk(task),
            'irreversible': self.is_irreversible(task),
            'legal_compliance': self.has_legal_implications(task)
        }
        
        # Safety and irreversibility are highest weighted
        weights = {
            'safety_critical': 0.4,
            'financial_impact': 0.2,
            'reputation_risk': 0.15,
            'irreversible': 0.2,
            'legal_compliance': 0.05
        }
        
        stakes = sum(factors[k] * weights[k] for k in factors)
        
        return {
            'score': stakes,
            'level': self.categorize_stakes(stakes),
            'factors': factors
        }
```

### Step 2 - Mode Selection

Select appropriate cognitive mode based on analysis:

**Mode Selector:**
```python
class ModeSelector:
    def __init__(self):
        self.modes = {
            'fast_intuitive': FastIntuitiveMode(),
            'slow_analytical': SlowAnalyticalMode(),
            'creative_divergent': CreativeDivergentMode(),
            'critical_evaluative': CriticalEvaluativeMode(),
            'collaborative_synthetic': CollaborativeSyntheticMode()
        }
    
    def select_mode(self, analysis):
        """Select cognitive mode based on task analysis"""
        
        complexity = analysis['complexity']['score']
        urgency = analysis['urgency']['score']
        stakes = analysis['stakes']['score']
        
        # Decision tree for mode selection
        
        # High stakes always requires analytical mode
        if stakes > 0.7:
            if complexity > 0.6:
                return self.modes['slow_analytical']
            else:
                return self.modes['critical_evaluative']
        
        # High urgency favors fast mode
        if urgency > 0.8:
            if stakes < 0.4:
                return self.modes['fast_intuitive']
            else:
                # High urgency + moderate stakes = critical evaluative
                return self.modes['critical_evaluative']
        
        # High complexity requires analytical mode
        if complexity > 0.7:
            return self.modes['slow_analytical']
        
        # Moderate complexity + time available = creative mode
        if complexity > 0.4 and urgency < 0.5:
            return self.modes['creative_divergent']
        
        # Default to fast intuitive for simple tasks
        if complexity < 0.3:
            return self.modes['fast_intuitive']
        
        # Collaborative for multi-part tasks
        if analysis['context'].get('multi_part', False):
            return self.modes['collaborative_synthetic']
        
        # Default fallback
        return self.modes['slow_analytical']
```

### Step 3 - Mode Execution

Execute task using selected cognitive mode:

**Fast Intuitive Mode:**
```python
class FastIntuitiveMode:
    def __init__(self):
        self.name = "Fast/Intuitive (System 1)"
        self.characteristics = {
            'speed': 'fast',
            'accuracy': 'moderate',
            'effort': 'low',
            'best_for': ['pattern_matching', 'routine_tasks', 'quick_responses']
        }
    
    def execute(self, task):
        """Execute task using fast, intuitive processing"""
        
        # Use pattern matching
        pattern_result = self.pattern_match(task)
        if pattern_result.confidence > 0.8:
            return pattern_result
        
        # Use heuristics
        heuristic_result = self.apply_heuristics(task)
        if heuristic_result.confidence > 0.7:
            return heuristic_result
        
        # Fall back to analytical if confidence too low
        if pattern_result.confidence < 0.5:
            return self.escalate_to_analytical(task)
        
        # Return best result with confidence
        return max([pattern_result, heuristic_result], 
                   key=lambda x: x.confidence)
    
    def pattern_match(self, task):
        """Match task against known patterns"""
        
        # Retrieve similar past tasks
        similar = Memory.search_similar(task, k=5)
        
        if similar:
            # Use most similar successful solution
            best = max(similar, key=lambda x: x.similarity * x.success_rate)
            return Result(
                value=best.solution,
                confidence=best.similarity,
                method='pattern_match'
            )
        
        return Result(value=None, confidence=0.0, method='pattern_match')
```

**Slow Analytical Mode:**
```python
class SlowAnalyticalMode:
    def __init__(self):
        self.name = "Slow/Analytical (System 2)"
        self.characteristics = {
            'speed': 'slow',
            'accuracy': 'high',
            'effort': 'high',
            'best_for': ['complex_problems', 'novel_situations', 'high_stakes']
        }
    
    def execute(self, task):
        """Execute task using slow, analytical processing"""
        
        # Decompose task
        subtasks = self.decompose(task)
        
        # Plan approach
        plan = self.create_plan(subtasks)
        
        # Execute each step with verification
        results = []
        for step in plan.steps:
            result = self.execute_step(step)
            
            # Verify step result
            if not self.verify(result):
                result = self.revise_step(step, result)
            
            results.append(result)
        
        # Synthesize final result
        final = self.synthesize(results)
        
        # Final verification
        if not self.verify(final):
            final = self.revise(task, results)
        
        return Result(
            value=final,
            confidence=self.calculate_confidence(results),
            method='analytical',
            trace=self.execution_trace
        )
    
    def decompose(self, task):
        """Decompose task into subtasks"""
        
        # Identify components
        components = []
        
        # Parse task structure
        if isinstance(task, dict) and 'steps' in task:
            components = task['steps']
        else:
            # Use LLM to decompose
            decomposition = llm.generate(
                prompt=f"Decompose this task into steps: {task}",
                mode='analytical'
            )
            components = decomposition.steps
        
        return components
    
    def create_plan(self, subtasks):
        """Create execution plan for subtasks"""
        
        # Determine dependencies
        dependencies = self.analyze_dependencies(subtasks)
        
        # Create ordered plan
        plan = Plan()
        
        for subtask in self.topological_sort(subtasks, dependencies):
            plan.add_step(subtask)
        
        return plan
```

**Creative Divergent Mode:**
```python
class CreativeDivergentMode:
    def __init__(self):
        self.name = "Creative/Divergent"
        self.characteristics = {
            'speed': 'moderate',
            'accuracy': 'variable',
            'effort': 'moderate',
            'best_for': ['brainstorming', 'novel_solutions', 'exploration']
        }
    
    def execute(self, task):
        """Execute task using creative, divergent thinking"""
        
        # Generate multiple diverse solutions
        solutions = self.generate_diverse_solutions(task, n=10)
        
        # Evaluate each solution
        evaluated = []
        for solution in solutions:
            score = self.evaluate_creativity(solution)
            feasibility = self.evaluate_feasibility(solution)
            evaluated.append({
                'solution': solution,
                'creativity': score,
                'feasibility': feasibility,
                'combined': score * feasibility
            })
        
        # Return top solutions
        evaluated.sort(key=lambda x: x['combined'], reverse=True)
        
        return Result(
            value=[e['solution'] for e in evaluated[:3]],
            confidence=evaluated[0]['combined'],
            method='creative_divergent',
            alternatives=evaluated[1:5]
        )
    
    def generate_diverse_solutions(self, task, n=10):
        """Generate diverse solutions using multiple approaches"""
        
        solutions = []
        
        # Approach 1: Analogical reasoning
        analogies = self.find_analogies(task)
        for analogy in analogies[:3]:
            solutions.append(self.apply_analogy(task, analogy))
        
        # Approach 2: Constraint relaxation
        relaxed = self.relax_constraints(task)
        solutions.extend(self.solve_relaxed(relaxed, n=3))
        
        # Approach 3: Random combination
        solutions.extend(self.random_combination(task, n=4))
        
        return solutions[:n]
```

### Step 4 - Mode Switching

Handle transitions between modes:

**Mode Switcher:**
```python
class ModeSwitcher:
    def __init__(self):
        self.current_mode = None
        self.switch_history = []
        
    def switch_mode(self, new_mode, reason):
        """Switch to new cognitive mode"""
        
        # Log switch
        self.switch_history.append({
            'from': self.current_mode.name if self.current_mode else None,
            'to': new_mode.name,
            'reason': reason,
            'timestamp': time.time()
        })
        
        # Perform switch
        old_mode = self.current_mode
        self.current_mode = new_mode
        
        # Handle transition
        if old_mode:
            old_mode.on_exit()
        new_mode.on_enter()
        
        return self.current_mode
    
    def should_switch(self, current_analysis, current_result):
        """Determine if mode switch is needed"""
        
        # Switch if confidence too low
        if current_result.confidence < 0.5:
            return True, 'low_confidence'
        
        # Switch if stakes increased
        if current_analysis['stakes']['score'] > 0.8:
            if self.current_mode.name != 'Slow/Analytical':
                return True, 'stakes_increased'
        
        # Switch if complexity discovered
        if current_analysis['complexity']['score'] > 0.7:
            if self.current_mode.name == 'Fast/Intuitive':
                return True, 'complexity_discovered'
        
        return False, None
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              COGNITIVE MODE CONTROLLER                           ║
╚══════════════════════════════════════════════════════════════════╝

TASK ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task:           [description]

Complexity:     [X.XX] ([LOW/MEDIUM/HIGH])
  • Steps:              [N]
  • Dependencies:       [N]
  • Ambiguity:          [X.XX]
  • Domain Knowledge:   [level]
  • Novelty:            [level]

Urgency:        [X.XX] ([LOW/MEDIUM/HIGH])
  • Deadline:           [time/None]
  • Urgent Keywords:    [Yes/No]
  • Delay Consequences: [level]
  • Interactive:        [Yes/No]

Stakes:         [X.XX] ([LOW/MEDIUM/HIGH/CRITICAL])
  • Safety Critical:    [Yes/No]
  • Financial Impact:   [level]
  • Reputation Risk:    [level]
  • Irreversible:       [Yes/No]
  • Legal Compliance:   [Yes/No]

MODE SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected Mode:  [mode name]
Reasoning:      [why this mode was selected]

Mode Characteristics:
• Speed:        [fast/moderate/slow]
• Accuracy:     [low/moderate/high]
• Effort:       [low/moderate/high]
• Best For:     [use cases]

[If mode switch occurred]
MODE SWITCH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From:           [previous mode]
To:             [current mode]
Reason:         [why switch occurred]
Timestamp:      [time]
```

## Examples

### Example 1: Simple Quick Question

**CMC Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              COGNITIVE MODE CONTROLLER                           ║
╚══════════════════════════════════════════════════════════════════╝

TASK ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task:           "What's the capital of France?"

Complexity:     0.05 (LOW)
  • Steps:              1
  • Dependencies:       0
  • Ambiguity:          0.00
  • Domain Knowledge:   high (factual)
  • Novelty:            none (common question)

Urgency:        0.90 (HIGH)
  • Deadline:           None
  • Urgent Keywords:    No
  • Delay Consequences: none
  • Interactive:        Yes ⚡

Stakes:         0.00 (LOW)
  • Safety Critical:    No
  • Financial Impact:   none
  • Reputation Risk:    none
  • Irreversible:       No
  • Legal Compliance:   No

MODE SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected Mode:  Fast/Intuitive (System 1) ⚡
Reasoning:      Low complexity + high urgency (interactive) + 
                very low stakes = Fast mode optimal

Mode Characteristics:
• Speed:        fast
• Accuracy:     moderate (sufficient for factual query)
• Effort:       low
• Best For:     pattern matching, routine tasks, quick responses

EXECUTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method:         Pattern match
Confidence:     0.99
Response Time:  12ms

Result: "Paris"
```

### Example 2: Complex High-Stakes Decision

**CMC Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              COGNITIVE MODE CONTROLLER                           ║
╚══════════════════════════════════════════════════════════════════╝

TASK ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task:           "Should we merge with Company X? Analyze risks, 
                 benefits, and provide recommendation."

Complexity:     0.85 (HIGH)
  • Steps:              12
  • Dependencies:       8
  • Ambiguity:          0.70
  • Domain Knowledge:   high (M&A expertise)
  • Novelty:            high (unique situation)

Urgency:        0.20 (LOW)
  • Deadline:           2 weeks
  • Urgent Keywords:    No
  • Delay Consequences: low
  • Interactive:        No

Stakes:         0.95 (CRITICAL)
  • Safety Critical:    No
  • Financial Impact:   very high ($100M+)
  • Reputation Risk:    high
  • Irreversible:       Yes ⚠️
  • Legal Compliance:   Yes

MODE SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected Mode:  Slow/Analytical (System 2) 🔬
Reasoning:      Very high complexity + very high stakes + 
                irreversible decision + time available = 
                Analytical mode required

Mode Characteristics:
• Speed:        slow
• Accuracy:     high
• Effort:       high
• Best For:     complex problems, novel situations, high stakes

EXECUTION PLAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1:  Gather financial data on Company X
Step 2:  Analyze market position and competition
Step 3:  Assess cultural fit
Step 4:  Evaluate technology integration
Step 5:  Calculate synergies
Step 6:  Identify risks (financial, operational, legal)
Step 7:  Model scenarios (best, expected, worst case)
Step 8:  Compare with alternatives
Step 9:  Consult stakeholders
Step 10: Synthesize findings
Step 11: Formulate recommendation
Step 12: Prepare presentation

Estimated Time: 3-5 days
Confidence Target: 0.85+
```

## Error Handling

### Mode Selection Failure

**Condition:** Cannot determine appropriate mode

**Response:**
1. Default to analytical mode (safest)
2. Log ambiguity
3. Request more context from user
4. Escalate if critical

### Mode Switch Loop

**Condition:** Rapid switching between modes

**Response:**
1. Detect oscillation pattern
2. Lock mode for minimum duration
3. Log for analysis
4. Consider hybrid mode

### Execution Timeout

**Condition:** Mode execution exceeds time limit

**Response:**
1. Interrupt current execution
2. Return partial results
3. Switch to faster mode
4. Log timeout

## Performance Characteristics

- **Mode Selection:** <10ms
- **Fast Mode Execution:** 10-100ms
- **Analytical Mode:** 1-60s (task dependent)
- **Mode Switching:** <5ms overhead

## Integration Points

- **Ethical Governor:** Mode affects safety scrutiny
- **BFT Consensus:** Analytical mode for critical decisions
- **WORM Archive:** Log mode decisions
- **Intrinsic Goal Generation:** Mode affects goal pursuit

## Configuration

```yaml
cognitive_mode_controller:
  thresholds:
    complexity:
      low: 0.3
      medium: 0.6
      high: 0.8
    urgency:
      low: 0.3
      medium: 0.6
      high: 0.8
    stakes:
      low: 0.2
      medium: 0.5
      high: 0.7
      critical: 0.9
  
  modes:
    fast_intuitive:
      enabled: true
      min_confidence: 0.7
    slow_analytical:
      enabled: true
      max_depth: 10
    creative_divergent:
      enabled: true
      diversity_weight: 0.5
    critical_evaluative:
      enabled: true
      scrutiny_level: high
    collaborative_synthetic:
      enabled: true
      max_agents: 5
```
