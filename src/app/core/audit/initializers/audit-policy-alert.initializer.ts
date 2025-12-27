import { APP_INITIALIZER, Provider } from '@angular/core';
import { AuditPolicyAlertSinkService } from '../services/audit-policy-alert-sink.service';

export function auditPolicyAlertInitializer(service: AuditPolicyAlertSinkService): () => Promise<void> {
  return async () => {
    await service.initialize();
  };
}

export function provideAuditPolicyAlertSink(): Provider {
  return {
    provide: APP_INITIALIZER,
    useFactory: auditPolicyAlertInitializer,
    deps: [AuditPolicyAlertSinkService],
    multi: true
  };
}
