import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
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
}
