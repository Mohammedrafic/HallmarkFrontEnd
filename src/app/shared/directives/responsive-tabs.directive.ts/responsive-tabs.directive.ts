import { Directive } from '@angular/core';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, map, takeUntil, BehaviorSubject } from 'rxjs';

import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { Destroyable } from '@core/helpers';
import { AppState } from 'src/app/store/app.state';

@Directive({
  selector: '[appResponsiveTabs]',
})
export class ResponsiveTabsDirective extends Destroyable {
  public elementContainer: HTMLElement | null = document.body.querySelector('#main');

  public tabsWidth$: BehaviorSubject<string> = new BehaviorSubject('100%');

  private resizeObserver: ResizeObserverModel;

  constructor(protected readonly store: Store) {
    super();
    this.initResizeObservable();
    this.listenResizeContent();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.detach();
  }

  private initResizeObservable(): void {
    this.resizeObserver = ResizeObserverService.init(this.elementContainer!);
  }

  private listenResizeContent(): void {
    const isTablet = this.store.selectSnapshot(AppState.isTabletScreen);
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
    this.resizeObserver.resize$
      .pipe(
        filter(() => isTablet && !isMobile),
        map((data) => Math.floor(data[0].contentRect.width)),
        distinctUntilChanged(),
        takeUntil(this.componentDestroy())
      )
      .subscribe((contentWidth) => {
        const padding = 48;
        this.tabsWidth$.next(contentWidth - padding + 'px');
      });
  }
}

