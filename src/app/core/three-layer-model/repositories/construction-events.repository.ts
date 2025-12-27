/**
 * Construction Events Repository (L1)
 * 
 * Handles storage and retrieval of immutable construction events.
 * L1 events are APPEND-ONLY - updates and deletes are forbidden.
 */

import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { BaseRepository } from './base.repository';
import { ConstructionEvent } from '../models/layer-types';
import { Result, Ok, Err, ValidationError } from '../models/result.type';

interface ConstructionEventDocument extends ConstructionEvent {
  // Firestore-specific fields
}

@Injectable({ providedIn: 'root' })
export class ConstructionEventsRepository extends BaseRepository<ConstructionEventDocument> {
  protected collectionName = 'constructionEvents';

  /**
   * Create immutable L1 event
   * 
   * @override to enforce immutability
   */
  override async create(data: Omit<ConstructionEventDocument, 'id'>): Promise<Result<string, Error>> {
    // Validate evidence exists
    if (!data.evidence || data.evidence.length === 0) {
      return Err(new ValidationError('L1 events must include evidence', 'evidence'));
    }

    // Validate target location
    if (!data.target) {
      return Err(new ValidationError('L1 events must include target location', 'target'));
    }

    return super.create(data);
  }

  /**
   * Update is FORBIDDEN for L1 events
   * 
   * @override to prevent updates
   */
  override async update(id: string, data: any): Promise<Result<void, Error>> {
    return Err(
      new ValidationError(
        'L1 events are immutable. Use correction events instead.',
        'immutability'
      )
    );
  }

  /**
   * Delete is FORBIDDEN for L1 events
   * 
   * @override to prevent deletion
   */
  override async delete(id: string): Promise<Result<void, Error>> {
    return Err(
      new ValidationError(
        'L1 events cannot be deleted. They are append-only.',
        'immutability'
      )
    );
  }

  /**
   * Get events for a contract
   */
  async getEventsForContract(contractId: string): Promise<Result<ConstructionEvent[], Error>> {
    return this.findByField('contractId', contractId);
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: string): Promise<Result<ConstructionEvent[], Error>> {
    return this.findByField('type', type);
  }

  /**
   * Get events for a task
   */
  async getEventsForTask(taskId: string): Promise<Result<ConstructionEvent[], Error>> {
    return this.findByField('taskId', taskId);
  }

  /**
   * Get correction events for an original event
   */
  async getCorrections(originalEventId: string): Promise<Result<ConstructionEvent[], Error>> {
    return this.findByField('corrects', originalEventId);
  }

  /**
   * Get recent events
   */
  async getRecentEvents(limitTo: number = 50): Promise<Result<ConstructionEvent[], Error>> {
    return this.findWithOptions({
      orderByField: 'timestamp',
      orderDirection: 'desc',
      limitTo
    });
  }

  /**
   * Get events by actor
   */
  async getEventsByActor(actor: string): Promise<Result<ConstructionEvent[], Error>> {
    return this.findByField('actor', actor);
  }
}
