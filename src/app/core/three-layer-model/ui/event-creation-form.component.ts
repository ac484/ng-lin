import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreeLayerFacade } from '../facade/three-layer.facade';
import { ConstructionEvent } from '../models/layer-types';
import { isSuccess } from '../models/result.type';

/**
 * Event Creation Form Component
 *
 * Provides a UI for creating L1 construction events with evidence validation.
 *
 * @example
 * ```html
 * <app-event-creation-form
 *   [contractId]="contractId"
 *   (eventCreated)="onEventCreated($event)"
 *   (error)="onError($event)">
 * </app-event-creation-form>
 * ```
 */
@Component({
  selector: 'app-event-creation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="event-creation-form">
      <h3>Record Construction Event (L1)</h3>

      @if (errorMessage()) {
        <div class="alert alert-danger">
          {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="submitEvent()" #form="ngForm">
        <!-- Event Type -->
        <div class="form-group">
          <label for="eventType">Event Type *</label>
          <select
            id="eventType"
            name="eventType"
            [(ngModel)]="eventData.type"
            required
            class="form-control"
          >
            <option value="">Select event type...</option>
            <option value="construction.concrete_pour_completed">Concrete Pour Completed</option>
            <option value="construction.steel_installation_completed">
              Steel Installation Completed
            </option>
            <option value="construction.formwork_installation_completed">
              Formwork Installation Completed
            </option>
            <option value="construction.inspection_completed">Inspection Completed</option>
            <option value="construction.defect_found">Defect Found</option>
          </select>
        </div>

        <!-- Location -->
        <div class="form-group">
          <label for="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            [(ngModel)]="eventData.target.location"
            required
            placeholder="e.g., B1F-C3-column"
            class="form-control"
          />
        </div>

        <!-- Location Type -->
        <div class="form-group">
          <label for="locationType">Location Type *</label>
          <select
            id="locationType"
            name="locationType"
            [(ngModel)]="eventData.target.type"
            required
            class="form-control"
          >
            <option value="confirmed">Confirmed (surveyed)</option>
            <option value="provisional">Provisional (approximate)</option>
          </select>
        </div>

        <!-- Evidence Requirements -->
        <div class="form-group">
          <label>Evidence *</label>
          <div class="evidence-checklist">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="hasPhotoEvidence" name="hasPhoto" />
              Photo Evidence
            </label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="hasSignature" name="hasSignature" />
              Signature
            </label>
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="hasGPS" name="hasGPS" />
              GPS Coordinates
            </label>
          </div>
          <small class="form-text text-muted"> At least one type of evidence is required </small>
        </div>

        <!-- Evidence URLs (simplified for demo) -->
        @if (hasPhotoEvidence) {
          <div class="form-group">
            <label for="photoUrl">Photo URL *</label>
            <input
              type="url"
              id="photoUrl"
              name="photoUrl"
              [(ngModel)]="photoUrl"
              required
              placeholder="https://storage.example.com/photo.jpg"
              class="form-control"
            />
          </div>
        }

        @if (hasSignature) {
          <div class="form-group">
            <label for="signerName">Signer Name *</label>
            <input
              type="text"
              id="signerName"
              name="signerName"
              [(ngModel)]="signerName"
              required
              placeholder="Inspector Name"
              class="form-control"
            />
          </div>
        }

        @if (hasGPS) {
          <div class="form-group">
            <label>GPS Coordinates *</label>
            <div class="row">
              <div class="col">
                <input
                  type="number"
                  name="latitude"
                  [(ngModel)]="gpsLatitude"
                  required
                  placeholder="Latitude"
                  class="form-control"
                  step="0.000001"
                />
              </div>
              <div class="col">
                <input
                  type="number"
                  name="longitude"
                  [(ngModel)]="gpsLongitude"
                  required
                  placeholder="Longitude"
                  class="form-control"
                  step="0.000001"
                />
              </div>
            </div>
          </div>
        }

        <!-- Metadata (optional) -->
        <div class="form-group">
          <label for="metadata">Additional Metadata (JSON)</label>
          <textarea
            id="metadata"
            name="metadata"
            [(ngModel)]="metadataJson"
            placeholder='{"volume": 45.5, "grade": "280kgf/cm²"}'
            class="form-control"
            rows="3"
          ></textarea>
          <small class="form-text text-muted"> Optional: Add custom metadata as JSON </small>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="submit" [disabled]="!form.valid || submitting()" class="btn btn-primary">
            @if (submitting()) {
              <span class="spinner-border spinner-border-sm" role="status"></span>
              Recording...
            } @else {
              Record Event
            }
          </button>
          <button type="button" (click)="resetForm()" class="btn btn-secondary">Reset</button>
        </div>
      </form>

      @if (canRecordStatus() !== null) {
        <div class="policy-check-status" [class.success]="canRecordStatus()" [class.error]="!canRecordStatus()">
          @if (canRecordStatus()) {
            <span>✓ Policy check passed - you can record this event</span>
          } @else {
            <span>✗ Policy check failed - this event cannot be recorded</span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .event-creation-form {
        max-width: 600px;
        padding: 20px;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .evidence-checklist {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem 0;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .alert {
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 4px;
      }

      .alert-danger {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .policy-check-status {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 4px;
      }

      .policy-check-status.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .policy-check-status.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .spinner-border {
        width: 1rem;
        height: 1rem;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        display: inline-block;
        animation: spin 0.75s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .row {
        display: flex;
        gap: 0.5rem;
      }

      .col {
        flex: 1;
      }
    `,
  ],
})
export class EventCreationFormComponent {
  private facade = inject(ThreeLayerFacade);

  // Outputs
  eventCreated = output<ConstructionEvent>();
  error = output<Error>();

  // State
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  canRecordStatus = signal<boolean | null>(null);

  // Form data
  eventData: Partial<Omit<ConstructionEvent, 'id'>> = {
    type: '',
    timestamp: new Date(),
    actor: 'current-user@example.com', // Should be from auth service
    target: {
      type: 'confirmed',
      location: '',
    },
    evidence: [],
    metadata: {},
  };

  // Evidence flags
  hasPhotoEvidence = false;
  hasSignature = false;
  hasGPS = false;

  // Evidence data
  photoUrl = '';
  signerName = '';
  gpsLatitude: number | null = null;
  gpsLongitude: number | null = null;
  metadataJson = '';

  async submitEvent() {
    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      // Build evidence array
      const evidence: any[] = [];

      if (this.hasPhotoEvidence && this.photoUrl) {
        evidence.push({
          type: 'photo',
          url: this.photoUrl,
          timestamp: new Date(),
        });
      }

      if (this.hasSignature && this.signerName) {
        evidence.push({
          type: 'signature',
          data: { signer: this.signerName },
          timestamp: new Date(),
        });
      }

      if (this.hasGPS && this.gpsLatitude !== null && this.gpsLongitude !== null) {
        evidence.push({
          type: 'gps',
          coordinates: {
            latitude: this.gpsLatitude,
            longitude: this.gpsLongitude,
          },
          timestamp: new Date(),
        });
      }

      // Parse metadata
      let metadata = {};
      if (this.metadataJson.trim()) {
        try {
          metadata = JSON.parse(this.metadataJson);
        } catch (e) {
          throw new Error('Invalid JSON in metadata field');
        }
      }

      // Build complete event
      const completeEvent: Omit<ConstructionEvent, 'id'> = {
        type: this.eventData.type!,
        timestamp: new Date(),
        actor: this.eventData.actor!,
        target: this.eventData.target!,
        evidence,
        metadata,
        contractId: 'CONTRACT-001', // Should come from context/input
      };

      // Record the event
      const result = await this.facade.recordConstructionEvent(completeEvent);

      if (isSuccess(result)) {
        this.eventCreated.emit(result.value);
        this.resetForm();
      } else {
        throw result.error;
      }
    } catch (err) {
      const errorObj = err as Error;
      this.errorMessage.set(errorObj.message || 'Failed to record event');
      this.error.emit(errorObj);
    } finally {
      this.submitting.set(false);
    }
  }

  resetForm() {
    this.eventData = {
      type: '',
      timestamp: new Date(),
      actor: 'current-user@example.com',
      target: {
        type: 'confirmed',
        location: '',
      },
      evidence: [],
      metadata: {},
    };

    this.hasPhotoEvidence = false;
    this.hasSignature = false;
    this.hasGPS = false;
    this.photoUrl = '';
    this.signerName = '';
    this.gpsLatitude = null;
    this.gpsLongitude = null;
    this.metadataJson = '';
    this.errorMessage.set(null);
    this.canRecordStatus.set(null);
  }

  async checkPolicy() {
    const completeEvent: Omit<ConstructionEvent, 'id'> = {
      type: this.eventData.type!,
      timestamp: new Date(),
      actor: this.eventData.actor!,
      target: this.eventData.target!,
      evidence: [],
      metadata: {},
      contractId: 'CONTRACT-001',
    };

    const result = await this.facade.canRecordEvent(completeEvent);

    if (isSuccess(result)) {
      this.canRecordStatus.set(result.value);
    } else {
      this.canRecordStatus.set(false);
      this.errorMessage.set(result.error.message);
    }
  }
}
