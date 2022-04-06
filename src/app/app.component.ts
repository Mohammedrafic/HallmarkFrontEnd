import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';

enum THEME {
  light = 'light',
  dark = 'dark'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private darkTheme = true;

  @ViewChild('sidebar') sidebar: SidebarComponent;

  public open() {
    console.log('Sidebar Opened');
  }

  public close() {
    console.log('Sidebar Closed');
  }

  toggleClick() {
    this.sidebar.toggle();
  }

  closeClick() {
    this.sidebar.hide();
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
    this.setTheme(this.darkTheme);
  }

  private setTheme(darkTheme: boolean) {
    document.body.classList.remove(darkTheme ? THEME.light : THEME.dark);
    document.body.classList.add(darkTheme ? THEME.dark : THEME.light);
  }
}
