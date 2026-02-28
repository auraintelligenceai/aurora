---
name: ptp-clock-sync
description: Synchronizes clocks across distributed nodes with sub-microsecond precision using IEEE 1588 PTP. Triggers continuously for distributed operations requiring precise timing. Essential for causality tracking and event ordering.
version: 2.0.0
ptp_roles:
  - grandmaster
  - master
  - slave
  - boundary_clock
---

# PTP Clock Synchronization (PTP-CS)

## Overview

The PTP Clock Synchronization module implements IEEE 1588 Precision Time Protocol (PTP) to synchronize clocks across distributed nodes with sub-microsecond precision. It is essential for causality tracking, event ordering, and coordinated actions in distributed systems.

## Core Principles

**Sub-Microsecond Precision:** Achieve nanosecond-level clock synchronization.

**Hardware Timestamping:** Use NIC hardware timestamps for accuracy.

**Master-Slave Hierarchy:** Organize clocks in a synchronization hierarchy.

**Fault Tolerance:** Continue operating even with grandmaster failure.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              PTP Clock Synchronization Architecture              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Grandmaster Clock                     │   │
│  │                    (Primary Time Source)                 │   │
│  │                         🕐                               │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │ Sync Messages                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Boundary Clock / Master Clocks              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Master  │  │ Master  │  │ Master  │  │ Master  │    │   │
│  │  │  🕑     │  │  🕒     │  │  🕓     │  │  🕔     │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│  └───────┼────────────┼────────────┼────────────┼──────────┘   │
│          │            │            │            │                │
│          ▼            ▼            ▼            ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Slave Clocks │  │ Slave Clocks │  │ Slave Clocks │          │
│  │  🕕  🕖  🕗  │  │  🕘  🕙  🕚  │  │  🕛  🕜  🕝  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - PTP Initialization

Initialize PTP on each node:

**PTP Initialization:**
```python
class PTPClock:
    def __init__(self, config):
        self.config = config
        self.role = config.get('role', 'slave')
        self.clock_id = self.generate_clock_id()
        self.parent = None
        self.offset_from_master = 0
        self.mean_path_delay = 0
        
        # Hardware timestamping
        self.hw_timestamping = config.get('hw_timestamping', True)
        
        # Initialize network interface
        self.interface = config['interface']
        self.socket = self.create_ptp_socket()
        
    def create_ptp_socket(self):
        """Create raw socket for PTP messages"""
        
        sock = socket.socket(
            socket.AF_PACKET,
            socket.SOCK_RAW,
            socket.htons(0x88F7)  # PTP Ethernet type
        )
        
        sock.bind((self.interface, 0))
        
        # Enable hardware timestamping
        if self.hw_timestamping:
            sock.setsockopt(
                socket.SOL_SOCKET,
                socket.SO_TIMESTAMPING,
                socket.SOF_TIMESTAMPING_RAW_HARDWARE |
                socket.SOF_TIMESTAMPING_RX_HARDWARE |
                socket.SOF_TIMESTAMPING_TX_HARDWARE
            )
        
        return sock
    
    def generate_clock_id(self):
        """Generate unique clock ID from MAC address"""
        
        mac = get_mac_address(self.interface)
        return int(mac.replace(':', ''), 16)
```

### Step 2 - Best Master Clock Algorithm (BMCA)

Determine the best master clock in the network:

**BMCA Implementation:**
```python
class BestMasterClockAlgorithm:
    def __init__(self):
        self.announce_messages = {}
        
    def run_bmca(self, local_clock, announce_messages):
        """Run Best Master Clock Algorithm"""
        
        # Collect all clock candidates
        candidates = [local_clock] + list(announce_messages.values())
        
        # Sort by priority (best first)
        sorted_candidates = sorted(
            candidates,
            key=self.clock_comparison_key,
            reverse=True
        )
        
        # Best clock becomes grandmaster
        best_clock = sorted_candidates[0]
        
        # Determine role
        if best_clock.clock_id == local_clock.clock_id:
            return 'grandmaster'
        else:
            return 'slave'
    
    def clock_comparison_key(self, clock):
        """Generate comparison key for clock priority"""
        
        # Priority order (highest priority first):
        # 1. Priority1 (user-configurable)
        # 2. ClockClass (quality of clock)
        # 3. ClockAccuracy
        # 4. OffsetScaledLogVariance
        # 5. Priority2 (user-configurable)
        # 6. ClockIdentity (tiebreaker)
        
        return (
            clock.priority1,
            clock.clock_class,
            clock.clock_accuracy,
            -clock.offset_scaled_log_variance,  # Lower variance = higher priority
            clock.priority2,
            clock.clock_id
        )
```

