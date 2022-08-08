import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttachmentsListComponent } from '@shared/components/attachments/attachments-list/attachments-list.component';
import { FeatherModule } from 'angular-feather';
import { Download } from 'angular-feather/icons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';

@NgModule({
  declarations: [
    AttachmentsListComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule.pick({
      Download,
    }),
    TooltipModule
  ],
  exports: [
    AttachmentsListComponent,
  ]
})
export class AttachmentsModule { }
