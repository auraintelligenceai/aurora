---
name: formal-verification
description: Uses Z3 SMT solver to mathematically prove safety properties of critical code paths. Triggers for ANY high-stakes operation, safety-critical decision, or when formal guarantees are required. Provides mathematical certainty for critical operations.
version: 2.0.0
solver_timeout: 3.0
verification_depth: 10
---

# Formal Verification (FV)

## Overview

The Formal Verification module uses Z3 SMT (Satisfiability Modulo Theories) solver to mathematically prove safety properties of critical code paths. It provides formal guarantees that critical operations will not violate safety constraints.

## Core Principles

**Mathematical Certainty:** Prove properties with mathematical rigor.

**Exhaustive:** Covers all possible inputs, not just test cases.

**Automated:** Automatic verification without manual proof.

**Composable:** Verify components, compose verified systems.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              Formal Verification Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Parse      │────►│   Encode     │────►│   Verify     │    │
│  │   Code/Spec  │     │   as SMT-LIB │     │   with Z3    │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │             │
│                       ┌────────────────────────────┴────────┐   │
│                       ▼                                     │   │
│  ┌─────────────────────────────────────────────────────────┐│   │
│  │              Verification Result                         ││   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    ││   │
│  │  │  PROVED │  │  FAILED │  │ TIMEOUT │  │ UNKNOWN │    ││   │
│  │  │   ✅    │  │   ❌    │  │   ⏱️   │  │   ❓    │    ││   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    ││   │
│  └─────────────────────────────────────────────────────────┘│   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1 - Specification

Define formal specifications to verify:

**Specification Language:**
```python
class FormalSpecification:
    def __init__(self, name):
        self.name = name
        self.preconditions = []
        self.postconditions = []
        self.invariants = []
        
    def requires(self, condition):
        """Add precondition"""
        self.preconditions.append(condition)
        return self
    
    def ensures(self, condition):
        """Add postcondition"""
        self.postconditions.append(condition)
        return self
    
    def invariant(self, condition):
        """Add loop invariant"""
        self.invariants.append(condition)
        return self
```

**Example Specification:**
```python
# Specify a function that transfers funds
transfer_spec = FormalSpecification("transfer")
    .requires("amount >= 0")
    .requires("sender_balance >= amount")
    .ensures("sender_balance' == sender_balance - amount")
    .ensures("receiver_balance' == receiver_balance + amount")
    .ensures("total_balance' == total_balance")  # Conservation
```

### Step 2 - Encoding

Encode code and specifications as SMT-LIB:

**SMT Encoder:**
```python
class SMTEncoder:
    def __init__(self):
        self.solver = Solver()
        self.variables = {}
        
    def encode_function(self, func, spec):
        """Encode function with specification"""
        
        # Declare input variables
        for param in func.parameters:
            self.declare_variable(param.name, param.type)
        
        # Encode preconditions
        for pre in spec.preconditions:
            self.solver.add(self.encode_condition(pre))
        
        # Encode function body
        self.encode_body(func.body)
        
        # Encode postconditions as assertions to prove
        proof_obligations = []
        for post in spec.postconditions:
            # Negate postcondition (we want to prove it's unsatisfiable)
            negated = self.negate(self.encode_condition(post))
            proof_obligations.append(negated)
        
        return proof_obligations
    
    def declare_variable(self, name, var_type):
        """Declare SMT variable"""
        
        if var_type == 'Int':
            var = Int(name)
        elif var_type == 'Real':
            var = Real(name)
        elif var_type == 'Bool':
            var = Bool(name)
        else:
            var = Const(name, self.get_sort(var_type))
        
        self.variables[name] = var
        return var
    
    def encode_condition(self, condition):
        """Encode condition as SMT expression"""
        
        # Parse condition string
        # Example: "x >= 0" -> x >= 0
        
        # Handle common patterns
        if '>=' in condition:
            left, right = condition.split('>=')
            return self.variables[left.strip()] >= self.parse_value(right.strip())
        
        elif '==' in condition:
            left, right = condition.split('==')
            return self.variables[left.strip()] == self.parse_value(right.strip())
        
        elif '<=' in condition:
            left, right = condition.split('<=')
            return self.variables[left.strip()] <= self.parse_value(right.strip())
        
        # Add more operators as needed
        
        return True
    
    def encode_body(self, body):
        """Encode function body"""
        
        for stmt in body:
            if stmt.type == 'assignment':
                # Encode assignment
                var = self.variables.get(stmt.target)
                if var:
                    value = self.encode_expression(stmt.value)
                    self.solver.add(var == value)
            
            elif stmt.type == 'conditional':
                # Encode if-then-else
                condition = self.encode_condition(stmt.condition)
                
                # Create two branches
                then_solver = self.solver.copy()
                then_solver.add(condition)
                
                else_solver = self.solver.copy()
                else_solver.add(Not(condition))
            
            elif stmt.type == 'loop':
                # Encode loop with invariant
                invariant = self.encode_condition(stmt.invariant)
                self.solver.add(invariant)
```

