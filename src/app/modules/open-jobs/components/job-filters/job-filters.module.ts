import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { JobFiltersComponent } from './job-filters.component';

@NgModule({
  declarations: [
    JobFiltersComponent,
  ],
  exports: [
    JobFiltersComponent,
  ],
  imports: [
    CommonModule,
    FilterDialogModule,
    ReactiveFormsModule,
    DropDownListModule,
    ValidateDirectiveModule,
  ],
})
export class JobFiltersModule {}
