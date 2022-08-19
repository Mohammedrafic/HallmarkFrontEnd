import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FilterDialogModule } from "@shared/components/filter-dialog/filter-dialog.module";
import { ChipListAllModule } from "@syncfusion/ej2-angular-buttons";
import { MultiSelectAllModule } from "@syncfusion/ej2-angular-dropdowns";
import { WidgetFilterComponent } from "./widget-filter.component";

@NgModule({
  imports: [CommonModule, ChipListAllModule, MultiSelectAllModule, FilterDialogModule, ReactiveFormsModule],
  declarations: [WidgetFilterComponent],
  exports: [WidgetFilterComponent],
})
export class WidgetFilterModule {}
