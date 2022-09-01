import { throttleTime } from 'rxjs';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpinnerInterceptorHelperService } from './spinner-interceptor.service';


/**
 * Spinner interceptor. Intercept request and stores them as queue in corresponding service.
 *
 * When response received, particular request would be deleted from queue. Spinner is showed untill queue is empty.
 *
 * If error occured queue would clear, spinner would hide.
 */
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
      catchError((error) => {
        this.spinnerService.handleRequestError();
        return throwError(() => error);
      }),
      map<HttpEvent<unknown>, unknown>((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          this.spinnerService.deleteUrlFromQueue(request.url);
        }
        this.spinnerService.checkQueueState();
        return event;
      }),

    ) as Observable<HttpEvent<unknown>>;
  }
}