### Step 3 - Clock Synchronization

Synchronize slave clock to master:

**Sync Message Exchange:**
```python
class ClockSynchronization:
    def __init__(self, ptp_clock):
        self.clock = ptp_clock
        self.sync_interval = 1.0  # seconds
        
    def send_sync(self, dest_address):
        """Send Sync message as master"""
        
        # Get hardware timestamp
        tx_timestamp = self.get_hw_timestamp()
        
        # Create Sync message
        sync_msg = SyncMessage(
            source_port_identity=self.clock.clock_id,
            sequence_id=self.next_sequence_id(),
            origin_timestamp=tx_timestamp
        )
        
        # Send message
        self.clock.socket.send(sync_msg.serialize())
        
        # Send Follow_Up with precise timestamp
        follow_up = FollowUpMessage(
            source_port_identity=self.clock.clock_id,
            sequence_id=sync_msg.sequence_id,
            precise_origin_timestamp=tx_timestamp
        )
        
        self.clock.socket.send(follow_up.serialize())
    
    def handle_sync(self, sync_msg, rx_timestamp):
        """Handle received Sync message as slave"""
        
        # Record t2 (sync receive time)
        t2 = rx_timestamp
        
        # Wait for Follow_Up to get t1 (sync send time)
        follow_up = self.wait_for_follow_up(sync_msg.sequence_id)
        t1 = follow_up.precise_origin_timestamp
        
        # Send Delay_Req
        delay_req = DelayReqMessage(
            source_port_identity=self.clock.clock_id,
            sequence_id=self.next_sequence_id()
        )
        
        # Get t3 (delay_req send time)
        t3 = self.get_hw_timestamp()
        self.clock.socket.send(delay_req.serialize())
        
        # Wait for Delay_Resp to get t4 (delay_req receive time)
        delay_resp = self.wait_for_delay_resp(delay_req.sequence_id)
        t4 = delay_resp.receive_timestamp
        
        # Calculate offset and delay
        offset, delay = self.calculate_offset_delay(t1, t2, t3, t4)
        
        # Update clock
        self.update_clock(offset, delay)
        
        return offset, delay
    
    def calculate_offset_delay(self, t1, t2, t3, t4):
        """Calculate clock offset and path delay"""
        
        # t1 = master time when sync sent
        # t2 = slave time when sync received
        # t3 = slave time when delay_req sent
        # t4 = master time when delay_req received
        
        # Offset from master: (t2 - t1) - delay
        # Mean path delay: ((t2 - t1) + (t4 - t3)) / 2
        
        mean_path_delay = ((t2 - t1) + (t4 - t3)) / 2
        offset_from_master = (t2 - t1) - mean_path_delay
        
        return offset_from_master, mean_path_delay
    
    def update_clock(self, offset, delay):
        """Update local clock based on offset"""
        
        # Apply offset to system clock
        self.clock.offset_from_master = offset
        self.clock.mean_path_delay = delay
        
        # Use adjtime for gradual adjustment
        if abs(offset) > 1e-6:  # > 1 microsecond
            self.adjust_clock(offset)
        
        # Log synchronization
        WormArchive.log({
            'event': 'clock_sync',
            'offset': offset,
            'delay': delay,
            'timestamp': time.time_ns()
        })
```

### Step 4 - Hardware Timestamping

Use hardware timestamps for maximum accuracy:

