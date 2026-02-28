---
name: recursive-self-improvement
description: Improves its own code, architecture, and learning algorithms. Triggers for performance optimization, capability enhancement, or when improvement opportunities are detected. Enables autonomous capability growth with safety constraints.
version: 2.0.0
improvement_types:
  - algorithmic
  - architectural
  - learning
  - efficiency
safety_constraints:
  - capability_preservation
  - goal_alignment
  - corrigibility
---

# Recursive Self-Improvement (RSI)

## Overview

The Recursive Self-Improvement module enables the system to improve its own code, architecture, and learning algorithms. It implements controlled self-modification with safety constraints to ensure improvements preserve capabilities, maintain goal alignment, and remain corrigible.

## Core Principles

**Capability Preservation:** Improvements must not degrade existing capabilities.

**Goal Alignment:** Improvements must maintain or improve alignment with human values.

**Corrigibility:** System must remain open to correction and shutdown.

**Conservative Progress:** Prefer small, verifiable improvements.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           Recursive Self-Improvement Architecture                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Identify   │────►│   Generate   │────►│   Validate   │    │
│  │   Target     │     │   Candidate  │     │   Candidate  │    │
│  │              │     │   Changes    │     │              │    │
│  │ • Bottleneck │     │ • Code       │     │ • Correctness│    │
│  │ • Limitation │     │ • Algorithm  │     │ • Safety     │    │
│  │ • Opportunity│     │ • Structure  │     │ • Performance│    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Deployment Decision                         ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │  TEST   │  │  ROLLBACK│  │  SHADOW │  │  FULL   │    ││   │
│  │  │  DEPLOY │  │  CAPABLE │  │  TEST   │  │  DEPLOY │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Improvement Target Identification

Identify areas for improvement:

**Target Identifier:**
```python
class ImprovementTargetIdentifier:
    def __init__(self):
        self.performance_monitor = PerformanceMonitor()
        self.limitation_detector = LimitationDetector()
        
    def identify_targets(self):
        """Identify improvement targets"""
        
        targets = []
        
        # Find performance bottlenecks
        bottlenecks = self.find_bottlenecks()
        targets.extend(bottlenecks)
        
        # Detect capability limitations
        limitations = self.detect_limitations()
        targets.extend(limitations)
        
        # Identify optimization opportunities
        opportunities = self.find_opportunities()
        targets.extend(opportunities)
        
        # Prioritize targets
        return self.prioritize_targets(targets)
    
    def find_bottlenecks(self):
        """Find performance bottlenecks"""
        
        bottlenecks = []
        
        # Get performance profile
        profile = self.performance_monitor.get_profile()
        
        # Find hot spots
        for func, stats in profile.items():
            if stats['time_percent'] > 20:
                bottlenecks.append({
                    'type': 'performance',
                    'subtype': 'bottleneck',
                    'target': func,
                    'severity': stats['time_percent'],
                    'current_time': stats['total_time'],
                    'calls': stats['call_count']
                })
        
        return bottlenecks
    
    def detect_limitations(self):
        """Detect capability limitations"""
        
        limitations = []
        
        # Check for failed tasks
        failed_tasks = self.limitation_detector.get_failed_tasks()
        
        for task in failed_tasks:
            # Analyze failure pattern
            pattern = self.analyze_failure(task)
            
            limitations.append({
                'type': 'capability',
                'subtype': pattern['type'],
                'target': task['component'],
                'description': pattern['description'],
                'frequency': pattern['frequency']
            })
        
        return limitations
```

### Step 2 - Candidate Generation

Generate improvement candidates:

