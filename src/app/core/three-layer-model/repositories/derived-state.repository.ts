/**
 * Derived State Repository (L2)
 * 
 * Handles storage and retrieval of calculated/derived states.
 * L2 states can be recomputed and updated.
 */

import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { BaseRepository } from './base.repository';
import { DerivedState } from '../models/layer-types';
import { Result } from '../models/result.type';

interface DerivedStateDocument extends DerivedState {
  // Firestore-specific fields
}

@Injectable({ providedIn: 'root' })
export class DerivedStateRepository extends BaseRepository<DerivedStateDocument> {
  protected collectionName = 'derivedStates';

  /**
   * Get derived states by type
   */
  async getByType(type: string): Promise<Result<DerivedState[], Error>> {
    return this.findByField('type', type);
  }

  /**
   * Get non-stale derived states
   */
  async getFreshStates(): Promise<Result<DerivedState[], Error>> {
    return this.findAll([
      where('stale', '==', false)
    ]);
  }

  /**
   * Mark derived state as stale
   */
  async markAsStale(id: string): Promise<Result<void, Error>> {
    return this.update(id, { stale: true } as any);
  }

  /**
   * Get derived states that reference a specific L1 event
   */
  async getStatesReferencingEvent(eventId: string): Promise<Result<DerivedState[], Error>> {
    return this.findAll([
      where('sourceEvents', 'array-contains', eventId)
    ]);
  }

  /**
   * Get latest calculation for a specific type
   */
  async getLatestByType(type: string): Promise<Result<DerivedState | null, Error>> {
    const result = await this.findAll([
      where('type', '==', type),
      where('stale', '==', false)
    ]);

    if (!result.success) {
      return result;
    }

    if (result.value.length === 0) {
      return { success: true, value: null };
    }

    // Get most recent
    const sorted = result.value.sort((a, b) => 
      b.calculatedAt.getTime() - a.calculatedAt.getTime()
    );

    return { success: true, value: sorted[0] };
  }
}
