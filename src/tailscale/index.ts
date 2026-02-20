import { logInfo, logWarn, logError } from "../logger.js";

export interface TailscaleConfig {
  apiKey?: string;
  tailnet?: string;
  hostname?: string;
  port?: number;
}

export interface TailscaleServeConfig {
  port: number;
  path?: string;
}

export interface TailscaleFunnelConfig extends TailscaleServeConfig {
  domain?: string;
}

export interface TailscaleStatus {
  connected: boolean;
  tailnet?: string;
  hostname?: string;
  ipAddresses?: string[];
  version?: string;
}

export class TailscaleClient {
  private config: TailscaleConfig;
  private apiBaseUrl: string;

  constructor(config: Partial<TailscaleConfig> = {}) {
    this.config = {
      apiKey: process.env.TAILSCALE_API_KEY,
      tailnet: process.env.TAILSCALE_TAILNET,
      hostname: process.env.TAILSCALE_HOSTNAME,
      port: 18789,
      ...config,
    };
    this.apiBaseUrl = 'https://api.tailscale.com';
    logInfo("Tailscale integration initialized");
  }

  /**
   * Get Tailscale status
   */
  async getStatus(): Promise<TailscaleStatus> {
    try {
      // Check if Tailscale CLI is available
      const cliStatus = this.execTailscaleCli(['status', '--json']);
      if (cliStatus.success) {
        const status = JSON.parse(cliStatus.output);
        return {
          connected: true,
          tailnet: status.Tailnet,
          hostname: status.Self.Hostname,
          ipAddresses: status.Self.TailscaleIPs,
          version: status.Version,
        };
      }

      return { connected: false };
    } catch (error) {
      logError(`Failed to get Tailscale status: ${(error as Error).message}`);
      return { connected: false };
    }
  }

  /**
   * Check if Tailscale is connected
   */
  async isConnected(): Promise<boolean> {
    const status = await this.getStatus();
    return status.connected;
  }