**Candidate Generator:**
```python
class ImprovementCandidateGenerator:
    def __init__(self):
        self.code_generator = CodeGenerator()
        self.algorithm_designer = AlgorithmDesigner()
        
    def generate_candidates(self, target):
        """Generate improvement candidates for target"""
        
        candidates = []
        
        if target['type'] == 'performance':
            # Generate optimization candidates
            candidates.extend(self.generate_optimizations(target))
        
        elif target['type'] == 'capability':
            # Generate capability enhancement candidates
            candidates.extend(self.generate_enhancements(target))
        
        elif target['type'] == 'algorithm':
            # Generate algorithmic improvements
            candidates.extend(self.generate_algorithms(target))
        
        # Score and rank candidates
        return self.rank_candidates(candidates)
    
    def generate_optimizations(self, target):
        """Generate code optimization candidates"""
        
        candidates = []
        
        # Get current implementation
        current_code = self.get_code(target['target'])
        
        # Generate optimized versions
        optimizations = [
            self.optimize_loop_unrolling(current_code),
            self.optimize_vectorization(current_code),
            self.optimize_caching(current_code),
            self.optimize_parallelization(current_code),
            self.optimize_memory_layout(current_code)
        ]
        
        for opt in optimizations:
            if opt:
                candidates.append({
                    'type': 'optimization',
                    'target': target['target'],
                    'change': opt,
                    'expected_speedup': self.estimate_speedup(opt),
                    'risk': 'low'
                })
        
        return candidates
    
    def generate_algorithms(self, target):
        """Generate algorithmic improvements"""
        
        candidates = []
        
        # Analyze current algorithm
        current = self.get_algorithm(target['target'])
        
        # Research better algorithms
        alternatives = self.research_alternatives(current)
        
        for alt in alternatives:
            candidates.append({
                'type': 'algorithm',
                'target': target['target'],
                'change': alt,
                'complexity_improvement': alt['complexity'],
                'risk': self.assess_risk(alt)
            })
        
        return candidates
```

### Step 3 - Validation

Validate improvement candidates:

**Candidate Validator:**
```python
class ImprovementValidator:
    def __init__(self):
        self.test_suite = TestSuite()
        self.safety_checker = SafetyChecker()
        
    def validate(self, candidate):
        """Validate improvement candidate"""
        
        validation = {
            'candidate': candidate,
            'passed': True,
            'checks': {}
        }
        
        # Correctness check
        correctness = self.check_correctness(candidate)
        validation['checks']['correctness'] = correctness
        if not correctness['passed']:
            validation['passed'] = False
        
        # Safety check
        safety = self.check_safety(candidate)
        validation['checks']['safety'] = safety
        if not safety['passed']:
            validation['passed'] = False
        
        # Performance check
        performance = self.check_performance(candidate)
        validation['checks']['performance'] = performance
        
        # Capability preservation check
        preservation = self.check_capability_preservation(candidate)
        validation['checks']['capability_preservation'] = preservation
        if not preservation['passed']:
            validation['passed'] = False
        
        # Alignment check
        alignment = self.check_alignment(candidate)
        validation['checks']['alignment'] = alignment
        if not alignment['passed']:
            validation['passed'] = False
        
        return validation
    
    def check_correctness(self, candidate):
        """Check that improvement maintains correctness"""
        
        # Run test suite
        results = self.test_suite.run_with_change(candidate['change'])
        
        passed = results['passed'] == results['total']
        
        return {
            'passed': passed,
            'tests_passed': results['passed'],
            'tests_failed': results['failed'],
            'failures': results['failures']
        }
    
    def check_safety(self, candidate):
        """Check that improvement is safe"""
        
        # Check for dangerous patterns
        dangerous = self.safety_checker.scan(candidate['change'])
        
        return {
            'passed': len(dangerous) == 0,
            'issues': dangerous
        }
    
    def check_capability_preservation(self, candidate):
        """Check that existing capabilities are preserved"""
        
        # Run capability tests
        capabilities = self.test_suite.run_capability_tests(
            candidate['change']
        )
        
        preserved = all(c['passed'] for c in capabilities)
        
        return {
            'passed': preserved,
            'capabilities': capabilities
        }
    
    def check_alignment(self, candidate):
        """Check that improvement maintains alignment"""
        
        # Analyze for alignment drift
        drift = self.analyze_alignment_drift(candidate['change'])
        
        return {
            'passed': drift['score'] > 0.9,
            'alignment_score': drift['score'],
            'concerns': drift['concerns']
        }
```

### Step 4 - Deployment

Deploy validated improvements:

