import { TestBed } from '@angular/core/testing';
import { EventIdentifierService } from './event-identifier.service';
import { EventLevel } from '../models/event-identifier.model';

describe('EventIdentifierService', () => {
  let service: EventIdentifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventIdentifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateEventId', () => {
    it('should generate valid event identifier', () => {
      const id = service.generateEventId('qrl', 'trading', 'order', 1024);

      expect(id.namespace).toBe('qrl.trading.order');
      expect(id.sequence).toBe(1024);
      expect(id.fullReference).toBe('qrl.trading.order#1024');
      expect(id.namespaceStructure?.tenant).toBe('qrl');
      expect(id.namespaceStructure?.context).toBe('trading');
      expect(id.namespaceStructure?.aggregate).toBe('order');
    });

    it('should auto-increment sequence when not provided', () => {
      const id1 = service.generateEventId('test', 'ctx', 'agg');
      const id2 = service.generateEventId('test', 'ctx', 'agg');

      expect(id1.sequence).toBe(1);
      expect(id2.sequence).toBe(2);
    });

    it('should maintain separate sequences per namespace', () => {
      const id1 = service.generateEventId('tenant1', 'ctx', 'agg');
      const id2 = service.generateEventId('tenant2', 'ctx', 'agg');
      const id3 = service.generateEventId('tenant1', 'ctx', 'agg');

      expect(id1.sequence).toBe(1);
      expect(id2.sequence).toBe(1);
      expect(id3.sequence).toBe(2);
    });
  });

  describe('buildNamespace', () => {
    it('should build correct namespace path', () => {
      const namespace = service.buildNamespace('qrl', 'trading-bot', 'order');
      expect(namespace).toBe('qrl.trading-bot.order');
    });
  });

  describe('parseNamespace', () => {
    it('should parse valid namespace', () => {
      const result = service.parseNamespace('qrl.trading.order');

      expect(result).toBeTruthy();
      expect(result?.tenant).toBe('qrl');
      expect(result?.context).toBe('trading');
      expect(result?.aggregate).toBe('order');
      expect(result?.fullPath).toBe('qrl.trading.order');
    });

    it('should return null for invalid namespace', () => {
      expect(service.parseNamespace('invalid')).toBeNull();
      expect(service.parseNamespace('too.many.parts.here')).toBeNull();
      expect(service.parseNamespace('only.two')).toBeNull();
    });
  });

  describe('parseEventId', () => {
    it('should parse valid event reference', () => {
      const result = service.parseEventId('qrl.trading.order#1024');

      expect(result.success).toBe(true);
      expect(result.identifier?.namespace).toBe('qrl.trading.order');
      expect(result.identifier?.sequence).toBe(1024);
      expect(result.identifier?.fullReference).toBe('qrl.trading.order#1024');
    });

    it('should fail for invalid format', () => {
      const result = service.parseEventId('invalid-format');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should fail for invalid namespace', () => {
      const result = service.parseEventId('invalid#123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('namespace');
    });

    it('should parse complex namespaces', () => {
      const result = service.parseEventId('acme.project-alpha.issue#1');

      expect(result.success).toBe(true);
      expect(result.identifier?.namespaceStructure?.tenant).toBe('acme');
      expect(result.identifier?.namespaceStructure?.context).toBe('project-alpha');
      expect(result.identifier?.namespaceStructure?.aggregate).toBe('issue');
    });
  });

  describe('validateNamespace', () => {
    it('should validate correct namespace', () => {
      const result = service.validateNamespace('qrl.trading.order');

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
      expect(result.namespace?.tenant).toBe('qrl');
    });

    it('should reject empty namespace', () => {
      const result = service.validateNamespace('');

      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should reject namespace with wrong number of parts', () => {
      const result = service.validateNamespace('only.two');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Namespace must have exactly 3 parts: tenant.context.aggregate');
    });

    it('should reject namespace with invalid characters', () => {
      const result = service.validateNamespace('tenant.ctx@invalid.agg');

      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('alphanumeric'))).toBe(true);
    });

    it('should accept hyphens and underscores', () => {
      const result = service.validateNamespace('tenant-1.ctx_2.agg-3');

      expect(result.valid).toBe(true);
    });
  });

  describe('sequence management', () => {
    it('should get current sequence', () => {
      const ns = 'test.ctx.agg';
      service.generateEventId('test', 'ctx', 'agg');
      service.generateEventId('test', 'ctx', 'agg');

      expect(service.getCurrentSequence(ns)).toBe(2);
    });

    it('should set sequence', () => {
      const ns = 'test.ctx.agg';
      service.setSequence(ns, 100);

      expect(service.getCurrentSequence(ns)).toBe(100);

      const id = service.generateEventId('test', 'ctx', 'agg');
      expect(id.sequence).toBe(101);
    });

    it('should reset sequence', () => {
      const ns = 'test.ctx.agg';
      service.generateEventId('test', 'ctx', 'agg');
      service.resetSequence(ns);

      expect(service.getCurrentSequence(ns)).toBe(0);

      const id = service.generateEventId('test', 'ctx', 'agg');
      expect(id.sequence).toBe(1);
    });

    it('should throw error for negative sequence', () => {
      expect(() => service.setSequence('test.ctx.agg', -1)).toThrow();
    });
  });

  describe('createIdentifiedEvent', () => {
    it('should create event at L0 level', () => {
      const id = service.generateEventId('qrl', 'trading', 'order', 1024);
      const event = service.createIdentifiedEvent(id, EventLevel.Identified);

      expect(event.identifier).toBe(id);
      expect(event.level).toBe(EventLevel.Identified);
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should create event at L1 level with type', () => {
      const id = service.generateEventId('qrl', 'trading', 'order', 1024);
      const event = service.createIdentifiedEvent(
        id,
        EventLevel.Semantic,
        'OrderPlaced',
        { orderId: '123', amount: 100 }
      );

      expect(event.level).toBe(EventLevel.Semantic);
      expect(event.eventType).toBe('OrderPlaced');
      expect(event.payload).toEqual({ orderId: '123', amount: 100 });
    });

    it('should create event at L2 level with metadata', () => {
      const id = service.generateEventId('qrl', 'risk', 'alert', 2048);
      const event = service.createIdentifiedEvent(
        id,
        EventLevel.Policy,
        'RiskAlertTriggered',
        { severity: 'high' },
        { triggeredBy: 'qrl.trading.order#1024', action: 'SendAlert' }
      );

      expect(event.level).toBe(EventLevel.Policy);
      expect(event.metadata?.triggeredBy).toBe('qrl.trading.order#1024');
      expect(event.metadata?.action).toBe('SendAlert');
    });
  });

  describe('formatEventReference', () => {
    it('should format reference string', () => {
      const ref = service.formatEventReference('qrl', 'trading', 'order', 1024);
      expect(ref).toBe('qrl.trading.order#1024');
    });
  });

  describe('areIdentifiersEqual', () => {
    it('should return true for equal identifiers', () => {
      const id1 = service.generateEventId('qrl', 'trading', 'order', 1024);
      const id2 = service.generateEventId('qrl', 'trading', 'order', 1024);

      expect(service.areIdentifiersEqual(id1, id2)).toBe(true);
    });

    it('should return false for different identifiers', () => {
      const id1 = service.generateEventId('qrl', 'trading', 'order', 1024);
      const id2 = service.generateEventId('qrl', 'trading', 'order', 1025);

      expect(service.areIdentifiersEqual(id1, id2)).toBe(false);
    });
  });

  describe('extraction methods', () => {
    let identifier: ReturnType<typeof service.generateEventId>;

    beforeEach(() => {
      identifier = service.generateEventId('qrl', 'trading', 'order', 1024);
    });

    it('should extract tenant', () => {
      expect(service.extractTenant(identifier)).toBe('qrl');
    });

    it('should extract context', () => {
      expect(service.extractContext(identifier)).toBe('trading');
    });

    it('should extract aggregate', () => {
      expect(service.extractAggregate(identifier)).toBe('order');
    });

    it('should check tenant membership', () => {
      expect(service.belongsToTenant(identifier, 'qrl')).toBe(true);
      expect(service.belongsToTenant(identifier, 'other')).toBe(false);
    });
  });

  describe('getActiveNamespaces', () => {
    it('should return all namespaces with sequences', () => {
      service.generateEventId('tenant1', 'ctx1', 'agg1');
      service.generateEventId('tenant2', 'ctx2', 'agg2');
      service.generateEventId('tenant3', 'ctx3', 'agg3');

      const namespaces = service.getActiveNamespaces();

      expect(namespaces).toContain('tenant1.ctx1.agg1');
      expect(namespaces).toContain('tenant2.ctx2.agg2');
      expect(namespaces).toContain('tenant3.ctx3.agg3');
    });
  });

  describe('getSequenceConfig', () => {
    it('should return sequence configuration', () => {
      const ns = 'test.ctx.agg';
      service.setSequence(ns, 50);

      const config = service.getSequenceConfig(ns);

      expect(config.namespace).toBe(ns);
      expect(config.currentSequence).toBe(50);
      expect(config.increment).toBe(1);
      expect(config.startFrom).toBe(1);
      expect(config.lastUpdated).toBeInstanceOf(Date);
    });
  });
});
