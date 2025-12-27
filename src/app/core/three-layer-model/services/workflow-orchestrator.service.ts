/**
 * Workflow Orchestrator Service
 * 
 * Based on blueprint: docs/strategy-governance/blueprint/system/04-event-driven-architecture.md
 * 
 * Coordinates complex multi-step workflows using events.
 * Implements saga pattern for compensating actions.
 */

import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IEventBus, DomainEvent } from '../../event-bus/interfaces/event-bus.interface';
import { EVENT_BUS } from '../../event-bus/constants/event-bus-tokens';

export interface WorkflowStep {
  name: string;
  eventType: string;
  handler: (event: DomainEvent) => Promise<void> | void;
  compensate?: (event: DomainEvent) => Promise<void> | void;
  timeout?: number;
}

export interface WorkflowDefinition {
  name: string;
  triggerEvent: string;
  steps: WorkflowStep[];
}

@Injectable({ providedIn: 'root' })
export class WorkflowOrchestrator {
  private eventBus = inject(EVENT_BUS);
  private destroyRef = inject(DestroyRef);
  private workflows = new Map<string, WorkflowDefinition>();
  private activeWorkflows = new Map<string, WorkflowExecution>();

  constructor() {
    this.registerCoreWorkflows();
  }

  /**
   * Register core GigHub workflows
   */
  private registerCoreWorkflows(): void {
    this.registerTaskCompletedWorkflow();
    this.registerQCWorkflow();
    this.registerAcceptanceWorkflow();
  }

