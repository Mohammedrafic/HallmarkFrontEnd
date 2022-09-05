import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent  {
  @ViewChild('inputWithIcon') search: ElementRef;

  @Input() placeholder: string = 'Search';

  @Output() inputKeyUpEnter = new EventEmitter();

  constructor() { }

  onSearchClick(): void {
    this.search.nativeElement.classList.add('e-search-input-active');
  }

  onSearchBlur(): void {
    this.search.nativeElement.classList.remove('e-search-input-active');
  }

  onKeyUp($event: any): void {
    this.inputKeyUpEnter.emit($event);
  }

  clear(): void {
    this.search.nativeElement.getElementsByTagName('input')[0].value = '';
  }
}
