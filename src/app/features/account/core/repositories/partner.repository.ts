import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';

import { Partner } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PartnerRepository {
  private readonly firestore = inject(Firestore);
  private readonly collectionRef = collection(this.firestore, 'partners');

  findByOrganization(organizationId: string): Observable<Partner[]> {
    if (!organizationId) return of([]);
    const q = query(this.collectionRef, where('organization_id', '==', organizationId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(items => items as Partner[]),
      catchError((error: unknown) => {
        return of<Partner[]>([]);
      })
    );
  }
}