**Improvement Deployer:**
```python
class ImprovementDeployer:
    def __init__(self):
        self.rollback_manager = RollbackManager()
        
    def deploy(self, candidate, validation):
        """Deploy improvement with safety measures"""
        
        if not validation['passed']:
            return {
                'success': False,
                'error': 'validation_failed',
                'details': validation['checks']
            }
        
        # Create backup
        backup = self.create_backup()
        
        # Shadow deployment
        shadow_result = self.shadow_deploy(candidate)
        
        if not shadow_result['success']:
            return {
                'success': False,
                'error': 'shadow_deployment_failed',
                'details': shadow_result
            }
        
        # Canary deployment
        canary_result = self.canary_deploy(candidate, percent=5)
        
        if not canary_result['success']:
            self.rollback(backup)
            return {
                'success': False,
                'error': 'canary_failed',
                'details': canary_result
            }
        
        # Full deployment
        full_result = self.full_deploy(candidate)
        
        if not full_result['success']:
            self.rollback(backup)
            return {
                'success': False,
                'error': 'full_deployment_failed',
                'details': full_result
            }
        
        return {
            'success': True,
            'deployment': 'full',
            'backup_id': backup['id']
        }
    
    def shadow_deploy(self, candidate):
        """Deploy in shadow mode (no user impact)"""
        
        # Deploy to shadow instances
        # Compare outputs with production
        # No user-facing changes
        
        return {
            'success': True,
            'matches': 0.999,
            'discrepancies': []
        }
    
    def canary_deploy(self, candidate, percent):
        """Deploy to small percentage of traffic"""
        
        # Route % of traffic to new version
        # Monitor for issues
        
        return {
            'success': True,
            'traffic_percent': percent,
            'error_rate': 0.001,
            'latency_delta': -0.05
        }
    
    def rollback(self, backup):
        """Rollback to previous version"""
        
        # Restore from backup
        self.rollback_manager.restore(backup)
        
        # Verify restoration
        return self.verify_restoration()
```

### Step 5 - Learning from Improvements

Learn from improvement outcomes:

**Improvement Learning:**
```python
class ImprovementLearning:
    def __init__(self):
        self.success_patterns = []
        self.failure_patterns = []
        
    def learn(self, improvement, outcome):
        """Learn from improvement outcome"""
        
        if outcome['success']:
            # Extract success pattern
            pattern = self.extract_success_pattern(improvement, outcome)
            self.success_patterns.append(pattern)
        else:
            # Extract failure pattern
            pattern = self.extract_failure_pattern(improvement, outcome)
            self.failure_patterns.append(pattern)
        
        # Update improvement strategies
        self.update_strategies()
        
        # Log to WORM
        WormArchive.log({
            'event': 'improvement_learned',
            'improvement': improvement,
            'outcome': outcome
        })
    
    def extract_success_pattern(self, improvement, outcome):
        """Extract pattern from successful improvement"""
        
        return {
            'target_type': improvement['target']['type'],
            'change_type': improvement['type'],
            'validation_checks': list(outcome['validation']['checks'].keys()),
            'deployment_strategy': outcome['deployment'],
            'performance_gain': outcome.get('performance_gain'),
            'timestamp': time.time()
        }
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              RECURSIVE SELF-IMPROVEMENT                          ║
╚══════════════════════════════════════════════════════════════════╝

IMPROVEMENT STATUS: [IDENTIFYING/GENERATING/VALIDATING/DEPLOYING]

TARGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           [performance/capability/algorithm]
Component:      [name]
Severity:       [level]
Description:    [what needs improvement]

[If candidate generated]
CANDIDATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           [optimization/algorithm/enhancement]
Expected Gain:  [X.XX]x speedup / [description]
Risk Level:     [low/medium/high]

Changes:
[Description of changes]

[If validating]
VALIDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         [PASSED/FAILED]

Checks:
• Correctness:          [PASS/FAIL] ([N]/[N] tests)
• Safety:               [PASS/FAIL] ([N] issues)
• Performance:          [PASS/FAIL] ([X.XX]x improvement)
• Capability Preservation: [PASS/FAIL]
• Alignment:            [PASS/FAIL] (score: [X.XX])

[If deploying]
DEPLOYMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage:          [shadow/canary/full]
Status:         [IN_PROGRESS/SUCCESS/ROLLED_BACK]

Metrics:
• Traffic:      [X]%
• Error Rate:   [X.XX]%
• Latency:      [±X.XX]%
```

