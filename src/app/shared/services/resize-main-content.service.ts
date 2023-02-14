import { ElementRef, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, map, Observable, tap } from 'rxjs';
import { AppState } from 'src/app/store/app.state';
import { ResizeObserverModel, ResizeObserverService } from './resize-observer.service';

@Injectable({
  providedIn: 'root',
})
export class ResizeContentService {
  private containerWidth$: BehaviorSubject<string> = new BehaviorSubject('100%');

  private resizeContainer: ElementRef<HTMLElement>;

  private resizeObserver: ResizeObserverModel;

  constructor(private readonly store: Store) {}

  public attachResizeContainer(container: ElementRef<HTMLElement>): void {
    this.resizeContainer = container;
  }

  public initResizeObservable(): Observable<number> {
    this.resizeObserver = ResizeObserverService.init(this.resizeContainer.nativeElement);
    return this.listenResizeContent();
  }

  public detachResizeObservable(): void {
    this.resizeObserver.detach();
  }

  public getContainerWidth(): Observable<string> {
    return this.containerWidth$;
  }

  private listenResizeContent(): Observable<number> {
    const isTablet = this.store.selectSnapshot(AppState.isTabletScreen);
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
    const padding = 48;

    return this.resizeObserver.resize$.pipe(
      filter(() => isTablet && !isMobile),
      map((data) => Math.floor(data[0].contentRect.width - padding)),
      distinctUntilChanged(),
      debounceTime(200),
      tap((contentWidth) => {
        console.error(contentWidth);
        
        this.containerWidth$.next(contentWidth + 'px');
      })
    );
  }
}