### Step 3 - Verification

Verify specifications using Z3:

**Verifier:**
```python
class FormalVerifier:
    def __init__(self, timeout=3.0):
        self.timeout = timeout
        
    def verify(self, func, spec):
        """Verify function against specification"""
        
        # Encode as SMT
        encoder = SMTEncoder()
        proof_obligations = encoder.encode_function(func, spec)
        
        results = []
        
        for i, obligation in enumerate(proof_obligations):
            # Create solver
            solver = Solver()
            solver.set("timeout", int(self.timeout * 1000))
            
            # Add obligation
            solver.add(obligation)
            
            # Check satisfiability
            start_time = time.time()
            result = solver.check()
            elapsed = time.time() - start_time
            
            if result == unsat:
                # Property proved (negation is unsatisfiable)
                results.append({
                    'property': i,
                    'result': 'PROVED',
                    'time': elapsed,
                    'proof': solver.proof()
                })
            
            elif result == sat:
                # Counterexample found
                model = solver.model()
                results.append({
                    'property': i,
                    'result': 'FAILED',
                    'time': elapsed,
                    'counterexample': self.format_model(model)
                })
            
            elif result == unknown:
                # Timeout or solver couldn't determine
                results.append({
                    'property': i,
                    'result': 'UNKNOWN',
                    'time': elapsed,
                    'reason': solver.reason_unknown()
                })
        
        return {
            'specification': spec.name,
            'function': func.name,
            'results': results,
            'all_proved': all(r['result'] == 'PROVED' for r in results)
        }
    
    def format_model(self, model):
        """Format counterexample model"""
        
        counterexample = {}
        
        for decl in model:
            name = decl.name()
            value = model[decl]
            counterexample[name] = str(value)
        
        return counterexample
```

### Step 4 - Safety Properties

Define common safety properties:

**Safety Properties:**
```python
SAFETY_PROPERTIES = {
    'memory_safety': {
        'no_buffer_overflow': 
            'forall i: index < array_length',
        'no_use_after_free': 
            'access => allocated',
        'no_null_dereference': 
            'ptr != null'
    },
    
    'type_safety': {
        'no_type_confusion': 
            'type(obj) == expected_type',
        'valid_casts': 
            'cast => compatible_types'
    },
    
    'resource_safety': {
        'no_resource_leak': 
            'acquire => eventually(release)',
        'no_double_free': 
            'free_count <= 1'
    },
    
    'security': {
        'no_integer_overflow': 
            'result == a + b => result >= a && result >= b',
        'input_validation': 
            'input => valid(input)',
        'authorization': 
            'privileged_op => authorized'
    },
    
    'correctness': {
        'functional': 
            'output == f(input)',
        'termination': 
            'eventually(terminated)',
        'determinism': 
            'same_input => same_output'
    }
}
```

### Step 5 - Counterexample Analysis

Analyze failed verifications:

**Counterexample Analyzer:**
```python
class CounterexampleAnalyzer:
    def __init__(self):
        self.analyzers = {}
        
    def analyze(self, verification_result):
        """Analyze verification failure"""
        
        failed = [r for r in verification_result['results'] 
                 if r['result'] == 'FAILED']
        
        analysis = []
        
        for failure in failed:
            counterexample = failure['counterexample']
            
            # Analyze counterexample
            root_cause = self.find_root_cause(
                verification_result['function'],
                counterexample
            )
            
            # Suggest fix
            fix = self.suggest_fix(root_cause)
            
            analysis.append({
                'property': failure['property'],
                'counterexample': counterexample,
                'root_cause': root_cause,
                'suggested_fix': fix
            })
        
        return analysis
    
    def find_root_cause(self, func, counterexample):
        """Find root cause of violation"""
        
        # Trace through function with counterexample values
        # Identify where property is violated
        
        # Common patterns
        if 'index' in counterexample and 'length' in counterexample:
            if int(counterexample['index']) >= int(counterexample['length']):
                return {
                    'type': 'buffer_overflow',
                    'description': 'Array index exceeds bounds',
                    'location': self.find_location(func, 'index')
                }
        
        if 'ptr' in counterexample:
            if counterexample['ptr'] == 'null':
                return {
                    'type': 'null_dereference',
                    'description': 'Null pointer dereference',
                    'location': self.find_location(func, 'ptr')
                }
        
        return {
            'type': 'unknown',
            'description': 'Unknown violation pattern',
            'counterexample': counterexample
        }
```

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║              FORMAL VERIFICATION                                 ║
╚══════════════════════════════════════════════════════════════════╝

