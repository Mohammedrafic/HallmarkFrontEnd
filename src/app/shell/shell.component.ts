import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable } from 'rxjs';

import { AppState } from 'src/app/store/app.state';
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
export class ShellPageComponent implements OnInit, AfterViewInit {
  enableDock = true;
  width = '240px';
  dockSize = '70px';
  isDarkTheme: boolean;

  @ViewChild('sidebar') sidebar: SidebarComponent;

  @Select(AppState.isSidebarOpened)
  isSideBarDocked$: Observable<boolean>;

  @Select(AppState.sideBarMenu)
  sideBarMenu$: Observable<any>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.headerState)
  headerState$: Observable<any>;

  constructor(private store: Store) { }

  ngOnInit() {
    this.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.setTheme(isDark);
    });
  }

  ngAfterViewInit() {
    this.isSideBarDocked$.subscribe(isDocked => this.sidebar.isOpen = isDocked);
  }

  toggleClick() {
    this.store.dispatch(new ToggleSidebarState(!this.sidebar.isOpen));
  }

  toggleTheme() {
    this.store.dispatch(new ToggleTheme(!this.isDarkTheme));
  }

  private setTheme(darkTheme: boolean) {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }
}
