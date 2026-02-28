# Daemon System Analysis - Issues and Improvements

## Current System Status

Based on the codebase analysis, we're running on a **Windows 10** system with:
- Node.js runtime in active use
- Gateway running in foreground mode on port 18789
- Project path: `c:/Users/shamasesamke/Desktop/aurora/aurora`

## Key Files Analyzed

- **src/commands/configure.daemon.ts** - Main CLI interface for daemon configuration
- **src/daemon/service.ts** - Service resolution for different platforms (Windows, macOS, Linux)
- **src/daemon/program-args.ts** - Resolves CLI entrypoint and program arguments
- **src/daemon/constants.ts** - Service naming and configuration constants
- **src/daemon/schtasks.ts** - Windows Task Scheduler implementation

## Critical Issues Identified

### 1. Windows Task Scheduler (schtasks.ts) - Environment Variable Handling

**Issue:** The `buildTaskScript` function in [schtasks.ts](src/daemon/schtasks.ts) is not properly escaping environment variable values.

```typescript
// Current problematic code
lines.push(`set ${key}=${value}`);  // Line 163
```

**Problem:** If the environment variable value contains special characters (like `!`, `^`, `&`, `|`, etc.), the batch file will fail to execute.

**Impact:** Daemon startup failure on Windows if any configured environment variable has special characters.

**Recommendation:** Implement proper batch file escaping for environment variable values.

### 2. Windows Task Scheduler - Working Directory Handling

**Issue:** The working directory is not properly validated or escaped.

```typescript
// Current code
lines.push(`cd /d ${quoteCmdArg(workingDirectory)}`);  // Line 158
```

**Problem:** If the working directory contains characters like `%` or other batch file special characters, it may cause issues.

**Recommendation:** Add validation and proper escaping for working directory paths.

### 3. System Node Detection - Node Version Compatibility

**Issue:** The system node detection may not properly handle Node 22+ requirements.

**Code in runtime-paths.ts:**
```typescript
export async function resolveSystemNodeInfo(params: {
  env?: Record<string, string | undefined>;
  platform?: NodeJS.Platform;
  execFile?: ExecFileAsync;
}): Promise<SystemNodeInfo | null> {
  // ...
  return {
    path: systemNode,
    version,
    supported: isSupportedNodeVersion(version),
  };
}

export function renderSystemNodeWarning(
  systemNode: SystemNodeInfo | null,
  selectedNodePath?: string,
): string | null {
  if (!systemNode || systemNode.supported) return null;
  const versionLabel = systemNode.version ?? "unknown";
  const selectedLabel = selectedNodePath ? ` Using ${selectedNodePath} for the daemon.` : "";
  return `System Node ${versionLabel} at ${systemNode.path} is below the required Node 22+.${selectedLabel} Install Node 22+ from nodejs.org or Homebrew.`;
}
```

**Problem:** We need to verify what `isSupportedNodeVersion` checks.

### 4. Windows Task Scheduler - Error Handling

**Issue:** The error handling in schtasks.ts could be improved. For example, when attempting to stop a task that's not running:

```typescript
// Current code
const res = await execSchtasks(["/End", "/TN", taskName]);
if (res.code !== 0 && !isTaskNotRunning(res)) {
  throw new Error(`schtasks end failed: ${res.stderr || res.stdout}`.trim());
}
```

**Problem:** The `isTaskNotRunning` check is too simplistic.

### 5. Daemon Configuration - Install Path Validation

**Issue:** The `resolveCliEntrypointPathForService` function may not handle all installation scenarios correctly.

## Proposed Improvements & Enhancements

### 1. Fix Windows Task Scheduler Environment Variable Escaping

**Solution:** Implement proper batch file escaping for environment variable values.

```typescript
// Enhanced code for schtasks.ts
function escapeBatchVariable(value: string): string {
  // Escape special characters for batch files: !, ^, &, |, <, >, (, ), etc.
  return value.replace(/([!^&|<>()])/g, '^$1');
}

// In buildTaskScript function
lines.push(`set ${key}=${escapeBatchVariable(value)}`);
```

### 2. Enhance Windows Task Scheduler Working Directory Handling

**Solution:** Improve working directory validation and escaping.

```typescript
// Enhanced code for schtasks.ts
function isValidWindowsPath(path: string): boolean {
  // Basic validation for Windows paths
  const windowsPathRegex = /^[a-zA-Z]:[\\/](?:[^<>:"|?*]+[\\/])*[^<>:"|?*]*$/;
  return windowsPathRegex.test(path);
}

function escapeBatchPath(path: string): string {
  // Escape special characters in paths for batch files
  return path.replace(/([!^&|<>()])/g, '^$1');
}

// In buildTaskScript function
if (workingDirectory) {
  if (!isValidWindowsPath(workingDirectory)) {
    throw new Error(`Invalid working directory path: ${workingDirectory}`);
  }
  lines.push(`cd /d ${quoteCmdArg(escapeBatchPath(workingDirectory))}`);
}
```

