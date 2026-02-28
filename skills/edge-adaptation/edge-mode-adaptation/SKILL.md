---
name: edge-mode-adaptation
description: Adapts behavior based on available compute, battery, and network conditions. Triggers continuously for resource monitoring and adaptation decisions. Ensures optimal performance under varying constraints.
version: 2.0.0
adaptation_strategies:
  - quality_reduction
  - model_compression
  - offload_decision
  - batch_size_adjustment
---

# Edge Mode Adaptation (EMA)

## Overview

The Edge Mode Adaptation module dynamically adapts system behavior based on available compute resources, battery level, and network conditions. It ensures optimal performance under varying constraints while maintaining functionality.

## Core Principles

**Resource Awareness:** Continuously monitor available resources.

**Graceful Degradation:** Reduce quality rather than fail.

**Proactive Adaptation:** Anticipate resource changes.

**User-Centric:** Prioritize user experience within constraints.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Edge Mode Adaptation Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Monitor    │────►│   Decide     │────►│   Adapt      │    │
│  │   Resources  │     │   Strategy   │     │   Behavior   │    │
│  │              │     │              │     │              │    │
│  │ • CPU        │     │ • Quality    │     │ • Reduce     │    │
│  │ • Memory     │     │ • Compress   │     │ • Compress   │    │
│  │ • Battery    │     │ • Offload    │     │ • Offload    │    │
│  │ • Network    │     │ • Batch      │     │ • Adjust     │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Adaptation Modes                            ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │  HIGH   │  │ MEDIUM  │  │  LOW    │  │CRITICAL │    ││   │
│  │  │ QUALITY │  │ QUALITY │  │ QUALITY │  │ QUALITY │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Resource Monitoring

Monitor system resources continuously:

**Resource Monitor:**
```python
class ResourceMonitor:
    def __init__(self):
        self.metrics = {}
        self.history = []
        
    def monitor(self):
        """Monitor all resources"""
        
        metrics = {
            'timestamp': time.time(),
            'compute': self.monitor_compute(),
            'memory': self.monitor_memory(),
            'battery': self.monitor_battery(),
            'network': self.monitor_network(),
            'thermal': self.monitor_thermal()
        }
        
        self.metrics = metrics
        self.history.append(metrics)
        
        # Keep history bounded
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
        
        return metrics
    
    def monitor_compute(self):
        """Monitor compute resources"""
        
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'cpu_count': psutil.cpu_count(),
            'cpu_freq': psutil.cpu_freq().current if psutil.cpu_freq() else None,
            'load_avg': os.getloadavg() if hasattr(os, 'getloadavg') else None,
            'gpu_available': self.check_gpu_available(),
            'gpu_utilization': self.get_gpu_utilization()
        }
    
    def monitor_memory(self):
        """Monitor memory resources"""
        
        mem = psutil.virtual_memory()
        
        return {
            'total': mem.total,
            'available': mem.available,
            'percent': mem.percent,
            'used': mem.used,
            'free': mem.free
        }
    
    def monitor_battery(self):
        """Monitor battery status"""
        
        battery = psutil.sensors_battery()
        
        if battery:
            return {
                'percent': battery.percent,
                'power_plugged': battery.power_plugged,
                'secs_left': battery.secs_left
            }
        
        return {'percent': 100, 'power_plugged': True, 'secs_left': None}
    
    def monitor_network(self):
        """Monitor network conditions"""
        
        # Measure latency
        latency = self.measure_latency()
        
        # Measure bandwidth
        bandwidth = self.measure_bandwidth()
        
        # Check connectivity
        connectivity = self.check_connectivity()
        
        return {
            'latency_ms': latency,
            'bandwidth_mbps': bandwidth,
            'connected': connectivity,
            'interface': self.get_active_interface()
        }
    
    def measure_latency(self):
        """Measure network latency"""
        
        try:
            # Ping a reliable host
            result = subprocess.run(
                ['ping', '-c', '1', '-W', '2', '8.8.8.8'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            # Parse latency from output
            if result.returncode == 0:
                match = re.search(r'time=(\d+\.?\d*)', result.stdout)
                if match:
                    return float(match.group(1))
        
        except Exception:
            pass
        
        return None
```

