---
name: self-healing-modules
description: Detects and repairs system faults automatically without human intervention. Triggers continuously for health monitoring, fault detection, and recovery operations. Maintains system availability through automated remediation.
version: 2.0.0
healing_strategies:
  - restart
  - failover
  - rollback
  - rebuild
  - quarantine
---

# Self-Healing Modules (SHM)

## Overview

The Self-Healing Modules continuously monitor system health, detect faults, and automatically repair issues without human intervention. It maintains system availability through automated remediation strategies.

## Core Principles

**Proactive Monitoring:** Detect issues before they cause failures.

**Automatic Remediation:** Fix problems without human intervention.

**Graceful Degradation:** Maintain partial functionality during recovery.

**Learning from Failures:** Improve healing strategies over time.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Self-Healing Modules Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Monitor    │────►│   Detect     │────►│   Diagnose   │    │
│  │   Health     │     │   Faults     │     │   Issues     │    │
│  │              │     │              │     │              │    │
│  │ • Metrics    │     │ • Anomalies  │     │ • Root Cause │    │
│  │ • Logs       │     │ • Thresholds │     │ • Impact     │    │
│  │ • Heartbeats │     │ • Patterns   │     │ • Scope      │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Healing Strategy Selection                  ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │ Restart │  │ Failover│  │ Rollback│  │ Rebuild │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Health Monitoring

Continuously monitor system health metrics:

**Health Monitor:**
```python
class HealthMonitor:
    def __init__(self):
        self.metrics = {}
        self.thresholds = self.load_thresholds()
        self.alert_history = []
        
    def monitor(self):
        """Continuous health monitoring loop"""
        
        while True:
            # Collect metrics
            metrics = self.collect_metrics()
            
            # Check thresholds
            alerts = self.check_thresholds(metrics)
            
            # Process alerts
            for alert in alerts:
                self.process_alert(alert)
            
            # Store metrics
            self.store_metrics(metrics)
            
            # Sleep interval
            time.sleep(self.interval)
    
    def collect_metrics(self):
        """Collect system health metrics"""
        
        return {
            'cpu': self.get_cpu_usage(),
            'memory': self.get_memory_usage(),
            'disk': self.get_disk_usage(),
            'network': self.get_network_stats(),
            'response_time': self.get_response_times(),
            'error_rate': self.get_error_rate(),
            'queue_depth': self.get_queue_depth(),
            'active_connections': self.get_active_connections()
        }
    
    def check_thresholds(self, metrics):
        """Check metrics against thresholds"""
        
        alerts = []
        
        for metric_name, value in metrics.items():
            threshold = self.thresholds.get(metric_name)
            
            if threshold:
                if value > threshold['critical']:
                    alerts.append({
                        'severity': 'critical',
                        'metric': metric_name,
                        'value': value,
                        'threshold': threshold['critical']
                    })
                elif value > threshold['warning']:
                    alerts.append({
                        'severity': 'warning',
                        'metric': metric_name,
                        'value': value,
                        'threshold': threshold['warning']
                    })
        
        return alerts
```

### Step 2 - Fault Detection

Detect faults through anomaly detection:

**Fault Detector:**
```python
class FaultDetector:
    def __init__(self):
        self.anomaly_model = AnomalyDetectionModel()
        self.pattern_matcher = PatternMatcher()
        
    def detect(self, metrics, logs):
        """Detect faults in system"""
        
        faults = []
        
        # Anomaly detection
        anomalies = self.anomaly_model.detect(metrics)
        for anomaly in anomalies:
            faults.append({
                'type': 'anomaly',
                'metric': anomaly.metric,
                'expected': anomaly.expected,
                'actual': anomaly.actual,
                'confidence': anomaly.confidence
            })
        
        # Pattern matching
        patterns = self.pattern_matcher.match(logs)
        for pattern in patterns:
            faults.append({
                'type': 'pattern',
                'pattern': pattern.name,
                'matches': pattern.matches,
                'severity': pattern.severity
            })
        
        # Threshold breaches
        threshold_faults = self.check_thresholds(metrics)
        faults.extend(threshold_faults)
        
        return faults
    
    def check_thresholds(self, metrics):
        """Check for threshold breaches"""
        
        faults = []
        
        # CPU threshold
        if metrics['cpu'] > 95:
            faults.append({
                'type': 'threshold',
                'component': 'cpu',
                'severity': 'critical',
                'message': f"CPU usage critical: {metrics['cpu']}%"
            })
        
        # Memory threshold
        if metrics['memory'] > 90:
            faults.append({
                'type': 'threshold',
                'component': 'memory',
                'severity': 'critical',
                'message': f"Memory usage critical: {metrics['memory']}%"
            })
        
        # Error rate threshold
        if metrics['error_rate'] > 0.1:
            faults.append({
                'type': 'threshold',
                'component': 'error_rate',
                'severity': 'warning',
                'message': f"Error rate elevated: {metrics['error_rate']*100}%"
            })
        
        return faults
```

