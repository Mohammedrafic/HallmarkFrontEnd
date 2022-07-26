import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { WidgetLegendComponent } from './widget-legend.component';

@NgModule({
  imports: [CommonModule, CheckBoxModule],
  declarations: [WidgetLegendComponent],
  exports: [WidgetLegendComponent],
})
export class WidgetLegendModule {}
