import { Component, ViewChild } from '@angular/core';

import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';

enum THEME {
  light = 'light',
  dark = 'dark',
}

@Component({
  selector: 'app-shell-page',
  templateUrl: './shell-page.component.html',
  styleUrls: ['./shell-page.component.scss'],
})
export class ShellPageComponent {
  @ViewChild('sidebar') sidebar: SidebarComponent;
  enableDock = true;
  width = '240px';
  dockSize = '70px';

  toggleClick() {
    this.sidebar.toggle();
  }

  themeName = 'Light Theme';
  isDarkTheme = true;

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.changeThemeLabel();
    this.setTheme(this.isDarkTheme);
  }

  private changeThemeLabel() {
    this.isDarkTheme
      ? (this.themeName = 'Dark Theme')
      : (this.themeName = 'Light Theme');
  }

  private setTheme(darkTheme: boolean) {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }
}
