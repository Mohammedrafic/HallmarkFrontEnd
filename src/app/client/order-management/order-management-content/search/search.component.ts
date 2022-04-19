import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent  {
  @ViewChild('inputWithIcon') search: ElementRef;

  constructor() { }

  onSearchClick(): void {
    this.search.nativeElement.classList.add('e-search-input-active');
  }

  onSearchBlur(): void {
    this.search.nativeElement.classList.remove('e-search-input-active');
  }
}