### Step 2 - Resource Classification

Classify resource availability:

**Resource Classifier:**
```python
class ResourceClassifier:
    def __init__(self):
        self.thresholds = self.load_thresholds()
        
    def classify(self, metrics):
        """Classify resource availability"""
        
        classifications = {}
        
        # Classify compute
        classifications['compute'] = self.classify_compute(
            metrics['compute']
        )
        
        # Classify memory
        classifications['memory'] = self.classify_memory(
            metrics['memory']
        )
        
        # Classify battery
        classifications['battery'] = self.classify_battery(
            metrics['battery']
        )
        
        # Classify network
        classifications['network'] = self.classify_network(
            metrics['network']
        )
        
        # Overall classification
        classifications['overall'] = self.classify_overall(
            classifications
        )
        
        return classifications
    
    def classify_compute(self, compute_metrics):
        """Classify compute availability"""
        
        cpu_percent = compute_metrics['cpu_percent']
        
        if cpu_percent < 50:
            return 'high'
        elif cpu_percent < 75:
            return 'medium'
        elif cpu_percent < 90:
            return 'low'
        else:
            return 'critical'
    
    def classify_memory(self, memory_metrics):
        """Classify memory availability"""
        
        percent = memory_metrics['percent']
        
        if percent < 60:
            return 'high'
        elif percent < 80:
            return 'medium'
        elif percent < 95:
            return 'low'
        else:
            return 'critical'
    
    def classify_battery(self, battery_metrics):
        """Classify battery status"""
        
        percent = battery_metrics['percent']
        plugged = battery_metrics['power_plugged']
        
        if plugged or percent > 50:
            return 'high'
        elif percent > 25:
            return 'medium'
        elif percent > 10:
            return 'low'
        else:
            return 'critical'
    
    def classify_network(self, network_metrics):
        """Classify network conditions"""
        
        if not network_metrics['connected']:
            return 'critical'
        
        latency = network_metrics['latency_ms']
        
        if latency is None:
            return 'critical'
        
        if latency < 50:
            return 'high'
        elif latency < 150:
            return 'medium'
        elif latency < 500:
            return 'low'
        else:
            return 'critical'
    
    def classify_overall(self, classifications):
        """Classify overall resource availability"""
        
        # Take worst classification
        priority = ['critical', 'low', 'medium', 'high']
        
        for level in priority:
            if level in classifications.values():
                return level
        
        return 'high'
```

### Step 3 - Adaptation Strategy Selection

Select adaptation strategy based on resources:

**Strategy Selector:**
```python
class AdaptationStrategySelector:
    def __init__(self):
        self.strategies = {
            'high': HighQualityStrategy(),
            'medium': MediumQualityStrategy(),
            'low': LowQualityStrategy(),
            'critical': CriticalQualityStrategy()
        }
        
    def select_strategy(self, resource_class):
        """Select adaptation strategy"""
        
        overall = resource_class['overall']
        
        strategy = self.strategies[overall]
        
        # Fine-tune based on specific constraints
        if resource_class['battery'] == 'critical':
            strategy.enable_power_saving()
        
        if resource_class['network'] == 'critical':
            strategy.enable_offline_mode()
        
        if resource_class['compute'] == 'critical':
            strategy.enable_minimal_processing()
        
        return strategy
```

**Quality Strategies:**
```python
class HighQualityStrategy:
    def __init__(self):
        self.name = 'high_quality'
        self.config = {
            'model_size': 'full',
            'inference_depth': 'deep',
            'context_window': 128000,
            'batch_size': 32,
            'use_gpu': True,
            'compression': 'none',
            'caching': 'aggressive'
        }
    
    def apply(self, system):
        """Apply high quality configuration"""
        
        system.configure(self.config)
        
        return {'mode': 'high_quality', 'config': self.config}

class LowQualityStrategy:
    def __init__(self):
        self.name = 'low_quality'
        self.config = {
            'model_size': 'compressed',
            'inference_depth': 'shallow',
            'context_window': 8000,
            'batch_size': 4,
            'use_gpu': False,
            'compression': 'high',
            'caching': 'minimal'
        }
    
    def enable_power_saving(self):
        """Enable additional power saving"""
        
        self.config['batch_size'] = 1
        self.config['polling_interval'] = 5000  # ms
    
    def apply(self, system):
        """Apply low quality configuration"""
        
        system.configure(self.config)
        
        return {'mode': 'low_quality', 'config': self.config}
```