**Hardware Timestamping:**
```python
class HardwareTimestamping:
    def __init__(self, interface):
        self.interface = interface
        self.sock = None
        
    def enable_hw_timestamping(self):
        """Enable hardware timestamping on interface"""
        
        # Create socket
        self.sock = socket.socket(
            socket.AF_PACKET,
            socket.SOCK_RAW,
            socket.htons(0x88F7)
        )
        
        # Enable hardware timestamping
        self.sock.setsockopt(
            socket.SOL_SOCKET,
            socket.SO_TIMESTAMPING,
            socket.SOF_TIMESTAMPING_RAW_HARDWARE |
            socket.SOF_TIMESTAMPING_RX_HARDWARE |
            socket.SOF_TIMESTAMPING_TX_HARDWARE |
            socket.SOF_TIMESTAMPING_SYS_HARDWARE
        )
        
        # Bind to interface
        self.sock.bind((self.interface, 0))
    
    def get_tx_timestamp(self):
        """Get hardware transmit timestamp"""
        
        # Receive timestamp from error queue
        msg, ancdata, flags, addr = self.sock.recvmsg(
            4096,
            socket.CMSG_SPACE(64)  # Space for timestamp
        )
        
        for cmsg_level, cmsg_type, cmsg_data in ancdata:
            if cmsg_level == socket.SOL_SOCKET:
                if cmsg_type == socket.SO_TIMESTAMPING:
                    # Parse hardware timestamp
                    hw_timestamp = self.parse_hw_timestamp(cmsg_data)
                    return hw_timestamp
        
        return None
    
    def get_rx_timestamp(self, msg, ancdata):
        """Get hardware receive timestamp"""
        
        for cmsg_level, cmsg_type, cmsg_data in ancdata:
            if cmsg_level == socket.SOL_SOCKET:
                if cmsg_type == socket.SO_TIMESTAMPING:
                    hw_timestamp = self.parse_hw_timestamp(cmsg_data)
                    return hw_timestamp
        
        return None
```

### Step 5 - Fault Tolerance

Handle grandmaster failures:

**Fault Tolerance:**
```python
class PTPFaultTolerance:
    def __init__(self, ptp_clock):
        self.clock = ptp_clock
        self.announce_timeout = 3.0  # seconds
        self.last_announce = time.time()
        
    def check_grandmaster_health(self):
        """Check if grandmaster is still alive"""
        
        elapsed = time.time() - self.last_announce
        
        if elapsed > self.announce_timeout:
            # Grandmaster may have failed
            return False
        
        return True
    
    def handle_grandmaster_failure(self):
        """Handle grandmaster failure"""
        
        # Clear parent
        self.clock.parent = None
        
        # Run BMCA to find new grandmaster
        self.clock.run_bmca()
        
        # If we become grandmaster, start sending sync
        if self.clock.role == 'grandmaster':
            self.clock.start_as_grandmaster()
        
        # Log failure and recovery
        WormArchive.log({
            'event': 'grandmaster_failure',
            'old_grandmaster': self.clock.parent,
            'new_role': self.clock.role,
            'timestamp': time.time_ns()
        })
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              PTP CLOCK SYNCHRONIZATION                           ║
╚══════════════════════════════════════════════════════════════════╝

PTP STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node:           [hostname]
Clock ID:       [id]
Role:           [grandmaster/master/slave/boundary]

Clock Quality:
• Class:        [class]
• Accuracy:     [accuracy]
• Priority 1:   [N]
• Priority 2:   [N]

[If slave]
SYNCHRONIZATION STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parent:         [parent clock id]
State:          [SYNCHRONIZING/LOCKED/HOLDOVER]

Timing:
• Offset:       [±X.XXX] μs ([within spec/out of spec])
• Path Delay:   [X.XXX] μs
• Sync Interval:[X.XX] s

Statistics:
• Sync Messages:        [N] received
• Follow_Up Messages:   [N] received
• Delay_Req Sent:       [N]
• Delay_Resp Received:  [N]

[If grandmaster]
GRANDMASTER STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slaves:         [N] synchronized

Announce Stats:
• Sent:         [N]
• Interval:     [X.XX] s

Sync Stats:
• Sent:         [N]
• Interval:     [X.XX] s
```

