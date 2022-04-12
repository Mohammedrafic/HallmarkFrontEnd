import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel, MenuItemModel, NodeSelectEventArgs, SidebarComponent, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
import { ClientSidebarMenu } from '../shared/models/client-sidebar-menu.model';
import { ToggleSidebarState, ToggleTheme } from '../store/app.actions';

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
  enableDock = true;
  width = '240px';
  dockSize = '68px';
  isDarkTheme: boolean;
  sideBarMenu: ClientSidebarMenu[];
  sideBarMenuField: Object;

  contextMenuItems: MenuItemModel[] = [];


  @ViewChild('sidebar') sidebar: SidebarComponent;
  @ViewChild ('treevalidate') tree: TreeViewComponent;

  @Select(AppState.isSidebarOpened)
  isSideBarDocked$: Observable<boolean>;

  @Select(AppState.sideBarMenu)
  sideBarMenu$: Observable<ClientSidebarMenu[]>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.headerState)
  headerState$: Observable<any>;

  constructor(private store: Store,
              private route: Router) { }

  ngOnInit() {
    this.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });

    this.initSidebarFields();
  }

  sideBarCreated() {
    this.isSideBarDocked$.subscribe(isDocked => this.sidebar.isOpen = isDocked);
  }

  toggleClick() {
    this.store.dispatch(new ToggleSidebarState(!this.sidebar.isOpen));
    this.tree.collapseAll();
  }

  toggleTheme() {
    this.store.dispatch(new ToggleTheme(!this.isDarkTheme));
  }

  initSidebarFields() {
    this.sideBarMenu$.subscribe(items => {
      this.sideBarMenu = items;
      this.sideBarMenuField = { dataSource: items, id: 'title', text: 'title', child: 'children' };

      items.forEach(item => {
        let children: MenuItemModel[] = [];

        item.children?.forEach(child => {
          children.push({ text: child.title, url: child.route });
        });

        this.contextMenuItems.push({ items: children });
      });
    });
  }

  nodeSelect(args: NodeSelectEventArgs) {
    if (args.node.classList.contains('e-level-1')) {
      this.tree.collapseAll();
      this.tree.expandAll([args.node]);
      this.tree.expandOn = 'None'
    }
  }

  onMenuItemClick(menuItem: ClientSidebarMenu) {
    this.route.navigate([menuItem.route]);
  }

  private setTheme(darkTheme: boolean) {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }
}
