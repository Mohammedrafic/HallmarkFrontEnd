import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  GridHeaderActionsComponent,
} from '@shared/components/grid/cell-renderers/grid-header-actions/grid-header-actions.component';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FeatherModule } from 'angular-feather';
import { Menu } from 'angular-feather/icons';

@NgModule({
  declarations: [GridHeaderActionsComponent],
  imports: [CommonModule, ButtonModule, FeatherModule.pick({ Menu })],
  exports: [GridHeaderActionsComponent],
})
export class GridHeaderActionsModule {}
