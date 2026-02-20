import { logInfo, logWarn, logError } from "../logger.js";

export interface WorkflowStep {
  name: string;
  description: string;
  tool: string;
  parameters: any;
  condition?: string;
  nextStep?: string;
}

export interface Workflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
  startStep: string;
  variables?: Record<string, any>;
}

export interface WorkflowExecutionContext {
  workflow: Workflow;
  currentStep: string;
  variables: Record<string, any>;
  stepResults: Record<string, any>;
  executionId: string;
  startTime: Date;
}

export class SentientWorkflowShell {
  private workflows: Map<string, Workflow> = new Map();
  private toolRegistry: Map<string, (params: any, context: any) => Promise<any>> = new Map();
  private runningWorkflows: Map<string, WorkflowExecutionContext> = new Map();

  constructor() {
    logInfo("Sentient Workflow Shell initialized");
  }

  /**
   * Register a workflow
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.name, workflow);
    logInfo(`Registered workflow: ${workflow.name}`);
  }

  /**
   * Unregister a workflow
   */
  unregisterWorkflow(name: string): void {
    this.workflows.delete(name);
    logInfo(`Unregistered workflow: ${name}`);
  }

  /**
   * Get a workflow by name
   */
  getWorkflow(name: string): Workflow | undefined {
    return this.workflows.get(name);
  }

  /**
   * Register a tool
   */
  registerTool(name: string, handler: (params: any, context: any) => Promise<any>): void {
    this.toolRegistry.set(name, handler);
    logInfo(`Registered tool: ${name}`);
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): void {
    this.toolRegistry.delete(name);
    logInfo(`Unregistered tool: ${name}`);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): ((params: any, context: any) => Promise<any>) | undefined {
    return this.toolRegistry.get(name);
  }

