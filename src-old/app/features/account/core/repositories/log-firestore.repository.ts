import { Injectable } from '@angular/core';

//import { CreateLogRequest, Log, UpdateLogRequest } from '@core/blueprint/domain/types/log/log.types';

/**
 * NOTE: Blueprint-related repository implementations are temporarily
 * disabled by keeping the original implementation in comments below
 * and providing conservative stubs to avoid runtime side-effects.
 * Restore the commented implementation when re-enabling blueprint features.
 */

@Injectable({
  providedIn: 'root'
})
export class LogFirestoreRepository {
  // Stubs (deny/no-op) while blueprint features are disabled
  // async findByBlueprint(_blueprintId: string): Promise<Log[]> {
  //   return [];
  // }

  //  async findById(_id: string): Promise<Log | null> {
  //   return null;
  // }

  // async create(_request: CreateLogRequest): Promise<Log> {
  // Return a minimal stub record to maintain contract
  //  return {
  //    id: crypto.randomUUID(),
  // If CreateLogRequest type is available when re-enabled,
  // restore mapping logic from commented original implementation.
  //    blueprintId: (_request as any)?.blueprintId || '',
  //   title: (_request as any)?.title || 'log',
  //   content: (_request as any)?.content || '',
  //   createdAt: new Date(),
  //    createdBy: 'system'
  // } as unknown as Log;
  //}

  // async update(_id: string, _request: UpdateLogRequest): Promise<void> {
  //   return;
  // }

  //  async delete(_id: string): Promise<void> {
  //   return;
  //  }

  // async uploadPhoto(_logId: string, _file: File, _caption?: string): Promise<Log> {
  //  return {
  //   id: crypto.randomUUID(),
  //      blueprintId: _logId,
  //    title: _caption || 'photo',
  //   createdAt: new Date(),
  //     createdBy: 'system'
  //   } as unknown as Log;
  // }

  async deletePhoto(_logId: string, _photoId: string): Promise<void> {
    return;
  }

  /*
  // Original implementation (preserved for re-enable)
  async findByBlueprint(_blueprintId: string): Promise<Log[]> {
    return [];
  }

  async findById(_id: string): Promise<Log | null> {
    return null;
  }

  async create(_request: CreateLogRequest): Promise<Log> {
    const log: Log = {
      id: crypto.randomUUID(),
      blueprintId: _request.blueprintId,
      title: _request.title,
      content: _request.content,
      createdAt: new Date(),
      createdBy: 'system'
    };
    return log;
  }

  async update(_id: string, _request: UpdateLogRequest): Promise<void> {
    return;
  }

  async delete(_id: string): Promise<void> {
    return;
  }

  async uploadPhoto(_logId: string, _file: File, _caption?: string): Promise<Log> {
    return {
      id: crypto.randomUUID(),
      blueprintId: _logId,
      title: _caption || 'photo',
      createdAt: new Date(),
      createdBy: 'system'
    };
  }

  async deletePhoto(_logId: string, _photoId: string): Promise<void> {
    return;
  }
  */
}
