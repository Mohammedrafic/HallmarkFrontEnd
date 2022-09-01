import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { SpinnerInterceptorHelperService } from '../services/spinner';

@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  constructor(
    private spinnerService: SpinnerInterceptorHelperService,
  ) {
    this.spinnerService.createRequestQueueSubscription().subscribe();
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.spinnerService.addUrlToQueue(request.url);

    return next.handle(request)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        this.spinnerService.handleRequestError();
        return throwError(() => error);
      }),
      tap((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          this.spinnerService.deleteUrlFromQueue(request.url);
        }
        this.spinnerService.checkQueueState();
      }),
    ) as Observable<HttpEvent<unknown>>;
  }
}
