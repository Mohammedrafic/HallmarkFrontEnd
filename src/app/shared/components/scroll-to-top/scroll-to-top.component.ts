import { Component, ChangeDetectionStrategy, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ButtonTypeEnum } from '../button/enums/button-type.enum';
import { windowScrollTop } from '@shared/utils/styles.utils';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToTopComponent {
  public windowScrolled: boolean;
  public buttonType = ButtonTypeEnum;

  private window: Window;
  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.window = this.document.defaultView as Window;
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
    windowScrollTop();
  }
}
