import { Injectable } from '@angular/core';
import { BaseObservable } from '@core/helpers';
import { distinctUntilChanged, Observable } from 'rxjs';

/**
 * This service used for DateWeekPickerComponent, stores selected range.
 */
@Injectable()
export class DateWeekService {
  private readonly rangeStore: BaseObservable<[string, string]> = new BaseObservable(['', '']);

  setRange(range: [string, string]): void {
    this.rangeStore.set(range);
  }

  getRange(): [string, string] {
    return this.rangeStore.get();
  }

  getRangeStream(): Observable<[string, string]> {
    return this.rangeStore.getStream()
    .pipe(
      distinctUntilChanged((prev, next) => prev[0] === next[0] && prev[1] === next[1]),
    );
  }
}
