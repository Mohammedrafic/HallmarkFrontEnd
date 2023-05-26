import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAddBackgroundForEmptyGridDirective]', // TODO: research if it is still needed
})
export class AddBackgroundForEmptyGridDirective implements OnInit {

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    setInterval(() => {
      const table = this.element.nativeElement;
      const emptyRowElement = table.querySelector('.e-emptyrow');
      if (emptyRowElement) {
        emptyRowElement.parentElement.parentElement.parentElement.classList.add('empty-grid');
      } else {
        const emptyGridElement = table.querySelector('.e-content.empty-grid');
        if (emptyGridElement) {
          emptyGridElement.classList.remove('empty-grid');
        }
      }
    }, 250);
  }
}
