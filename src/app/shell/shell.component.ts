import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { ContextMenuComponent, NodeSelectEventArgs, SidebarComponent, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
import { SIDEBAR_CONFIG } from '../client/client-menu.config';
import { ClientSidebarMenu } from '../shared/models/client-sidebar-menu.model';
import { SetIsFirstLoadState, ToggleSidebarState, ToggleTheme } from '../store/app.actions';

enum THEME {
  light = 'light',
  dark = 'dark',
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellPageComponent implements OnInit {
  enableDock = SIDEBAR_CONFIG.isDock;
  width = SIDEBAR_CONFIG.width;
  dockSize = SIDEBAR_CONFIG.dockSize;
  sideBarType = SIDEBAR_CONFIG.type;

  isDarkTheme: boolean;
  isFirstLoad: boolean;
  sideBarMenu: ClientSidebarMenu[];
  sideBarMenuField: Object;
  activeMenuItemData: ClientSidebarMenu;

  @ViewChild('sidebar') sidebar: SidebarComponent;
  @ViewChild ('treevalidate') tree: TreeViewComponent;
  @ViewChild('contextmenu') contextmenu: ContextMenuComponent;

  @Select(AppState.isSidebarOpened)
  isSideBarDocked$: Observable<boolean>;

  @Select(AppState.sideBarMenu)
  sideBarMenu$: Observable<ClientSidebarMenu[]>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.headerState)
  headerState$: Observable<any>;

  @Select(AppState.isFirstLoad)
  isFirstLoad$: Observable<boolean>;

  constructor(private store: Store,
              private route: Router) { }

  ngOnInit(): void {
    this.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });

    this.isFirstLoad$.subscribe(isFirstLoad => {
      this.isFirstLoad = isFirstLoad;
      if (isFirstLoad) {
        this.route.navigate(['/client/dashboard']); // TODO: Should be replaced from Login component
      }
    });

    this.initSidebarFields();
  }

  onSideBarCreated(): void {
    // code placed here since this.sidebar = undefined in ngOnInit() as sidebar not creates in time
    this.isSideBarDocked$.subscribe(isDocked => this.sidebar.isOpen = isDocked);
  }

  toggleClick(): void {
    this.store.dispatch(new ToggleSidebarState(!this.sidebar.isOpen));
    this.tree.collapseAll();
  }

  toggleTheme(): void {
    this.store.dispatch(new ToggleTheme(!this.isDarkTheme));
  }

  initSidebarFields(): void {
    this.sideBarMenu$.subscribe(items => {
      this.sideBarMenu = items;
      this.sideBarMenuField = { dataSource: items, id: 'title', text: 'title', child: 'children' };
    });
  }

  nodeSelect(args: NodeSelectEventArgs): void {
    if (args.node.classList.contains('e-level-1') && this.sidebar.isOpen) {
      this.tree.collapseAll();
      this.tree.expandAll([args.node]);
      this.tree.expandOn = 'None'
    }
  }

  onMenuItemClick(menuItem: ClientSidebarMenu): void {
    this.openSideBarForFirstLoad(menuItem.route);
    this.route.navigate([menuItem.route]);
  }

  onSubMenuItemClick(event: any): void {
    this.tree.selectedNodes = [this.activeMenuItemData.title];
    this.openSideBarForFirstLoad(event.item.route);
    this.route.navigate([event.item.route]);
  }

  showContextMenu(data: ClientSidebarMenu, event: any): void {
    // @ts-ignore: Object is possibly 'null'.
    if (data && data.children?.length > 0 && !this.sidebar.isOpen) {
      this.activeMenuItemData = data;
      const boundingRectangle = event.target.getBoundingClientRect();
      this.contextmenu.open(boundingRectangle.top, boundingRectangle.left + parseInt(this.dockSize));
      this.contextmenu.items = data.children?.map((child: any) => {
        child.text = child.title;
        return child;
      }) || [];
    }
  }

  onContextMenuOpen(event: any): void {
    if (!this.sidebar.isOpen) {
      event.items.forEach((item: any) => {
        // added left colored border
        if (item.route === this.route.url && item.id !== null) {
          // @ts-ignore: Object is possibly 'null'.
          document.getElementById(item.id).classList.add('e-selected');
        }
      });
    }

    // hide context menu items if sidebar is opened
    if (this.sidebar.isOpen) {
      Array.from(event.element.children).forEach((child: any) => child.classList.add('hide'));
    }
  }

  onContextMenuClose(): void {
    this.contextmenu.items = [];
  }

  private openSideBarForFirstLoad(route: string): void {
    if (this.isFirstLoad && route !== this.route.url) {
      this.store.dispatch(new ToggleSidebarState(true));
      this.store.dispatch(new SetIsFirstLoadState(false));
    }
  }

  private setTheme(darkTheme: boolean): void {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }
}
