import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, combineLatest, filter, forkJoin, takeUntil } from 'rxjs';
import { AnalyticsMenuId, VMSReportsMenuId } from '../../shared/constants/menu-config';
import { Menu, MenuItem } from '../../shared/models/menu.model';
import { UserState } from '../../store/user.state';
import { MenuSettings } from '@shared/models';
import { Router } from '@angular/router';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  public sideMenuConfig: MenuSettings[] = [];
  @Select(UserState.menu)
  menu$: Observable<Menu>;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public isLoad: boolean = false;
  navigateTo: string;

  constructor(private router: Router, private userservice: UserService, private cd: ChangeDetectorRef, private store: Store) { }

  ngOnInit(): void {
    this.initAnalyticsSubMenu();

  }

  flattenChildren(items: any[]): any[] {
    let flattenedItems: any[] = [];
    items.forEach(item => {
      // Push the current item to the flattened array
      flattenedItems.push({ text: item.title, id: item.id, route: item.route ? item.route : '' });

      // If the item has children, recursively flatten them
      if (item.children && item.children.length > 0) {
        const flattenedChildren = this.flattenChildren(item.children);
        flattenedItems = flattenedItems.concat(flattenedChildren);
      }
    });
    return flattenedItems;
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initAnalyticsSubMenu(): void {
    this.isLoad = true;
    combineLatest([this.menu$, this.userservice.data$])
    .pipe(
      filter(([menu, data]) => menu?.menuItems?.length > 0 || data != null),
      takeUntil(this.unsubscribe$)
    )
    .subscribe(([menu, data]) => {
      this.sideMenuConfig = [];
      if(data!=null)
      {
        const flattenedMenuItems = this.flattenChildren(data?.children);
        this.sideMenuConfig = flattenedMenuItems;
      }else{
        if (menu.menuItems.length) {
          let analyticsMenuItem = menu.menuItems.filter((item: MenuItem) => item.id == AnalyticsMenuId);
          const menuFilter = analyticsMenuItem[0].children;
          const menuId = localStorage.getItem("menuId");
  
          if (menuId) {
            const item = this.findItemById(menuFilter, Number(menuId));
            const flattenedMenuItems = this.flattenChildren(item?.children);
            this.sideMenuConfig = flattenedMenuItems;
          } else {
            const routeToFind = this.router.url;
            const topLevelParentId = this.findTopLevelParentId(menuFilter, routeToFind);
  
            if (topLevelParentId !== null) {
              const item = this.findItemById(menuFilter, Number(topLevelParentId));
              const flattenedMenuItems = this.flattenChildren(item.children);
              this.sideMenuConfig = flattenedMenuItems;
           }
          }
        }
      }

  
      if (this.router.url == '/analytics') {
        const menuId = localStorage.getItem("menuId")
        const route = (Number(menuId) === VMSReportsMenuId) ? this.sideMenuConfig[1].route : this.sideMenuConfig[0].route
        this.router.navigate([route]);
      } else if (this.sideMenuConfig.length == 0) {
        this.router.navigate(['/']);
      } else {
        this.navigateTo = this.router.url;
      }
    });

  }
  findTopLevelParentId(menuItems: any[], route: string): number | null {
    for (const menuItem of menuItems) {
      if (menuItem.route === route) {
        return menuItem.id;
      }
      if (menuItem.children) {
        const parentId = this.findTopLevelParentId(menuItem.children, route);
        if (parentId !== null) {
          return menuItem.id;
        }
      }
    }
    return null;
  }
  
  findItemById(data: any, id: number): any {
    return data.find((item: { id: number; }) => item.id === id);
  }

}
