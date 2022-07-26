import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { ContextMenuComponent, NodeSelectEventArgs, SidebarComponent, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
import { SIDEBAR_CONFIG } from '../client/client.config';
import { Menu, MenuItem } from '../shared/models/menu.model';
import { User } from '../shared/models/user.model';
import { SetHeaderState, SetIsFirstLoadState, ToggleSidebarState, ToggleTheme } from '../store/app.actions';
import { GetUserMenuConfig, LogoutUser } from '../store/user.actions';
import { UserState } from '../store/user.state';
import { ItemModel, MenuEventArgs, BeforeOpenCloseMenuEventArgs } from '@syncfusion/ej2-angular-splitbuttons';
import { SearchMenuComponent } from './components/search-menu/search-menu.component';
enum THEME {
  light = 'light',
  dark = 'dark',
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellPageComponent implements OnInit, OnDestroy {
  enableDock = SIDEBAR_CONFIG.isDock;
  width = SIDEBAR_CONFIG.width;
  dockSize = SIDEBAR_CONFIG.dockSize;
  sideBarType = SIDEBAR_CONFIG.type;

  isDarkTheme: boolean;
  isFirstLoad: boolean;
  sideBarMenu: MenuItem[];
  sideBarMenuField: Object;
  activeMenuItemData: MenuItem;
  public userLogin:{firstName:string, lastName:string};

  private unsubscribe$: Subject<void> = new Subject();

  @ViewChild('sidebar') sidebar: SidebarComponent;
  @ViewChild ('treevalidate') tree: TreeViewComponent;
  @ViewChild('contextmenu') contextmenu: ContextMenuComponent;
  @ViewChild('searchInputContainer')
  public searchInputContainer: ElementRef;

  @ViewChild('searchInput')
  public searchInput: ElementRef;

  @ViewChild('searchMenuInstance')
  public searchMenuInstance: SearchMenuComponent;

  @Select(AppState.isSidebarOpened)
  isSideBarDocked$: Observable<boolean>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.headerState)
  headerState$: Observable<any>;

  @Select(AppState.isFirstLoad)
  isFirstLoad$: Observable<boolean>;

  @Select(UserState.user)
  user$: Observable<User>;

  @Select(UserState.menu)
  menu$: Observable<Menu>;

  public searchString: string = '';
  public isClosingSearch: boolean = false;
  public searchResult: MenuItem[] = [];
  public isSearching: boolean = false;
  public isMaximized: boolean = true;
  public searchHeight: number;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;
  profileDatasource: ItemModel[] = [

    { text: "Edit Profile", id: '0', iconCss: 'e-ddb-icons e-settings' },

    { text: "LogOut", id: '1', iconCss: 'e-ddb-icons e-logout' }

  ];

  constructor(private store: Store,
              private router: Router) { }
  
  ngOnInit(): void {
    this.isDarkTheme$.pipe(takeUntil(this.unsubscribe$)).subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });
    this.initSidebarFields();
    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.userLogin = user; 
        this.store.dispatch(new GetUserMenuConfig(user.businessUnitType));
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSelectProfileMenu(event: any) {

    switch (Number(event.item.properties.id)) {

      case 0:
        break;

      case 1:
        this.logout();
        break;
    }

  }

  

  onSideBarCreated(): void {
    // code placed here since this.sidebar = undefined in ngOnInit() as sidebar not creates in time
    this.isSideBarDocked$.pipe(takeUntil(this.unsubscribe$)).subscribe(isDocked => this.sidebar.isOpen = isDocked);
    this.isFirstLoad$.pipe(takeUntil(this.unsubscribe$)).subscribe(isFirstLoad => {
      this.isFirstLoad = isFirstLoad;
      if (isFirstLoad) {
        // TODO: Should be decided after Login: CLIENT_SIDEBAR_MENU, ADMIN_SIDEBAR_MENU etc.
        // const currentConfiguration = CLIENT_SIDEBAR_MENU;
        // const activeMenuItem = currentConfiguration.find(item => item.isActive);
        //
        // if (activeMenuItem) {
        //   this.route.navigate([activeMenuItem.route]);
        //   this.tree.selectedNodes = [activeMenuItem.title];
        // }
      }
    });
  }

  toggleClick(): void {
    this.store.dispatch(new ToggleSidebarState(!this.sidebar.isOpen));
    this.tree.collapseAll();
  }

  toggleTheme(): void {
    this.store.dispatch(new ToggleTheme(!this.isDarkTheme));
  }

  initSidebarFields(): void {
    this.menu$.pipe(takeUntil(this.unsubscribe$)).subscribe((menu: Menu) => {
      if (menu.menuItems.length) {
        this.sideBarMenu = menu.menuItems;
        if (this.router.url === '/') {
          this.router.navigate([this.sideBarMenu[0].route]);
        }
        this.sideBarMenuField = { dataSource: this.sideBarMenu, id: 'title', text: 'title', child: 'children' };
      }
    });
  }

  nodeSelect(args: NodeSelectEventArgs): void {
    if (args.node.classList.contains('e-level-1') && this.sidebar.isOpen) {
      this.tree.collapseAll();
      this.tree.expandAll([args.node]);
      this.tree.expandOn = 'None'
    }
  }

  onMenuItemClick(menuItem: MenuItem): void {
    this.setSideBarForFirstLoad(menuItem.route as string);
    this.router.navigate([menuItem.route]);
  }

  onSubMenuItemClick(event: any): void {
    this.tree.selectedNodes = [this.activeMenuItemData.title];
    this.setSideBarForFirstLoad(event.item.route);
    this.router.navigate([event.item.route]);
  }

  showContextMenu(data: MenuItem, event: any): void {
    this.contextmenu.items = [];
    if (data.children && data.children.length > 0 && !this.sidebar.isOpen) {
      this.activeMenuItemData = data;
      const boundingRectangle = event.target.getBoundingClientRect();
      this.contextmenu.items = data.children.map((child: any) => {
        child.text = child.title;
        return child;
      }) || [];

      // workaround to eliminate UI glitch with context menu resizing
      setTimeout(() => this.contextmenu.open(boundingRectangle.top, parseInt(this.dockSize)));
    }
  }

  onBeforeContextMenuOpen(event: any): void {
    if (!this.sidebar.isOpen) {
      event.items.forEach((item: any) => {
        if (item.route === this.router.url && item.id) {
          const contextMenuItem = document.getElementById(item.id)
          if (contextMenuItem) {
            // added left colored border
            contextMenuItem.classList.add('e-selected');
          }
        }
      });
    } else {
      // hide context menu items if sidebar is opened
      Array.from(event.element.children).forEach((child: any) => child.classList.add('hide'));
    }
  }

  onContextMenuClose(): void {
    this.contextmenu.items = [];
  }

  logout(): void {
    this.store.dispatch(new LogoutUser());
  }

  public onGetHelp(): void {
    window.open('https://helpdocumentation.azurewebsites.net/', "_blank");
  }


  private setSideBarForFirstLoad(route: string): void {
    if (this.isFirstLoad && route !== this.router.url) {
      this.store.dispatch(new ToggleSidebarState(true));
      this.store.dispatch(new SetIsFirstLoadState(false));
    }
  }

  private setTheme(darkTheme: boolean): void {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }

  public onSearchFocus(): void {
    this.searchHeight = 100;
    this.isSearching = true;
   
    if (this.isMaximized) {
      this.searchInput?.nativeElement?.focus();
    } else {
        this.searchMenuInstance.setFocus();
    }
  }

  public onSearchChange(): void {

    this.searchResult= this.sideBarMenu.filter((element) => {
      return element.title.toLowerCase().includes(this.searchString.toLowerCase()) ;
    });
    if (this.searchResult.length == 0) {
      this.searchResult = this.sideBarMenu. filter((element) => {
        element.children.filter((childElement) => { return childElement.title.toLowerCase().includes(this.searchString.toLowerCase()); }) 
      });
    }
  }

  public onSearchFocusOut(): void {
    this.isClosingSearch = true;
    this.searchString = '';
    this.searchResult = [];
    this.isSearching = false;

    /* Small delay to allow search to close when clicking search icon*/
    setTimeout(() => {
      this.isClosingSearch = false;
    }, 500);
  }
}