### Step 3 - Diagnosis

Diagnose root cause of detected faults:

**Fault Diagnoser:**
```python
class FaultDiagnoser:
    def __init__(self):
        self.knowledge_base = DiagnosisKnowledgeBase()
        
    def diagnose(self, fault, context):
        """Diagnose root cause of fault"""
        
        # Gather evidence
        evidence = self.gather_evidence(fault, context)
        
        # Apply diagnostic rules
        candidates = self.apply_diagnostic_rules(evidence)
        
        # Score candidates
        scored = self.score_candidates(candidates, evidence)
        
        # Return top diagnosis
        if scored:
            return {
                'root_cause': scored[0]['cause'],
                'confidence': scored[0]['score'],
                'alternatives': scored[1:3],
                'evidence': evidence,
                'impact': self.assess_impact(fault, scored[0])
            }
        
        return {
            'root_cause': 'unknown',
            'confidence': 0.0,
            'evidence': evidence
        }
    
    def gather_evidence(self, fault, context):
        """Gather diagnostic evidence"""
        
        evidence = {
            'fault': fault,
            'context': context,
            'related_logs': self.get_related_logs(fault),
            'recent_changes': self.get_recent_changes(),
            'dependencies': self.get_dependencies(fault),
            'similar_incidents': self.find_similar_incidents(fault)
        }
        
        return evidence
    
    def apply_diagnostic_rules(self, evidence):
        """Apply diagnostic rules to evidence"""
        
        candidates = []
        
        # Rule: High CPU + memory leak pattern
        if (evidence['fault'].get('component') == 'memory' and
            evidence['fault'].get('value', 0) > 85):
            
            # Check for memory leak pattern in logs
            if 'memory leak' in evidence['related_logs']:
                candidates.append({
                    'cause': 'memory_leak',
                    'description': 'Memory leak detected in application',
                    'indicators': ['increasing memory', 'no decrease after GC']
                })
        
        # Rule: Error spike after deployment
        if (evidence['fault'].get('component') == 'error_rate' and
            evidence['recent_changes']):
            
            candidates.append({
                'cause': 'deployment_issue',
                'description': 'Errors correlated with recent deployment',
                'indicators': ['error spike', 'recent deployment']
            })
        
        # Rule: Network timeouts
        if evidence['fault'].get('component') == 'network':
            candidates.append({
                'cause': 'network_degradation',
                'description': 'Network connectivity issues',
                'indicators': ['timeouts', 'packet loss']
            })
        
        return candidates
```

### Step 4 - Healing Strategy Selection

Select appropriate healing strategy:

**Strategy Selector:**
```python
class HealingStrategySelector:
    def __init__(self):
        self.strategies = {
            'restart': RestartStrategy(),
            'failover': FailoverStrategy(),
            'rollback': RollbackStrategy(),
            'rebuild': RebuildStrategy(),
            'quarantine': QuarantineStrategy()
        }
    
    def select_strategy(self, diagnosis, context):
        """Select healing strategy based on diagnosis"""
        
        root_cause = diagnosis['root_cause']
        impact = diagnosis['impact']
        
        # Strategy selection matrix
        strategy_map = {
            'memory_leak': 'restart',
            'deployment_issue': 'rollback',
            'network_degradation': 'failover',
            'corrupted_data': 'rebuild',
            'security_breach': 'quarantine',
            'service_crash': 'restart',
            'database_connection': 'failover',
            'configuration_error': 'rollback'
        }
        
        # Get strategy
        strategy_name = strategy_map.get(root_cause, 'restart')
        strategy = self.strategies[strategy_name]
        
        # Check if strategy is viable
        if not strategy.is_viable(context):
            # Fall back to next best strategy
            strategy = self.find_fallback_strategy(diagnosis, context)
        
        return strategy
    
    def find_fallback_strategy(self, diagnosis, context):
        """Find fallback healing strategy"""
        
        # Priority order of strategies
        priority = ['failover', 'rollback', 'restart', 'rebuild', 'quarantine']
        
        for strategy_name in priority:
            strategy = self.strategies[strategy_name]
            if strategy.is_viable(context):
                return strategy
        
        # Last resort: quarantine
        return self.strategies['quarantine']
```

