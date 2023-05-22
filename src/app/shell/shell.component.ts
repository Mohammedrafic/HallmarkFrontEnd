import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterEvent, Event } from '@angular/router';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBan, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import {
  ContextMenuComponent,
  MenuItemModel,
  NodeSelectEventArgs,
  SidebarComponent,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { Observable, debounceTime, distinctUntilChanged, filter, map, merge, takeUntil } from 'rxjs';

import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { ToggleChatDialog, UnreadMessage } from '@core/actions';
import { OutsideZone } from "@core/decorators";
import { Destroyable } from '@core/helpers';
import { AnalyticsMenuId } from '@shared/constants/menu-config';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { AnalyticsApiService } from '@shared/services/analytics-api.service';
import { FilterService } from '@shared/services/filter.service';
import { ResizeContentService } from '@shared/services/resize-main-content.service';
import { AppState } from 'src/app/store/app.state';
import { SIDEBAR_CONFIG } from '@client/client.config';
import { Menu, MenuItem } from '@shared/models/menu.model';
import { User } from '@shared/models/user.model';
import { InitPreservedFilters } from '../store/preserved-filters.actions';
import { GetCurrentUserPermissions, GetUserMenuConfig, LogoutUser } from '../store/user.actions';
import { UserState } from '../store/user.state';
import { DismissAlert, DismissAllAlerts } from '@admin/store/alerts.actions';
import { DismissAlertDto } from '@shared/models/alerts-template.model';
import { GetAlertsForUserStateModel } from '@shared/models/get-alerts-for-user-state-model';
import {
  GetAlertsCountForCurrentUser,
  GetAlertsForCurrentUser,
  GetDeviceScreenResolution,
  ShowCustomSideDialog,
  SetIsFirstLoadState,
  ToggleSidebarState,
  ToggleTheme,
} from '../store/app.actions';
import { SearchMenuComponent } from './components/search-menu/search-menu.component';
import { MenuItemNames } from './shell.constant';
import { ProfileMenuItem, THEME } from './shell.enum';
import { UserService } from '@shared/services/user.service';
import { BreakpointObserverService } from '@core/services';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellPageComponent extends Destroyable implements OnInit, OnDestroy, AfterViewInit {
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

  @ViewChild('mainContainer', { static: true }) private mainContainer: ElementRef<HTMLElement>;

  @ViewChild('uiElement', { static: false })  public uiElement: ElementRef;

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

  @Select(AppState.getAlertsCountForCurrentUser)
  alertCountStateModel$: Observable<number>;

  @Select(UserState.currentUserPermissions)
  currentUserPermissions$: Observable<CurrentUserPermission[]>;

  @Select(UserState.userChatConfig)
  userChatConfig$: Observable<boolean>;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  @Select(AppState.isMobileScreen)
  public isMobile$: Observable<boolean>;

  @Select(AppState.isTabletScreen)
  public isTablet$: Observable<boolean>;

  @Select(AppState.isDekstopScreen)
  public isDekstop$: Observable<boolean>;

  //TODO: primitive type obssesion
  public searchString = '';
  public searchResult: MenuItem[] = [];
  public isSearching = false;
  public isMaximized = true;
  public searchHeight: number;
  public isUnreadMessages = false;
  public dialogWidth = '800px';
  public contactHeaderTitle = 'Contact Support';
  public profileDatasource: MenuItemModel[] = [];
  public enableDock = SIDEBAR_CONFIG.isDock;
  public width = SIDEBAR_CONFIG.width;
  public dockSize = SIDEBAR_CONFIG.dockSize;
  public sideBarType = SIDEBAR_CONFIG.type;
  public alertSidebarWidth = '440px';
  public alertSidebarType = 'auto';
  public alertSidebarPosition = 'Right';
  public showAlertSidebar = false;
  public isDarkTheme: boolean;
  public sideBarMenuField: Object;
  public faTimes = faTimes as IconDefinition;
  public alerts: any;
  public alertsCount: number;
  public isToggleButtonDisable = false;

  private isClosingSearch = false;
  private ProfileMenuItemNames = MenuItemNames;
  private isContactOpen = false;
  private profileData: MenuItemModel[] = [];
  private activeMenuItemData: MenuItem;
  private isFirstLoad: boolean;
  private sideBarMenu: MenuItem[];
  private faBan = faBan as IconDefinition;
  private userLogin: { firstName: string; lastName: string };
  private addFormButton: HTMLElement;
  private cancelFormButton: HTMLElement;
  private canManageOtherUserNotifications: boolean;
  private canManageNotificationTemplates: boolean;
  private isDialogOpen = false;
  private permissions: CurrentUserPermission[] = [];
  private orderMenuItems: Array<string> = ['Organization/Order Management', 'Agency/Order Management'];
  private irpVmsHelpSiteUrl = 'https://eiiohelp.einsteinii.org/';

  scrollData:boolean = false;
  loadMoreCotent:string = '';
  pageNumber:number = 0;
  pageSize:number = 50;
  public isMobile = false;
  public isSmallDesktop = false;
  nonResponsiveMenuItesm :Array<number> = [81,44,18,40,21,34];
  selectedItem:number = 0;

  constructor(
    private store: Store,
    private router: Router,
    private orderManagementService: OrderManagementService,
    private orderManagementAgencyService: OrderManagementAgencyService,
    private actions$: Actions,
    private analyticsApiService: AnalyticsApiService<string>,
    private filterService: FilterService,
    private readonly ngZone: NgZone,
    private ResizeContentService: ResizeContentService,
    private userService: UserService,
    private breakpointService: BreakpointObserverService,
    public elementRef: ElementRef
  ) {
    super();

    this.filterService.canPreserveFilters() && store.dispatch(new InitPreservedFilters());

    router.events.pipe(filter((event) => event instanceof NavigationEnd), debounceTime(50)).subscribe((data: any) => {
      if (this.tree) {
        const menuItem = this.tree.getTreeData().find((el) => el['route'] === data['url']);
        if (menuItem) {
          if (menuItem['id'] == AnalyticsMenuId) {
            this.toggleSidebar();
          }
          this.tree.selectedNodes = [menuItem['title'] as string];
        }
      }
    });

    this.getDeviceScreenResolution();
  }

  ngOnInit(): void {
    this.getDeviceScreen();
    this.observeOrderNavigation();
    this.observeThemeChange();
    this.initSidebarFields();
    this.getCurrentUserPermissions();
    this.getPermissions();
    this.getAlertsPoolling();
    this.watchForUnreadMessages();
    this.attachElementToResizeObserver();
    this.watchForRouterEvents();
    this.getSiteHelpUrl();
  }

  ngAfterViewInit(): void {
    this.hideAnalyticsSubMenuItems();
    this.getAlertsPoollingTime();
  }

  onSelectProfileMenu(event: any): void {
    switch (Number(event.item.properties.id)) {
      // TODO: edit profile
      //case ProfileMenuItem.edit_profile:
      //  break;
      case ProfileMenuItem.manage_notifications:
        this.manageNotifications();
        break;
      case ProfileMenuItem.light_theme:
        this.isDarkTheme = true;
        this.toggleTheme();
        break;
      case ProfileMenuItem.dark_theme:
        this.isDarkTheme = false;
        this.toggleTheme();
        break;
      case ProfileMenuItem.help:
        this.onGetHelp();
        break;
      case ProfileMenuItem.log_out:
        this.logout();
        break;
      case ProfileMenuItem.contact_us:
        this.contactUs();
        break;
    }
  }

  onSideBarCreated(): void {
    // code placed here since this.sidebar = undefined in ngOnInit() as sidebar not creates in time

    this.isSideBarDocked$
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe((isDocked) => {
      this.sidebar.isOpen = isDocked;
    });


    this.isFirstLoad$
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe((isFirstLoad) => {
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

  toggleSidebar(): void {
    this.store.dispatch(new ToggleSidebarState(!this.sidebar.isOpen));
    this.tree.collapseAll();
  }

  toggleSubMenu(args: NodeSelectEventArgs): void {
    if (args.node.classList.contains('e-level-1') && this.sidebar.isOpen) {
      this.tree.collapseAll();
      this.tree.expandAll([args.node]);
      this.tree.expandOn = 'None';
    }

    this.hideAnalyticsSubMenuItems();
  }

  selectMenuItem(menuItem: MenuItem): void {
    /** Preventing the page navigation  which are not responsive*/
    if(this.isMobile  || this.isSmallDesktop){
      if(this.nonResponsiveMenuItesm.includes(menuItem.id))
        return;
    }
    this.setSideBarForFirstLoad(menuItem.route as string);

    if (menuItem.id == AnalyticsMenuId) {
      this.router.navigate([menuItem.route]);
    } else if (!menuItem.children?.length) {
        this.router.navigate([menuItem.route]).then(() => {
          this.closeSidebarInMobileMode();
        });
    }
  }

  onSubMenuItemClick(event: any): void {
    this.selectedItem = event.element.id;
    this.tree.selectedNodes = [this.activeMenuItemData?.anch];
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

  onBeforeContextMenuClose(event: any): void {
   let selectedMenuItem = event.items.find((data:any)=>data.id == this.selectedItem);

    if (selectedMenuItem) {
      this.setSideBarForFirstLoad(selectedMenuItem.route);
      this.router.navigate([selectedMenuItem.route]);

      this.analyticsApiService.predefinedMenuClickAction(selectedMenuItem.route, selectedMenuItem.title).subscribe();
    }
  }

  onBeforeContextMenuOpen(event: any): void {
    if (!this.sidebar.isOpen) {
      event.items.forEach((item: any) => {
        if ((item.route === this.router.url || "/"+item.route === this.router.url) && item.id) {
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
    this.isTablet$
    .pipe(
      filter((isTablet) => !isTablet),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.contextmenu.items = [];
    });
  }

  logout(): void {
    this.store.dispatch(new LogoutUser());
  }

  onGetHelp(): void {
    const user = this.store.selectSnapshot(UserState.user);
    let url = '';
    if (user?.businessUnitType === BusinessUnitType.Agency) {
      url = 'https://eiiahelp.einsteinii.org/';
    } else {
      url = this.irpVmsHelpSiteUrl;
    }
    window.open(url, '_blank');
  }

  toggleChatDialog(): void {
    this.store.dispatch(new ToggleChatDialog());
    this.isUnreadMessages = false;
  }

  onSearchMenuClick(): void {
    this.searchHeight = 100;
    this.isSearching = !this.isSearching;
    if (this.isMaximized) {
      this.searchInput?.nativeElement?.focus();
    }

    this.isMaximized = this.sidebar.isOpen;
  }

  // TODO: make it with fromEvent and debouncetime
  handleOnSearchMenuTextKeyUp(event: KeyboardEvent): void {
    const { value } = event.target as HTMLInputElement;

    if (value) {
      this.searchString = value;
      this.searchResult = this.getData(this.searchString.toLowerCase());
    } else {
      this.searchString = '';
      this.searchResult = [];
    }
  }

  onSearchChange(): void {
    this.searchResult = this.getData(this.searchString.toLowerCase());
  }

  onSearchFocusOut(): void {
    this.isClosingSearch = true;
    this.searchString = '';
    this.searchResult = [];
    this.isSearching = false;

    /* Small delay to allow search to close when clicking search icon*/
    setTimeout(() => {
      this.isClosingSearch = false;
    }, 500);
  }

  bellIconClicked(): void {
    this.pageNumber = 0;
    this.alerts = [];
    this.store.dispatch(new GetAlertsForCurrentUser(this.pageNumber,this.pageSize));
    this.alertStateModel$
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe((alertdata) => {
      if(alertdata != null && alertdata.length > 0){
        this.scrollData = true;
        this.alerts =  [...alertdata,...this.alerts]; //alertdata;
        this.showAlertSidebar = true;
        this.alertSidebar?.show();      
      }else{
        this.scrollData = false;
        this.loadMoreCotent = "No more data found!";
      }

    });

  }

  alertSideBarCloseClick(): void {
    this.alertSidebar.hide();
    this.store.dispatch(new GetAlertsCountForCurrentUser({}));

    this.alertCountStateModel$
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe((alertCountdata) => {
      this.alertsCount = alertCountdata;
    });
  }

  alertSideBarClearAllClick(): void {
    this.allAlertDismiss();
  }

  alertDismiss(id: any): void {
    const model: DismissAlertDto = {
      Id: id,
    };

    this.store.dispatch(new DismissAlert(model)).subscribe((x) => {
      if (x) {
        this.getAlertsForUser();
      }
    });
    this.store.dispatch(new GetAlertsCountForCurrentUser({}));
    this.alertCountStateModel$.subscribe((alertCountdata) => {
      this.alertsCount = alertCountdata;
    });
  }

  contactUs(): void {
    this.store.dispatch(new ShowCustomSideDialog(true));
  }

  getContentDetails(businessUnitId?: number,orderId?: number,title?:string): void {
    if (businessUnitId) {
        this.alertSideBarCloseClick();
        window.localStorage.setItem("BussinessUnitID",JSON.stringify(businessUnitId));
    }
    if(orderId){
      window.localStorage.setItem("OrderId",JSON.stringify(orderId));
    }
    if(title){
     window.localStorage.setItem("alertTitle",JSON.stringify(title));
    }
  }

  private getAlertsForUser(): void {
    this.pageNumber = 0;
    this.store.dispatch(new GetAlertsForCurrentUser(this.pageNumber,this.pageSize));
    this.alertStateModel$
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe((x) => {
      this.alerts = x;
    });
  }

  private allAlertDismiss(): void {
    this.store.dispatch(new DismissAllAlerts()).subscribe((x) => {
      if (x) {
        this.getAlertsForUser();
      }
    });
    this.store.dispatch(new GetAlertsCountForCurrentUser({}));
    this.alertCountStateModel$.subscribe((alertCountdata) => {
      this.alertsCount = alertCountdata;
    });
  }

  private getData(searchText: string): any[] {
    const menuItems = [...this.sideBarMenu];
    const filterMenuItems = menuItems.filter((item: MenuItem) => item.id != AnalyticsMenuId);
    return this.getValueLogic(filterMenuItems && filterMenuItems.length > 0 ? filterMenuItems : menuItems, searchText);
  }

  private getValueLogic(data: any, filterText: string): any[] {
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

  private observeOrderNavigation(): void {
    const orgOrderStream = this.orderManagementAgencyService.selectedOrderAfterRedirect$
    .pipe(
      map(() => [this.orderMenuItems[1]]),
    );

    const agencyOrderStream = this.orderManagementService.selectedOrderAfterRedirect$
    .pipe(
      map(() => [this.orderMenuItems[0]])
    );

    merge(
      orgOrderStream,
      agencyOrderStream,
    )
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((menuItem: string[]) => {
      this.tree.selectedNodes = menuItem;
    });
  }

  private hideAnalyticsSubMenuItems(): void {
    const element = this.tree?.element.querySelector('[data-uid="Analytics"]');
    element?.querySelectorAll('ul li').forEach((el: any) => {
      el.style.display = 'none';
    });
    element?.querySelectorAll('.e-text-content .e-icons').forEach((el: any) => {
      el.style.display = 'none';
    });
  }

  private manageNotifications(): void {
    this.menu$
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe((menu: Menu) => {
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

  private toggleTheme(): void {
    this.store.dispatch(new ToggleTheme(!this.isDarkTheme));
  }

  private initSidebarFields(): void {
    this.menu$
    .pipe(
      filter((menu) => !!menu.menuItems.length),
      takeUntil(this.componentDestroy())
    )
    .subscribe((menu: Menu) => {
      this.sideBarMenu = menu.menuItems;
      this.sideBarMenuField = { dataSource: this.sideBarMenu, id: 'anch', text: 'title', child: 'children' };

      if (this.router.url === '/') {
        this.router.navigate([this.sideBarMenu[0].route]);
      }

    });
  }

  private closeSidebarInMobileMode(): void {
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);

    if (isMobile) {
      this.store.dispatch(new ToggleSidebarState(false));
    }
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

  private watchForUnreadMessages(): void {
    this.actions$
      .pipe(
        ofActionDispatched(UnreadMessage),
        filter(() => !this.store.snapshot().chat.chatOpen as boolean),
        distinctUntilChanged(),
        debounceTime(1500),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.isUnreadMessages = true;
      });
  }

  private removeManageNotificationOptionInHeader(): void {
    if (!this.canManageNotificationTemplates || !this.canManageOtherUserNotifications) {
      const profileManageNotificationId = this.profileData[0].items?.findIndex(
        (x) => x.id == ProfileMenuItem.manage_notifications.toString()
      );
      if (profileManageNotificationId !== undefined && profileManageNotificationId > 0) {
        this.profileData[0].items?.splice(profileManageNotificationId, 1);
      }
    }
    this.profileDatasource = this.profileData;
  }

  private getCurrentUserPermissions(): void {
    this.store.dispatch(new GetCurrentUserPermissions());
  }

  // TODO: this.alertCountStateModel$.subscribe - possibly duplicated 3 times.
  private getAlertsPoolling(): void {
    this.user$.pipe(takeUntil(this.componentDestroy())).subscribe((user: User) => {
      if (user) {
        this.userLogin = user;
        this.store.dispatch(new GetUserMenuConfig(user.businessUnitType));
        this.store.dispatch(new GetAlertsCountForCurrentUser({}));

        this.alertCountStateModel$
        .pipe(takeUntil(this.componentDestroy()))
        .subscribe((alertCountdata) => {
          this.alertsCount = alertCountdata;
        });

        this.profileData = [
          {
            text: this.userLogin.firstName + ' ' + this.userLogin.lastName,
            items: [
              // TODO: edit profile
              /*{ text: this.ProfileMenuItemNames[ProfileMenuItem.edit_profile], id: ProfileMenuItem.edit_profile.toString(), iconCss: 'e-ddb-icons e-settings' },*/
              {
                text: this.ProfileMenuItemNames[ProfileMenuItem.manage_notifications],
                id: ProfileMenuItem.manage_notifications.toString(),
                iconCss: 'e-settings e-icons',
              },
              {
                text: this.ProfileMenuItemNames[ProfileMenuItem.theme],
                id: ProfileMenuItem.theme.toString(),
                iconCss: this.isDarkTheme ? 'e-theme-dark e-icons' : 'e-theme-light e-icons',
                items: [
                  {
                    text: this.ProfileMenuItemNames[ProfileMenuItem.light_theme],
                    id: ProfileMenuItem.light_theme.toString(),
                  },
                  {
                    text: this.ProfileMenuItemNames[ProfileMenuItem.dark_theme],
                    id: ProfileMenuItem.dark_theme.toString(),
                  },
                ],
              },
              {
                text: this.ProfileMenuItemNames[ProfileMenuItem.help],
                id: ProfileMenuItem.help.toString(),
                iconCss: 'e-circle-info e-icons',
              },
              {
                text: this.ProfileMenuItemNames[ProfileMenuItem.contact_us],
                id: ProfileMenuItem.contact_us.toString(),
                iconCss: 'e-ddb-icons e-contactus',
              },
              {
                text: this.ProfileMenuItemNames[ProfileMenuItem.log_out],
                id: ProfileMenuItem.log_out.toString(),
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
      this.store.dispatch(new GetAlertsCountForCurrentUser({}));
      this.alertCountStateModel$.subscribe((alertCountdata) => {
        this.alertsCount = alertCountdata;
      });
    }, 200000
    );

  }

  private hasPermission(permissions: number[], id: number): boolean {
    return permissions.includes(id);
  }

  private attachElementToResizeObserver(): void {
    this.ResizeContentService.attachResizeContainer(this.mainContainer);
  }

  private getDeviceScreenResolution(): void {
    this.store.dispatch(new GetDeviceScreenResolution());
  }

  private observeThemeChange(): void {
    this.isDarkTheme$
    .pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((isDark) => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });
  }

  private getPermissions(): void {
    this.currentUserPermissions$
    .pipe(
      takeUntil(this.componentDestroy()),
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
  }

  private watchForRouterEvents(): void {
    const scheduleUrl = '/client/scheduling';

    if (this.router.url === scheduleUrl) {
      this.isToggleButtonDisable = true;
    }

    this.router.events.pipe(
      filter((routeEvent: Event): routeEvent is RouterEvent => routeEvent instanceof NavigationEnd),
      takeUntil(this.componentDestroy()),
    ).subscribe((routeEvent: RouterEvent) => {
      if(routeEvent.url === scheduleUrl) {
        this.tree.collapseAll();
        this.store.dispatch(new ToggleSidebarState(false));
        
        this.isToggleButtonDisable = true;
      } else {
        this.isToggleButtonDisable = false;
      }
    });
  }

  private getSiteHelpUrl(): void {
    this.userService
      .getHelpSiteUrl()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(({ url }) => {
        this.irpVmsHelpSiteUrl = url;
      });
  }

  public onScrollLoadData(){
    const nativeElement= this.uiElement.nativeElement;    
    if(nativeElement.clientHeight + Math.round(nativeElement.scrollTop) === nativeElement.scrollHeight && this.scrollData){
      this.scrollData = false;
      this.loadMoreCotent = "loading..";
      this.pageNumber = this.pageNumber + 1;
      this.store.dispatch(new GetAlertsForCurrentUser(this.pageNumber,this.pageSize));
    }
  }

  private getDeviceScreen(): void {
    this.breakpointService
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((screen) => {
        this.isMobile = screen.isMobile;
        this.isSmallDesktop = screen.isDesktopSmall;
      });
  }
}
