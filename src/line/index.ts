import { logInfo, logWarn, logError } from "../logger.js";

export interface LineMessage {
  type: string;
  id: string;
  userId: string;
  text?: string;
  timestamp: number;
}

export interface LineResponse {
  type: string;
  text?: string;
  image?: {
    originalContentUrl: string;
    previewImageUrl: string;
  };
  flex?: any;
  altText?: string;
  contents?: any;
}

export class LineClient {
  private accessToken: string;
  private apiEndpoint: string;

  constructor(accessToken: string, apiEndpoint: string = 'https://api.line.me') {
    this.accessToken = accessToken;
    this.apiEndpoint = apiEndpoint;
    logInfo("Line messaging client initialized");
  }

  /**
   * Send a message to a user
   */
  async sendMessage(to: string, messages: LineResponse[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/v2/bot/message/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          to,
          messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Line API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      logInfo(`Sent message to Line user: ${to}`);
    } catch (error) {
      logError(`Failed to send Line message: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, text: string): Promise<void> {
    await this.sendMessage(to, [{
      type: 'text',
      text,
    }]);
  }

  /**
   * Send an image message
   */
  async sendImageMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string
  ): Promise<void> {
    await this.sendMessage(to, [{
      type: 'image',
      image: {
        originalContentUrl,
        previewImageUrl,
      },
    }]);
  }

  /**
   * Send a flex message
   */
  async sendFlexMessage(to: string, altText: string, contents: any): Promise<void> {
    await this.sendMessage(to, [{
      type: 'flex',
      text: altText,
      flex: contents,
    }]);
  }

  /**
   * Reply to a message
   */
  async replyMessage(replyToken: string, messages: LineResponse[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/v2/bot/message/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          replyToken,
          messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Line API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      logInfo(`Replied to Line message`);
    } catch (error) {
      logError(`Failed to reply to Line message: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/v2/bot/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Line API error: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      logError(`Failed to get Line user profile: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Verify signature
   */
  verifySignature(body: string, signature: string): boolean {
    // Implementation would be added here
    return true; // Temporary implementation for testing
  }
}

export class LineMonitor {
  private client: LineClient;
  private listeners: Array<(message: LineMessage) => void> = [];

  constructor(client: LineClient) {
    this.client = client;
    logInfo("Line monitor initialized");
  }

  /**
   * Add a listener for incoming messages
   */
  onMessage(listener: (message: LineMessage) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  offMessage(listener: (message: LineMessage) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvents(events: any[]): Promise<void> {
    for (const event of events) {
      if (event.type === 'message') {
        const message: LineMessage = {
          type: event.message.type,
          id: event.message.id,
          userId: event.source.userId,
          text: event.message.text,
          timestamp: event.timestamp,
        };

        for (const listener of this.listeners) {
          try {
            await listener(message);
          } catch (error) {
            logError(`Failed to handle Line message: ${(error as Error).message}`);
          }
        }
      }
    }
  }

  /**
   * Start the monitor
   */
  async start(): Promise<void> {
    logInfo("Line monitor started");
    // Line uses webhook events instead of long polling
  }

  /**
   * Stop the monitor
   */
  async stop(): Promise<void> {
    logInfo("Line monitor stopped");
  }
}

export function createLineClient(accessToken: string): LineClient {
  return new LineClient(accessToken);
}

export function createLineMonitor(client: LineClient): LineMonitor {
  return new LineMonitor(client);
}
