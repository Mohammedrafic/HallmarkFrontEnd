import { Directive, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, map, takeUntil, BehaviorSubject, debounceTime } from 'rxjs';

import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { Destroyable } from '@core/helpers';
import { AppState } from 'src/app/store/app.state';

@Directive({
  selector: '[appResponsiveTabs]',
})
export class ResponsiveTabsDirective extends Destroyable {
  public elementContainer: HTMLElement;

  public tabsWidth$: BehaviorSubject<string> = new BehaviorSubject('100%');

  private resizeObserver: ResizeObserverModel;

  constructor(protected readonly store: Store, @Inject(DOCUMENT) protected readonly document: Document) {
    super();
    this.elementContainer = this.document.querySelector('#main') || this.document.body;
    this.initResizeObservable();
    this.listenResizeContent();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.detach();
  }

  private initResizeObservable(): void {
    this.resizeObserver = ResizeObserverService.init(this.elementContainer);
  }

  private listenResizeContent(): void {
    const isTablet = this.store.selectSnapshot(AppState.isTabletScreen);
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
    this.resizeObserver.resize$
      .pipe(
        filter(() => isTablet && !isMobile),
        map((data) => Math.floor(data[0].contentRect.width)),
        distinctUntilChanged(),
        debounceTime(200),
        takeUntil(this.componentDestroy())
      )
      .subscribe((contentWidth) => {
        const padding = 48;
        this.tabsWidth$.next(contentWidth - padding + 'px');
      });
  }
}

