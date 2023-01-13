import { Directive, ElementRef, HostBinding, HostListener, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BreakpointObserverService } from '@core/services';
import { DestroyableDirective } from './destroyable.directive';
import { takeUntil } from 'rxjs';

@Directive({
  selector: '[appTabsMobileShadow]',
})
export class TabsMobileShadowDirective extends DestroyableDirective implements OnInit {
  private windowScrolled: boolean;
  private window: Window;
  private isMobile: boolean;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private renderer: Renderer2,
    private hostElement: ElementRef,
    private breackpointObserver: BreakpointObserverService
  ) {
    super();
    this.window = document.defaultView!;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isMobile) {
      const minScrolledPixelsFromTop = 10;
      const maxScrolledPixelsFromTop = 100;
      if (
        this.window.pageYOffset ||
        this.document.documentElement.scrollTop ||
        this.document.body.scrollTop > maxScrolledPixelsFromTop
      ) {
        this.renderer.setStyle(this.hostElement.nativeElement, 'box-shadow', '0px 4px 4px rgba(0, 0, 0, 0.25)');
      } else if (
        (this.windowScrolled && this.window.pageYOffset) ||
        this.document.documentElement.scrollTop ||
        this.document.body.scrollTop < minScrolledPixelsFromTop
      ) {
        this.renderer.removeStyle(this.hostElement.nativeElement, 'box-shadow');
      }
    }
  }

  ngOnInit(): void {
    this.breackpointObserver
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isMobile }) => {
        this.isMobile = isMobile;
        if (!this.isMobile) {
          this.renderer.removeStyle(this.hostElement.nativeElement, 'box-shadow');
        }
      });
  }
}
