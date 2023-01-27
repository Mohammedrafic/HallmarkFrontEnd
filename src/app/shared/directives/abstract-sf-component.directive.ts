import { Component as SFComponent } from '@syncfusion/ej2-base';
import { takeUntil, filter, debounceTime } from 'rxjs';

import { Directive, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';

@Directive()
export class AbstractSFComponentDirective<ComponentType extends SFComponent<HTMLElement>>
  extends DestroyableDirective
  implements AfterViewInit, OnDestroy
{
  @ViewChild('sfComponent') public sfComponent: ComponentType;

  protected skipResizeObserverHandlerPredicate: boolean = false;

  private componentResizeObserver: ResizeObserverModel | null;

  public ngAfterViewInit(): void {
    this.initSFComponentWrapperResizeObserver();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.componentResizeObserver?.detach();
  }

  private initSFComponentWrapperResizeObserver(): void {
    this.componentResizeObserver = ResizeObserverService.init(this.sfComponent.getRootElement());
    this.componentResizeObserver.resize$
      .pipe(
        debounceTime(300),
        filter(() => !this.skipResizeObserverHandlerPredicate),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        requestAnimationFrame(() => this.sfComponent.refresh());
      });
  }
}
