import { Component, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';

import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store/app.state';

enum THEME {
  light = 'light',
  dark = 'dark',
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellPageComponent {
  enableDock = true;
  width = '240px';
  dockSize = '70px';
  themeName = 'Light Theme';
  isDarkTheme = true;

  @ViewChild('sidebar') sidebar: SidebarComponent;

  @Select(AppState.sideBarMenu)
  sideBarMenu$: Observable<any>;

  @Select(AppState.headerState)
  headerState$: Observable<any>;

  toggleClick() {
    this.sidebar.toggle();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.changeThemeLabel();
    this.setTheme(this.isDarkTheme);
  }

  private changeThemeLabel() {
    this.isDarkTheme
      ? (this.themeName = 'Light Theme')
      : (this.themeName = 'Dark Theme');
  }

  private setTheme(darkTheme: boolean) {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }
}
