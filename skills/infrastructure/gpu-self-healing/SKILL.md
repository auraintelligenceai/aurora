---
name: gpu-self-healing
description: Monitors GPU health, detects silent errors, and recovers from faults without data loss. Triggers continuously for GPU-intensive operations and hardware health monitoring. Ensures reliable GPU computation in AI/ML workloads.
version: 2.0.0
gpu_metrics:
  - temperature
  - memory_errors
  - utilization
  - power_draw
  - ecc_errors
---

# GPU Self-Healing (GPU-SH)

## Overview

The GPU Self-Healing module monitors GPU health in real-time, detects silent errors and faults, and automatically recovers without data loss. It ensures reliable GPU computation for AI/ML workloads.

## Core Principles

**Proactive Monitoring:** Detect issues before they cause computation errors.

**Silent Error Detection:** Catch errors that don't cause obvious failures.

**Graceful Recovery:** Recover without losing computation progress.

**Predictive Maintenance:** Predict failures before they occur.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              GPU Self-Healing Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    GPU Hardware                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  GPU 0  │  │  GPU 1  │  │  GPU 2  │  │  GPU N  │    │   │
│  │  │  🎮     │  │  🎮     │  │  🎮     │  │  🎮     │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│  │       └────────────┴────────────┴────────────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              GPU Health Monitor                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │   NVML  │  │  ECC    │  │  Temp   │  │  Perf   │    │   │
│  │  │  Stats  │  │  Check  │  │  Monitor│  │  Counters│   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Recovery Manager                            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Restart │  │Migrate  │  │ Reduce  │  │ Predict │    │   │
│  │  │  Kernel │  │  Task   │  │  Load   │  │ Failure │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - GPU Health Monitoring

Monitor GPU health metrics continuously:

**GPU Monitor:**
```python
class GPUHealthMonitor:
    def __init__(self):
        self.nvml = NVML()
        self.metrics_history = {}
        
    def monitor_all_gpus(self):
        """Monitor all available GPUs"""
        
        gpu_count = self.nvml.get_gpu_count()
        
        for gpu_id in range(gpu_count):
            metrics = self.collect_gpu_metrics(gpu_id)
            self.store_metrics(gpu_id, metrics)
            
            # Check for issues
            issues = self.check_gpu_health(gpu_id, metrics)
            
            for issue in issues:
                self.handle_gpu_issue(gpu_id, issue)
    
    def collect_gpu_metrics(self, gpu_id):
        """Collect comprehensive GPU metrics"""
        
        handle = self.nvml.get_handle(gpu_id)
        
        return {
            'timestamp': time.time(),
            'gpu_id': gpu_id,
            
            # Temperature
            'temperature': self.nvml.get_temperature(handle),
            
            # Memory
            'memory_used': self.nvml.get_memory_used(handle),
            'memory_total': self.nvml.get_memory_total(handle),
            'memory_utilization': self.nvml.get_memory_utilization(handle),
            
            # Compute
            'gpu_utilization': self.nvml.get_gpu_utilization(handle),
            'compute_mode': self.nvml.get_compute_mode(handle),
            
            # Power
            'power_draw': self.nvml.get_power_draw(handle),
            'power_limit': self.nvml.get_power_limit(handle),
            
            # ECC Errors
            'ecc_errors': self.nvml.get_ecc_errors(handle),
            'ecc_enabled': self.nvml.is_ecc_enabled(handle),
            
            # PCIe
            'pcie_tx': self.nvml.get_pcie_throughput_tx(handle),
            'pcie_rx': self.nvml.get_pcie_throughput_rx(handle),
            
            # Clocks
            'clock_graphics': self.nvml.get_clock_graphics(handle),
            'clock_memory': self.nvml.get_clock_memory(handle),
            'clock_sm': self.nvml.get_clock_sm(handle),
            
            # Processes
            'processes': self.nvml.get_compute_processes(handle)
        }
    
    def check_gpu_health(self, gpu_id, metrics):
        """Check GPU health and return any issues"""
        
        issues = []
        
        # Temperature check
        if metrics['temperature'] > 85:
            issues.append({
                'type': 'temperature',
                'severity': 'critical' if metrics['temperature'] > 90 else 'warning',
                'value': metrics['temperature'],
                'threshold': 85,
                'message': f"GPU {gpu_id} temperature: {metrics['temperature']}°C"
            })
        
        # ECC errors check
        if metrics['ecc_errors']['aggregate']['total'] > 0:
            issues.append({
                'type': 'ecc_error',
                'severity': 'warning',
                'value': metrics['ecc_errors']['aggregate']['total'],
                'message': f"GPU {gpu_id} ECC errors detected"
            })
        
        # Memory errors check
        memory_errors = self.nvml.get_memory_error_stats(gpu_id)
        if memory_errors['corrected'] > 100:
            issues.append({
                'type': 'memory_error',
                'severity': 'warning',
                'value': memory_errors['corrected'],
                'message': f"GPU {gpu_id} high memory error rate"
            })
        
        # Power check
        if metrics['power_draw'] > metrics['power_limit'] * 0.95:
            issues.append({
                'type': 'power',
                'severity': 'warning',
                'value': metrics['power_draw'],
                'limit': metrics['power_limit'],
                'message': f"GPU {gpu_id} near power limit"
            })
        
        # Xid errors check
        xid_errors = self.nvml.get_xid_errors(gpu_id)
        if xid_errors:
            issues.append({
                'type': 'xid_error',
                'severity': 'critical',
                'value': xid_errors,
                'message': f"GPU {gpu_id} Xid errors: {xid_errors}"
            })
        
        return issues
```