VERIFICATION TARGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Function:       [name]
Specification:  [spec name]

[If verifying]
VERIFICATION RESULT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         [PROVED ✅ / FAILED ❌ / TIMEOUT ⏱️ / UNKNOWN ❓]

Properties:     [N] total
• Proved:       [N]
• Failed:       [N]
• Timeout:      [N]
• Unknown:      [N]

Time:           [X.XX] seconds

[If failed]
COUNTEREXAMPLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Property:       [N]
Type:           [violation type]

Input Values:
• [var1]:       [value]
• [var2]:       [value]

Root Cause:
[Description of why property failed]

Suggested Fix:
[Recommended code change]

[If proved]
PROOF SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All properties verified ✅

Verified Properties:
• [Property 1]: Proved
• [Property 2]: Proved
• [Property 3]: Proved
```

## Examples

### Example 1: Successful Verification

**FV Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              FORMAL VERIFICATION                                 ║
╚══════════════════════════════════════════════════════════════════╝

VERIFICATION TARGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Function:       transfer_funds
Specification:  secure_transfer

VERIFICATION RESULT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         PROVED ✅

Properties:     4 total
• Proved:       4 ✅
• Failed:       0
• Timeout:      0
• Unknown:      0

Time:           0.847 seconds

PROOF SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All properties verified ✅

Verified Properties:
• Property 0: amount >= 0 - Proved
  No negative transfers possible
  
• Property 1: sender_balance >= amount - Proved
  No overdrafts possible
  
• Property 2: sender_balance' == sender_balance - amount - Proved
  Sender balance correctly reduced
  
• Property 3: total_balance' == total_balance - Proved
  Money conservation: no creation or destruction

Formal Guarantee:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This function is mathematically proven to:
✅ Never allow negative transfers
✅ Never allow overdrafts
✅ Correctly update balances
✅ Preserve total money supply
```

### Example 2: Verification Failure

**FV Output:**
```
╔══════════════════════════════════════════════════════════════════╗
║              FORMAL VERIFICATION                                 ║
╚══════════════════════════════════════════════════════════════════╝

VERIFICATION TARGET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Function:       process_array
Specification:  safe_array_access

VERIFICATION RESULT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:         FAILED ❌

Properties:     2 total
• Proved:       1 ✅
• Failed:       1 ❌
• Timeout:      0
• Unknown:      0

Time:           0.234 seconds

COUNTEREXAMPLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Property:       1
Type:           buffer_overflow

Input Values:
• index:        100
• array_length: 50
• data:         [array of 50 elements]

Execution Trace:
1. index = get_user_input()  → 100
2. if (index < array_length) → FALSE (100 < 50 is false)
3. BUT: array[index] accessed without bounds check!

Root Cause:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The bounds check at line 45 uses < instead of <=, but the actual 
access at line 52 doesn't use the checked value. User input of 
100 bypasses the check when array_length is 50.

Suggested Fix:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Line 52: Change from:
  return array[index];
To:
  if (index >= 0 && index < array_length) {
      return array[index];
  } else {
      return ERROR_OUT_OF_BOUNDS;
  }

Or ensure the checked value is used:
  checked_index = min(index, array_length - 1);
  return array[checked_index];
```

## Error Handling

### Timeout

**Condition:** Verification exceeds timeout

**Response:**
1. Return UNKNOWN status
2. Simplify specification
3. Increase timeout if needed
4. Use bounded verification

### Solver Error

**Condition:** Z3 solver encounters error

**Response:**
1. Log error details
2. Retry with different parameters
3. Fall back to testing
4. Alert for investigation

### Unsupported Feature

**Condition:** Code uses unsupported construct

**Response:**
1. Identify unsupported feature
2. Suggest alternative
3. Skip verification
4. Log limitation

## Performance Characteristics

- **Simple Properties:** <1 second
- **Complex Properties:** 1-10 seconds
- **Timeout:** 3 seconds default
- **Memory:** 100MB-1GB

## Integration Points

- **Ethical Governor:** Verify safety contracts
- **Self-Healing Modules:** Verify recovery logic
- **BFT Consensus:** Verify consensus properties
- **WORM Archive:** Log verification results

## Configuration

```yaml
formal_verification:
  solver:
    type: Z3
    timeout: 3.0  # seconds
    memory_limit: 1024  # MB
  
  properties:
    memory_safety: true
    type_safety: true
    resource_safety: true
    security: true
    correctness: true
  
  verification:
    depth: 10
    unroll_loops: true
    inline_functions: false
  
  reporting:
    show_counterexamples: true
    suggest_fixes: true
```
