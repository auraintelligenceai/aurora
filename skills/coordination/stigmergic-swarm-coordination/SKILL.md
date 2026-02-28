---
name: stigmergic-swarm-coordination
description: Coordinates multi-agent swarms using indirect communication through environmental markers (pheromones). Triggers for ANY multi-agent task, distributed problem solving, or when agents need to coordinate without direct communication. Enables emergent collective intelligence.
version: 2.0.0
pheromone_types:
  - attractant
  - repellent
  - neutral
  - trail
  - alarm
---

# Stigmergic Swarm Coordination (SSC)

## Overview

The Stigmergic Swarm Coordination module enables multi-agent coordination through indirect communication via environmental markers (pheromones). Agents deposit and sense pheromones in a shared environment, enabling emergent collective behavior without direct agent-to-agent communication.

## Core Principles

**Indirect Communication:** Agents communicate through the environment, not directly.

**Emergent Behavior:** Complex collective behavior emerges from simple local rules.

**Scalability:** System scales to thousands of agents without communication bottlenecks.

**Robustness:** System continues functioning even with agent failures.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           Stigmergic Swarm Coordination Architecture             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Shared Environment                      │   │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐          │   │
│  │  │ A+  │  │     │  │  T  │  │     │  │ R-  │          │   │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘          │   │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐          │   │
│  │  │     │  │ A+  │  │     │  │  T  │  │     │          │   │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘          │   │
│  │                                                         │   │
│  │  A+ = Attractant    R- = Repellent    T = Trail       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▲                                   │
│                              │                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ Agent 1 │  │ Agent 2 │  │ Agent 3 │  │ Agent N │           │
│  │  🐜     │  │  🐜     │  │  🐜     │  │  🐜     │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       │            │            │            │                  │
│       └────────────┴────────────┴────────────┘                  │
│                        Deposit/Sense                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Pheromone Management

Manage pheromone deposition, sensing, and evaporation:

**Pheromone Types:**
```python
PHEROMONE_TYPES = {
    'attractant': {
        'symbol': 'A+',
        'effect': 'attract',
        'strength': 1.0,
        'decay_rate': 0.01,
        'color': 'green'
    },
    'repellent': {
        'symbol': 'R-',
        'effect': 'repel',
        'strength': -1.0,
        'decay_rate': 0.02,
        'color': 'red'
    },
    'trail': {
        'symbol': 'T',
        'effect': 'follow',
        'strength': 0.5,
        'decay_rate': 0.05,
        'color': 'blue'
    },
    'alarm': {
        'symbol': '!',
        'effect': 'alert',
        'strength': 2.0,
        'decay_rate': 0.1,
        'color': 'orange'
    },
    'neutral': {
        'symbol': 'N',
        'effect': 'none',
        'strength': 0.0,
        'decay_rate': 0.0,
        'color': 'gray'
    }
}
```

**Pheromone Operations:**
```python
class PheromoneEnvironment:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.grid = defaultdict(lambda: defaultdict(float))
        
    def deposit(self, x, y, pheromone_type, amount=1.0):
        """Deposit pheromone at location"""
        
        pheromone = PHEROMONE_TYPES[pheromone_type]
        
        # Add to grid
        self.grid[(x, y)][pheromone_type] += amount * pheromone['strength']
        
        # Diffuse to neighbors
        self.diffuse(x, y, pheromone_type, amount * 0.3)
    
    def sense(self, x, y, radius=3):
        """Sense pheromones in radius"""
        
        sensed = defaultdict(float)
        
        for dx in range(-radius, radius + 1):
            for dy in range(-radius, radius + 1):
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    distance = math.sqrt(dx**2 + dy**2)
                    strength = 1.0 / (1.0 + distance)
                    
                    for ptype, amount in self.grid[(nx, ny)].items():
                        sensed[ptype] += amount * strength
        
        return sensed
    
    def evaporate(self):
        """Apply evaporation to all pheromones"""
        
        for pos in list(self.grid.keys()):
            for ptype in list(self.grid[pos].keys()):
                decay = PHEROMONE_TYPES[ptype]['decay_rate']
                self.grid[pos][ptype] *= (1 - decay)
                
                # Remove if too weak
                if self.grid[pos][ptype] < 0.01:
                    del self.grid[pos][ptype]
            
            # Remove empty positions
            if not self.grid[pos]:
                del self.grid[pos]
```

