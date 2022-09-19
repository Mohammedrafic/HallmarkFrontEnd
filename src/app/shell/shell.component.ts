import { DismissAlertDto } from './../shared/models/alerts-template.model';
import { DismissAlert, DismissAllAlerts } from './../admin/store/alerts.actions';
import { GetAlertsForCurrentUser } from './../store/app.actions';
import { GetAlertsForUserStateModel } from './../shared/models/get-alerts-for-user-state-model';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import {
  ContextMenuComponent,
  MenuItemModel,
  NodeSelectEventArgs,
  SidebarComponent,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { filter, Observable, Subject, takeUntil } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
import { SIDEBAR_CONFIG } from '../client/client.config';
import { Menu, MenuItem } from '../shared/models/menu.model';
import { User } from '../shared/models/user.model';
import { SetIsFirstLoadState, ToggleSidebarState, ToggleTheme } from '../store/app.actions';
import { GetUserMenuConfig, LogoutUser } from '../store/user.actions';
import { UserState } from '../store/user.state';
import { SearchMenuComponent } from './components/search-menu/search-menu.component';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { faBan, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AnalyticsMenuId } from '@shared/constants/menu-config';

enum THEME {
  light = 'light',
  dark = 'dark',
}
enum profileMenuItem {
  edit_profile = 0,
  theme = 1,
  help=2,
  log_out = 3,
  light_theme = 4,
  dark_theme=5
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellPageComponent implements OnInit, OnDestroy, AfterViewInit {
  enableDock = SIDEBAR_CONFIG.isDock;
  width = SIDEBAR_CONFIG.width;
  dockSize = SIDEBAR_CONFIG.dockSize;
  sideBarType = SIDEBAR_CONFIG.type;
  alertSidebarWidth = '360px';
  alertSidebarType = 'auto';
  alertSidebarPosition = 'Right';
  showAlertSidebar = false;

  public isSidebarHidden: boolean = true;

  isDarkTheme: boolean;
  isFirstLoad: boolean;
  sideBarMenu: MenuItem[];
  sideBarMenuField: Object;
  activeMenuItemData: MenuItem;
  public userLogin: { firstName: string; lastName: string };

  private unsubscribe$: Subject<void> = new Subject();

  @ViewChild('sidebar') sidebar: SidebarComponent;
  @ViewChild('alertSidebar') alertSidebar: SidebarComponent;
  @ViewChild('treevalidate') tree: TreeViewComponent;
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

  @Select(AppState.getAlertsForCurrentUser)
  alertStateModel$: Observable<GetAlertsForUserStateModel[]>;

  public searchString: string = '';
  public isClosingSearch: boolean = false;
  public searchResult: MenuItem[] = [];
  public isSearching: boolean = false;
  public isMaximized: boolean = true;
  public searchHeight: number;
  public ProfileMenuItemNames = {
    [profileMenuItem.edit_profile]: 'Edit Profile',
    [profileMenuItem.theme]: 'Theme',
    [profileMenuItem.help]: 'Help',
    [profileMenuItem.log_out]: 'LogOut',
    [profileMenuItem.light_theme]: "Light",
    [profileMenuItem.dark_theme]: "Dark"
  }
  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;
  profileDatasource: MenuItemModel[] = []; 
  private routers: Array<string> = ['Organization/Order Management', 'Agency/Order Management'];

  @Select(AppState.isMobileScreen)
  public isMobile$: Observable<boolean>;

  @Select(AppState.isTabletScreen)
  public isTablet$: Observable<boolean>;

  @Select(AppState.isDekstopScreen)
  public isDekstop$: Observable<boolean>;

  faTimes = faTimes as IconDefinition;
  faBan = faBan as IconDefinition;
  alerts: any;
  constructor(
    private store: Store,
    private router: Router,
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService
  ) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((data: any) => {
      if (this.tree) {
        const menuItem = this.tree.getTreeData().find((el) => el['route'] === data['url']);
        if (menuItem) {
          this.tree.selectedNodes = [menuItem['title'] as string];
        }
      }
    });
  }

  ngOnInit(): void {
    this.subsToOrderAgencyIds();
    this.isDarkTheme$.pipe(takeUntil(this.unsubscribe$)).subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });
    this.initSidebarFields();
    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.userLogin = user;
        this.store.dispatch(new GetUserMenuConfig(user.businessUnitType));
        this.getAlertsForUser();
        this.profileDatasource = [
          {
            text: this.userLogin.firstName + ' ' + this.userLogin.lastName,
            items: [{ text: this.ProfileMenuItemNames[profileMenuItem.edit_profile], id: profileMenuItem.edit_profile.toString(), iconCss: 'e-ddb-icons e-settings' },
            {
              text: this.ProfileMenuItemNames[profileMenuItem.theme], id: profileMenuItem.theme.toString(), iconCss: this.isDarkTheme ?'e-theme-dark e-icons': 'e-theme-light e-icons', items: [
                { text: this.ProfileMenuItemNames[profileMenuItem.light_theme], id: profileMenuItem.light_theme.toString() },
                { text: this.ProfileMenuItemNames[profileMenuItem.dark_theme], id: profileMenuItem.dark_theme.toString() }
              ]
              },
              { text: this.ProfileMenuItemNames[profileMenuItem.help], id: profileMenuItem.help.toString(), iconCss: 'e-circle-info e-icons' },
              { text: this.ProfileMenuItemNames[profileMenuItem.log_out], id: profileMenuItem.log_out.toString(), iconCss: 'e-ddb-icons e-logout' }]
          },

        ];
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngAfterViewInit(): void {
    this.hideAnalyticsSubMenuItems();
  }

  subsToOrderAgencyIds(): void {
    this.orderManagementAgencyService.selectedOrderAfterRedirect$.subscribe(
      () => (this.tree.selectedNodes = [this.routers[1]])
    );
    this.orderManagementService.selectedOrderAfterRedirect$.subscribe(
      () => (this.tree.selectedNodes = [this.routers[0]])
    );
  }

  onSelectProfileMenu(event: any) {
    switch (Number(event.item.properties.id)) {
      case profileMenuItem.edit_profile:
        break;
      case profileMenuItem.light_theme:
        this.isDarkTheme = true;
        this.toggleTheme();
        break;
      case profileMenuItem.dark_theme:
        this.isDarkTheme = false;
        this.toggleTheme();
        break;
      case profileMenuItem.help:
        this.onGetHelp();
        break;
      case profileMenuItem.log_out:
        this.logout();
        break;
    }
  }

  onSideBarCreated(): void {
    // code placed here since this.sidebar = undefined in ngOnInit() as sidebar not creates in time
    this.isMobile$.pipe(takeUntil(this.unsubscribe$)).subscribe((isMobile) => {
      isMobile && this.store.dispatch(new ToggleSidebarState(true));
    });

    this.isSideBarDocked$.pipe(takeUntil(this.unsubscribe$)).subscribe((isDocked) => (this.sidebar.isOpen = isDocked));
    this.isFirstLoad$.pipe(takeUntil(this.unsubscribe$)).subscribe((isFirstLoad) => {
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

  onAlertSidebarCreated(): void {
    this.sidebar.element.classList.add('e-hidden');
  }

  toggleClick(): void {
    this.store.dispatch(new ToggleSidebarState(!this.sidebar.isOpen));
    this.tree.collapseAll();
  }

  public toggleMobileSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
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
        this.sideBarMenuField = { dataSource: this.sideBarMenu, id: 'anch', text: 'title', child: 'children' };
      }
    });
  }

  nodeSelect(args: NodeSelectEventArgs): void {
  
    if (args.node.classList.contains('e-level-1') && this.sidebar.isOpen) {
      this.tree.collapseAll();
      this.tree.expandAll([args.node]);
      this.tree.expandOn = 'None';
    }
    this.hideAnalyticsSubMenuItems();
  }

  onMenuItemClick(menuItem: MenuItem): void {
    this.setSideBarForFirstLoad(menuItem.route as string);
    this.router.navigate([menuItem.route]);
  }

  onSubMenuItemClick(event: any): void {
    this.tree.selectedNodes = [this.activeMenuItemData.anch];
    this.setSideBarForFirstLoad(event.item.route);
    this.router.navigate([event.item.route]);
  }

  showContextMenu(data: MenuItem, event: any): void {
    this.contextmenu.items = [];
    if (data.id != AnalyticsMenuId && data.children && data.children.length > 0 && !this.sidebar.isOpen) {
      this.activeMenuItemData = data;
      const boundingRectangle = event.target.getBoundingClientRect();
      this.contextmenu.items =
        data.children.map((child: any) => {
          child.text = child.title;
          return child;
        }) || [];

      // workaround to eliminate UI glitch with context menu resizing
      setTimeout(() => this.contextmenu.open(boundingRectangle.top, parseInt(this.dockSize)));
    }
    this.hideAnalyticsSubMenuItems();
  }

  hideAnalyticsSubMenuItems() {
    let element = this.tree.element.querySelector('[data-uid="Analytics"]');
    element?.querySelectorAll('ul li').forEach((el: any) => { el.style.display = 'none' });
    element?.querySelectorAll('.e-text-content .e-icons').forEach((el: any) => { el.style.display = 'none' });
  }

  onBeforeContextMenuOpen(event: any): void {
    if (!this.sidebar.isOpen) {
      event.items.forEach((item: any) => {
        if (item.route === this.router.url && item.id) {
          const contextMenuItem = document.getElementById(item.id);
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
    const user = this.store.selectSnapshot(UserState.user);
    let url = '';
    if (user?.businessUnitType === BusinessUnitType.Agency) {
      url = 'https://green-pebble-0878e040f.1.azurestaticapps.net/';
    } else {
      url = 'https://lemon-sea-05b5a7c0f.1.azurestaticapps.net/';
    }
    window.open(url, '_blank');
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
    this.searchResult = this.getData(this.searchString.toLowerCase());
  }

  getData(searchText: string) {
    const menuItems = [...this.sideBarMenu];

    return this.getValueLogic(menuItems, searchText);
  }

  getValueLogic(data: any, filterText: string) {
    const arr: any = [];

    if (data && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const ele = data[i];

        ele && ele.title.toLowerCase().includes(filterText.toLocaleLowerCase())
          ? arr.push(ele)
          : arr.push(...this.getValueLogic(ele.children, filterText));
      }
    }

    return arr;
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

  getAlertsForUser(){
    this.store.dispatch(new GetAlertsForCurrentUser({}));
    this.alertStateModel$.subscribe((x) => {
      this.alerts = x;
    });
  }

  bellIconClicked() {
    this.showAlertSidebar = true;
    this.alertSidebar.show();
  }

  alertSideBarCloseClick() {
    this.alertSidebar.hide();
  }

  alertSideBarClearAllClick(){
    this.allAlertDismiss();
  }

  alertDismiss(id: any) {    
    var model: DismissAlertDto = {
      Id: id,
    };
    this.store.dispatch(new DismissAlert(model)).subscribe((x)=>{
      if(x){
        this.getAlertsForUser();
      }
    });
  }

  allAlertDismiss() {
    this.store.dispatch(new DismissAllAlerts()).subscribe((x) => {
      if (x) {
        this.getAlertsForUser();
      }
    });
  }
}
