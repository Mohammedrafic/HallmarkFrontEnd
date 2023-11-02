import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { Calendar, Clock } from 'angular-feather/icons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { ChipsCssClassPipeModule } from '@shared/pipes/chip-css-class/chip-css-class-pipe.module';
import { EmployeeDetailsModalComponent } from './employee-details-modal.component';
import { OfferedTemplateComponent } from './templates/offered-template/offered-template.component';

@NgModule({
  declarations: [
    EmployeeDetailsModalComponent,
    OfferedTemplateComponent
  ],
  exports: [
    EmployeeDetailsModalComponent
  ],
  imports: [
    CommonModule,
    DialogModule,
    ChipListModule,
    ChipsCssClassPipeModule,
    ButtonModule,
    FeatherModule.pick({ Clock, Calendar }),
  ]
})
export class EmployeeDetailsModalModule { }
