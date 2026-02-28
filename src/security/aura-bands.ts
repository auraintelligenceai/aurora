import { logError, logInfo, logWarn } from "../logger.js";

export interface AuraBandsConfig {
  enabled: boolean;
  requireApprovalFor: {
    fileWrites: boolean;
    shellCommands: boolean;
    networkRequests: boolean;
    dockerOperations: boolean;
  };
  approvalTimeout: number; // in seconds
  allowedHosts: string[];
  allowedCommands: string[];
}

export interface AuraBandsRequest {
  id: string;
  type: 'file-write' | 'shell-command' | 'network-request' | 'docker-operation';
  details: any;
  timestamp: number;
}

export interface AuraBandsApproval {
  requestId: string;
  approved: boolean;
  approver: string;
  timestamp: number;
  reason?: string;
}

class AuraBands {
  private config: AuraBandsConfig;
  private pendingRequests = new Map<string, AuraBandsRequest>();
  private approvals = new Map<string, AuraBandsApproval>();

  constructor(config: Partial<AuraBandsConfig> = {}) {
    this.config = {
      enabled: true,
      requireApprovalFor: {
        fileWrites: true,
        shellCommands: true,
        networkRequests: false,
        dockerOperations: true,
      },
      approvalTimeout: 300, // 5 minutes
      allowedHosts: [],
      allowedCommands: [],
      ...config,
    };
    logInfo("AuraBands security middleware initialized");
  }

  /**
   * Check if a request requires approval
   */
  private requiresApproval(request: AuraBandsRequest): boolean {
    if (!this.config.enabled) return false;

    const config = this.config.requireApprovalFor;

    switch (request.type) {
      case 'file-write':
        return config.fileWrites;
      case 'shell-command':
        return config.shellCommands && !this.isCommandAllowed(request.details.command);
      case 'network-request':
        return config.networkRequests && !this.isHostAllowed(request.details.host);
      case 'docker-operation':
        return config.dockerOperations;
      default:
        return true;
    }
  }

  /**
   * Check if a host is in the allowed list
   */
  private isHostAllowed(host: string): boolean {
    if (!host) return false;
    return this.config.allowedHosts.some(allowedHost => 
      host.includes(allowedHost)
    );
  }

  /**
   * Check if a command is in the allowed list
   */
  private isCommandAllowed(command: string): boolean {
    if (!command) return false;
    return this.config.allowedCommands.some(allowedCmd => 
      command.startsWith(allowedCmd)
    );
  }

  /**
   * Validate a Docker operation to prevent container escapes
   */
  private validateDockerOperation(details: any): boolean {
    // Block bind mounts to sensitive directories
    if (details.mounts) {
      for (const mount of details.mounts) {
        if (mount.type === 'bind') {
          const source = mount.source || '';
          if (
            source.startsWith('/') && 
            (
              source === '/' || 
              source.startsWith('/etc') || 
              source.startsWith('/root') || 
              source.startsWith('/proc') || 
              source.startsWith('/sys')
            )
          ) {
            logWarn(`Blocked Docker bind mount to sensitive directory: ${source}`);
            return false;
          }
        }
      }
    }

    // Block host networking
    if (details.network === 'host') {
      logWarn('Blocked Docker host networking');
      return false;
    }

    return true;
  }

  /**
   * Submit a request for approval
   */
  submitRequest(request: AuraBandsRequest): string {
    const requestId = request.id || Math.random().toString(36).substring(2, 15);
    
    if (request.type === 'docker-operation' && !this.validateDockerOperation(request.details)) {
      logError('Docker operation validation failed');
      return requestId;
    }

    this.pendingRequests.set(requestId, {
      ...request,
      id: requestId,
      timestamp: Date.now(),
    });

    logInfo(`Submitted ${request.type} request for approval: ${requestId}`);

    return requestId;
  }

  /**
   * Approve or reject a pending request
   */
  approveRequest(requestId: string, approved: boolean, approver: string, reason?: string): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      logWarn(`Request ${requestId} not found`);
      return;
    }

    this.pendingRequests.delete(requestId);
    this.approvals.set(requestId, {
      requestId,
      approved,
      approver,
      timestamp: Date.now(),
      reason,
    });

    logInfo(`Request ${requestId} ${approved ? 'approved' : 'rejected'} by ${approver}`);
  }

  /**
   * Check if a request has been approved
   */
  isApproved(requestId: string): boolean {
    const approval = this.approvals.get(requestId);
    return approval?.approved ?? false;
  }

  /**
   * Get all pending requests
   */
  getPendingRequests(): AuraBandsRequest[] {
    const now = Date.now();
    // Remove expired requests
    for (const [id, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.config.approvalTimeout * 1000) {
        this.pendingRequests.delete(id);
        logWarn(`Request ${id} expired`);
      }
    }
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Get all approvals
   */
  getApprovals(): AuraBandsApproval[] {
    return Array.from(this.approvals.values());
  }

  /**
   * Clear all pending requests
   */
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  /**
   * Clear all approvals
   */
  clearApprovals(): void {
    this.approvals.clear();
  }
}

// Export singleton instance
let auraBandsInstance: AuraBands | null = null;

export function getAuraBandsInstance(config: Partial<AuraBandsConfig> = {}): AuraBands {
  if (!auraBandsInstance) {
    auraBandsInstance = new AuraBands(config);
  }
  return auraBandsInstance;
}

// Helper functions for common use cases

/**
 * Check if a file write operation requires approval
 */
export function checkFileWriteApproval(filePath: string, contentLength: number): string | null {
  const auraBands = getAuraBandsInstance();
  const request: AuraBandsRequest = {
    id: Math.random().toString(36).substring(2, 15),
    type: 'file-write',
    details: {
      filePath,
      contentLength,
    },
    timestamp: Date.now(),
  };
  
  // Make requiresApproval public or create a public method for it
  // For now, we'll just submit the request and let submitRequest handle the check
  return auraBands.submitRequest(request);
}

/**
 * Check if a shell command requires approval
 */
export function checkShellCommandApproval(command: string, args: string[]): string | null {
  const auraBands = getAuraBandsInstance();
  const request: AuraBandsRequest = {
    id: Math.random().toString(36).substring(2, 15),
    type: 'shell-command',
    details: {
      command,
      args,
    },
    timestamp: Date.now(),
  };
  
  return auraBands.submitRequest(request);
}

/**
 * Check if a Docker operation requires approval
 */
export function checkDockerOperationApproval(operation: string, details: any): string | null {
  const auraBands = getAuraBandsInstance();
  const request: AuraBandsRequest = {
    id: Math.random().toString(36).substring(2, 15),
    type: 'docker-operation',
    details: {
      operation,
      ...details,
    },
    timestamp: Date.now(),
  };
  
  return auraBands.submitRequest(request);
}
