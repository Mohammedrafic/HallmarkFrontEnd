import { Injectable } from '@angular/core';
import { BaseObservable } from '@core/helpers';
import { Observable } from 'rxjs';

/**
 * This service used for DateWeekPickerComponent, stores selected range.
 */
@Injectable()
export class DateWeekService {
  private readonly rangeStore: BaseObservable<[string, string]> = new BaseObservable(['', '']);

  setRange(range: [string, string]): void {
    this.rangeStore.set(range);
  }

  getRangeStream(): Observable<[string, string]> {
    return this.rangeStore.getStream();
  }
}
