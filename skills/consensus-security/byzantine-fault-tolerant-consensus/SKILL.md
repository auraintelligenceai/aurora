---
name: byzantine-fault-tolerant-consensus
description: Triggers for ANY request involving distributed systems, multi-node coordination, or when consistency across multiple agents is required. Uses PBFT (Practical Byzantine Fault Tolerance) to ensure agreement even when some nodes fail or act maliciously. Critical for maintaining system integrity in adversarial environments.
version: 2.0.0
pbft_phases:
  - request
  - pre_prepare
  - prepare
  - commit
  - reply
tolerance_ratio: 0.33
---

# Byzantine Fault Tolerant Consensus (PBFT)

## Overview

The Byzantine Fault Tolerant Consensus module implements Practical Byzantine Fault Tolerance (PBFT) to ensure distributed agreement among nodes even when some nodes fail or act maliciously. It guarantees safety (no two correct nodes agree on different values) and liveness (correct nodes eventually agree) as long as fewer than 1/3 of nodes are Byzantine.

## Core Principles

**Safety:** No two correct nodes agree on different values.

**Liveness:** Correct nodes eventually agree on a value.

**Byzantine Tolerance:** System remains correct even with f faulty nodes out of 3f+1 total nodes.

**Deterministic:** All correct nodes reach the same decision.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              PBFT Consensus Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Client Request                        │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Primary │  │Replica 0│  │Replica 1│  │Replica 2│    │   │
│  │  │  (0)    │  │  (1)    │  │  (2)    │  │  (3)    │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│  │       │            │            │            │          │   │
│  │       │  PRE-PREPARE│            │            │          │   │
│  │       │────────────►│            │            │          │   │
│  │       │            │            │            │          │   │
│  │       │  PREPARE   │            │            │          │   │
│  │       │◄───────────│────────────│────────────►│          │   │
│  │       │            │            │            │          │   │
│  │       │  COMMIT    │            │            │          │   │
│  │       │◄───────────│────────────│────────────►│          │   │
│  │       │            │            │            │          │   │
│  └───────┼────────────┼────────────┼────────────┼──────────┘   │
│          │            │            │            │               │
│          ▼            ▼            ▼            ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Reply to Client                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Request Phase

Client sends request to the primary node:

**Request Format:**
```python
class ClientRequest:
    def __init__(self, operation, timestamp, client_id):
        self.operation = operation
        self.timestamp = timestamp
        self.client_id = client_id
    
    def digest(self):
        """Compute digest of request"""
        return hashlib.sha256(
            json.dumps({
                'operation': self.operation,
                'timestamp': self.timestamp,
                'client_id': self.client_id
            }, sort_keys=True).encode()
        ).hexdigest()
    
    def sign(self, private_key):
        """Sign request with client private key"""
        return private_key.sign(self.digest().encode())
```

**Client Behavior:**
```python
class PBFTClient:
    def __init__(self, nodes, f):
        self.nodes = nodes
        self.f = f  # Max faulty nodes
        self.sequence_number = 0
        
    def send_request(self, operation):
        """Send request to primary and collect replies"""
        
        request = ClientRequest(
            operation=operation,
            timestamp=time.time(),
            client_id=self.id
        )
        
        # Send to primary
        primary = self.get_primary()
        primary.send(request)
        
        # Wait for f+1 matching replies
        replies = {}
        timeout = 5.0
        start = time.time()
        
        while time.time() - start < timeout:
            reply = self.receive_reply()
            if reply:
                digest = reply.result_digest
                replies[digest] = replies.get(digest, 0) + 1
                
                if replies[digest] >= self.f + 1:
                    return reply.result
        
        # Timeout - retry with different primary
        return self.retry_with_view_change(request)
```

### Step 2 - Pre-Prepare Phase

Primary assigns sequence number and broadcasts pre-prepare:

**Pre-Prepare Message:**
```python
class PrePrepareMessage:
    def __init__(self, view, sequence, digest, request):
        self.view = view
        self.sequence = sequence
        self.digest = digest
        self.request = request
    
    def verify(self, primary_key):
        """Verify primary's signature"""
        return primary_key.verify(self.signature, self.digest().encode())
```

**Primary Behavior:**
```python
class PBFTPrimary:
    def __init__(self, view, nodes, f):
        self.view = view
        self.nodes = nodes
        self.f = f
        self.sequence_number = 0
        self.log = []
        
    def handle_request(self, request):
        """Process client request"""
        
        # Validate request
        if not self.validate_request(request):
            return
        
        # Assign sequence number
        self.sequence_number += 1
        
        # Compute digest
        digest = request.digest()
        
        # Create pre-prepare message
        pre_prepare = PrePrepareMessage(
            view=self.view,
            sequence=self.sequence_number,
            digest=digest,
            request=request
        )
        
        # Sign and broadcast
        pre_prepare.sign(self.private_key)
        self.broadcast(pre_prepare)
        
        # Add to log
        self.log.append({
            'view': self.view,
            'sequence': self.sequence_number,
            'digest': digest,
            'state': 'pre_prepared'
        })
```

