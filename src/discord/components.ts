import { logInfo, logWarn, logError } from "../logger.js";

export type DiscordComponentType = 'button' | 'select' | 'modal';

export interface DiscordComponent {
  type: DiscordComponentType;
  id: string;
  label: string;
  style?: number;
  options?: DiscordSelectOption[];
  placeholder?: string;
  required?: boolean;
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}

export interface DiscordButtonComponent extends DiscordComponent {
  type: 'button';
  style: 1 | 2 | 3 | 4 | 5; // Primary, Secondary, Success, Danger, Link
  url?: string;
}

export interface DiscordSelectComponent extends DiscordComponent {
  type: 'select';
  minValues?: number;
  maxValues?: number;
  options: DiscordSelectOption[];
}

export interface DiscordModalComponent extends DiscordComponent {
  type: 'modal';
  title: string;
  components: DiscordComponent[];
}

export class DiscordComponentsManager {
  private components: Map<string, DiscordComponent> = new Map();
  private interactions: Map<string, (interaction: any) => Promise<void>> = new Map();

  constructor() {
    logInfo("Discord Components v2 manager initialized");
  }

  /**
   * Create a button component
   */
  createButton(options: Omit<DiscordButtonComponent, 'type'>): DiscordButtonComponent {
    const component: DiscordButtonComponent = {
      type: 'button',
      ...options,
    };
    this.components.set(component.id, component);
    logInfo(`Created Discord button component: ${component.id}`);
    return component;
  }

  /**
   * Create a select component (dropdown)
   */
  createSelect(options: Omit<DiscordSelectComponent, 'type'>): DiscordSelectComponent {
    const component: DiscordSelectComponent = {
      type: 'select',
      minValues: 1,
      maxValues: 1,
      ...options,
    };
    this.components.set(component.id, component);
    logInfo(`Created Discord select component: ${component.id}`);
    return component;
  }

  /**
   * Create a modal component
   */
  createModal(options: Omit<DiscordModalComponent, 'type'>): DiscordModalComponent {
    const component: DiscordModalComponent = {
      type: 'modal',
      ...options,
    };
    this.components.set(component.id, component);
    logInfo(`Created Discord modal component: ${component.id}`);
    return component;
  }

  /**
   * Get a component by ID
   */
  getComponent(id: string): DiscordComponent | undefined {
    return this.components.get(id);
  }

  /**
   * Register an interaction handler
   */
  registerInteractionHandler(id: string, handler: (interaction: any) => Promise<void>): void {
    this.interactions.set(id, handler);
    logInfo(`Registered interaction handler for component: ${id}`);
  }

  /**
   * Unregister an interaction handler
   */
  unregisterInteractionHandler(id: string): void {
    this.interactions.delete(id);
    logInfo(`Unregistered interaction handler for component: ${id}`);
  }

  /**
   * Handle interaction event
   */
  async handleInteraction(interaction: any): Promise<void> {
    const customId = interaction.data?.custom_id;
    if (!customId) {
      logWarn("Interaction event without custom_id");
      return;
    }

    const handler = this.interactions.get(customId);
    if (!handler) {
      logWarn(`No interaction handler registered for custom_id: ${customId}`);
      return;
    }

    try {
      logInfo(`Handling interaction for custom_id: ${customId}`);
      await handler(interaction);
      logInfo(`Handled interaction for custom_id: ${customId}`);
    } catch (error) {
      logError(`Failed to handle interaction ${customId}: ${(error as Error).message}`);
    }
  }

  /**
   * Convert component to Discord API format
   */
  toDiscordFormat(component: DiscordComponent): any {
    const base = {
      type: this.getDiscordComponentType(component.type),
      custom_id: component.id,
    };

    switch (component.type) {
      case 'button':
        const button = component as DiscordButtonComponent;
        return {
          ...base,
          label: button.label,
          style: button.style,
          url: button.url,
        };

      case 'select':
        const select = component as DiscordSelectComponent;
        return {
          ...base,
          placeholder: select.placeholder,
          min_values: select.minValues,
          max_values: select.maxValues,
          options: select.options.map(option => ({
            label: option.label,
            value: option.value,
            description: option.description,
            emoji: option.emoji,
            default: option.default,
          })),
        };

      case 'modal':
        const modal = component as DiscordModalComponent;
        return {
          custom_id: modal.id,
          title: modal.title,
          components: this.buildModalComponents(modal.components),
        };

      default:
        throw new Error(`Unknown component type: ${component.type}`);
    }
  }

