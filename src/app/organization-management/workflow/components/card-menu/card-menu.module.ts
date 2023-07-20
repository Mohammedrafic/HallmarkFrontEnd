import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { CardMenuComponent } from '@organization-management/workflow/components/card-menu/card-menu.component';
import { Icons } from '@organization-management/workflow/components/card-menu/constants/card.constant';

@NgModule({
  declarations: [
    CardMenuComponent,
  ],
  exports: [
    CardMenuComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick(Icons),
    ButtonModule,
  ],
})
export class CardMenuModule { }