  /**
   * Create a Tailscale Serve configuration
   */
  async createServeConfig(config: TailscaleServeConfig): Promise<string> {
    try {
      // Use Tailscale CLI to create serve configuration
      const result = this.execTailscaleCli([
        'serve',
        `${config.port}:http`,
        ...(config.path ? [config.path] : []),
      ]);

      if (!result.success) {
        throw new Error(`Failed to create serve configuration: ${result.error}`);
      }

      logInfo(`Created Tailscale Serve configuration on port ${config.port}`);
      return result.output;
    } catch (error) {
      logError(`Failed to create Tailscale Serve configuration: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Create a Tailscale Funnel configuration
   */
  async createFunnelConfig(config: TailscaleFunnelConfig): Promise<string> {
    try {
      // Use Tailscale CLI to create funnel configuration
      const result = this.execTailscaleCli([
        'funnel',
        'serve',
        `${config.port}:https`,
        ...(config.path ? [config.path] : []),
        ...(config.domain ? ['--domain', config.domain] : []),
      ]);

      if (!result.success) {
        throw new Error(`Failed to create Funnel configuration: ${result.error}`);
      }

      logInfo(`Created Tailscale Funnel configuration on port ${config.port}`);
      return result.output;
    } catch (error) {
      logError(`Failed to create Tailscale Funnel configuration: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Stop Tailscale Serve
   */
  async stopServe(): Promise<string> {
    try {
      const result = this.execTailscaleCli(['serve', 'stop']);

      if (!result.success) {
        throw new Error(`Failed to stop serve: ${result.error}`);
      }

      logInfo("Stopped Tailscale Serve");
      return result.output;
    } catch (error) {
      logError(`Failed to stop Tailscale Serve: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Stop Tailscale Funnel
   */
  async stopFunnel(): Promise<string> {
    try {
      const result = this.execTailscaleCli(['funnel', 'stop']);

      if (!result.success) {
        throw new Error(`Failed to stop Funnel: ${result.error}`);
      }

      logInfo("Stopped Tailscale Funnel");
      return result.output;
    } catch (error) {
      logError(`Failed to stop Tailscale Funnel: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get serve status
   */
  async getServeStatus(): Promise<string> {
    try {
      const result = this.execTailscaleCli(['serve', 'status']);

      if (!result.success) {
        throw new Error(`Failed to get serve status: ${result.error}`);
      }

      return result.output;
    } catch (error) {
      logError(`Failed to get serve status: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get Funnel status
   */
  async getFunnelStatus(): Promise<string> {
    try {
      const result = this.execTailscaleCli(['funnel', 'status']);

      if (!result.success) {
        throw new Error(`Failed to get Funnel status: ${result.error}`);
      }

      return result.output;
    } catch (error) {
      logError(`Failed to get Funnel status: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Execute Tailscale CLI command
   */
  private execTailscaleCli(args: string[]): { success: boolean; output: string; error: string } {
    try {
      const { execSync } = require('node:child_process');
      const command = `tailscale ${args.join(' ')}`;
      const output = execSync(command, { encoding: 'utf8' });
      return { success: true, output, error: '' };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.stdout ? error.stdout.toString() : (error.stderr ? error.stderr.toString() : error.message),
      };
    }
  }

  /**
   * List shared nodes
   */
  async listSharedNodes(): Promise<any[]> {
    try {
      if (!this.config.apiKey || !this.config.tailnet) {
        throw new Error("API key and tailnet required for node listing");
      }

      const response = await fetch(`${this.apiBaseUrl}/api/v2/tailnet/${this.config.tailnet}/devices`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to list shared nodes: ${response.status} - ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      return data.devices;
    } catch (error) {
      logError(`Failed to list shared nodes: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get node information
   */
  async getNodeInfo(nodeId: string): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.tailnet) {
        throw new Error("API key and tailnet required for node info");
      }

      const response = await fetch(`${this.apiBaseUrl}/api/v2/device/${nodeId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get node info: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      logError(`Failed to get node info: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get Tailscale config
   */
  getConfig(): TailscaleConfig {
    return { ...this.config };
  }
}

export class TailscaleManager {
  private client: TailscaleClient;

  constructor(config: Partial<TailscaleConfig> = {}) {
    this.client = new TailscaleClient(config);
    logInfo("Tailscale manager initialized");
  }

  /**
   * Start Tailscale Serve
   */
  async startServe(port: number, path?: string): Promise<string> {
    try {
      const status = await this.client.getStatus();
      if (!status.connected) {
        throw new Error("Tailscale is not connected");
      }

      await this.client.stopServe(); // Stop any existing serve
      return await this.client.createServeConfig({ port, path });
    } catch (error) {
      logError(`Failed to start Tailscale Serve: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Start Tailscale Funnel
   */
  async startFunnel(port: number, path?: string, domain?: string): Promise<string> {
    try {
      const status = await this.client.getStatus();
      if (!status.connected) {
        throw new Error("Tailscale is not connected");
      }

      await this.client.stopFunnel(); // Stop any existing Funnel
      return await this.client.createFunnelConfig({ port, path, domain });
    } catch (error) {
      logError(`Failed to start Tailscale Funnel: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Stop all Tailscale services
   */
  async stopAll(): Promise<void> {
    try {
      await Promise.all([
        this.client.stopServe(),
        this.client.stopFunnel(),
      ]);
    } catch (error) {
      logError(`Failed to stop Tailscale services: ${(error as Error).message}`);
    }
  }

  /**
   * Get combined status
   */
  async getStatus(): Promise<{
    tailscale: TailscaleStatus;
    serve: string;
    funnel: string;
  }> {
    try {
      const tailscaleStatus = await this.client.getStatus();
      let serveStatus = '';
      let funnelStatus = '';

      if (tailscaleStatus.connected) {
        try {
          serveStatus = await this.client.getServeStatus();
        } catch (error) {
          logWarn(`Failed to get Serve status: ${(error as Error).message}`);
        }

        try {
          funnelStatus = await this.client.getFunnelStatus();
        } catch (error) {
          logWarn(`Failed to get Funnel status: ${(error as Error).message}`);
        }
      }

      return {
        tailscale: tailscaleStatus,
        serve: serveStatus,
        funnel: funnelStatus,
      };
    } catch (error) {
      logError(`Failed to get Tailscale status: ${(error as Error).message}`);
      throw error;
    }
  }

  getClient(): TailscaleClient {
    return this.client;
  }
}

export function createTailscaleClient(config: Partial<TailscaleConfig> = {}): TailscaleClient {
  return new TailscaleClient(config);
}

export function createTailscaleManager(config: Partial<TailscaleConfig> = {}): TailscaleManager {
  return new TailscaleManager(config);
}
