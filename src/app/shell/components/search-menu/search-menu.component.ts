import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RECENT_SEARCH_MENU_HISTROY } from '../../../shared/constants';
import { MenuItem } from '../../../shared/models/menu.model';


@Component({
  selector: 'dashboard-search-menu',
  templateUrl: './search-menu.component.html',
  styleUrls: ['./search-menu.component.scss'],
})
export class SearchMenuComponent implements OnChanges, OnInit {
  @Input() public isMaximized: boolean;
  @Input() public searchResult: MenuItem[];
  @Input() public searchString: string;
  @Input() public searchHeight: number;
  @Input() public isDarkTheme: boolean | null;

  @Output() public searchFocusOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() public handleOnSearchTextKeyUp = new EventEmitter<any>();

  @ViewChild('searchInput')
  public searchInput: ElementRef;

  public searchContentWindowHeight: string;
  public placeholder: string = 'Start typing';
  public recentHistoryMenuItems: MenuItem[] = [];
  public uniqueHistoryMenuItems: MenuItem[] = [];

  public constructor(
   
    private router: Router,
   
  ) {}

  ngOnInit(): void {
    if (window.localStorage.getItem(RECENT_SEARCH_MENU_HISTROY) != undefined && window.localStorage.getItem(RECENT_SEARCH_MENU_HISTROY) != null) {
      this.recentHistoryMenuItems = JSON.parse(window.localStorage.getItem(RECENT_SEARCH_MENU_HISTROY) as string) || [];
      this.uniqueHistoryMenuItems = this.recentHistoryMenuItems;
    }
  }

  public ngOnChanges(): void {
    const adjustedHeight = this.searchHeight - 42;
    this.searchContentWindowHeight = adjustedHeight + 'px';
  }

  

  public onItemClick(item: MenuItem): void {
    this.recentHistoryMenuItems.push(item);
    this.uniqueHistoryMenuItems = [];
    this.uniqueHistoryMenuItems = [...new Set(this.recentHistoryMenuItems)];
    window.localStorage.setItem("recentHistory", JSON.stringify(this.uniqueHistoryMenuItems));
    this.router.navigate([item.route]);
  }

  public onSearchFocusOut($event: any): void {
    this.searchFocusOut.emit($event);
  }

  public onSearchChange(): void {
 
  }

  public setFocus(): void {
    this.searchInput?.nativeElement?.focus();
  }

  public searchMenuItems($event: any): void {
    this.handleOnSearchTextKeyUp.emit($event);
  }
}