### Step 2 - Agent Behavior

Implement agent decision-making based on pheromones:

**Agent Class:**
```python
class SwarmAgent:
    def __init__(self, agent_id, x, y, environment):
        self.id = agent_id
        self.x = x
        self.y = y
        self.env = environment
        self.state = 'exploring'
        self.carrying = None
        
    def step(self):
        """Execute one step of agent behavior"""
        
        # Sense environment
        pheromones = self.env.sense(self.x, self.y)
        
        # Decide action based on state and pheromones
        if self.state == 'exploring':
            self.explore(pheromones)
        elif self.state == 'foraging':
            self.forage(pheromones)
        elif self.state == 'returning':
            self.return_home(pheromones)
        elif self.state == 'avoiding':
            self.avoid(pheromones)
        
        # Deposit appropriate pheromones
        self.deposit_pheromones()
    
    def explore(self, pheromones):
        """Explore environment following attractants"""
        
        # Check for attractants
        if pheromones['attractant'] > 0.5:
            # Move toward attractant
            direction = self.gradient_toward('attractant')
            self.move(direction)
            self.state = 'foraging'
        else:
            # Random walk
            self.move_random()
            
            # Deposit exploration trail
            self.env.deposit(self.x, self.y, 'trail', 0.1)
    
    def forage(self, pheromones):
        """Forage at attractant source"""
        
        # Check if resource found
        if self.found_resource():
            self.carrying = self.collect_resource()
            self.state = 'returning'
            
            # Deposit strong attractant
            self.env.deposit(self.x, self.y, 'attractant', 2.0)
        
        # Check for alarm
        elif pheromones['alarm'] > 1.0:
            self.state = 'avoiding'
        
        else:
            # Continue following attractant gradient
            direction = self.gradient_toward('attractant')
            self.move(direction)
    
    def return_home(self, pheromones):
        """Return home with resource"""
        
        # Follow trail back
        if pheromones['trail'] > 0.3:
            direction = self.gradient_toward('trail')
            self.move(direction)
        else:
            # Move toward known home location
            direction = self.toward_home()
            self.move(direction)
        
        # Deposit stronger trail
        self.env.deposit(self.x, self.y, 'trail', 0.5)
        
        # Check if home
        if self.at_home():
            self.deposit_resource()
            self.carrying = None
            self.state = 'exploring'
    
    def avoid(self, pheromones):
        """Avoid danger (alarm pheromone)"""
        
        # Move away from alarm
        direction = self.gradient_away('alarm')
        self.move(direction)
        
        # Deposit repellent
        self.env.deposit(self.x, self.y, 'repellent', 0.5)
        
        # Return to exploring after safe
        if pheromones['alarm'] < 0.3:
            self.state = 'exploring'
    
    def gradient_toward(self, pheromone_type):
        """Calculate direction toward pheromone gradient"""
        
        # Sample in all directions
        gradients = {}
        for direction in ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']:
            nx, ny = self.position_in_direction(direction)
            if self.env.in_bounds(nx, ny):
                pheromones = self.env.sense(nx, ny, radius=1)
                gradients[direction] = pheromones.get(pheromone_type, 0)
        
        # Return direction with highest gradient
        return max(gradients, key=gradients.get)
```

### Step 3 - Swarm Coordination

Coordinate multiple agents through pheromones:

**Swarm Controller:**
```python
class SwarmCoordinator:
    def __init__(self, num_agents, environment):
        self.agents = []
        self.env = environment
        
        # Initialize agents
        for i in range(num_agents):
            x = random.randint(0, environment.width - 1)
            y = random.randint(0, environment.height - 1)
            agent = SwarmAgent(i, x, y, environment)
            self.agents.append(agent)
    
    def run_step(self):
        """Execute one step for all agents"""
        
        # Shuffle agent order to prevent bias
        random.shuffle(self.agents)
        
        # Each agent takes a step
        for agent in self.agents:
            agent.step()
        
        # Evaporate pheromones
        self.env.evaporate()
        
        # Collect metrics
        return self.collect_metrics()
    
    def coordinate_task(self, task_type, target_location):
        """Coordinate agents for specific task"""
        
        if task_type == 'foraging':
            # Deposit attractant at target
            self.env.deposit(
                target_location[0], 
                target_location[1], 
                'attractant', 
                5.0
            )
        
        elif task_type == 'defense':
            # Deposit alarm at threat
            self.env.deposit(
                target_location[0],
                target_location[1],
                'alarm',
                10.0
            )
        
        elif task_type == 'exploration':
            # Clear old pheromones
            self.env.clear()
            
            # Agents will explore randomly
            for agent in self.agents:
                agent.state = 'exploring'
```

### Step 4 - Emergent Behavior Detection

Detect and analyze emergent collective behavior:

**Emergence Analyzer:**
```python
class EmergenceAnalyzer:
    def __init__(self):
        self.patterns = []
        
    def analyze(self, environment, agents, history):
        """Analyze for emergent patterns"""
        
        patterns = []
        
        # Check for trail formation
        trail_pattern = self.detect_trails(environment)
        if trail_pattern:
            patterns.append(trail_pattern)
        
        # Check for clustering
        cluster_pattern = self.detect_clustering(agents)
        if cluster_pattern:
            patterns.append(cluster_pattern)
        
        # Check for division of labor
        labor_pattern = self.detect_division_of_labor(agents)
        if labor_pattern:
            patterns.append(labor_pattern)
        
        # Check for synchronization
        sync_pattern = self.detect_synchronization(agents, history)
        if sync_pattern:
            patterns.append(sync_pattern)
        
        return patterns
    
    def detect_trails(self, environment):
        """Detect trail formation in environment"""
        
        # Find connected trail components
        trails = self.find_connected_components(
            environment, 
            pheromone_type='trail'
        )
        
        if len(trails) > 0:
            longest = max(trails, key=len)
            return {
                'type': 'trail_formation',
                'length': len(longest),
                'count': len(trails),
                'description': f'{len(trails)} trails, longest: {len(longest)} cells'
            }
        
        return None
    
    def detect_clustering(self, agents):
        """Detect agent clustering"""
        
        positions = [(a.x, a.y) for a in agents]
        
        # Calculate clustering coefficient
        clusters = self.dbscan_clustering(positions, eps=5, min_pts=3)
        
        if len(clusters) > 0:
            largest = max(clusters, key=len)
            return {
                'type': 'clustering',
                'cluster_count': len(clusters),
                'largest_cluster': len(largest),
                'description': f'{len(clusters)} clusters, largest: {len(largest)} agents'
            }
        
        return None
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║           STIGMERGIC SWARM COORDINATION                          ║
╚══════════════════════════════════════════════════════════════════╝

SWARM STATUS: [EXPLORING/FORAGING/RETURNING/COORDINATING]

ENVIRONMENT STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:           [W] x [H]
Pheromones:     [N] active deposits

Pheromone Distribution:
• Attractant:   [N] deposits, total strength [X.XX]
• Repellent:    [N] deposits, total strength [X.XX]
• Trail:        [N] deposits, total strength [X.XX]
• Alarm:        [N] deposits, total strength [X.XX]

AGENT STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Agents:   [N]

State Distribution:
• Exploring:    [N] agents ([X]%)
• Foraging:     [N] agents ([X]%)
• Returning:    [N] agents ([X]%)
• Avoiding:     [N] agents ([X]%)

[If patterns detected]
EMERGENT PATTERNS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Pattern Type]: [description]
  Strength: [X.XX]
  Agents involved: [N]

COORDINATION METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task Efficiency:    [X.XX]
Resource Collection:[N] items
Trail Usage:        [X.XX]% of agents following trails
Clustering:         [X.XX] (0=random, 1=fully clustered)
```

## Examples

### Example 1: Foraging Task

**Swarm Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║           STIGMERGIC SWARM COORDINATION                          ║
╚══════════════════════════════════════════════════════════════════╝

SWARM STATUS: FORAGING 🍎

ENVIRONMENT STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:           100 x 100
Pheromones:     1,247 active deposits