### Step 2 - Silent Error Detection

Detect silent errors that don't cause obvious failures:

**Silent Error Detector:**
```python
class SilentErrorDetector:
    def __init__(self):
        self.checksum_history = {}
        self.pattern_analyzer = PatternAnalyzer()
        
    def detect_silent_errors(self, gpu_id, computation_result):
        """Detect silent errors in computation"""
        
        errors = []
        
        # Method 1: Checksum verification
        checksum_error = self.verify_checksum(gpu_id, computation_result)
        if checksum_error:
            errors.append(checksum_error)
        
        # Method 2: Result consistency check
        consistency_error = self.check_consistency(gpu_id, computation_result)
        if consistency_error:
            errors.append(consistency_error)
        
        # Method 3: Statistical anomaly detection
        anomaly_error = self.detect_anomaly(gpu_id, computation_result)
        if anomaly_error:
            errors.append(anomaly_error)
        
        return errors
    
    def verify_checksum(self, gpu_id, result):
        """Verify computation result checksum"""
        
        # Compute checksum of result
        current_checksum = self.compute_checksum(result)
        
        # Compare with expected (from CPU reference or redundant computation)
        expected_checksum = self.get_expected_checksum(result['task_id'])
        
        if current_checksum != expected_checksum:
            return {
                'type': 'checksum_mismatch',
                'severity': 'critical',
                'gpu_id': gpu_id,
                'expected': expected_checksum,
                'actual': current_checksum,
                'message': 'Computation result checksum mismatch detected'
            }
        
        return None
    
    def check_consistency(self, gpu_id, result):
        """Check result consistency with similar computations"""
        
        # Get historical results for similar tasks
        similar_results = self.get_similar_results(result['task_type'])
        
        if similar_results:
            # Statistical comparison
            mean_value = np.mean([r['value'] for r in similar_results])
            std_value = np.std([r['value'] for r in similar_results])
            
            z_score = abs(result['value'] - mean_value) / std_value
            
            if z_score > 3:  # 3-sigma outlier
                return {
                    'type': 'statistical_outlier',
                    'severity': 'warning',
                    'gpu_id': gpu_id,
                    'z_score': z_score,
                    'message': f'Result is {z_score:.2f} sigma from expected'
                }
        
        return None
    
    def detect_anomaly(self, gpu_id, result):
        """Detect anomalies using ML model"""
        
        # Extract features
        features = self.extract_features(result)
        
        # Run anomaly detection model
        anomaly_score = self.anomaly_model.predict(features)
        
        if anomaly_score > 0.9:
            return {
                'type': 'ml_anomaly',
                'severity': 'warning',
                'gpu_id': gpu_id,
                'score': anomaly_score,
                'message': 'ML model detected anomalous computation pattern'
            }
        
        return None
```

### Step 3 - Recovery Actions

Execute recovery actions when issues are detected:

**GPU Recovery Manager:**
```python
class GPURecoveryManager:
    def __init__(self):
        self.recovery_strategies = {
            'kernel_restart': KernelRestartStrategy(),
            'task_migration': TaskMigrationStrategy(),
            'load_reduction': LoadReductionStrategy(),
            'gpu_reset': GPUResetStrategy(),
            'predictive_maintenance': PredictiveMaintenanceStrategy()
        }
    
    def recover(self, gpu_id, issue, context):
        """Execute recovery for GPU issue"""
        
        # Select recovery strategy
        strategy = self.select_recovery_strategy(issue, context)
        
        # Execute recovery
        result = strategy.execute(gpu_id, issue, context)
        
        # Verify recovery
        if result['success']:
            verified = self.verify_recovery(gpu_id)
            if not verified:
                result['success'] = False
                result['error'] = 'recovery_verification_failed'
        
        return result
    
    def select_recovery_strategy(self, issue, context):
        """Select appropriate recovery strategy"""
        
        strategy_map = {
            'temperature': 'load_reduction',
            'ecc_error': 'kernel_restart',
            'memory_error': 'task_migration',
            'checksum_mismatch': 'kernel_restart',
            'xid_error': 'gpu_reset',
            'power': 'load_reduction'
        }
        
        strategy_name = strategy_map.get(issue['type'], 'kernel_restart')
        return self.recovery_strategies[strategy_name]
```

