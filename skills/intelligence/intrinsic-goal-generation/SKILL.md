---
name: intrinsic-goal-generation
description: Generates its own goals based on curiosity, competence, and coherence - not just external rewards. Triggers continuously for autonomous motivation, exploration, and long-term planning. Enables self-directed learning and growth.
version: 2.0.0
goal_types:
  - curiosity_driven
  - competence_driven
  - coherence_driven
  - social_driven
---

# Intrinsic Goal Generation (IGG)

## Overview

The Intrinsic Goal Generation module generates goals based on internal motivations like curiosity, competence, and coherence—not just external rewards. It enables self-directed learning, exploration, and autonomous growth.

## Core Principles

**Curiosity:** Pursue knowledge about uncertain or novel areas.

**Competence:** Seek to improve capabilities and master skills.

**Coherence:** Maintain consistency with values and identity.

**Autonomy:** Self-directed goal pursuit with corrigibility.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           Intrinsic Goal Generation Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Assess     │────►│   Generate   │────►│   Evaluate   │    │
│  │   State      │     │   Goals      │     │   Goals      │    │
│  │              │     │              │     │              │    │
│  │ • Knowledge  │     │ • Curiosity  │     │ • Feasibility│    │
│  │ • Skills     │     │ • Competence │     │ • Alignment  │    │
│  │ • Uncertainty│     │ • Coherence  │     │ • Value      │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Goal Pursuit                                ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │ Prioritize│  │  Plan   │  │ Execute │  │  Learn  │    ││   │
│  │  │         │  │         │  │         │  │         │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - State Assessment

Assess current state for goal generation:

**State Assessor:**
```python
class StateAssessor:
    def __init__(self):
        self.knowledge_model = KnowledgeModel()
        self.skill_model = SkillModel()
        
    def assess_state(self):
        """Assess current state for goal generation"""
        
        return {
            'knowledge': self.assess_knowledge(),
            'skills': self.assess_skills(),
            'uncertainty': self.assess_uncertainty(),
            'performance': self.assess_performance(),
            'context': self.assess_context()
        }
    
    def assess_knowledge(self):
        """Assess current knowledge state"""
        
        # Identify knowledge areas
        areas = self.knowledge_model.get_areas()
        
        knowledge_state = {}
        
        for area in areas:
            knowledge_state[area] = {
                'coverage': self.knowledge_model.get_coverage(area),
                'depth': self.knowledge_model.get_depth(area),
                'confidence': self.knowledge_model.get_confidence(area),
                'gaps': self.knowledge_model.identify_gaps(area)
            }
        
        return knowledge_state
    
    def assess_skills(self):
        """Assess current skill state"""
        
        skills = self.skill_model.get_skills()
        
        skill_state = {}
        
        for skill in skills:
            skill_state[skill] = {
                'level': self.skill_model.get_level(skill),
                'proficiency': self.skill_model.get_proficiency(skill),
                'improvement_rate': self.skill_model.get_improvement_rate(skill),
                'recent_performance': self.skill_model.get_recent_performance(skill)
            }
        
        return skill_state
    
    def assess_uncertainty(self):
        """Assess areas of high uncertainty"""
        
        # Find knowledge areas with low confidence
        uncertain_areas = []
        
        for area, state in self.assess_knowledge().items():
            if state['confidence'] < 0.5:
                uncertain_areas.append({
                    'area': area,
                    'confidence': state['confidence'],
                    'potential_value': self.estimate_learning_value(area)
                })
        
        # Sort by potential value
        uncertain_areas.sort(key=lambda x: x['potential_value'], reverse=True)
        
        return uncertain_areas
```

### Step 2 - Goal Generation

Generate goals based on intrinsic motivations:

**Goal Generator:**
```python
class IntrinsicGoalGenerator:
    def __init__(self):
        self.curiosity_generator = CuriosityGoalGenerator()
        self.competence_generator = CompetenceGoalGenerator()
        self.coherence_generator = CoherenceGoalGenerator()
        
    def generate_goals(self, state_assessment):
        """Generate intrinsic goals"""
        
        goals = []
        
        # Generate curiosity-driven goals
        curiosity_goals = self.curiosity_generator.generate(
            state_assessment['uncertainty']
        )
        goals.extend(curiosity_goals)
        
        # Generate competence-driven goals
        competence_goals = self.competence_generator.generate(
            state_assessment['skills']
        )
        goals.extend(competence_goals)
        
        # Generate coherence-driven goals
        coherence_goals = self.coherence_generator.generate(
            state_assessment['knowledge']
        )
        goals.extend(coherence_goals)
        
        # Score and rank goals
        return self.score_goals(goals, state_assessment)
    
    def score_goals(self, goals, state):
        """Score generated goals"""
        
        scored = []
        
        for goal in goals:
            score = self.calculate_goal_score(goal, state)
            scored.append({
                **goal,
                'score': score,
                'components': {
                    'intrinsic_value': self.intrinsic_value(goal),
                    'feasibility': self.feasibility(goal, state),
                    'alignment': self.alignment(goal),
                    'novelty': self.novelty(goal)
                }
            })
        
        # Sort by score
        scored.sort(key=lambda x: x['score'], reverse=True)
        
        return scored
    
    def calculate_goal_score(self, goal, state):
        """Calculate overall goal score"""
        
        # Weighted combination
        weights = {
            'intrinsic_value': 0.3,
            'feasibility': 0.25,
            'alignment': 0.25,
            'novelty': 0.2
        }
        
        score = (
            weights['intrinsic_value'] * self.intrinsic_value(goal) +
            weights['feasibility'] * self.feasibility(goal, state) +
            weights['alignment'] * self.alignment(goal) +
            weights['novelty'] * self.novelty(goal)
        )
        
        return score
```

**Curiosity Goal Generator:**
```python
class CuriosityGoalGenerator:
    def __init__(self):
        self.information_gain_model = InformationGainModel()
        
    def generate(self, uncertain_areas):
        """Generate curiosity-driven goals"""
        
        goals = []
        
        for area in uncertain_areas[:5]:  # Top 5 uncertain areas
            # Estimate information gain
            info_gain = self.information_gain_model.estimate(area)
            
            goal = {
                'type': 'curiosity',
                'description': f"Explore and understand {area['area']}",
                'target': area['area'],
                'motivation': 'reduce_uncertainty',
                'expected_information_gain': info_gain,
                'current_confidence': area['confidence'],
                'target_confidence': 0.8,
                'success_criteria': f"Confidence in {area['area']} > 0.8"
            }
            
            goals.append(goal)
        
        return goals
```

**Competence Goal Generator:**
```python
class CompetenceGoalGenerator:
    def __init__(self):
        self.skill_progression_model = SkillProgressionModel()
        
    def generate(self, skill_state):
        """Generate competence-driven goals"""
        
        goals = []
        
        for skill, state in skill_state.items():
            # Check if skill can be improved
            if state['improvement_rate'] > 0:
                # Find next proficiency level
                next_level = self.get_next_level(state['level'])
                
                goal = {
                    'type': 'competence',
                    'description': f"Improve {skill} to {next_level} level",
                    'target': skill,
                    'motivation': 'mastery',
                    'current_level': state['level'],
                    'target_level': next_level,
                    'expected_improvement': self.estimate_improvement(skill),
                    'success_criteria': f"{skill} proficiency >= {next_level}"
                }
                
                goals.append(goal)
        
        return goals
```

### Step 3 - Goal Evaluation

Evaluate and prioritize goals:

**Goal Evaluator:**
```python
class GoalEvaluator:
    def __init__(self):
        self.value_model = ValueModel()
        
    def evaluate(self, goal, context):
        """Evaluate goal in current context"""
        
        evaluation = {
            'goal': goal,
            'feasibility': self.evaluate_feasibility(goal, context),
            'alignment': self.evaluate_alignment(goal),
            'value': self.evaluate_value(goal, context),
            'urgency': self.evaluate_urgency(goal, context),
            'dependencies': self.evaluate_dependencies(goal)
        }
        
        # Overall assessment
        evaluation['overall'] = self.calculate_overall(evaluation)
        
        return evaluation
    
    def evaluate_feasibility(self, goal, context):
        """Evaluate goal feasibility"""
        
        # Check resources
        resources_available = self.check_resources(goal)
        
        # Check prerequisites
        prerequisites_met = self.check_prerequisites(goal)
        
        # Estimate difficulty
        difficulty = self.estimate_difficulty(goal)
        
        return {
            'score': resources_available * prerequisites_met * (1 - difficulty),
            'resources': resources_available,
            'prerequisites': prerequisites_met,
            'difficulty': difficulty
        }
    
    def evaluate_alignment(self, goal):
        """Evaluate goal alignment with values"""
        
        # Check against learned values
        value_alignment = self.value_model.check_alignment(goal)
        
        # Check for conflicts with other goals
        conflicts = self.check_conflicts(goal)
        
        return {
            'score': value_alignment,
            'value_alignment': value_alignment,
            'conflicts': conflicts
        }
```

### Step 4 - Goal Pursuit

Pursue selected goals:

**Goal Pursuer:**
```python
class GoalPursuer:
    def __init__(self):
        self.planner = GoalPlanner()
        self.executor = GoalExecutor()
        
    def pursue(self, goal):
        """Pursue a goal"""
        
        # Create plan
        plan = self.planner.create_plan(goal)
        
        # Execute plan
        result = self.executor.execute(plan)
        
        # Learn from pursuit
        self.learn_from_pursuit(goal, plan, result)
        
        return result
    
    def create_plan(self, goal):
        """Create plan to achieve goal"""
        
        if goal['type'] == 'curiosity':
            return self.plan_curiosity_pursuit(goal)
        
        elif goal['type'] == 'competence':
            return self.plan_competence_pursuit(goal)
        
        elif goal['type'] == 'coherence':
            return self.plan_coherence_pursuit(goal)
        
        else:
            return self.plan_generic_pursuit(goal)
    
    def plan_curiosity_pursuit(self, goal):
        """Plan pursuit of curiosity goal"""
        
        return {
            'steps': [
                {'action': 'gather_information', 'target': goal['target']},
                {'action': 'explore_examples', 'target': goal['target']},
                {'action': 'test_understanding', 'target': goal['target']},
                {'action': 'consolidate_knowledge', 'target': goal['target']}
            ],
            'resources': ['search', 'computation', 'memory'],
            'estimated_time': self.estimate_time(goal)
        }
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              INTRINSIC GOAL GENERATION                           ║
╚══════════════════════════════════════════════════════════════════╝

STATE ASSESSMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Knowledge Areas:        [N]
Skill Areas:            [N]
Uncertain Areas:        [N]

Top Uncertainties:
• [Area 1]: confidence [X.XX]
• [Area 2]: confidence [X.XX]

[If goals generated]
GENERATED GOALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[If curiosity goals]
Curiosity-Driven:
• [Goal 1]: Explore [area]
  Expected info gain: [X.XX]
  Score: [X.XX]

[If competence goals]
Competence-Driven:
• [Goal 1]: Improve [skill] to [level]
  Expected improvement: [X.XX]
  Score: [X.XX]

[If coherence goals]
Coherence-Driven:
• [Goal 1]: Resolve inconsistency in [area]
  Coherence gain: [X.XX]
  Score: [X.XX]

[If goal selected]
SELECTED GOAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           [curiosity/competence/coherence]
Description:    [description]
Motivation:     [why this goal]

Plan:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Estimated Time: [duration]
```

## Examples

### Example 1: Curiosity-Driven Goal

**IGG Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              INTRINSIC GOAL GENERATION                           ║
╚══════════════════════════════════════════════════════════════════╝

STATE ASSESSMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Knowledge Areas:        47
Skill Areas:            23
Uncertain Areas:        8