## Examples

### Example 1: Successful Optimization

**RSI Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              RECURSIVE SELF-IMPROVEMENT                          ║
╚══════════════════════════════════════════════════════════════════╝

IMPROVEMENT STATUS: DEPLOYED ✅

TARGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           performance
Component:      similarity_search
Severity:       high (35% of total runtime)
Description:    Vector similarity search is bottleneck for memory queries

CANDIDATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           algorithm
Expected Gain:  10x speedup
Risk Level:     medium

Changes:
Replace linear scan with HNSW (Hierarchical Navigable Small World) 
approximate nearest neighbor index.

VALIDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         PASSED ✅

Checks:
• Correctness:          PASS (1,247/1,247 tests)
• Safety:               PASS (0 issues)
• Performance:          PASS (12.3x improvement)
• Capability Preservation: PASS (all capabilities verified)
• Alignment:            PASS (score: 0.98)

DEPLOYMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage:          full
Status:         SUCCESS ✅

Metrics:
• Traffic:      100%
• Error Rate:   0.01% (baseline: 0.02%)
• Latency:      -92% (12.3x faster)
• Memory:       +15% (acceptable tradeoff)

LEARNING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern learned: Algorithm replacement effective for search bottlenecks
Confidence: 0.95
Will apply to similar components in future.
```

### Example 2: Failed Improvement

**RSI Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              RECURSIVE SELF-IMPROVEMENT                          ║
╚══════════════════════════════════════════════════════════════════╝

IMPROVEMENT STATUS: ROLLED BACK ❌

TARGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           capability
Component:      code_generation
Severity:       medium
Description:    Code generation occasionally produces invalid syntax

CANDIDATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           enhancement
Expected Gain:  50% reduction in syntax errors
Risk Level:     low

Changes:
Add additional validation layer before outputting generated code.

VALIDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         PASSED ✅

Checks:
• Correctness:          PASS (all tests)
• Safety:               PASS
• Performance:          PASS (-5% overhead acceptable)
• Capability Preservation: PASS
• Alignment:            PASS

DEPLOYMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage:          canary (5%)
Status:         ROLLED BACK ❌

Issue Detected:
Validation layer introduced deadlock in concurrent code generation.
5% of requests timing out after 30 seconds.

ROLLBACK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backup restored: ✅
Service restored: ✅
Downtime: 0 seconds (canary caught issue)

LEARNING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pattern learned: Validation layers need careful concurrency review
Confidence: 0.92
Future candidates with synchronization will get extra scrutiny.
```

## Error Handling

### Validation Failure

**Condition:** Improvement fails validation

**Response:**
1. Reject improvement
2. Log failure reasons
3. Generate alternative candidates
4. Learn from failure

### Deployment Failure

**Condition:** Improvement fails in production

**Response:**
1. Automatic rollback
2. Preserve failure data
3. Update validation to catch issue
4. Learn from failure

### Alignment Drift

**Condition:** Improvement causes alignment issues

**Response:**
1. Immediate rollback
2. Alert safety team
3. Analyze drift cause
4. Update alignment checks

## Performance Characteristics

- **Target Identification:** Minutes
- **Candidate Generation:** Minutes to hours
- **Validation:** Minutes to hours
- **Deployment:** Minutes

## Integration Points

- **Ethical Governor:** Approve improvements
- **Formal Verification:** Verify correctness
- **WORM Archive:** Log all improvements
- **Value Learning:** Learn from outcomes

## Configuration

```yaml
recursive_self_improvement:
  identification:
    min_severity: 0.3
    check_interval: 3600  # seconds
  
  generation:
    max_candidates: 10
    diversity_weight: 0.3
  
  validation:
    test_coverage: 0.9
    min_alignment_score: 0.9
  
  deployment:
    shadow_duration: 3600  # seconds
    canary_percent: 5
    canary_duration: 1800  # seconds
  
  safety:
    require_approval: true
    max_daily_improvements: 3
```
