import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements AfterViewInit {
  @ViewChild('inputWithIcon') search: ElementRef;

  @Input() public placeholder = 'Search';
  @Input() public showClearButton = false;

  @Output() public inputKeyUpEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
  @Output() public searchFocusOut: EventEmitter<FocusEvent> = new EventEmitter();
  @Output() public clearInput: EventEmitter<void> = new EventEmitter();

  public ngAfterViewInit(): void {
    if (this.searchFocusOut?.observers.length > 0) {
      this.search.nativeElement.getElementsByTagName('input')[0].focus();
    }
  }

  public onSearchClick(): void {
    this.search.nativeElement.classList.add('e-search-input-active');
  }

  public onSearchBlur(): void {
    this.search.nativeElement.classList.remove('e-search-input-active');
  }

  public onKeyUp($event: KeyboardEvent): void {
    this.inputKeyUpEnter.emit($event);
  }

  public clear(): void {
    this.search.nativeElement.getElementsByTagName('input')[0].value = '';
  }

  public onSearchFocusOut($event: FocusEvent): void {
    if (this.searchFocusOut?.observers.length > 0) { 
      this.searchFocusOut.emit($event);
    }
  }

  public clearInputByButton(): void {
    this.clear();
    this.clearInput.emit();
  }
}
