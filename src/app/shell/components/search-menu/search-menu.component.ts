import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '../../../shared/models/menu.model';


@Component({
  selector: 'dashboard-search-menu',
  templateUrl: './search-menu.component.html',
  styleUrls: ['./search-menu.component.scss'],
})
export class SearchMenuComponent implements OnChanges {
  @Input() public isMaximized: boolean;
  @Input() public searchResult: MenuItem[];
  @Input() public searchString: string;
  @Input() public searchHeight: number;

  @Output() public searchFocusOut: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('searchInput')
  public searchInput: ElementRef;

  public searchContentWindowHeight: string;



  public constructor(
   
    private router: Router,
   
  ) {}

  public ngOnChanges(): void {
    const adjustedHeight = this.searchHeight - 42;
    this.searchContentWindowHeight = adjustedHeight + 'px';
  }

  

  public onItemClick(item: MenuItem): void {
    this.router.navigate([item.route]);
  }

  public onSearchFocusOut(): void {
   
  }

  public onSearchChange(): void {
 
  }

  public setFocus(): void {
    this.searchInput?.nativeElement?.focus();
  }
}
