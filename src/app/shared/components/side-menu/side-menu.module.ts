import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SideMenuComponent } from './side-menu.component';
import { SideMenuService } from '@shared/components/side-menu/services';
import { TooltipAllModule } from '@syncfusion/ej2-angular-popups';

@NgModule({
  imports: [CommonModule, ListBoxModule, TooltipAllModule],
  exports: [SideMenuComponent],
  declarations: [SideMenuComponent],
  providers: [SideMenuService]
})
export class SideMenuModule {}
