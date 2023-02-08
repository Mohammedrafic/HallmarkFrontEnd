import { DismissAlertDto } from './../shared/models/alerts-template.model';
import { DismissAlert, DismissAllAlerts } from './../admin/store/alerts.actions';
import { GetAlertsForCurrentUser, ShowCustomSideDialog } from './../store/app.actions';
import { GetAlertsForUserStateModel } from './../shared/models/get-alerts-for-user-state-model';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { OutsideZone } from "@core/decorators";
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import {
  ContextMenuComponent,
  MenuItemModel,
  NodeSelectEventArgs,
  SidebarComponent,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { filter, Observable, Subject, takeUntil, distinctUntilChanged, debounceTime, map } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
import { SIDEBAR_CONFIG } from '../client/client.config';
import { Menu, MenuItem } from '../shared/models/menu.model';
import { User } from '../shared/models/user.model';
import { SetIsFirstLoadState, ToggleSidebarState, ToggleTheme } from '../store/app.actions';
import { GetCurrentUserPermissions, GetUserMenuConfig, LogoutUser } from '../store/user.actions';
import { UserState } from '../store/user.state';
import { SearchMenuComponent } from './components/search-menu/search-menu.component';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { faBan, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ToggleChatDialog, UnreadMessage } from '@core/actions';

import { AnalyticsMenuId } from '@shared/constants/menu-config';

import { CurrentUserPermission } from '@shared/models/permission.model';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { AnalyticsApiService } from '@shared/services/analytics-api.service';
import { InitPreservedFilters } from '../store/preserved-filters.actions';
import { FilterService } from '@shared/services/filter.service';



enum THEME {
  light = 'light',
  dark = 'dark',
}
enum profileMenuItem {
  // TODO: edit profile
  /*edit_profile = 0,*/
  theme = 1,
  help = 2,
  log_out = 3,
  light_theme = 4,
  dark_theme = 5,
  manage_notifications = 6,
  contact_us = 7,
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
  alertSidebarWidth = '440px';
  alertSidebarType = 'auto';
  alertSidebarPosition = 'Right';
  showAlertSidebar = false;

  isDarkTheme: boolean;
  isFirstLoad: boolean;
  sideBarMenu: MenuItem[];
  sideBarMenuField: Object;
  activeMenuItemData: MenuItem;
  public userLogin: { firstName: string; lastName: string };
  public addFormButton: HTMLElement;
  public cancelFormButton: HTMLElement;

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

  @Select(UserState.currentUserPermissions)
  currentUserPermissions$: Observable<CurrentUserPermission[]>;

  @Select(UserState.userChatConfig)
  userChatConfig$: Observable<boolean>;

  public searchString: string = '';
  public isClosingSearch: boolean = false;
  public searchResult: MenuItem[] = [];
  public isSearching: boolean = false;
  public isMaximized: boolean = true;
  public searchHeight: number;
  public ProfileMenuItemNames = {
    // TODO: edit profile
    /* [profileMenuItem.edit_profile]: 'Edit Profile',*/
    [profileMenuItem.theme]: 'Theme',
    [profileMenuItem.help]: 'Help',
    [profileMenuItem.log_out]: 'LogOut',
    [profileMenuItem.light_theme]: 'Light',
    [profileMenuItem.dark_theme]: 'Dark',
    [profileMenuItem.manage_notifications]: 'Manage Notifications',
    [profileMenuItem.contact_us]: 'Contact Us',
  };
  public isUnreadMessages = false;
  public isContactOpen: boolean = false;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;
  profileDatasource: MenuItemModel[] = [];
  profileData: MenuItemModel[] = [];
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
  private permissions: CurrentUserPermission[] = [];
  canManageOtherUserNotifications: boolean;
  canManageNotificationTemplates: boolean;

  isDialogOpen: boolean = false;
  public dialogWidth: string;
  public contactHeaderTitle = 'Contact Support';

  constructor(
    private store: Store,
    private router: Router,
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private actions$: Actions,
    private analyticsApiService: AnalyticsApiService<string>,
    private filterService: FilterService,
    private readonly ngZone: NgZone,
  ) {

    this.filterService.canPreserveFilters() && store.dispatch(new InitPreservedFilters());
    router.events.pipe(filter((event) => event instanceof NavigationEnd), debounceTime(50)).subscribe((data: any) => {
      if (this.tree) {
        const menuItem = this.tree.getTreeData().find((el) => el['route'] === data['url']);
        if (menuItem) {
          if (menuItem['id'] == AnalyticsMenuId) {
            this.toggleClick();
          }
          this.tree.selectedNodes = [menuItem['title'] as string];
        }
      }
    });

  }

  ngOnInit(): void {
    this.dialogWidth = '800px';
    this.subsToOrderAgencyIds();
    this.isDarkTheme$.pipe(takeUntil(this.unsubscribe$)).subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });
    this.initSidebarFields();
    this.getCurrentUserPermissions();
    this.currentUserPermissions$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((permissions) => !!permissions.length),
        map((permissions) => permissions.map((permission) => permission.permissionId))
      )
      .subscribe((permissionsIds: number[]) => {
        this.canManageOtherUserNotifications = this.hasPermission(
          permissionsIds,
          PermissionTypes.CanManageNotificationsForOtherUsers
        );
        this.canManageNotificationTemplates = this.hasPermission(
          permissionsIds,
          PermissionTypes.CanManageNotificationTemplates
        );
        this.removeManageNotificationOptionInHeader();
      });

    this.getAlertsPoolling();

    this.watchForUnreadMessages();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngAfterViewInit(): void {
    this.hideAnalyticsSubMenuItems();
    this.getAlertsPoollingTime();
  }

  private removeManageNotificationOptionInHeader(): void {
    if (this.canManageNotificationTemplates == false || this.canManageOtherUserNotifications == false) {
      const profileManageNotificationId = this.profileData[0].items?.findIndex(
        (x) => x.id == profileMenuItem.manage_notifications.toString()
      );
      if (profileManageNotificationId != undefined && profileManageNotificationId > 0) {
        this.profileData[0].items?.splice(profileManageNotificationId, 1);
      }
    }
    this.profileDatasource = this.profileData;
  }

  private getCurrentUserPermissions(): void {
    this.store.dispatch(new GetCurrentUserPermissions());
  }


  private getAlertsPoolling(): void {
    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.userLogin = user;
        this.store.dispatch(new GetUserMenuConfig(user.businessUnitType));
        this.store.dispatch(new GetAlertsForCurrentUser({}));
        this.alertStateModel$.subscribe((alertdata) => {
          this.alerts = alertdata;
        });
        this.profileData = [
          {
            text: this.userLogin.firstName + ' ' + this.userLogin.lastName,
            items: [
              // TODO: edit profile
              /*{ text: this.ProfileMenuItemNames[profileMenuItem.edit_profile], id: profileMenuItem.edit_profile.toString(), iconCss: 'e-ddb-icons e-settings' },*/
              {
                text: this.ProfileMenuItemNames[profileMenuItem.manage_notifications],
                id: profileMenuItem.manage_notifications.toString(),
                iconCss: 'e-settings e-icons',
              },
              {
                text: this.ProfileMenuItemNames[profileMenuItem.theme],
                id: profileMenuItem.theme.toString(),
                iconCss: this.isDarkTheme ? 'e-theme-dark e-icons' : 'e-theme-light e-icons',
                items: [
                  {
                    text: this.ProfileMenuItemNames[profileMenuItem.light_theme],
                    id: profileMenuItem.light_theme.toString(),
                  },
                  {
                    text: this.ProfileMenuItemNames[profileMenuItem.dark_theme],
                    id: profileMenuItem.dark_theme.toString(),
                  },
                ],
              },
              {
                text: this.ProfileMenuItemNames[profileMenuItem.help],
                id: profileMenuItem.help.toString(),
                iconCss: 'e-circle-info e-icons',
              },
              {
                text: this.ProfileMenuItemNames[profileMenuItem.contact_us],
                id: profileMenuItem.contact_us.toString(),
                iconCss: 'e-ddb-icons e-contactus',
              },
              {
                text: this.ProfileMenuItemNames[profileMenuItem.log_out],
                id: profileMenuItem.log_out.toString(),
                iconCss: 'e-ddb-icons e-logout',
              },
            ],
          },
        ];
      }
    });
  }


  @OutsideZone
  private getAlertsPoollingTime(): void {
    setInterval(() => {
      this.store.dispatch(new GetAlertsForCurrentUser({}));
      this.alertStateModel$.subscribe((alertdata) => {
        this.alerts = alertdata;
      });
    }, 60000
    );

  }

  private hasPermission(permissions: number[], id: number): boolean {
    return permissions.includes(id);
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
      // TODO: edit profile
      //case profileMenuItem.edit_profile:
      //  break;
      case profileMenuItem.manage_notifications:
        this.manageNotifications();
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
      case profileMenuItem.contact_us:
        this.contactUs();
        break;
    }
  }

  onSideBarCreated(): void {
    // code placed here since this.sidebar = undefined in ngOnInit() as sidebar not creates in time

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

  manageNotifications(): void {
    this.menu$.pipe(takeUntil(this.unsubscribe$)).subscribe((menu: Menu) => {
      if (menu.menuItems.length) {
        const menuItems = menu.menuItems
          .find((element) => element.id == 6)
          ?.children.find((e) => e.route == '/alerts/user-subscription');
        if (menuItems) {
          this.router.navigate([menuItems.route]);
        }
      }
    });
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
    if (menuItem.id == AnalyticsMenuId) {
      this.router.navigate([menuItem.route]);
    } else {
      if (!menuItem.children?.length) {
        this.router.navigate([menuItem.route]).then(() => {
          this.closeSidebarInMobileMode();
        });
      }
    }
  }

  private closeSidebarInMobileMode(): void {
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
    if (isMobile) {
      this.store.dispatch(new ToggleSidebarState(false));
    }
  }

  onSubMenuItemClick(event: any): void {
    this.tree.selectedNodes = [this.activeMenuItemData?.anch];
    if (event.item) {
      this.setSideBarForFirstLoad(event.item.route);
      this.router.navigate([event.item.route]);

      this.analyticsApiService.predefinedMenuClickAction(event.item.route, event.item.title).subscribe();
    }
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
    let element = this.tree?.element.querySelector('[data-uid="Analytics"]');
    element?.querySelectorAll('ul li').forEach((el: any) => {
      el.style.display = 'none';
    });
    element?.querySelectorAll('.e-text-content .e-icons').forEach((el: any) => {
      el.style.display = 'none';
    });
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
    this.isTablet$.pipe(takeUntil(this.unsubscribe$)).subscribe((isTablet) => {
      if (!isTablet) {
        this.contextmenu.items = [];
      }
    });
  }

  logout(): void {
    this.store.dispatch(new LogoutUser());
  }

  public onGetHelp(): void {
    const user = this.store.selectSnapshot(UserState.user);
    let url = '';
    if (user?.businessUnitType === BusinessUnitType.Agency) {
      url = 'https://eiiahelp.einsteinii.org/';
    } else {
      url = 'https://eiiohelp.einsteinii.org/';
    }
    window.open(url, '_blank');
  }

  toggleChatDialog(): void {
    this.store.dispatch(new ToggleChatDialog());
    this.isUnreadMessages = false;
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

  public onSearchMenuClick(): void {
    this.searchHeight = 100;
    this.isSearching = !this.isSearching;
    if (this.isMaximized) {
      this.searchInput?.nativeElement?.focus();
    }
    if (!this.sidebar.isOpen) {
      this.isMaximized = false;
    } else this.isMaximized = true;
  }

  public handleOnSearchMenuTextKeyUp(event: KeyboardEvent): void {
    const { value } = event.target as HTMLInputElement;
    if (value != '') {
      this.searchString = value;
      this.searchResult = this.getData(this.searchString.toLowerCase());
    } else {
      this.searchString = '';
      this.searchResult = [];
    }
  }

  public onSearchChange(): void {
    this.searchResult = this.getData(this.searchString.toLowerCase());
  }

  getData(searchText: string) {
    const menuItems = [...this.sideBarMenu];
    const filterMenuItems = menuItems.filter((item: MenuItem) => item.id != AnalyticsMenuId);
    return this.getValueLogic(filterMenuItems && filterMenuItems.length > 0 ? filterMenuItems : menuItems, searchText);
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

  getAlertsForUser() {
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

  alertSideBarClearAllClick() {
    this.allAlertDismiss();
  }

  alertDismiss(id: any) {
    var model: DismissAlertDto = {
      Id: id,
    };
    this.store.dispatch(new DismissAlert(model)).subscribe((x) => {
      if (x) {
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

  private watchForUnreadMessages(): void {
    this.actions$
      .pipe(
        ofActionDispatched(UnreadMessage),
        filter(() => !this.store.snapshot().chat.chatOpen as boolean),
        distinctUntilChanged(),
        debounceTime(1500),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((value) => {
        this.isUnreadMessages = true;
      });
  }

  contactUs() {
    this.store.dispatch(new ShowCustomSideDialog(true));
  }
  GetContentDetails(businessUnitId?: number,orderId?: number,title?:string) {
    if (businessUnitId) {
        this.alertSideBarCloseClick()
        window.localStorage.setItem("BussinessUnitID",JSON.stringify(businessUnitId));
    } 
    if(orderId){
      window.localStorage.setItem("OrderId",JSON.stringify(orderId));
    }
    if(title){
     window.localStorage.setItem("alertTitle",JSON.stringify(title)); 
    }
  }
}
