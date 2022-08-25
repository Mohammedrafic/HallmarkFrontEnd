import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';

import {
  GridActionsCellComponent
} from '@shared/components/grid/cell-renderers/grid-actions-cell/grid-actions-cell.component';

@NgModule({
  declarations: [
    GridActionsCellComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FeatherModule
  ]
})
export class GridActionsCellModule {
}
