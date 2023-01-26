import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ExcludeSpinnerUrls } from '../constants/filters-helper.constant';

import { SpinnerInterceptorHelperService } from '../services/spinner';

@Injectable({ providedIn: 'root' })
export class LoadingInterceptor implements HttpInterceptor {
  constructor(
    private spinnerService: SpinnerInterceptorHelperService,
  ) {
    this.spinnerService.createRequestQueueSubscription().subscribe();
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.checkExcludeSpinnerUrls(request.url)) {
      this.spinnerService.addUrlToQueue(request.url);
    }

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
      finalize(() => {
        if (this.spinnerService.checkQueueForUrl(request.url)) {
          this.spinnerService.deleteUrlFromQueue(request.url);
        }
      }),
    ) as Observable<HttpEvent<unknown>>;
  }

  checkExcludeSpinnerUrls(url:string): boolean {
    return ExcludeSpinnerUrls.some(item => url.includes(item));
  }
}