### Step 5 - Healing Execution

Execute selected healing strategy:

**Restart Strategy:**
```python
class RestartStrategy:
    def __init__(self):
        self.name = 'restart'
        
    def execute(self, target, context):
        """Execute restart healing"""
        
        # Pre-restart checks
        if not self.pre_check(target):
            return {'success': False, 'error': 'pre_check_failed'}
        
        # Drain connections
        self.drain_connections(target)
        
        # Stop service
        stop_result = self.stop_service(target)
        if not stop_result['success']:
            return {'success': False, 'error': 'stop_failed'}
        
        # Clear state if needed
        if context.get('clear_state', False):
            self.clear_state(target)
        
        # Start service
        start_result = self.start_service(target)
        if not start_result['success']:
            return {'success': False, 'error': 'start_failed'}
        
        # Health check
        if not self.health_check(target):
            return {'success': False, 'error': 'health_check_failed'}
        
        return {'success': True, 'action': 'restart'}
    
    def pre_check(self, target):
        """Check if restart is safe"""
        
        # Check if active transactions
        if self.has_active_transactions(target):
            return False
        
        # Check dependencies
        if self.has_critical_dependencies(target):
            return False
        
        return True
```

**Failover Strategy:**
```python
class FailoverStrategy:
    def __init__(self):
        self.name = 'failover'
        
    def execute(self, target, context):
        """Execute failover healing"""
        
        # Find healthy replica
        replica = self.find_healthy_replica(target)
        
        if not replica:
            return {'success': False, 'error': 'no_healthy_replica'}
        
        # Update load balancer
        self.update_load_balancer(target, replica)
        
        # Redirect traffic
        self.redirect_traffic(target, replica)
        
        # Mark target as failed
        self.mark_failed(target)
        
        # Start recovery on target
        self.start_recovery(target)
        
        return {
            'success': True,
            'action': 'failover',
            'new_primary': replica
        }
```

**Rollback Strategy:**
```python
class RollbackStrategy:
    def __init__(self):
        self.name = 'rollback'
        
    def execute(self, target, context):
        """Execute rollback healing"""
        
        # Identify last known good version
        last_good = self.find_last_good_version(target)
        
        if not last_good:
            return {'success': False, 'error': 'no_good_version'}
        
        # Create backup of current state
        self.backup_current_state(target)
        
        # Stop service
        self.stop_service(target)
        
        # Restore to last good version
        self.restore_version(target, last_good)
        
        # Start service
        self.start_service(target)
        
        # Verify rollback
        if not self.verify_rollback(target, last_good):
            return {'success': False, 'error': 'rollback_verification_failed'}
        
        return {
            'success': True,
            'action': 'rollback',
            'version': last_good
        }
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              SELF-HEALING MODULES                                ║
╚══════════════════════════════════════════════════════════════════╝

SYSTEM HEALTH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         [HEALTHY/DEGRADED/CRITICAL/RECOVERING]

Metrics:
• CPU:          [X]% ([normal/warning/critical])
• Memory:       [X]% ([normal/warning/critical])
• Disk:         [X]% ([normal/warning/critical])
• Error Rate:   [X]% ([normal/warning/critical])
• Response:     [X]ms ([normal/warning/critical])

[If fault detected]
FAULT DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component:      [name]
Severity:       [WARNING/CRITICAL]
Type:           [anomaly/threshold/pattern]

Details:
[Description of fault]

DIAGNOSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Root Cause:     [identified cause]
Confidence:     [X.XX]
Impact:         [scope of impact]

Evidence:
• [Evidence point 1]
• [Evidence point 2]

HEALING ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       [restart/failover/rollback/rebuild/quarantine]
Status:         [IN_PROGRESS/COMPLETED/FAILED]

Steps:
1. [Step 1] - [status]
2. [Step 2] - [status]
3. [Step 3] - [status]

Result:         [success/failure details]
```

## Examples

### Example 1: Memory Leak Recovery

**SHM Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              SELF-HEALING MODULES                                ║
╚══════════════════════════════════════════════════════════════════╝

SYSTEM HEALTH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         CRITICAL 🚨

Metrics:
• CPU:          45% (normal)
• Memory:       94% (CRITICAL) 🚨
• Disk:         62% (normal)
• Error Rate:   2.3% (warning)
• Response:     850ms (warning)

