import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject, filter, forkJoin, takeUntil } from 'rxjs';
import { AnalyticsMenuId } from '../../shared/constants/menu-config';
import { Menu, MenuItem } from '../../shared/models/menu.model';
import { UserState } from '../../store/user.state';
import { MenuSettings } from '@shared/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  public sideMenuConfig: MenuSettings[] = [];
  @Select(UserState.menu)
  menu$: Observable<Menu>;
  private unsubscribe$: Subject<void> = new Subject();
  public isLoad: boolean = false;
  navigateTo: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoad = false;
    this.initAnalyticsSubMenu();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initAnalyticsSubMenu(): void {
    this.menu$
    .pipe(
      filter((menu: Menu) => menu?.menuItems?.length > 0),
      takeUntil(this.unsubscribe$))
    .subscribe((menu: Menu) => {
      this.sideMenuConfig = [];
      if (menu.menuItems.length) {
        let analyticsMenuItem = menu.menuItems.filter((item: MenuItem) => item.id == AnalyticsMenuId);
        if (analyticsMenuItem && analyticsMenuItem.length) {
          analyticsMenuItem[0].children.forEach((x, index) => {
            this.sideMenuConfig.push({ text: x.title, id: index + 1, route: x.route ? x.route : '' });
          });
          const additionalItem = {
            text: "User Activity",
            id: this.sideMenuConfig.length + 1, // Generate a unique ID for the additional item
            route: "/analytics/user-activity", // Replace this with the desired route for the additional item
          };
        
          this.sideMenuConfig.push(additionalItem);
          this.isLoad = true;
        }
      }
      if (this.router.url == '/analytics') {
        this.router.navigate([this.sideMenuConfig[0].route]);
      } else if (this.sideMenuConfig.length == 0) {
        this.router.navigate(['/']);
      } else {
        this.navigateTo = this.router.url;
      }
    });
  }
}