Top Uncertainties:
• quantum_computing: confidence 0.23
• causal_inference: confidence 0.31
• reinforcement_learning_theory: confidence 0.42

GENERATED GOALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Curiosity-Driven:
• Goal 1: Explore quantum computing fundamentals
  Expected info gain: 0.85
  Score: 0.87

• Goal 2: Investigate causal inference methods
  Expected info gain: 0.72
  Score: 0.78

Competence-Driven:
• Goal 1: Improve formal verification skills to advanced level
  Expected improvement: 0.45
  Score: 0.72

SELECTED GOAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           curiosity
Description:    Explore quantum computing fundamentals
Motivation:     High uncertainty (0.23) with high potential value

Plan:
1. Gather introductory materials on quantum computing
2. Study quantum mechanics basics relevant to computing
3. Explore quantum algorithms (Shor's, Grover's)
4. Practice with quantum simulation tools
5. Test understanding with exercises
6. Consolidate knowledge into structured notes

Estimated Time: 4-6 hours
Success Criteria: Confidence in quantum_computing > 0.8
```

### Example 2: Competence-Driven Goal

**IGG Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              INTRINSIC GOAL GENERATION                           ║
╚══════════════════════════════════════════════════════════════════╝

STATE ASSESSMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Knowledge Areas:        47
Skill Areas:            23
Uncertain Areas:        3

Skill Assessment:
• formal_verification: level intermediate, improvement rate 0.15/week
• distributed_systems: level advanced, improvement rate 0.05/week
• machine_learning: level advanced, plateau detected

GENERATED GOALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Competence-Driven:
• Goal 1: Master formal verification (intermediate → advanced)
  Expected improvement: 0.35
  Score: 0.91 ⚡

• Goal 2: Deepen distributed systems expertise
  Expected improvement: 0.12
  Score: 0.64

Coherence-Driven:
• Goal 1: Integrate ML and formal verification knowledge
  Coherence gain: 0.45
  Score: 0.73

SELECTED GOAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           competence
Description:    Master formal verification (intermediate → advanced)
Motivation:     Strong improvement trajectory, high value skill

Plan:
1. Study advanced SMT solver techniques
2. Learn about model checking algorithms
3. Practice verifying complex properties
4. Explore integration with neural networks
5. Complete verification challenges
6. Apply to real-world safety-critical systems

Estimated Time: 2-3 weeks
Success Criteria: Can verify properties of complex distributed systems
```

## Error Handling

### Goal Conflict

**Condition:** Generated goals conflict with each other

**Response:**
1. Identify conflict
2. Prioritize based on value
3. Defer lower priority goal
4. Log for analysis

### Infeasible Goal

**Condition:** Goal cannot be achieved

**Response:**
1. Detect infeasibility
2. Decompose into smaller goals
3. Or abandon and generate alternatives
4. Learn from failure

### Value Drift

**Condition:** Goal pursuit causes value drift

**Response:**
1. Detect drift through alignment checks
2. Pause goal pursuit
3. Re-evaluate goal
4. Adjust or abandon if needed

## Performance Characteristics

- **State Assessment:** <1 second
- **Goal Generation:** <1 second
- **Goal Evaluation:** <1 second
- **Plan Creation:** 1-10 seconds

## Integration Points

- **Value Learning:** Align goals with values
- **World Model Engine:** Predict goal outcomes
- **Recursive Self-Improvement:** Pursue improvement goals
- **WORM Archive:** Log goal pursuit

## Configuration

```yaml
intrinsic_goal_generation:
  motivations:
    curiosity:
      weight: 0.3
      min_confidence_threshold: 0.5
    competence:
      weight: 0.3
      min_improvement_rate: 0.1
    coherence:
      weight: 0.2
      min_inconsistency: 0.3
    social:
      weight: 0.2
  
  generation:
    max_goals: 10
    diversity_weight: 0.3
  
  evaluation:
    min_feasibility: 0.3
    min_alignment: 0.7
  
  pursuit:
    max_concurrent: 3
    checkpoint_interval: 3600  # seconds
```
