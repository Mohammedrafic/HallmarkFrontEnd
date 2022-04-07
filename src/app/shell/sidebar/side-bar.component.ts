import { Component } from '@angular/core';

enum THEME {
  light = 'light',
  dark = 'dark',
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  width = '270px';
  dockSize = '90px';

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