### 3. Improve Node Version Detection and Validation

**Solution:** Enhance the node version validation function.

```typescript
// Enhanced code for runtime-guard.ts (where isSupportedNodeVersion likely exists)
export function isSupportedNodeVersion(version: string | null): boolean {
  if (!version) return false;
  
  const [major] = version.split('.').map(Number);
  if (isNaN(major)) return false;
  
  // Require Node 22+ for all features
  return major >= 22;
}
```

### 4. Enhanced Error Handling for Windows Task Scheduler

**Solution:** Improve error detection and reporting.

```typescript
// Enhanced code for schtasks.ts
function isTaskNotRunning(res: { stdout: string; stderr: string; code: number }): boolean {
  const detail = `${res.stderr || res.stdout}`.toLowerCase();
  return detail.includes("not running") || 
         detail.includes("could not find the task") || 
         detail.includes("the task is not currently running");
}

function isTaskNotFound(res: { stdout: string; stderr: string; code: number }): boolean {
  const detail = `${res.stderr || res.stdout}`.toLowerCase();
  return detail.includes("cannot find the file") || 
         detail.includes("could not find the task") || 
         detail.includes("the specified task name was not found");
}
```

### 5. Add Configuration Validation

**Solution:** Add validation for daemon configuration parameters.

```typescript
// New validation function
export function validateDaemonConfig(config: {
  port: number;
  runtime?: "node" | "bun" | "auto";
  nodePath?: string;
}): void {
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port number: ${config.port}. Must be between 1 and 65535.`);
  }
  
  if (config.runtime && !["node", "bun", "auto"].includes(config.runtime)) {
    throw new Error(`Invalid runtime: ${config.runtime}. Must be 'node', 'bun', or 'auto'.`);
  }
  
  if (config.nodePath) {
    // Validate nodePath is a valid file path
    if (!fs.existsSync(config.nodePath)) {
      throw new Error(`Node executable not found: ${config.nodePath}`);
    }
  }
}

// Usage in configure.daemon.ts
export async function maybeInstallDaemon(params: {
  runtime: RuntimeEnv;
  port: number;
  gatewayToken?: string;
  daemonRuntime?: GatewayDaemonRuntime;
}) {
  validateDaemonConfig(params);
  // ... existing logic
}
```

### 6. Improve Logging for Debugging

**Solution:** Enhance logging capabilities in the daemon system.

```typescript
// Enhanced logging in daemon functions
import { logger } from "../logging/logger.js";

// In schtasks.ts functions
export async function installScheduledTask({
  env,
  stdout,
  programArguments,
  workingDirectory,
  environment,
  description,
}: {
  env: Record<string, string | undefined>;
  stdout: NodeJS.WritableStream;
  programArguments: string[];
  workingDirectory?: string;
  environment?: Record<string, string | undefined>;
  description?: string;
}): Promise<{ scriptPath: string }> {
  logger.debug("Installing scheduled task", {
    taskName: resolveTaskName(env),
    scriptPath: resolveTaskScriptPath(env),
    workingDirectory,
  });
  
  // ... existing logic
  
  logger.debug("Scheduled task installed successfully", { scriptPath });
  return { scriptPath };
}
```

## Verification Steps

### 1. Check Current Node Version

```bash
# Check Node version
node --version

# Check if Node is in PATH
where node

# Check if Bun is available
where bun
```

### 2. Verify Current Gateway Configuration

```bash
# Check if gateway is running
pnpm aura_intelligence gateway status

# Check current configuration
pnpm aura_intelligence config get
```

### 3. Test Environment Variable Handling

```bash
# Set test environment variable with special characters
pnpm aura_intelligence config set gateway.env.TEST_VAR "test!value^with&special|characters"

# Check if config is saved correctly
pnpm aura_intelligence config get
```

## Summary

The daemon system has several potential issues, primarily in the Windows Task Scheduler implementation. The most critical issues are:

1. **Environment variable escaping** - Batch files require special escaping for variable values
2. **Working directory validation** - Need to ensure paths are valid before use
3. **Node version compatibility** - Ensure proper Node 22+ validation
4. **Error handling improvements** - More robust error detection

Implementing these improvements will enhance the reliability and stability of the daemon service on all platforms, but especially on Windows.
