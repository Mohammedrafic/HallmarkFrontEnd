import { FeatherModule } from 'angular-feather';
import { Sliders } from 'angular-feather/icons';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@shared/components/button/button.module';
import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { GridModule } from '@shared/components/grid/grid.module';
import { MultiselectDropdownModule } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.module';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { InputModule } from '@shared/components/form-controls/input/input.module';

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    ButtonModule,
    CommonModule,
    FeatherModule.pick({ Sliders }),
    FilterDialogModule,
    GridModule,
    InputModule,
    MultiselectDropdownModule,
    PageToolbarModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
  ],
})
export class ReportsModule {}