## Examples

### Example 1: Slave Synchronization

**PTP-CS Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              PTP CLOCK SYNCHRONIZATION                           ║
╚══════════════════════════════════════════════════════════════════╝

PTP STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node:           node-03
Clock ID:       0xA4B5C6D7E8F90123
Role:           slave

Clock Quality:
• Class:        248 (Default)
• Accuracy:     0x20 (Within 100 ns)
• Priority 1:   128
• Priority 2:   128

SYNCHRONIZATION STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parent:         0x1122334455667788 (grandmaster)
State:          LOCKED ✅

Timing:
• Offset:       +0.023 μs ✅ (within spec)
• Path Delay:   12.456 μs
• Sync Interval: 1.00 s

Statistics (last hour):
• Sync Messages:        3,600 received
• Follow_Up Messages:   3,600 received
• Delay_Req Sent:       3,600
• Delay_Resp Received:  3,600
• Packet Loss:          0 (0.00%)

Sync Quality:
• Mean Offset:          +0.018 μs
• Std Dev:              0.042 μs
• Max Offset:           +0.156 μs
• Min Offset:           -0.089 μs

All timing within specification (< 1 μs)
```

### Example 2: Grandmaster Election

**PTP-CS Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              PTP CLOCK SYNCHRONIZATION                           ║
╚══════════════════════════════════════════════════════════════════╝

PTP STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node:           node-01
Clock ID:       0x1122334455667788
Role:           grandmaster 👑

Clock Quality:
• Class:        6 (Primary reference)
• Accuracy:     0x20 (Within 100 ns)
• Priority 1:   10 (high priority)
• Priority 2:   10 (high priority)

GRANDMASTER STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slaves:         12 synchronized

Network Topology:
• Boundary Clocks:      2
• Direct Slaves:        10
• Total Nodes:          13

Announce Stats:
• Sent:         10,800
• Interval:     1.00 s

Sync Stats:
• Sent:         43,200
• Interval:     0.25 s
• Follow_Up:    43,200

Slave Status:
• Synchronized: 12/12 (100%)
• Within 1μs:   12/12 (100%)
• Within 100ns: 8/12 (67%)

Grandmaster Health: ✅
• GPS Lock:     Active
• Holdover:     Not needed
• Drift:        < 1 ppb
```

## Error Handling

### Sync Loss

**Condition:** Slave loses synchronization

**Response:**
1. Enter holdover mode
2. Use local oscillator
3. Attempt to re-sync
4. Alert if holdover exceeds limit

### Network Partition

**Condition:** Network partition separates nodes

**Response:**
1. Detect missing announces
2. Run BMCA in partition
3. Elect new grandmaster if needed
4. Reconcile on partition heal

### Hardware Timestamp Failure

**Condition:** Hardware timestamping unavailable

**Response:**
1. Fall back to software timestamps
2. Accept reduced accuracy
3. Log degradation
4. Alert operators

## Performance Characteristics

- **Sync Accuracy:** <100 nanoseconds (hardware)
- **Sync Interval:** 125ms - 1s configurable
- **Holdover:** 1-24 hours depending on oscillator
- **BMCA Convergence:** <5 seconds

## Integration Points

- **WORM Archive:** Timestamp all events
- **BFT Consensus:** Order events by timestamp
- **Self-Healing Modules:** Time-based healing
- **GPU Self-Healing:** Synchronize GPU clocks

## Configuration

```yaml
ptp_clock_sync:
  interface: eth0
  role: auto  # auto-detect via BMCA
  
  clock_quality:
    priority1: 128
    priority2: 128
    clock_class: 248
    clock_accuracy: 0x20
  
  timing:
    sync_interval: 1.0
    announce_interval: 1.0
    announce_timeout: 3.0
  
  hardware:
    timestamping: true
    tx_timestamp_timeout: 1.0
  
  fault_tolerance:
    holdover_limit: 3600  # seconds
    auto_recover: true
```