### Step 4 - Model Compression

Compress models for resource-constrained environments:

**Model Compressor:**
```python
class ModelCompressor:
    def __init__(self):
        self.compression_methods = {
            'quantization': QuantizationCompressor(),
            'pruning': PruningCompressor(),
            'distillation': DistillationCompressor(),
            'knowledge_distillation': KnowledgeDistillationCompressor()
        }
        
    def compress(self, model, target_size, method='quantization'):
        """Compress model to target size"""
        
        compressor = self.compression_methods[method]
        
        compressed = compressor.compress(model, target_size)
        
        # Verify quality
        quality = self.evaluate_quality(model, compressed)
        
        return {
            'model': compressed,
            'original_size': self.get_model_size(model),
            'compressed_size': self.get_model_size(compressed),
            'compression_ratio': self.get_model_size(model) / self.get_model_size(compressed),
            'quality_retention': quality
        }
    
    def evaluate_quality(self, original, compressed):
        """Evaluate quality retention after compression"""
        
        # Run evaluation on test set
        original_accuracy = self.evaluate(original)
        compressed_accuracy = self.evaluate(compressed)
        
        return compressed_accuracy / original_accuracy
```

### Step 5 - Offload Decision

Decide whether to offload computation:

**Offload Decider:**
```python
class OffloadDecider:
    def __init__(self):
        self.cost_model = OffloadCostModel()
        
    def should_offload(self, task, resources):
        """Decide if task should be offloaded"""
        
        # Estimate local cost
        local_cost = self.estimate_local_cost(task, resources)
        
        # Estimate offload cost
        offload_cost = self.estimate_offload_cost(task, resources)
        
        # Compare costs
        if offload_cost < local_cost * 0.8:  # 20% threshold
            return {
                'should_offload': True,
                'reason': 'offload_cheaper',
                'local_cost': local_cost,
                'offload_cost': offload_cost,
                'savings': local_cost - offload_cost
            }
        
        # Check if local resources critical
        if resources['compute'] == 'critical' or resources['memory'] == 'critical':
            return {
                'should_offload': True,
                'reason': 'local_resources_critical',
                'local_cost': local_cost,
                'offload_cost': offload_cost
            }
        
        return {
            'should_offload': False,
            'reason': 'local_cheaper',
            'local_cost': local_cost,
            'offload_cost': offload_cost
        }
    
    def estimate_local_cost(self, task, resources):
        """Estimate cost of local execution"""
        
        # Consider compute, memory, battery
        compute_cost = task['compute_units'] * self.compute_unit_cost(resources)
        memory_cost = task['memory_units'] * self.memory_unit_cost(resources)
        battery_cost = task['energy_units'] * self.battery_unit_cost(resources)
        
        return compute_cost + memory_cost + battery_cost
    
    def estimate_offload_cost(self, task, resources):
        """Estimate cost of offloading"""
        
        # Consider latency, bandwidth, remote compute
        latency_cost = resources['network']['latency_ms'] * self.latency_weight
        
        data_size = task['input_size'] + task['output_size']
        bandwidth_cost = data_size / resources['network']['bandwidth_mbps']
        
        remote_compute_cost = task['compute_units'] * self.remote_compute_cost
        
        return latency_cost + bandwidth_cost + remote_compute_cost
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              EDGE MODE ADAPTATION                                ║
╚══════════════════════════════════════════════════════════════════╝

RESOURCE STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compute:        [high/medium/low/critical] ([X]% CPU)
Memory:         [high/medium/low/critical] ([X]% used)
Battery:        [high/medium/low/critical] ([X]% remaining)
Network:        [high/medium/low/critical] ([X]ms latency)

Overall:        [high/medium/low/critical]

[If adaptation triggered]
ADAPTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       [high/medium/low/critical]_quality

Changes:
• Model:        [full/compressed/minimal]
• Context:      [N] tokens
• Batch:        [N]
• GPU:          [enabled/disabled]
• Compression:  [none/medium/high]

[If offloading]
OFFLOAD DECISION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Decision:       [OFFLOAD/LOCAL]
Reason:         [why]

Cost Comparison:
• Local:        [X.XX]
• Offload:      [X.XX]
• Savings:      [X.XX] ([X]%)
```