FAULT DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component:      memory
Severity:       CRITICAL
Type:           threshold

Details:
Memory usage exceeded 90% threshold and continues climbing. Pattern 
matches known memory leak signature.

DIAGNOSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Root Cause:     memory_leak
Confidence:     0.92
Impact:         Service degradation, potential OOM kill

Evidence:
• Memory increased from 40% to 94% over 30 minutes
• No decrease after garbage collection cycles
• Heap dump shows unclosed database connections
• Similar to incident #2847 (resolved by restart)

HEALING ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       restart
Status:         COMPLETED ✅

Steps:
1. Drain connections - ✅ Completed (45s)
2. Stop service - ✅ Completed (2s)
3. Clear connection pool - ✅ Completed (1s)
4. Start service - ✅ Completed (8s)
5. Health check - ✅ Passed

Result:         SUCCESS
• Memory usage: 94% → 32%
• Response time: 850ms → 120ms
• Error rate: 2.3% → 0.1%

Post-Action:
• Root cause ticket created: OPS-2024-0891
• Connection pool config updated
• Monitoring alert threshold lowered
```

### Example 2: Deployment Rollback

**SHM Output:**
```
╔════════════════════════════════━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╗
║              SELF-HEALING MODULES                                ║
╚════════════════════════════════━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╝

SYSTEM HEALTH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         RECOVERING ⏳

Metrics:
• CPU:          78% (warning)
• Memory:       56% (normal)
• Disk:         45% (normal)
• Error Rate:   18.5% (CRITICAL) 🚨
• Response:     2300ms (CRITICAL) 🚨

FAULT DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component:      api-gateway
Severity:       CRITICAL
Type:           pattern

Details:
Error rate spiked to 18.5% immediately following deployment v2.4.1.
Pattern matches deployment issue signature.

DIAGNOSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Root Cause:     deployment_issue
Confidence:     0.89
Impact:         85% of API requests failing

Evidence:
• Deployment v2.4.1 at 14:32:00
• Error spike began at 14:32:15
• All errors are 500 Internal Server Error
• Previous version (v2.4.0) had 0.2% error rate
• Rollback candidate identified: v2.4.0

HEALING ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       rollback
Status:         COMPLETED ✅

Steps:
1. Identify last good version - ✅ v2.4.0
2. Backup current state - ✅ Created snapshot
3. Stop v2.4.1 - ✅ Completed (3s)
4. Restore v2.4.0 - ✅ Completed (12s)
5. Start service - ✅ Completed (5s)
6. Verify rollback - ✅ Health checks passed

Result:         SUCCESS
• Error rate: 18.5% → 0.15%
• Response time: 2300ms → 95ms
• Traffic restored to healthy state

Post-Action:
• Deployment v2.4.1 marked as bad
• Incident ticket created: INC-2024-0042
• Deployment pipeline gated pending investigation
```

## Error Handling

### Healing Failure

**Condition:** Healing strategy fails to resolve issue

**Response:**
1. Escalate to next strategy
2. Alert human operators
3. Log detailed failure information
4. Enter degraded mode if needed

### Cascading Failure

**Condition:** Healing causes additional failures

**Response:**
1. Stop healing process
2. Assess scope of cascade
3. Quarantine affected components
4. Manual intervention required

### Recovery Verification Failure

**Condition:** Post-healing verification fails

**Response:**
1. Mark healing as failed
2. Try alternative strategy
3. Escalate if no strategy succeeds
4. Log for analysis

## Performance Characteristics

- **Detection Latency:** <30 seconds
- **Diagnosis Time:** <1 minute
- **Healing Execution:** 10-60 seconds
- **False Positive Rate:** <2%
- **Recovery Success Rate:** >95%

## Integration Points

- **BFT Consensus:** Coordinate healing across nodes
- **WORM Archive:** Log all healing actions
- **Ethical Governor:** Verify healing is safe
- **PTP Clock Sync:** Timestamps for healing events

## Configuration

```yaml
self_healing_modules:
  monitoring:
    interval: 10  # seconds
    metrics:
      - cpu
      - memory
      - disk
      - network
      - error_rate
      - response_time
  
  thresholds:
    cpu:
      warning: 70
      critical: 90
    memory:
      warning: 80
      critical: 90
    error_rate:
      warning: 0.05
      critical: 0.10
  
  healing:
    auto_heal: true
    max_attempts: 3
    backoff: exponential
    strategies:
      - restart
      - failover
      - rollback
      - rebuild
      - quarantine
```
