import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { catchError, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { AnalyticsApiService } from '@shared/services/analytics-api.service';
import { AnalyticEventType, AnalyticTargetType } from '@shared/enums/analytic-event.enum';
import { AnalyticsDTO, AnalyticsEvent, AnalyticsTarget } from '@core/interface/analytics.interface';

/**
 * Analytic directive that handle click or select on HTML element / component and send analytics request
 */
@Directive({
  selector: '[appAnalyticByClick]'
})
export class AnalyticByClickDirective<T> {
  /**
   * @analyticData - parameter to provide main data of event (Exp. id || route || text) to send in analytics inside directive
   * @analyticEvent - parameter to listen different events (Exp. click)
   * @analyticTargetType - parameter to understand what eventTarget needed (Exp. menu || button || input || sidebar)
   * @analyticEventValue - parameter to provide secondary info of the current value of element (Exp. checkbox value || input value)
   */
  @Input() analyticData: T;
  @Input() analyticEvent: AnalyticsEvent = AnalyticEventType.Click;
  @Input() analyticTargetType: AnalyticsTarget = AnalyticTargetType.Menu;
  @Input() analyticEventValue: string = '';

  constructor(private elementRef: ElementRef, private analyticsApiService: AnalyticsApiService<T>) {}

  /**
   * Listener on click by any element/component and send analytics request
   */
  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement): void {
    if (this.analyticEvent === AnalyticEventType.Click) {
      const clickedInside = this.elementRef.nativeElement.contains(target);

      if (clickedInside) {
        this.makeRequest();
      }
    }
  }

  /**
   * Listener on select the sidebar item and send analytics request
   */
  @HostListener('document:select', ['$event.item'])
  public onSelectSideBarItem(item: { title: string; route: T }): void {
    if (this.analyticEvent === AnalyticEventType.Select) {
      this.analyticData = item.route;
      this.analyticEventValue = item.title;

      this.makeRequest();
    }
  }

  private makeRequest(): void {
    const body: AnalyticsDTO<T> = {
      eventType: AnalyticEventType.Click,
      eventTargetType: this.analyticTargetType,
      eventTarget: this.analyticData,
      eventValue: this.analyticEventValue,
    };

    this.analyticsApiService.postUIAction(body).pipe(
      take(1),
      catchError(() => of(null)),
    ).subscribe();
  }
}
