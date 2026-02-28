---
name: world-model-engine
description: Builds and maintains an internal model of how the world works to predict consequences of actions. Triggers for planning, prediction, counterfactual reasoning, and understanding complex systems. Enables informed decision-making through simulation.
version: 2.0.0
model_types:
  - causal
  - physical
  - social
  - temporal
---

# World Model Engine (WME)

## Overview

The World Model Engine builds and maintains an internal model of how the world works to predict consequences of actions. It enables informed decision-making through simulation, counterfactual reasoning, and understanding of complex systems.

## Core Principles

**Causal Understanding:** Model cause-and-effect relationships.

**Predictive Power:** Forecast outcomes of actions.

**Counterfactual Reasoning:** Explore "what if" scenarios.

**Uncertainty Awareness:** Quantify prediction uncertainty.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              World Model Engine Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Observe    │────►│   Build      │────►│   Simulate   │    │
│  │   World      │     │   Model      │     │   Future     │    │
│  │              │     │              │     │              │    │
│  │ • Events     │     │ • Entities   │     │ • Predict    │    │
│  │ • States     │     │ • Relations  │     │ • Evaluate   │    │
│  │ • Actions    │     │ • Dynamics   │     │ • Compare    │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Decision Support                            ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │ Predict │  │ Evaluate│  │ Explain │  │ Learn   │    ││   │
│  │  │ Outcomes│  │ Actions │  │ Reasons │  │ Update  │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Model Building

Build internal models from observations:

**Model Builder:**
```python
class WorldModelBuilder:
    def __init__(self):
        self.causal_model = CausalModel()
        self.physical_model = PhysicalModel()
        self.social_model = SocialModel()
        self.temporal_model = TemporalModel()
        
    def build_from_observations(self, observations):
        """Build world model from observations"""
        
        # Extract entities
        entities = self.extract_entities(observations)
        
        # Learn causal relationships
        causal_relations = self.learn_causal_relations(observations)
        
        # Learn physical dynamics
        physical_dynamics = self.learn_physical_dynamics(observations)
        
        # Learn social patterns
        social_patterns = self.learn_social_patterns(observations)
        
        # Learn temporal patterns
        temporal_patterns = self.learn_temporal_patterns(observations)
        
        # Integrate into unified model
        model = UnifiedWorldModel(
            entities=entities,
            causal_relations=causal_relations,
            physical_dynamics=physical_dynamics,
            social_patterns=social_patterns,
            temporal_patterns=temporal_patterns
        )
        
        return model
    
    def extract_entities(self, observations):
        """Extract entities from observations"""
        
        entities = {}
        
        for obs in observations:
            # Identify entities mentioned
            mentioned = self.entity_extractor.extract(obs)
            
            for entity in mentioned:
                entity_id = entity['id']
                
                if entity_id not in entities:
                    entities[entity_id] = {
                        'id': entity_id,
                        'type': entity['type'],
                        'properties': {},
                        'first_seen': obs['timestamp'],
                        'observations': []
                    }
                
                # Update properties
                entities[entity_id]['properties'].update(
                    entity.get('properties', {})
                )
                entities[entity_id]['observations'].append(obs)
                entities[entity_id]['last_seen'] = obs['timestamp']
        
        return entities
    
    def learn_causal_relations(self, observations):
        """Learn causal relationships from observations"""
        
        # Use causal discovery algorithms
        # Example: PC algorithm, GES, etc.
        
        causal_graph = CausalGraph()
        
        # Find potential causes and effects
        for obs in observations:
            if 'action' in obs and 'outcome' in obs:
                # Potential causal link
                causal_graph.add_potential_link(
                    cause=obs['action'],
                    effect=obs['outcome'],
                    context=obs.get('context')
                )
        
        # Validate causal links
        validated = self.validate_causal_links(causal_graph, observations)
        
        return validated
```

### Step 2 - Simulation

Simulate future scenarios:

**Simulator:**
```python
class WorldSimulator:
    def __init__(self, world_model):
        self.model = world_model
        
    def simulate(self, initial_state, actions, steps=10):
        """Simulate future given actions"""
        
        trajectory = [initial_state]
        current_state = initial_state.copy()
        
        for step in range(steps):
            # Apply action if any
            if step < len(actions):
                action = actions[step]
                current_state = self.apply_action(current_state, action)
            
            # Apply dynamics
            current_state = self.apply_dynamics(current_state)
            
            # Add to trajectory
            trajectory.append(current_state.copy())
        
        return trajectory
    
    def apply_action(self, state, action):
        """Apply action to state"""
        
        # Look up action effect in causal model
        effects = self.model.causal_relations.get_effects(action)
        
        new_state = state.copy()
        
        for effect in effects:
            # Apply effect with probability
            if random.random() < effect['probability']:
                new_state = self.apply_effect(new_state, effect)
        
        return new_state
    
    def apply_dynamics(self, state):
        """Apply natural dynamics to state"""
        
        new_state = state.copy()
        
        # Apply physical dynamics
        for entity_id, entity in state.get('entities', {}).items():
            if 'velocity' in entity:
                # Update position
                new_state['entities'][entity_id]['position'] = (
                    entity['position'] + entity['velocity']
                )
        
        # Apply temporal dynamics
        new_state['time'] = state.get('time', 0) + 1
        
        return new_state
    
    def monte_carlo_simulate(self, initial_state, actions, n_samples=100):
        """Run multiple simulations for uncertainty quantification"""
        
        trajectories = []
        
        for _ in range(n_samples):
            trajectory = self.simulate(initial_state, actions)
            trajectories.append(trajectory)
        
        # Aggregate results
        return self.aggregate_trajectories(trajectories)
```

