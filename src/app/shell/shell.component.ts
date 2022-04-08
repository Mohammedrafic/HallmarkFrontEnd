import { Component, OnInit, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
import { SetSidebarMenu, ToggleTheme } from '../store/app.actions';
import { CLIENT_SIDEBAR_MENU } from '../client/client-menu.config';

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
  dockSize = '70px';
  isDarkTheme: boolean;

  @ViewChild('sidebar') sidebar: SidebarComponent;

  @Select(AppState.sideBarMenu)
  sideBarMenu$: Observable<any>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.headerState)
  headerState$: Observable<any>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });
  }

  toggleClick() {
    this.sidebar.toggle();
  }

  toggleTheme() {
    this.store.dispatch(new ToggleTheme(!this.isDarkTheme));
  }

  private setTheme(darkTheme: boolean) {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }

  ngOnDestroy() {
    // TODO: add unsubscribiption
  }
}