  /**
   * Get Discord API component type number
   */
  private getDiscordComponentType(type: DiscordComponentType): number {
    switch (type) {
      case 'button':
        return 2;
      case 'select':
        return 3;
      default:
        throw new Error(`Unsupported component type: ${type}`);
    }
  }

  /**
   * Build modal components structure
   */
  private buildModalComponents(components: DiscordComponent[]): any[] {
    return components.map(component => ({
      type: 1, // Action Row
      components: [this.toDiscordFormat(component)],
    }));
  }

  /**
   * Create a component row
   */
  createActionRow(components: DiscordComponent[]): any {
    return {
      type: 1,
      components: components.map(this.toDiscordFormat.bind(this)),
    };
  }

  /**
   * Create a message with components
   */
  createMessageWithComponents(
    content: string,
    components: DiscordComponent[]
  ): any {
    return {
      content,
      components: components.map(component => this.createActionRow([component])),
    };
  }

  /**
   * Show a modal to the user
   */
  async showModal(
    interaction: any,
    modal: DiscordModalComponent
  ): Promise<void> {
    const modalData = this.toDiscordFormat(modal);
    
    await interaction.response.sendModal(modalData);
    logInfo(`Shown modal: ${modal.id}`);
  }

  /**
   * Respond to a button click
   */
  async respondToButtonClick(
    interaction: any,
    message?: string
  ): Promise<void> {
    if (message) {
      await interaction.reply({
        content: message,
        ephemeral: true,
      });
    } else {
      await interaction.deferUpdate();
    }
  }

  /**
   * Respond to a select change
   */
  async respondToSelectChange(
    interaction: any,
    selectedValue: string
  ): Promise<void> {
    await interaction.reply({
      content: `You selected: ${selectedValue}`,
      ephemeral: true,
    });
  }

  /**
   * Respond to a modal submit
   */
  async respondToModalSubmit(
    interaction: any,
    message?: string
  ): Promise<void> {
    if (message) {
      await interaction.reply({
        content: message,
        ephemeral: true,
      });
    } else {
      await interaction.deferUpdate();
    }
  }

  /**
   * Remove a component
   */
  removeComponent(id: string): void {
    if (this.components.delete(id)) {
      this.interactions.delete(id);
      logInfo(`Removed component: ${id}`);
    } else {
      logWarn(`Component not found: ${id}`);
    }
  }

  /**
   * Get all components
   */
  getComponents(): DiscordComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * Clear all components and handlers
   */
  clear(): void {
    this.components.clear();
    this.interactions.clear();
    logInfo("Cleared all Discord components and handlers");
  }
}

// Export singleton instance
let discordComponentsManagerInstance: DiscordComponentsManager | null = null;

export function getDiscordComponentsManager(): DiscordComponentsManager {
  if (!discordComponentsManagerInstance) {
    discordComponentsManagerInstance = new DiscordComponentsManager();
  }
  return discordComponentsManagerInstance;
}

// Helper functions

export function createDiscordButton(options: Omit<DiscordButtonComponent, 'type'>): DiscordButtonComponent {
  return getDiscordComponentsManager().createButton(options);
}

export function createDiscordSelect(options: Omit<DiscordSelectComponent, 'type'>): DiscordSelectComponent {
  return getDiscordComponentsManager().createSelect(options);
}

export function createDiscordModal(options: Omit<DiscordModalComponent, 'type'>): DiscordModalComponent {
  return getDiscordComponentsManager().createModal(options);
}

export function registerDiscordInteractionHandler(id: string, handler: (interaction: any) => Promise<void>): void {
  getDiscordComponentsManager().registerInteractionHandler(id, handler);
}

export function unregisterDiscordInteractionHandler(id: string): void {
  getDiscordComponentsManager().unregisterInteractionHandler(id);
}

export function handleDiscordInteraction(interaction: any): Promise<void> {
  return getDiscordComponentsManager().handleInteraction(interaction);
}

export function showDiscordModal(interaction: any, modal: DiscordModalComponent): Promise<void> {
  return getDiscordComponentsManager().showModal(interaction, modal);
}

export function respondToDiscordButtonClick(interaction: any, message?: string): Promise<void> {
  return getDiscordComponentsManager().respondToButtonClick(interaction, message);
}

export function respondToDiscordSelectChange(interaction: any, selectedValue: string): Promise<void> {
  return getDiscordComponentsManager().respondToSelectChange(interaction, selectedValue);
}

export function respondToDiscordModalSubmit(interaction: any, message?: string): Promise<void> {
  return getDiscordComponentsManager().respondToModalSubmit(interaction, message);
}

export function createDiscordMessageWithComponents(content: string, components: DiscordComponent[]): any {
  return getDiscordComponentsManager().createMessageWithComponents(content, components);
}
