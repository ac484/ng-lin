import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponseBase } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Observable, of, throwError, mergeMap, catchError } from 'rxjs';

import { checkStatus, ReThrowHttpError } from '../net/helper';

/**
 * Centralized HTTP status handling and forwarding.
 */
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  const handle = (ev: HttpResponseBase): Observable<HttpEvent<unknown>> => {
    checkStatus(injector, ev);
    if (ev instanceof HttpErrorResponse) {
      return throwError(() => ev);
    }
    if ((ev as unknown as ReThrowHttpError)._throw === true) {
      return throwError(() => (ev as unknown as ReThrowHttpError).body);
    }
    return of(ev as HttpEvent<unknown>);
  };

  return next(req).pipe(
    mergeMap(ev => (ev instanceof HttpResponseBase ? handle(ev) : of(ev))),
    catchError(err => handle(err as HttpErrorResponse))
  );
};
