import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { distinctUntilChanged, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';

@Directive({
  selector: '[overflowElement]',
})
export class ElementOverflowDirective extends Destroyable implements OnInit, OnDestroy {
  @Output() elementOverflowed: EventEmitter<boolean> = new EventEmitter();

  private resizeObserver: ResizeObserverModel;

  private elementHeight: number;

  private elementScrollHeight: number;

  constructor(
    private elementRef: ElementRef<HTMLDivElement>,
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.resizeObserver = ResizeObserverService.init(this.elementRef.nativeElement);
    this.elementHeight = this.elementRef.nativeElement.getBoundingClientRect().height;

    this.observeIfElementOverflowed();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.detach();
  }

  private observeIfElementOverflowed(): void {
    this.resizeObserver.resize$
    .pipe(
      distinctUntilChanged((prev, next) => {
        return this.elementScrollHeight === next[0].target.scrollHeight;
      }),
      takeUntil(this.componentDestroy())
    )
    .subscribe(() => {
      this.elementScrollHeight = this.elementRef.nativeElement.scrollHeight;
      this.elementOverflowed.emit(this.elementScrollHeight > this.elementHeight);
    });
  }
}