import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SideMenuComponent } from './side-menu.component';
import { SideMenuService } from '@shared/components/side-menu/services';

@NgModule({
  imports: [CommonModule, ListBoxModule],
  exports: [SideMenuComponent],
  declarations: [SideMenuComponent],
  providers: [SideMenuService]
})
export class SideMenuModule {}
