import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlightGridRowDirective]',
})
export class HighlightGridRowDirective implements OnInit {
  @Input() appHighlightGridRowDirective = false;

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    if (this.appHighlightGridRowDirective) {
      const eDetailRow = this.element.nativeElement.parentElement.parentElement;
      eDetailRow.classList.add('highlight');
    }
  }
}
