import { Component, ViewChild } from '@angular/core';

import { SidebarComponent } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'app-shell-page',
  templateUrl: './shell-page.component.html',
  styleUrls: ['./shell-page.component.scss'],
})
export class ShellPageComponent {
  @ViewChild('sidebar') sidebar: SidebarComponent;
  enableDock = true;
  width = '270px';
  dockSize = '70px';

  toggleClick() {
    this.sidebar.toggle();
  }
}
