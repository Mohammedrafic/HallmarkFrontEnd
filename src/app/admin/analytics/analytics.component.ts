import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { AnalyticsMenuId } from '../../shared/constants/menu-config';
import { Menu, MenuItem } from '../../shared/models/menu.model';
import { UserState } from '../../store/user.state';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent implements OnInit, OnDestroy  {
  public sideMenuConfig: { [key: string]: Object }[] = [];
  @Select(UserState.menu)
  menu$: Observable<Menu>;

  private unsubscribe$: Subject<void> = new Subject();
  public isLoad: boolean = false;

  constructor() {
   
  }
  ngOnInit(): void {
    this.isLoad = false;
    this.initAnalyticsSubMenu();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initAnalyticsSubMenu(): void {
    this.menu$.pipe(takeUntil(this.unsubscribe$)).subscribe((menu: Menu) => {
      this.sideMenuConfig = [];
      if (menu.menuItems.length) {
        let analyticsMenuItem = menu.menuItems.filter((item: MenuItem) => item.id == AnalyticsMenuId);
        if (analyticsMenuItem && analyticsMenuItem.length) {
          analyticsMenuItem[0].children.forEach((x, index) => {
            this.sideMenuConfig.push({ text: x.title, id: (index + 1), route: x.route ? x.route : '' });
          })
          this.isLoad = true;
        }
      }
    });
  }
}
