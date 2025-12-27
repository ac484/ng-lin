import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  GovernanceEvent,
  ConstructionEvent,
  DerivedState,
  CorrectionEvent,
} from '../models/layer-types';
import { Result, Ok, Err, isSuccess } from '../models/result.type';
import {
  GovernanceRepository,
  ConstructionEventsRepository,
  DerivedStateRepository,
} from '../repositories';
import { PolicyValidationService } from '../services/policy-validation.service';
import { WorkflowOrchestrator } from '../services/workflow-orchestrator.service';

/**
 * Three-Layer Facade
 *
 * Provides a simplified public API for working with the three-layer model.
 * This facade encapsulates the complexity of L0/L1/L2 interactions and enforces
 * architectural rules.
 *
 * @example
 * ```typescript
 * // Inject the facade
 * private threeLayer = inject(ThreeLayerFacade);
 *
 * // Record a construction event (L1)
 * const result = await this.threeLayer.recordConstructionEvent({
 *   type: 'construction.concrete_pour_completed',
 *   timestamp: new Date(),
 *   actor: 'worker@example.com',
 *   target: { type: 'confirmed', location: 'B1F-C3' },
 *   evidence: [{ type: 'photo', url: 'https://...' }],
 *   contractId: 'CONTRACT-001'
 * });
 *
 * if (isSuccess(result)) {
 *   console.log('Event recorded:', result.value);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ThreeLayerFacade {
  private governanceRepo = inject(GovernanceRepository);
  private eventsRepo = inject(ConstructionEventsRepository);
  private derivedRepo = inject(DerivedStateRepository);
  private policyService = inject(PolicyValidationService);
  private workflowOrchestrator = inject(WorkflowOrchestrator);

  // ============================================================================
  // L0: Governance Operations
  // ============================================================================

  /**
   * Create a governance event (L0)
   * Governance events can be updated as policies evolve.
   */
  async createGovernanceEvent(
    data: Omit<GovernanceEvent, 'id'>
  ): Promise<Result<GovernanceEvent, Error>> {
    return this.governanceRepo.create(data);
  }

  /**
   * Get active governance rules for a contract
   */
  async getActiveRules(contractId: string): Promise<Result<GovernanceEvent[], Error>> {
    return this.governanceRepo.getActiveRulesForContract(contractId);
  }

  /**
   * Update a governance event (allowed for L0)
   */
  async updateGovernanceEvent(
    id: string,
    updates: Partial<GovernanceEvent>
  ): Promise<Result<GovernanceEvent, Error>> {
    return this.governanceRepo.update(id, updates);
  }

  // ============================================================================
  // L1: Construction Event Operations (Immutable)
  // ============================================================================

  /**
   * Record a construction event (L1)
   *
   * This method:
   * 1. Validates against governance policies (L0)
   * 2. Creates the immutable event
   * 3. Triggers workflow orchestration
   * 4. Returns the created event
   *
   * @param data - Event data (without ID)
   * @returns Result with created event or error
   */
  async recordConstructionEvent(
    data: Omit<ConstructionEvent, 'id'>
  ): Promise<Result<ConstructionEvent, Error>> {
    try {
      // 1. Get governance rules
      if (data.contractId) {
        const rulesResult = await this.governanceRepo.getActiveRulesForContract(data.contractId);

        if (isSuccess(rulesResult)) {
          // 2. Validate against policies
          const policyCheck = await this.policyService.validateEventCreation(
            data,
            rulesResult.value
          );

          if (!isSuccess(policyCheck)) {
            return Err(policyCheck.error);
          }
        }
      }

      // 3. Create immutable L1 event
      const createResult = await this.eventsRepo.create(data);

      if (!isSuccess(createResult)) {
        return createResult;
      }

      // 4. Trigger workflow (fire and forget)
      // Workflow orchestrator will handle this asynchronously
      const event = createResult.value;
      this.workflowOrchestrator.handleEvent({
        type: event.type,
        data: event,
      });

      return Ok(event);
    } catch (error) {
      return Err(error as Error);
    }
  }

  /**
   * Create a correction event for an L1 error
   *
   * Correction events are the ONLY way to "fix" L1 events.
   * They don't modify the original - they create a new event that references it.
   */
  async createCorrectionEvent(
    originalEventId: string,
    correctionReason: string,
    correctedData: Omit<ConstructionEvent, 'id'>
  ): Promise<Result<ConstructionEvent & CorrectionEvent, Error>> {
    const correctionEvent: Omit<ConstructionEvent & CorrectionEvent, 'id'> = {
      ...correctedData,
      corrects: originalEventId,
      correctionReason,
    };

    return this.eventsRepo.create(correctionEvent as any);
  }

  /**
   * Get construction events for a contract
   */
  async getConstructionEvents(
    contractId: string
  ): Promise<Result<ConstructionEvent[], Error>> {
    return this.eventsRepo.getEventsForContract(contractId);
  }

  /**
   * Get correction history for an event
   */
  async getCorrectionHistory(
    eventId: string
  ): Promise<Result<ConstructionEvent[], Error>> {
    return this.eventsRepo.getCorrections(eventId);
  }

  // ============================================================================
  // L2: Derived State Operations (Calculated)
  // ============================================================================

  /**
   * Calculate and store derived state (L2)
   *
   * Derived states are calculated from L1 events and can be recomputed.
   */
  async calculateDerivedState(
    data: Omit<DerivedState, 'id'>
  ): Promise<Result<DerivedState, Error>> {
    return this.derivedRepo.create(data);
  }

  /**
   * Get fresh derived states (recently calculated)
   */
  async getFreshDerivedStates(
    maxAge: number = 3600000 // 1 hour default
  ): Promise<Result<DerivedState[], Error>> {
    return this.derivedRepo.getFreshStates(maxAge);
  }

  /**
   * Mark derived state as stale (needs recalculation)
   */
  async markDerivedStateAsStale(id: string): Promise<Result<void, Error>> {
    return this.derivedRepo.markAsStale(id);
  }

  /**
   * Get derived state by type
   */
  async getDerivedStateByType(
    type: string
  ): Promise<Result<DerivedState[], Error>> {
    return this.derivedRepo.getByType(type);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Check if an event can be recorded (policy validation only, no creation)
   */
  async canRecordEvent(
    eventData: Omit<ConstructionEvent, 'id'>
  ): Promise<Result<boolean, Error>> {
    if (!eventData.contractId) {
      return Ok(true); // No contract, no policy to check
    }

    const rulesResult = await this.governanceRepo.getActiveRulesForContract(
      eventData.contractId
    );

    if (!isSuccess(rulesResult)) {
      return Err(rulesResult.error);
    }

    const policyCheck = await this.policyService.validateEventCreation(
      eventData,
      rulesResult.value
    );

    return policyCheck;
  }

  /**
   * Get complete event history (L1 + corrections) for analysis
   */
  async getEventHistory(
    eventId: string
  ): Promise<Result<{ original: ConstructionEvent; corrections: ConstructionEvent[] }, Error>> {
    const originalResult = await this.eventsRepo.findById(eventId);

    if (!isSuccess(originalResult)) {
      return Err(originalResult.error);
    }

    const correctionsResult = await this.eventsRepo.getCorrections(eventId);

    if (!isSuccess(correctionsResult)) {
      return Err(correctionsResult.error);
    }

    return Ok({
      original: originalResult.value,
      corrections: correctionsResult.value,
    });
  }

  /**
   * Observable stream of construction events
   * Useful for real-time UI updates
   */
  getConstructionEventsStream(contractId: string): Observable<ConstructionEvent[]> {
    return from(this.eventsRepo.getEventsForContract(contractId)).pipe(
      map(result => {
        if (isSuccess(result)) {
          return result.value;
        }
        throw result.error;
      }),
      catchError(error => {
        console.error('Error fetching events:', error);
        return of([]);
      })
    );
  }
}