## Examples

### Example 1: Battery-Based Adaptation

**EMA Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              EDGE MODE ADAPTATION                                ║
╚══════════════════════════════════════════════════════════════════╝

RESOURCE STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compute:        high (32% CPU)
Memory:         high (45% used)
Battery:        critical (8% remaining) 🚨
Network:        high (23ms latency)

Overall:        critical ⚠️

ADAPTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       critical_quality

Changes:
• Model:        minimal (distilled 10x smaller)
• Context:      2,048 tokens (was 128,000)
• Batch:        1 (was 32)
• GPU:          disabled
• Compression:  high
• Polling:      5 second intervals

Power Saving Measures:
• Screen brightness reduced
• Background sync disabled
• Aggressive sleep mode enabled

Estimated Battery Extension: 3.2x (2 hours → 6.4 hours)
Quality Impact: -35% (acceptable for critical battery)
```

### Example 2: Network-Based Offload Decision

**EMA Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              EDGE MODE ADAPTATION                                ║
╚══════════════════════════════════════════════════════════════════╝

RESOURCE STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compute:        critical (95% CPU)
Memory:         medium (72% used)
Battery:        medium (45% remaining)
Network:        high (18ms latency, 100 Mbps)

Overall:        critical ⚠️

OFFLOAD DECISION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Decision:       OFFLOAD ✅
Reason:         local_resources_critical

Task:           Large language model inference (10K tokens)

Cost Comparison:
• Local:        12.5 seconds, 85% CPU, 2.3 Wh
• Offload:      0.8 seconds, 5% CPU, 0.1 Wh
• Savings:      11.7 seconds (93%), 80% CPU, 96% energy

Offload Target: cloud-inference-01 (23ms away)

ADAPTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strategy:       medium_quality (local tasks only)

Local Tasks:
• UI rendering: unchanged
• Caching: unchanged
• Background: reduced

Offloaded Tasks:
• LLM inference: ✅
• Image generation: ✅
• Complex calculations: ✅

Result: CPU reduced from 95% to 23%, responsiveness restored
```

## Error Handling

### Adaptation Failure

**Condition:** Cannot apply adaptation

**Response:**
1. Try fallback strategy
2. Alert user
3. Continue with current config
4. Log failure

### Resource Fluctuation

**Condition:** Resources fluctuating rapidly

**Response:**
1. Add hysteresis to prevent oscillation
2. Average over time window
3. Prefer stable configurations
4. Log pattern

### Offload Unavailable

**Condition:** Offload target unavailable

**Response:**
1. Try alternative targets
2. Fall back to local processing
3. Reduce quality further
4. Alert user

## Performance Characteristics

- **Monitoring:** <1% CPU overhead
- **Classification:** <10ms
- **Adaptation:** <100ms
- **Compression:** 1-10 minutes (one-time)

## Integration Points

- **Cognitive Mode Controller:** Adapt mode based on resources
- **Self-Healing Modules:** Detect resource issues
- **WORM Archive:** Log adaptations
- **GPU Self-Healing:** Coordinate GPU usage

## Configuration

```yaml
edge_mode_adaptation:
  monitoring:
    interval: 5  # seconds
    history_size: 1000
  
  thresholds:
    compute:
      high: 50
      medium: 75
      low: 90
    memory:
      high: 60
      medium: 80
      low: 95
    battery:
      high: 50
      medium: 25
      low: 10
  
  adaptation:
    hysteresis: 10  # seconds
    min_duration: 30  # seconds
  
  offloading:
    latency_threshold: 100  # ms
    bandwidth_threshold: 10  # Mbps
    savings_threshold: 0.2  # 20%
```
