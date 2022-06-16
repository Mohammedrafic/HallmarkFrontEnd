import { Directive, ViewChild, AfterViewInit } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Component as SFComponent } from '@syncfusion/ej2-base';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { takeUntil } from 'rxjs';

@Directive()
export class AbstractSFComponentDirective extends DestroyableDirective implements AfterViewInit {
  @ViewChild('sfComponent') public sfComponent: SFComponent<HTMLElement>;

  private componentResizeObserver: ResizeObserverModel;

  public ngAfterViewInit(): void {
    this.initSFComponentWrapperResizeObserver();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.componentResizeObserver.detach();
  }

  private initSFComponentWrapperResizeObserver(): void {
    this.componentResizeObserver = ResizeObserverService.init(this.sfComponent.getRootElement());
    this.componentResizeObserver.resize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => requestAnimationFrame(() => this.sfComponent.refresh()));
  }
}
