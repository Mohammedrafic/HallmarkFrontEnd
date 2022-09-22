import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements AfterViewInit  {
  @ViewChild('inputWithIcon') search: ElementRef;

  @Input() placeholder: string = 'Search';

  @Output() inputKeyUpEnter = new EventEmitter();
  @Output() public searchFocusOut: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngAfterViewInit(): void {
    if (this.searchFocusOut?.observers.length > 0) {
      this.search.nativeElement.getElementsByTagName('input')[0].focus();
    }
  }

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

  public onSearchFocusOut($event: any): void {
    if (this.searchFocusOut?.observers.length > 0)
      this.searchFocusOut.emit($event);
  }
}
