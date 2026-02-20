import { logInfo, logWarn, logError } from "../logger.js";

export interface TeamsMessage {
  id: string;
  type: string;
  from: {
    id: string;
    name: string;
    email?: string;
  };
  text: string;
  timestamp: string;
  channelId?: string;
  teamId?: string;
}

export interface TeamsResponse {
  type: string;
  text?: string;
  attachments?: TeamsAttachment[];
}

export interface TeamsAttachment {
  contentType: string;
  contentUrl?: string;
  content?: any;
  name?: string;
  thumbnailUrl?: string;
}

export class TeamsClient {
  private botId: string;
  private botPassword: string;
  private tenantId: string;
  private apiEndpoint: string;

  constructor(botId: string, botPassword: string, tenantId: string, apiEndpoint: string = 'https://smba.trafficmanager.net/amer/') {
    this.botId = botId;
    this.botPassword = botPassword;
    this.tenantId = tenantId;
    this.apiEndpoint = apiEndpoint;
    logInfo("Microsoft Teams messaging client initialized");
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const response = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.botId,
          client_secret: this.botPassword,
          scope: 'https://api.botframework.com/.default',
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Teams auth token: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logError(`Failed to get Teams auth token: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: string, messages: TeamsResponse[]): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      for (const message of messages) {
        const response = await fetch(`${this.apiEndpoint}/v3/conversations/${conversationId}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...message,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Teams API error: ${response.status} - ${JSON.stringify(error)}`);
        }
      }

      logInfo(`Sent ${messages.length} message(s) to Teams conversation: ${conversationId}`);
    } catch (error) {
      logError(`Failed to send Teams message: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(conversationId: string, text: string): Promise<void> {
    await this.sendMessage(conversationId, [{
      type: 'message',
      text,
    }]);
  }

  /**
   * Send a message with attachment
   */
  async sendMessageWithAttachment(
    conversationId: string,
    text: string,
    attachment: TeamsAttachment
  ): Promise<void> {
    await this.sendMessage(conversationId, [{
      type: 'message',
      text,
      attachments: [attachment],
    }]);
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.apiEndpoint}/v3/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Teams API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      logError(`Failed to get Teams conversation details: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(conversationId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.apiEndpoint}/v3/conversations/${conversationId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'typing',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Teams API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      logInfo(`Sent typing indicator to Teams conversation: ${conversationId}`);
    } catch (error) {
      logError(`Failed to send Teams typing indicator: ${(error as Error).message}`);
    }
  }
}

export class TeamsMonitor {
  private client: TeamsClient;
  private listeners: Array<(message: TeamsMessage) => void> = [];

  constructor(client: TeamsClient) {
    this.client = client;
    logInfo("Microsoft Teams monitor initialized");
  }

  /**
   * Add a listener for incoming messages
   */
  onMessage(listener: (message: TeamsMessage) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  offMessage(listener: (message: TeamsMessage) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Handle incoming activities
   */
  async handleActivity(activity: any): Promise<void> {
    if (activity.type === 'message' && activity.text) {
      const message: TeamsMessage = {
        id: activity.id,
        type: activity.type,
        from: {
          id: activity.from.id,
          name: activity.from.name,
          email: activity.from.aadObjectId,
        },
        text: activity.text,
        timestamp: activity.timestamp,
        channelId: activity.channelId,
        teamId: activity.team?.id,
      };

      for (const listener of this.listeners) {
        try {
          await listener(message);
        } catch (error) {
          logError(`Failed to handle Teams message: ${(error as Error).message}`);
        }
      }
    }
  }

  /**
   * Start the monitor
   */
  async start(): Promise<void> {
    logInfo("Teams monitor started");
    // Teams uses webhook events instead of long polling
  }

  /**
   * Stop the monitor
   */
  async stop(): Promise<void> {
    logInfo("Teams monitor stopped");
  }
}

export function createTeamsClient(
  botId: string,
  botPassword: string,
  tenantId: string
): TeamsClient {
  return new TeamsClient(botId, botPassword, tenantId);
}

export function createTeamsMonitor(client: TeamsClient): TeamsMonitor {
  return new TeamsMonitor(client);
}
