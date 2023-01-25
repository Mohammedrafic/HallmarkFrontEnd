import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { SpinnerService } from './spinner.service';

/**
 * This singeltone service is used to mange request queue and spinner actions.
 */
@Injectable({ providedIn: 'root' })
export class SpinnerInterceptorHelperService {
  private readonly loadQueue = new Map<string, boolean>();

  private readonly queueWatcher: Subject<string> = new Subject();

  constructor(
    private spinnerService: SpinnerService,
  ) {}

  createRequestQueueSubscription(): Observable<string> {
    return this.queueWatcher
    .pipe(
      tap((url) => this.loadQueue.set(url, true)),
      filter(() => this.loadQueue.size !== 0 && !this.spinnerService.getSpinnerState()),
      tap(() => this.spinnerService.show()),
    );
  }

  addUrlToQueue(url: string): void {
    this.queueWatcher.next(url);
  }

  deleteUrlFromQueue(url: string): void {
    this.loadQueue.delete(url);
  }

  checkQueueState(): void {
    if (this.loadQueue.size === 0) {
      this.spinnerService.hide();
    }
  }

  handleRequestError(): void {
    this.spinnerService.hide();
    this.loadQueue.clear();
  }

  checkQueueForUrl(url: string): boolean {
    return this.loadQueue.has(url);
  }
}