  /**
   * Register a workflow definition
   */
  registerWorkflow(definition: WorkflowDefinition): void {
    this.workflows.set(definition.name, definition);

    // Subscribe to trigger event
    this.eventBus.on(definition.triggerEvent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        this.startWorkflow(definition.name, event);
      });
  }

  /**
   * Start a workflow execution
   */
  private async startWorkflow(workflowName: string, triggerEvent: DomainEvent): Promise<void> {
    const definition = this.workflows.get(workflowName);
    if (!definition) {
      console.error(`Workflow ${workflowName} not found`);
      return;
    }

    const executionId = this.generateExecutionId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowName,
      triggerEvent,
      startedAt: new Date(),
      currentStep: 0,
      completedSteps: [],
      status: 'running'
    };

    this.activeWorkflows.set(executionId, execution);

    try {
      await this.executeSteps(execution, definition);
      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      console.error(`Workflow ${workflowName} failed:`, error);
      execution.status = 'failed';
      execution.error = error as Error;
      await this.compensate(execution, definition);
    } finally {
      this.activeWorkflows.delete(executionId);
    }
  }

  /**
   * Execute workflow steps sequentially
   */
  private async executeSteps(
    execution: WorkflowExecution,
    definition: WorkflowDefinition
  ): Promise<void> {
    for (let i = 0; i < definition.steps.length; i++) {
      const step = definition.steps[i];
      execution.currentStep = i;

      await step.handler(execution.triggerEvent);
      execution.completedSteps.push(step.name);
    }
  }

  /**
   * Compensate (rollback) completed steps on failure
   */
  private async compensate(
    execution: WorkflowExecution,
    definition: WorkflowDefinition
  ): Promise<void> {
    // Compensate in reverse order
    for (let i = execution.completedSteps.length - 1; i >= 0; i--) {
      const stepName = execution.completedSteps[i];
      const step = definition.steps.find(s => s.name === stepName);

      if (step?.compensate) {
        try {
          await step.compensate(execution.triggerEvent);
        } catch (compensateError) {
          console.error(`Compensation failed for step ${stepName}:`, compensateError);
        }
      }
    }
  }

  /**
   * Task Completed Workflow
   */
  private registerTaskCompletedWorkflow(): void {
    this.registerWorkflow({
      name: 'task-completed',
      triggerEvent: 'task.completed',
      steps: [
        {
          name: 'update-progress',
          eventType: 'progress.updated',
          handler: async (event) => {
            // Update project progress based on completed task
            const taskId = event.data.taskId;
            this.eventBus.emit('progress.calculate', {
              taskId,
              correlationId: event.correlationId
            });
          }
        },
        {
          name: 'trigger-qc',
          eventType: 'qc.inspection_required',
          handler: async (event) => {
            // Trigger QC inspection if required
            if (event.data.requiresInspection) {
              this.eventBus.emit('qc.inspection_requested', {
                taskId: event.data.taskId,
                correlationId: event.correlationId
              });
            }
          }
        },
        {
          name: 'notify-stakeholders',
          eventType: 'notification.sent',
          handler: async (event) => {
            // Notify relevant stakeholders
            this.eventBus.emit('notification.send', {
              type: 'task_completed',
              taskId: event.data.taskId,
              recipients: event.data.stakeholders,
              correlationId: event.correlationId
            });
          }
        }
      ]
    });
  }

  /**
   * QC Inspection Workflow
   */
  private registerQCWorkflow(): void {
    this.registerWorkflow({
      name: 'qc-inspection',
      triggerEvent: 'qc.inspection_requested',
      steps: [
        {
          name: 'assign-inspector',
          eventType: 'qc.inspector_assigned',
          handler: async (event) => {
            // Assign inspector based on workload
            this.eventBus.emit('qc.assign_inspector', {
              taskId: event.data.taskId,
              correlationId: event.correlationId
            });
          }
        },
        {
          name: 'perform-inspection',
          eventType: 'qc.inspection_completed',
          handler: async (event) => {
            // Inspector performs inspection (wait for event)
            // This is async - workflow continues when inspection completes
          }
        },
        {
          name: 'evaluate-result',
          eventType: 'qc.result_evaluated',
          handler: async (event) => {
            // Evaluate inspection result
            if (event.data.result === 'failed') {
              this.eventBus.emit('defect.detected', {
                taskId: event.data.taskId,
                defects: event.data.defects,
                correlationId: event.correlationId
              });
            } else {
              this.eventBus.emit('acceptance.ready', {
                taskId: event.data.taskId,
                correlationId: event.correlationId
              });
            }
          }
        }
      ]
    });
  }

  /**
   * Acceptance Workflow
   */
  private registerAcceptanceWorkflow(): void {
    this.registerWorkflow({
      name: 'acceptance',
      triggerEvent: 'acceptance.requested',
      steps: [
        {
          name: 'verify-prerequisites',
          eventType: 'acceptance.prerequisites_verified',
          handler: async (event) => {
            // Verify all tasks completed and QC passed
            this.eventBus.emit('acceptance.verify_prerequisites', {
              taskId: event.data.taskId,
              correlationId: event.correlationId
            });
          }
        },
        {
          name: 'request-approval',
          eventType: 'acceptance.approval_requested',
          handler: async (event) => {
            // Request approval from owner/architect
            this.eventBus.emit('approval.request', {
              type: 'acceptance',
              taskId: event.data.taskId,
              approvers: event.data.approvers,
              correlationId: event.correlationId
            });
          }
        },
        {
          name: 'finalize-acceptance',
          eventType: 'acceptance.finalized',
          handler: async (event) => {
            // Finalize acceptance and update records
            if (event.data.approved) {
              this.eventBus.emit('acceptance.approved', {
                taskId: event.data.taskId,
                approvedBy: event.data.approvedBy,
                correlationId: event.correlationId
              });
            }
          },
          compensate: async (event) => {
            // Rollback acceptance if something fails
            this.eventBus.emit('acceptance.cancelled', {
              taskId: event.data.taskId,
              reason: 'Workflow failed',
              correlationId: event.correlationId
            });
          }
        }
      ]
    });
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): WorkflowExecution[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow definition
   */
  getWorkflow(name: string): WorkflowDefinition | undefined {
    return this.workflows.get(name);
  }
}

interface WorkflowExecution {
  id: string;
  workflowName: string;
  triggerEvent: DomainEvent;
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  completedSteps: string[];
  status: 'running' | 'completed' | 'failed';
  error?: Error;
}