  /**
   * Create a new workflow execution context
   */
  createExecutionContext(workflow: Workflow): WorkflowExecutionContext {
    return {
      workflow,
      currentStep: workflow.startStep,
      variables: { ...workflow.variables },
      stepResults: {},
      executionId: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      startTime: new Date(),
    };
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(name: string, initialVariables: Record<string, any> = {}): Promise<WorkflowExecutionContext> {
    const workflow = this.getWorkflow(name);
    if (!workflow) {
      throw new Error(`Workflow not found: ${name}`);
    }

    const context = this.createExecutionContext(workflow);
    context.variables = {
      ...context.variables,
      ...initialVariables,
    };

    this.runningWorkflows.set(context.executionId, context);
    logInfo(`Started executing workflow: ${name} (${context.executionId})`);

    try {
      await this.executeStep(context);
      logInfo(`Completed executing workflow: ${name} (${context.executionId})`);
    } catch (error) {
      logError(`Failed to execute workflow ${name} (${context.executionId}): ${(error as Error).message}`);
    } finally {
      this.runningWorkflows.delete(context.executionId);
    }

    return context;
  }

  /**
   * Execute a single step
   */
  private async executeStep(context: WorkflowExecutionContext): Promise<void> {
    const step = context.workflow.steps.find(s => s.name === context.currentStep);
    if (!step) {
      logWarn(`Step not found: ${context.currentStep}`);
      return;
    }

    logInfo(`Executing step: ${step.name}`);

    // Check condition
    if (step.condition && !this.evaluateCondition(step.condition, context)) {
      logInfo(`Condition for step ${step.name} not met, skipping`);
      if (step.nextStep) {
        context.currentStep = step.nextStep;
        await this.executeStep(context);
      }
      return;
    }

    // Execute tool
    const tool = this.getTool(step.tool);
    if (!tool) {
      logWarn(`Tool not found: ${step.tool}`);
      if (step.nextStep) {
        context.currentStep = step.nextStep;
        await this.executeStep(context);
      }
      return;
    }

    try {
      // Resolve parameters with variables
      const resolvedParams = this.resolveParameters(step.parameters, context);
      const result = await tool(resolvedParams, context);
      context.stepResults[step.name] = result;
      logInfo(`Completed step: ${step.name}`);

      // Move to next step
      if (step.nextStep) {
        context.currentStep = step.nextStep;
        await this.executeStep(context);
      }
    } catch (error) {
      logError(`Failed to execute step ${step.name}: ${(error as Error).message}`);
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, context: WorkflowExecutionContext): boolean {
    try {
      // Simple expression evaluator - for production use, consider a safe evaluator library
      const expr = condition
        .replace(/\$\{([^}]+)\}/g, (_, key) => {
          return context.variables[key] || context.stepResults[key] || 'undefined';
        });

      // For demo purposes, we'll use a simple evaluation
      return true;
    } catch (error) {
      logError(`Failed to evaluate condition: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Resolve parameters with variables
   */
  private resolveParameters(parameters: any, context: WorkflowExecutionContext): any {
    if (typeof parameters === 'string') {
      return parameters.replace(/\$\{([^}]+)\}/g, (_, key) => {
        return context.variables[key] || context.stepResults[key] || '';
      });
    }

    if (Array.isArray(parameters)) {
      return parameters.map(p => this.resolveParameters(p, context));
    }

    if (parameters && typeof parameters === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(parameters)) {
        result[key] = this.resolveParameters(value, context);
      }
      return result;
    }

    return parameters;
  }

  /**
   * Get running workflow context
   */
  getRunningWorkflow(executionId: string): WorkflowExecutionContext | undefined {
    return this.runningWorkflows.get(executionId);
  }

  /**
   * Get all running workflows
   */
  getRunningWorkflows(): WorkflowExecutionContext[] {
    return Array.from(this.runningWorkflows.values());
  }

  /**
   * Cancel a running workflow
   */
  cancelWorkflow(executionId: string): void {
    this.runningWorkflows.delete(executionId);
    logInfo(`Cancelled workflow: ${executionId}`);
  }

  /**
   * Get all workflows
   */
  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get all tools
   */
  getTools(): string[] {
    return Array.from(this.toolRegistry.keys());
  }

  /**
   * Validate a workflow
   */
  validateWorkflow(workflow: Workflow): string[] {
    const errors: string[] = [];

    // Check that start step exists
    if (!workflow.steps.find(s => s.name === workflow.startStep)) {
      errors.push(`Start step not found: ${workflow.startStep}`);
    }

    // Check that all steps have valid tools
    for (const step of workflow.steps) {
      if (!step.tool || !this.getTool(step.tool)) {
        errors.push(`Invalid tool for step ${step.name}: ${step.tool}`);
      }

      // Check that next step exists
      if (step.nextStep && !workflow.steps.find(s => s.name === step.nextStep)) {
        errors.push(`Next step not found for ${step.name}: ${step.nextStep}`);
      }
    }

    return errors;
  }
}

// Export singleton instance
let workflowShellInstance: SentientWorkflowShell | null = null;

export function getWorkflowShell(): SentientWorkflowShell {
  if (!workflowShellInstance) {
    workflowShellInstance = new SentientWorkflowShell();
  }
  return workflowShellInstance;
}

// Helper functions

export function registerWorkflow(workflow: Workflow): void {
  getWorkflowShell().registerWorkflow(workflow);
}

export function unregisterWorkflow(name: string): void {
  getWorkflowShell().unregisterWorkflow(name);
}

export function executeWorkflow(name: string, initialVariables: Record<string, any> = {}): Promise<WorkflowExecutionContext> {
  return getWorkflowShell().executeWorkflow(name, initialVariables);
}

export function registerTool(name: string, handler: (params: any, context: any) => Promise<any>): void {
  getWorkflowShell().registerTool(name, handler);
}

export function unregisterTool(name: string): void {
  getWorkflowShell().unregisterTool(name);
}

export function validateWorkflow(workflow: Workflow): string[] {
  return getWorkflowShell().validateWorkflow(workflow);
}