Pheromone Distribution:
• Attractant:   3 deposits, total strength 15.00
• Repellent:    0 deposits, total strength 0.00
• Trail:        1,244 deposits, total strength 623.00
• Alarm:        0 deposits, total strength 0.00

AGENT STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Agents:   50

State Distribution:
• Exploring:    12 agents (24%)
• Foraging:     18 agents (36%)
• Returning:    20 agents (40%)
• Avoiding:     0 agents (0%)

EMERGENT PATTERNS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Trail Formation: 3 main trails established
  - Trail A: 45 cells (to food source A)
  - Trail B: 38 cells (to food source B)
  - Trail C: 28 cells (to food source C)
  
• Division of Labor: Detected
  - Scouts: 12 agents (finding new sources)
  - Foragers: 18 agents (collecting food)
  - Transporters: 20 agents (returning food)

COORDINATION METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Task Efficiency:    0.87
Resource Collection: 156 items/hour
Trail Usage:        78% of agents following trails
Clustering:         0.65 (moderate clustering around sources)

EFFICIENCY IMPROVEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial (random):   12 items/hour
After 100 steps:    89 items/hour
After 500 steps:    156 items/hour (13x improvement)
```

### Example 2: Defense Response

**Swarm Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║           STIGMERGIC SWARM COORDINATION                          ║
╚══════════════════════════════════════════════════════════════════╝

SWARM STATUS: DEFENSE ALERT 🚨

ENVIRONMENT STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:           100 x 100
Pheromones:     892 active deposits

Pheromone Distribution:
• Attractant:   0 deposits, total strength 0.00
• Repellent:    156 deposits, total strength 78.00
• Trail:        680 deposits, total strength 340.00
• Alarm:        56 deposits, total strength 112.00

THREAT DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Location:       (45, 67)
Alarm Strength: 10.00
Detection:      Agent #23

AGENT STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Agents:   50

State Distribution:
• Exploring:    5 agents (10%)
• Foraging:     0 agents (0%)
• Returning:    0 agents (0%)
• Avoiding:     45 agents (90%) ⚠️

EMERGENT PATTERNS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Avoidance Wave: Propagating from threat
  - 45 agents avoiding threat location
  - Repellent barrier forming
  - Safe perimeter established: 15 cells from threat

• Synchronized Response: Detected
  - Response time: 12 steps
  - 90% of swarm coordinated
  - No agents in danger zone

COORDINATION METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Response Time:      12 steps
Evacuation Rate:    90% (45/50 agents safe)
Barrier Strength:   78.00 (effective)
Threat Containment: ✅ Active
```

## Error Handling

### Pheromone Overflow

**Condition:** Too many pheromones causing saturation

**Response:**
1. Increase evaporation rate temporarily
2. Cap maximum pheromone strength
3. Normalize grid values
4. Log saturation event

### Agent Isolation

**Condition:** Agent cannot sense any pheromones

**Response:**
1. Agent switches to random walk
2. Increase sensing radius
3. Deposit weak attractant to attract others
4. Log isolated agent

### Pattern Collapse

**Condition:** Emergent pattern breaks down

**Response:**
1. Analyze cause (evaporation too fast?)
2. Adjust parameters
3. Re-seed pheromones if needed
4. Monitor recovery

## Performance Characteristics

- **Agent Count:** Scales to 10,000+ agents
- **Step Time:** O(n) where n = number of agents
- **Memory:** O(w×h) for environment grid
- **Communication:** Zero direct agent communication

## Integration Points

- **BFT Consensus:** Distributed decisions via pheromones
- **Self-Healing:** Agents repair via coordination
- **Cognitive Mode Controller:** Swarm intelligence mode
- **WORM Archive:** Log coordination patterns

## Configuration

```yaml
stigmergic_swarm_coordination:
  environment:
    width: 100
    height: 100
    
  pheromones:
    attractant:
      strength: 1.0
      decay_rate: 0.01
    repellent:
      strength: -1.0
      decay_rate: 0.02
    trail:
      strength: 0.5
      decay_rate: 0.05
    alarm:
      strength: 2.0
      decay_rate: 0.1
  
  agents:
    count: 50
    sensing_radius: 3
    movement_speed: 1
```