**Kernel Restart Strategy:**
```python
class KernelRestartStrategy:
    def __init__(self):
        self.name = 'kernel_restart'
        
    def execute(self, gpu_id, issue, context):
        """Restart CUDA kernels on GPU"""
        
        # Save checkpoint if possible
        checkpoint = self.create_checkpoint(gpu_id, context)
        
        # Terminate running kernels
        self.terminate_kernels(gpu_id)
        
        # Clear GPU memory
        self.clear_memory(gpu_id)
        
        # Reset CUDA context
        self.reset_cuda_context(gpu_id)
        
        # Restore from checkpoint
        if checkpoint:
            self.restore_checkpoint(gpu_id, checkpoint)
        
        return {
            'success': True,
            'strategy': self.name,
            'gpu_id': gpu_id,
            'checkpoint_used': checkpoint is not None
        }
```

**Task Migration Strategy:**
```python
class TaskMigrationStrategy:
    def __init__(self):
        self.name = 'task_migration'
        
    def execute(self, gpu_id, issue, context):
        """Migrate tasks to healthy GPU"""
        
        # Find healthy target GPU
        target_gpu = self.find_healthy_gpu(exclude=gpu_id)
        
        if not target_gpu:
            return {
                'success': False,
                'error': 'no_healthy_gpu_available'
            }
        
        # Get running tasks on affected GPU
        tasks = self.get_running_tasks(gpu_id)
        
        # Migrate each task
        migrated = []
        failed = []
        
        for task in tasks:
            try:
                self.migrate_task(task, gpu_id, target_gpu)
                migrated.append(task['id'])
            except Exception as e:
                failed.append({'task': task['id'], 'error': str(e)})
        
        return {
            'success': len(failed) == 0,
            'strategy': self.name,
            'source_gpu': gpu_id,
            'target_gpu': target_gpu,
            'migrated': migrated,
            'failed': failed
        }
```

### Step 4 - Predictive Maintenance

Predict GPU failures before they occur:

**Predictive Maintenance:**
```python
class PredictiveMaintenance:
    def __init__(self):
        self.failure_prediction_model = self.load_model()
        self.maintenance_schedule = {}
        
    def predict_failure(self, gpu_id, metrics_history):
        """Predict GPU failure probability"""
        
        # Extract features from history
        features = self.extract_prediction_features(metrics_history)
        
        # Run prediction model
        failure_prob = self.failure_prediction_model.predict(features)
        
        # Estimate time to failure
        ttf = self.estimate_time_to_failure(features, failure_prob)
        
        return {
            'gpu_id': gpu_id,
            'failure_probability': failure_prob,
            'estimated_ttf_hours': ttf,
            'risk_level': self.categorize_risk(failure_prob),
            'recommended_action': self.recommend_action(failure_prob, ttf)
        }
    
    def recommend_action(self, failure_prob, ttf):
        """Recommend maintenance action"""
        
        if failure_prob > 0.8:
            return {
                'action': 'immediate_replacement',
                'urgency': 'critical',
                'message': 'Schedule GPU replacement within 24 hours'
            }
        elif failure_prob > 0.5:
            return {
                'action': 'scheduled_maintenance',
                'urgency': 'high',
                'message': f'Schedule maintenance within {ttf/2:.1f} hours'
            }
        elif failure_prob > 0.2:
            return {
                'action': 'increased_monitoring',
                'urgency': 'medium',
                'message': 'Increase monitoring frequency'
            }
        else:
            return {
                'action': 'normal_operation',
                'urgency': 'low',
                'message': 'Continue normal monitoring'
            }
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              GPU SELF-HEALING                                    ║
╚══════════════════════════════════════════════════════════════════╝

GPU STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPU [N]:        [HEALTHY/WARNING/CRITICAL/OFFLINE]

Health Metrics:
• Temperature:  [X]°C ([normal/warning/critical])
• Memory Used:  [X] / [Y] GB ([X]%)
• Utilization:  [X]% ([idle/active/heavy])
• Power Draw:   [X]W / [Y]W limit
• ECC Errors:   [N] corrected / [N] uncorrected

[If issue detected]
ISSUE DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           [temperature/ecc_error/memory_error/xid_error]
Severity:       [WARNING/CRITICAL]
GPU:            [N]

Details:
[Description of issue]

RECOVERY ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       [kernel_restart/task_migration/load_reduction/gpu_reset]
Status:         [IN_PROGRESS/COMPLETED/FAILED]

Steps:
1. [Step 1] - [status]
2. [Step 2] - [status]

Result:         [success/failure details]
```

