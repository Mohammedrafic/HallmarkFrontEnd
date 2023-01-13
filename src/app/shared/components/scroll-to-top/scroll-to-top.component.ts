import { Component, ChangeDetectionStrategy, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToTopComponent {
  public windowScrolled: boolean;

  private window: Window;
  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.window = this.document.defaultView!;
  }
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const minScrolledPixelsFromTop = 10;
    const maxScrolledPixelsFromTop = 100;
    if (
      this.window.pageYOffset ||
      this.document.documentElement.scrollTop ||
      this.document.body.scrollTop > maxScrolledPixelsFromTop
    ) {
      this.windowScrolled = true;
    } else if (
      (this.windowScrolled && this.window.pageYOffset) ||
      this.document.documentElement.scrollTop ||
      this.document.body.scrollTop < minScrolledPixelsFromTop
    ) {
      this.windowScrolled = false;
    }
  }

  public scrollToTop(): void {
    const that = this;
    (function smoothscroll() {
      let currentScroll = that.document.documentElement.scrollTop || that.document.body.scrollTop;
      if (currentScroll > 0) {
        that.window.requestAnimationFrame(smoothscroll);
        that.window.scrollTo(0, currentScroll - currentScroll / 8);
      }
    })();
  }
}