### Step 3 - Prepare Phase

Replicas validate and broadcast prepare messages:

**Prepare Message:**
```python
class PrepareMessage:
    def __init__(self, view, sequence, digest, replica_id):
        self.view = view
        self.sequence = sequence
        self.digest = digest
        self.replica_id = replica_id
```

**Replica Prepare Logic:**
```python
class PBFTReplica:
    def __init__(self, replica_id, nodes, f):
        self.id = replica_id
        self.nodes = nodes
        self.f = f
        self.view = 0
        self.prepared = {}  # (view, sequence) -> set of prepares
        
    def handle_pre_prepare(self, msg):
        """Handle pre-prepare from primary"""
        
        # Verify primary signature
        primary_key = self.get_primary_key(msg.view)
        if not msg.verify(primary_key):
            return  # Invalid signature
        
        # Check view
        if msg.view != self.view:
            return  # Wrong view
        
        # Check sequence number
        if msg.sequence <= self.last_stable_checkpoint:
            return  # Old sequence
        
        # Verify digest matches request
        if msg.digest != msg.request.digest():
            return  # Digest mismatch
        
        # Accept pre-prepare
        self.accept_pre_prepare(msg)
        
        # Create and broadcast prepare
        prepare = PrepareMessage(
            view=msg.view,
            sequence=msg.sequence,
            digest=msg.digest,
            replica_id=self.id
        )
        prepare.sign(self.private_key)
        self.broadcast(prepare)
        
        # Track prepare
        key = (msg.view, msg.sequence)
        if key not in self.prepared:
            self.prepared[key] = set()
        self.prepared[key].add(self.id)
```

### Step 4 - Commit Phase

Replicas broadcast commit after receiving 2f prepares:

**Commit Message:**
```python
class CommitMessage:
    def __init__(self, view, sequence, digest, replica_id):
        self.view = view
        self.sequence = sequence
        self.digest = digest
        self.replica_id = replica_id
```

**Commit Logic:**
```python
def handle_prepare(self, msg):
    """Handle prepare message from replica"""
    
    # Verify replica signature
    replica_key = self.get_replica_key(msg.replica_id)
    if not msg.verify(replica_key):
        return
    
    # Track prepare
    key = (msg.view, msg.sequence)
    if key not in self.prepared:
        self.prepared[key] = set()
    self.prepared[key].add(msg.replica_id)
    
    # Check if prepared
    if len(self.prepared[key]) >= 2 * self.f:
        self.mark_prepared(key)
        
        # Create and broadcast commit
        commit = CommitMessage(
            view=msg.view,
            sequence=msg.sequence,
            digest=msg.digest,
            replica_id=self.id
        )
        commit.sign(self.private_key)
        self.broadcast(commit)

def handle_commit(self, msg):
    """Handle commit message from replica"""
    
    # Verify signature
    replica_key = self.get_replica_key(msg.replica_id)
    if not msg.verify(replica_key):
        return
    
    # Track commit
    key = (msg.view, msg.sequence)
    if key not in self.committed:
        self.committed[key] = set()
    self.committed[key].add(msg.replica_id)
    
    # Check if committed-local
    if len(self.committed[key]) >= 2 * self.f + 1:
        self.execute_request(key)
```

### Step 5 - Reply Phase

Replicas execute and reply to client:

**Reply Logic:**
```python
def execute_request(self, key):
    """Execute committed request"""
    
    view, sequence = key
    
    # Get request from log
    request = self.get_request(view, sequence)
    
    # Execute operation
    result = self.execute(request.operation)
    
    # Create reply
    reply = ReplyMessage(
        view=view,
        timestamp=request.timestamp,
        client_id=request.client_id,
        replica_id=self.id,
        result=result
    )
    reply.sign(self.private_key)
    
    # Send to client
    self.send_to_client(request.client_id, reply)
    
    # Mark as executed
    self.executed.add(key)
```

### Step 6 - View Change

Handle primary failure via view change:

**View Change Protocol:**
```python
def initiate_view_change(self, new_view):
    """Initiate view change to new primary"""
    
    # Stop processing in current view
    self.view_changing = True
    
    # Collect prepared certificates
    prepared_certs = []
    for key in self.prepared:
        if len(self.prepared[key]) >= 2 * self.f:
            prepared_certs.append({
                'view': key[0],
                'sequence': key[1],
                'prepares': list(self.prepared[key])
            })
    
    # Create view change message
    view_change = ViewChangeMessage(
        new_view=new_view,
        last_stable_checkpoint=self.last_stable_checkpoint,
        checkpoint_proofs=self.checkpoint_proofs,
        prepared_certs=prepared_certs,
        replica_id=self.id
    )
    view_change.sign(self.private_key)
    
    # Broadcast to all
    self.broadcast(view_change)

def handle_view_change(self, msg):
    """Handle view change message"""
    
    # Verify signature
    replica_key = self.get_replica_key(msg.replica_id)
    if not msg.verify(replica_key):
        return
    
    # Track view changes
    if msg.new_view not in self.view_changes:
        self.view_changes[msg.new_view] = []
    self.view_changes[msg.new_view].append(msg)
    
    # Check if enough view changes
    if len(self.view_changes[msg.new_view]) >= 2 * self.f + 1:
        self.adopt_new_view(msg.new_view)
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              BYZANTINE FAULT TOLERANT CONSENSUS                  ║
╚══════════════════════════════════════════════════════════════════╝

CONSENSUS STATUS: [PENDING/PRE_PREPARED/PREPARED/COMMITTED/EXECUTED]

REQUEST DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Operation:      [description]
Digest:         [hash]
Client:         [id]
Timestamp:      [time]

PBFT PROGRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View:           [N]
Sequence:       [N]
Primary:        [replica_id]

Phase Progress:
• Request:      ✅ Received
• Pre-Prepare:  ✅ Signed by primary
• Prepare:      [N]/[2f+1] replicas
• Commit:       [N]/[2f+1] replicas
• Reply:        [status]

[If view change]
VIEW CHANGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New View:       [N]
New Primary:    [replica_id]
View Changes:   [N] received
Reason:         [timeout/failure detected]

BYZANTINE TOLERANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Nodes:    [N]
Max Faulty (f): [N]
Tolerance:      [N] nodes can fail
Status:         [SAFE/AT_LIMIT/VIOLATED]
```

## Examples

### Example 1: Normal Consensus Flow

**Request:** "Update configuration parameter X to value Y"

**PBFT Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              BYZANTINE FAULT TOLERANT CONSENSUS                  ║
╚══════════════════════════════════════════════════════════════════╝

CONSENSUS STATUS: EXECUTED ✅

REQUEST DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Operation:      "UPDATE config.X = 'Y'"
Digest:         0x7a3f9c2e8d1b4f5a...
Client:         client-001
Timestamp:      2024-01-17T14:32:01.123Z

PBFT PROGRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View:           0
Sequence:       42
Primary:        replica-0

Phase Progress:
• Request:      ✅ Received from client-001
• Pre-Prepare:  ✅ Signed by replica-0 (primary)
• Prepare:      ✅ 3/3 replicas (replica-0,1,2)
• Commit:       ✅ 3/3 replicas (replica-0,1,2)
• Reply:        ✅ Sent to client-001

CONSENSUS RESULT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All correct replicas agreed on: UPDATE config.X = 'Y'
Execution confirmed by: replica-0, replica-1, replica-2

BYZANTINE TOLERANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Nodes:    4
Max Faulty (f): 1
Tolerance:      1 node can fail
Status:         SAFE ✅
```

### Example 2: View Change on Primary Failure

**Scenario:** Primary fails, replicas detect timeout

**PBFT Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              BYZANTINE FAULT TOLERANT CONSENSUS                  ║
╚══════════════════════════════════════════════════════════════════╝

CONSENSUS STATUS: VIEW CHANGING ⏳

VIEW CHANGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New View:       1
New Primary:    replica-1
View Changes:   3/4 received
Reason:         Primary timeout detected

PRIMARY FAILURE DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Failed Primary: replica-0
Timeout:        5.0 seconds
Detection:      replica-1, replica-2, replica-3

VIEW CHANGE MESSAGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• replica-1: ✅ Signed
• replica-2: ✅ Signed
• replica-3: ✅ Signed

NEW VIEW CERTIFICATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prepared Certificates: 2
  - Sequence 40: 3 prepares
  - Sequence 41: 3 prepares

Consensus will continue with new primary: replica-1

BYZANTINE TOLERANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Nodes:    4
Max Faulty (f): 1
Tolerance:      1 node can fail (including failed primary)
Status:         SAFE ✅
```

## Error Handling

### Network Partition

**Condition:** Network splits nodes into partitions

**Response:**
1. Detect partition via heartbeat timeout
2. Smaller partition pauses (cannot make progress)
3. Larger partition continues if majority
4. Reconcile on partition heal

### Byzantine Primary

**Condition:** Primary acts maliciously

**Response:**
1. Replicas detect inconsistency
2. Initiate view change
3. Elect new primary
4. Log malicious behavior

### Signature Verification Failure

**Condition:** Message signature invalid

**Response:**
1. Reject message
2. Log potential attack
3. Track suspicious node
4. Alert security module

## Performance Characteristics

- **Latency:** 3-5 message delays for consensus
- **Throughput:** 10,000+ requests/second (optimized)
- **Fault Tolerance:** f < n/3
- **Network:** O(n²) messages per request

## Integration Points

- **Ethical Governor:** Safety decisions use PBFT
- **WORM Archive:** Consensus for log entries
- **Cognitive Mode Controller:** Distributed mode decisions
- **Self-Healing Modules:** Coordination during recovery

## Configuration

```yaml
byzantine_fault_tolerant_consensus:
  nodes:
    count: 4
    max_faulty: 1
  
  timeouts:
    request: 5.0
    view_change: 10.0
    checkpoint: 100
  
  batching:
    enabled: true
    max_size: 100
    max_delay: 0.01
  
  checkpoint:
    period: 100
    enabled: true
```
