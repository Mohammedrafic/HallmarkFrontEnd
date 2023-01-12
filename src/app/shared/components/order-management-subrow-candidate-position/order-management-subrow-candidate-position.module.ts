import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { OrderManagementSubrowCandidatePositionComponent } from './order-management-subrow-candidate-position.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    OrderManagementSubrowCandidatePositionComponent,
  ],
  imports: [
    CommonModule,
    ChipListModule,
    SharedModule,
  ],
  exports: [OrderManagementSubrowCandidatePositionComponent],
})
export class OrderManagementSubrowCandidatePositionModule { }