## Examples

### Example 1: ECC Error Recovery

**GPU-SH Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              GPU SELF-HEALING                                    ║
╚══════════════════════════════════════════════════════════════════╝

GPU STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPU 2:          WARNING ⚠️

Health Metrics:
• Temperature:  72°C (normal)
• Memory Used:  12.4 / 16.0 GB (78%)
• Utilization:  89% (heavy)
• Power Draw:   285W / 300W limit
• ECC Errors:   47 corrected / 0 uncorrected ⚠️

ISSUE DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           ecc_error
Severity:       WARNING
GPU:            2

Details:
47 corrected ECC errors detected in last hour. Error rate elevated 
but within acceptable range. Pattern suggests memory degradation.

RECOVERY ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       kernel_restart
Status:         COMPLETED ✅

Steps:
1. Create checkpoint - ✅ Completed (saved to /checkpoints/gpu2_001)
2. Terminate kernels - ✅ Completed (3 kernels terminated)
3. Clear memory - ✅ Completed (12.4 GB freed)
4. Reset CUDA context - ✅ Completed
5. Restore checkpoint - ✅ Completed (training resumed)
6. Verify health - ✅ Passed (ECC errors: 0)

Result:         SUCCESS
• ECC errors cleared
• Training job resumed from checkpoint
• No data loss
• Estimated time saved: 4.2 hours

Post-Action:
• GPU 2 marked for increased monitoring
• Next checkpoint scheduled in 30 minutes
• Maintenance window scheduled in 48 hours
```

### Example 2: Temperature Throttling Recovery

**GPU-SH Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              GPU SELF-HEALING                                    ║
╚══════════════════════════════════════════════════════════════════╝

GPU STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPU 0:          CRITICAL 🚨

Health Metrics:
• Temperature:  94°C (CRITICAL) 🚨
• Memory Used:  8.2 / 16.0 GB (51%)
• Utilization:  98% (heavy)
• Power Draw:   298W / 300W limit
• ECC Errors:   0 corrected / 0 uncorrected

ISSUE DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           temperature
Severity:       CRITICAL
GPU:            0

Details:
GPU temperature at 94°C, approaching thermal limit (95°C). GPU is 
throttling performance. Risk of thermal shutdown.

RECOVERY ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       load_reduction
Status:         COMPLETED ✅

Steps:
1. Reduce batch size - ✅ 64 → 32
2. Lower clock frequencies - ✅ Applied power limit 250W
3. Migrate 2 tasks to GPU 1 - ✅ Completed
4. Increase fan speed - ✅ 85% → 100%
5. Monitor temperature - ✅ Passed

Result:         SUCCESS
• Temperature: 94°C → 78°C
• Performance: Restored to 92% of nominal
• No training jobs interrupted
• Thermal stability achieved

Post-Action:
• Power limit maintained at 250W
• Batch size optimization saved for future runs
• Cooling system inspection scheduled
```

## Error Handling

### Recovery Failure

**Condition:** Recovery strategy fails

**Response:**
1. Try next recovery strategy
2. Quarantine GPU if needed
3. Alert operators
4. Log for analysis

### Checkpoint Failure

**Condition:** Cannot create or restore checkpoint

**Response:**
1. Try alternative checkpoint method
2. Restart from beginning if necessary
3. Log checkpoint failure
4. Investigate storage issues

### Migration Failure

**Condition:** Cannot migrate tasks to another GPU

**Response:**
1. Try alternative target GPU
2. Save state and pause tasks
3. Alert operators
4. Queue for manual recovery

## Performance Characteristics

- **Monitoring Interval:** 5 seconds
- **Issue Detection:** <30 seconds
- **Recovery Time:** 5-60 seconds
- **Checkpoint Overhead:** <5%
- **Prediction Accuracy:** >85%

## Integration Points

- **Self-Healing Modules:** Coordinate with system healing
- **BFT Consensus:** GPU consensus for critical computations
- **WORM Archive:** Log GPU events
- **PTP Clock Sync:** Timestamps for GPU events

## Configuration

```yaml
gpu_self_healing:
  monitoring:
    interval: 5  # seconds
    metrics:
      - temperature
      - memory
      - utilization
      - power
      - ecc_errors
  
  thresholds:
    temperature:
      warning: 80
      critical: 90
    ecc_errors:
      warning: 10
      critical: 100
  
  recovery:
    auto_recover: true
    checkpoint_interval: 300  # seconds
    strategies:
      - kernel_restart
      - task_migration
      - load_reduction
      - gpu_reset
  
  predictive:
    enabled: true
    model_path: /models/gpu_failure_model.pkl
```
