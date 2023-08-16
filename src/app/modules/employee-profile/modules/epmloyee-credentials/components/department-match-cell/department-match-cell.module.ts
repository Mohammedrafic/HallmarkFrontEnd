import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatherModule } from 'angular-feather';
import { AlertTriangle, CheckCircle, XCircle } from 'angular-feather/icons';

import { DepartmentMatchCellComponent } from './department-match-cell.component';

@NgModule({
  declarations: [DepartmentMatchCellComponent],
  imports: [
    CommonModule,
    FeatherModule.pick({ AlertTriangle, CheckCircle, XCircle }),
  ],
})
export class DepartmentMatchCellModule { }
