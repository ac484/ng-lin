/**
 * Governance Events Repository (L0)
 * 
 * Handles storage and retrieval of governance events.
 */

import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { BaseRepository } from './base.repository';
import { GovernanceEvent } from '../models/layer-types';
import { Result } from '../models/result.type';

interface GovernanceEventDocument extends GovernanceEvent {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class GovernanceRepository extends BaseRepository<GovernanceEventDocument> {
  protected collectionName = 'governanceEvents';

  /**
   * Get active governance rules for a contract
   */
  async getActiveRulesForContract(contractId: string): Promise<Result<GovernanceEvent[], Error>> {
    return this.findAll([
      where('scope.contracts', 'array-contains', contractId)
    ]);
  }

  /**
   * Get governance rules by type
   */
  async findByType(type: string): Promise<Result<GovernanceEvent[], Error>> {
    return this.findByField('type', type);
  }

  /**
   * Get latest governance rules
   */
  async getLatestRules(limitTo: number = 10): Promise<Result<GovernanceEvent[], Error>> {
    return this.findWithOptions({
      orderByField: 'timestamp',
      orderDirection: 'desc',
      limitTo
    });
  }
}
