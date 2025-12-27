/**
 * Policy Validation Service
 * 
 * Based on blueprint: docs/strategy-governance/blueprint/system/03-three-layer-model.md
 * 
 * Validates L1 event creation against L0 governance rules.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GovernanceEvent, ConstructionEvent } from '../models/layer-types';
import { Result, Ok, Err, PolicyViolationError } from '../models/result.type';

export interface PolicyCheckResult {
  allowed: boolean;
  policy?: string;
  reason?: string;
  missingApprovals?: string[];
}

@Injectable({ providedIn: 'root' })
export class PolicyValidationService {
  /**
   * Check if an L1 event can be created based on L0 governance rules
   */
  async validateEventCreation(
    event: Partial<ConstructionEvent>,
    governance: GovernanceEvent[]
  ): Promise<Result<boolean, PolicyViolationError>> {
    // Find applicable governance rules
    const applicableRules = this.findApplicableRules(event, governance);

    if (applicableRules.length === 0) {
      return Err(
        new PolicyViolationError(
          'No active governance rules found for this operation',
          'governance.contract_active',
          { contractId: event.contractId }
        )
      );
    }

    // Check each policy
    for (const rule of applicableRules) {
      const checkResult = this.checkPolicy(event, rule);
      
      if (!checkResult.allowed) {
        return Err(
          new PolicyViolationError(
            checkResult.reason || 'Policy violation',
            checkResult.policy || 'unknown',
            {
              contractId: event.contractId,
              missingApprovals: checkResult.missingApprovals
            }
          )
        );
      }
    }

    return Ok(true);
  }

  /**
   * Find governance rules applicable to this event
   */
  private findApplicableRules(
    event: Partial<ConstructionEvent>,
    governance: GovernanceEvent[]
  ): GovernanceEvent[] {
    return governance.filter(rule => {
      // Check if rule applies to this contract
      if (event.contractId && rule.scope?.contracts) {
        return rule.scope.contracts.includes(event.contractId);
      }

      // Check if rule applies to this location
      if (event.target?.location && rule.scope?.locations) {
        return rule.scope.locations.some(loc => 
          event.target?.location?.startsWith(loc)
        );
      }

      return false;
    });
  }

  /**
   * Check individual policy rule
   */
  private checkPolicy(
    event: Partial<ConstructionEvent>,
    rule: GovernanceEvent
  ): PolicyCheckResult {
    // Check if approval is required
    if (rule.rules?.approvalRequired) {
      // In a real implementation, check if necessary approvals exist
      // For now, we'll assume approval is needed
      return {
        allowed: false,
        policy: `${rule.type}`,
        reason: 'Approval required before creating this event',
        missingApprovals: rule.rules.approvers
      };
    }

    // Check contract status
    if (rule.type === 'governance.contract_activated') {
      return {
        allowed: true,
        policy: rule.type
      };
    }

    if (rule.type === 'governance.contract_suspended') {
      return {
        allowed: false,
        policy: rule.type,
        reason: 'Contract is suspended - no new events allowed'
      };
    }

    if (rule.type === 'governance.contract_terminated') {
      return {
        allowed: false,
        policy: rule.type,
        reason: 'Contract is terminated - no new events allowed'
      };
    }

    // Default allow if no specific rule blocks it
    return {
      allowed: true,
      policy: rule.type
    };
  }

  /**
   * Validate evidence requirements
   */
  validateEvidence(event: Partial<ConstructionEvent>): Result<boolean, PolicyViolationError> {
    if (!event.evidence || event.evidence.length === 0) {
      return Err(
        new PolicyViolationError(
          'L1 events must include at least one piece of evidence',
          'evidence.required',
          { eventType: event.type }
        )
      );
    }

    // Validate each evidence piece
    for (const evidence of event.evidence) {
      if (!evidence.timestamp) {
        return Err(
          new PolicyViolationError(
            'Evidence must include timestamp',
            'evidence.timestamp_required',
            { evidenceType: evidence.type }
          )
        );
      }

      // Validate photo evidence
      if (evidence.type === 'photo' && !evidence.url) {
        return Err(
          new PolicyViolationError(
            'Photo evidence must include URL',
            'evidence.photo_url_required'
          )
        );
      }

      // Validate signature evidence
      if (evidence.type === 'signature' && !evidence.data) {
        return Err(
          new PolicyViolationError(
            'Signature evidence must include data',
            'evidence.signature_data_required'
          )
        );
      }
    }

    return Ok(true);
  }

  /**
   * Validate location information
   */
  validateLocation(event: Partial<ConstructionEvent>): Result<boolean, PolicyViolationError> {
    if (!event.target) {
      return Err(
        new PolicyViolationError(
          'L1 events must include target location',
          'location.required',
          { eventType: event.type }
        )
      );
    }

    if (event.target.type === 'confirmed' && !event.target.location) {
      return Err(
        new PolicyViolationError(
          'Confirmed target must include location',
          'location.confirmed_missing',
          { target: event.target }
        )
      );
    }

    if (event.target.type === 'provisional' && !event.target.provisional_description) {
      return Err(
        new PolicyViolationError(
          'Provisional target must include description',
          'location.provisional_missing',
          { target: event.target }
        )
      );
    }

    return Ok(true);
  }
}