### Step 3 - Prediction

Make predictions about future states:

**Predictor:**
```python
class WorldPredictor:
    def __init__(self, simulator):
        self.simulator = simulator
        
    def predict(self, query, horizon=10):
        """Predict future state or event"""
        
        # Parse query
        target = query.get('target')
        condition = query.get('condition')
        
        # Get current state
        current_state = self.get_current_state()
        
        # Run simulations
        results = self.simulator.monte_carlo_simulate(
            current_state,
            actions=query.get('actions', []),
            n_samples=100
        )
        
        # Extract predictions
        predictions = self.extract_predictions(results, target, horizon)
        
        return {
            'predictions': predictions,
            'confidence': self.calculate_confidence(predictions),
            'uncertainty': self.quantify_uncertainty(predictions),
            'supporting_evidence': self.gather_evidence(predictions)
        }
    
    def predict_consequences(self, action, depth=3):
        """Predict consequences of an action"""
        
        consequences = []
        
        # Direct effects
        direct = self.model.causal_relations.get_effects(action)
        consequences.extend([{'type': 'direct', 'effect': e} for e in direct])
        
        # Indirect effects (chain)
        current_effects = direct
        for level in range(1, depth):
            next_effects = []
            for effect in current_effects:
                secondary = self.model.causal_relations.get_effects(
                    effect['outcome']
                )
                next_effects.extend(secondary)
                consequences.append({
                    'type': f'indirect_{level}',
                    'effect': effect
                })
            current_effects = next_effects
        
        return consequences
```

### Step 4 - Counterfactual Reasoning

Explore "what if" scenarios:

**Counterfactual Reasoner:**
```python
class CounterfactualReasoner:
    def __init__(self, model):
        self.model = model
        
    def what_if(self, actual_history, counterfactual_action):
        """Explore what would have happened with different action"""
        
        # Find point of intervention
        intervention_point = counterfactual_action['time']
        
        # Get state at intervention point
        state_at_intervention = actual_history[intervention_point]
        
        # Simulate with counterfactual action
        counterfactual_trajectory = self.simulator.simulate(
            state_at_intervention,
            actions=[counterfactual_action],
            steps=len(actual_history) - intervention_point
        )
        
        # Compare with actual
        comparison = self.compare_trajectories(
            actual_history[intervention_point:],
            counterfactual_trajectory
        )
        
        return {
            'actual_outcome': actual_history[-1],
            'counterfactual_outcome': counterfactual_trajectory[-1],
            'difference': comparison['difference'],
            'key_divergences': comparison['divergences'],
            'confidence': comparison['confidence']
        }
    
    def compare_trajectories(self, actual, counterfactual):
        """Compare actual and counterfactual trajectories"""
        
        differences = []
        divergences = []
        
        for i, (actual_state, cf_state) in enumerate(zip(actual, counterfactual)):
            # Compare states
            state_diff = self.compare_states(actual_state, cf_state)
            
            if state_diff:
                differences.append({
                    'time': i,
                    'differences': state_diff
                })
                
                # Track major divergences
                if self.is_major_divergence(state_diff):
                    divergences.append({
                        'time': i,
                        'description': state_diff
                    })
        
        return {
            'difference': differences,
            'divergences': divergences,
            'confidence': self.estimate_counterfactual_confidence(differences)
        }
```

### Step 5 - Model Update

Update models based on new observations:

**Model Updater:**
```python
class ModelUpdater:
    def __init__(self, world_model):
        self.model = world_model
        
    def update(self, observation, prediction=None):
        """Update model based on observation"""
        
        # Check if prediction was made
        if prediction:
            # Compare prediction with observation
            error = self.compare_prediction_observation(
                prediction, observation
            )
            
            # Update based on error
            if error > self.error_threshold:
                self.correct_model(observation, prediction, error)
        
        # Add new observation to model
        self.model.add_observation(observation)
        
        # Periodically retrain
        if self.should_retrain():
            self.retrain_model()
    
    def correct_model(self, observation, prediction, error):
        """Correct model based on prediction error"""
        
        # Identify what was wrong
        discrepancy = self.identify_discrepancy(observation, prediction)
        
        # Update causal relations if needed
        if discrepancy['type'] == 'causal':
            self.model.causal_relations.update(
                cause=discrepancy['cause'],
                effect=discrepancy['effect'],
                new_probability=self.estimate_new_probability(
                    discrepancy['cause'],
                    discrepancy['effect'],
                    observation
                )
            )
        
        # Update physical dynamics if needed
        if discrepancy['type'] == 'physical':
            self.model.physical_dynamics.update(
                entity=discrepancy['entity'],
                new_dynamics=self.infer_dynamics(observation)
            )
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              WORLD MODEL ENGINE                                  ║
╚══════════════════════════════════════════════════════════════════╝

MODEL STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entities:       [N]
Causal Links:   [N]
Temporal Rules: [N]
Last Updated:   [timestamp]

[If predicting]
PREDICTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Query:          [what was asked]
Horizon:        [N] steps

Predicted Outcome:
[outcome description]

Confidence:     [X.XX]
Uncertainty:    [X.XX]

Key Factors:
• [Factor 1]: [influence]
• [Factor 2]: [influence]

[If counterfactual]
COUNTERFACTUAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actual Action:  [what was done]
Hypothetical:   [what if different]

Actual Outcome:
[outcome]

Counterfactual Outcome:
[outcome]

Key Differences:
• [Difference 1]
• [Difference 2]

Confidence:     [X.XX]
```

## Examples

### Example 1: Action Consequence Prediction

**WME Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              WORLD MODEL ENGINE                                  ║
╚══════════════════════════════════════════════════════════════════╝

MODEL STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entities:       1,247
Causal Links:   8,932
Temporal Rules: 456
Last Updated:   2024-01-17T14:32:00.000Z

PREDICTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Query:          "What happens if we restart the database server?"
Horizon:        10 steps (5 minutes)

Predicted Outcome:
Database server will be unavailable for 2-3 minutes during restart.
Connected applications will experience connection errors during this 
period. After restart, normal operation resumes.

Confidence:     0.92
Uncertainty:    0.08

Key Factors:
• Database size: 450 GB (affects restart time)
• Connection pool: 200 active connections (will be dropped)
• Replication lag: 0 seconds (no data loss risk)
• Backup status: Recent backup available (recovery option)

Consequence Chain:
1. Restart initiated → Database connections closed
2. Connections closed → Application errors (2-3 min)
3. Database restarts → Service unavailable (1-2 min)
4. Service restored → Connections re-established
5. Normal operation resumes

Alternative Scenarios:
• Best case: 90 seconds downtime (0.15 probability)
• Expected: 150 seconds downtime (0.70 probability)
• Worst case: 300 seconds downtime (0.15 probability)
```

### Example 2: Counterfactual Analysis

**WME Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              WORLD MODEL ENGINE                                  ║
╚══════════════════════════════════════════════════════════════════╝

COUNTERFACTUAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actual Action:  "Deployed configuration change directly to production"
Hypothetical:   "What if we had deployed to staging first?"

Actual Outcome:
Configuration error caused 15-minute service outage affecting 
10,000 users. Rollback required.

Counterfactual Outcome:
Staging deployment would have detected configuration error 
immediately. Error fixed before production. Zero user impact.

Key Differences:
• Detection time: 15 minutes (actual) vs 30 seconds (counterfactual)
• Users affected: 10,000 (actual) vs 0 (counterfactual)
• Recovery time: 15 minutes (actual) vs 0 (counterfactual)
• Cost: $50,000 (actual) vs $0 (counterfactual)

Learning:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern: Configuration changes should always go through staging
Confidence: 0.95
Recommendation: Update deployment policy to require staging validation
```

## Error Handling

### Model Inaccuracy

**Condition:** Model predictions consistently wrong

**Response:**
1. Increase uncertainty estimates
2. Flag for model retraining
3. Fall back to conservative predictions
4. Log for analysis

### Missing Information

**Condition:** Model lacks information for prediction

**Response:**
1. Request additional information
2. Provide range of possibilities
3. Flag high uncertainty
4. Suggest information gathering

### Simulation Failure

**Condition:** Simulation produces impossible states

**Response:**
1. Detect constraint violations
2. Adjust model parameters
3. Re-run simulation
4. Log anomaly

## Performance Characteristics

- **Model Update:** <1 second
- **Prediction:** 10-100ms
- **Simulation:** 100ms-1s per trajectory
- **Counterfactual:** 1-10 seconds

## Integration Points

- **Cognitive Mode Controller:** Inform mode selection
- **Value Learning:** Predict value outcomes
- **Intrinsic Goal Generation:** Predict goal achievement
- **WORM Archive:** Log predictions vs outcomes

## Configuration

```yaml
world_model_engine:
  model:
    max_entities: 10000
    max_causal_links: 100000
    update_frequency: 60  # seconds
  
  simulation:
    default_samples: 100
    max_steps: 100
    uncertainty_quantification: true
  
  prediction:
    min_confidence: 0.7
    max_horizon: 100
  
  learning:
    retrain_threshold: 100  # new observations
    error_threshold: 0.3
```
