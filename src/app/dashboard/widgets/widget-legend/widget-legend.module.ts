import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { PercentageRatioIndicatorModule } from '../percentage-ratio-indicator/percentage-ratio-indicator.module';
import { WidgetLegendComponent } from './widget-legend.component';

@NgModule({
  imports: [CommonModule, CheckBoxModule, PercentageRatioIndicatorModule],
  declarations: [WidgetLegendComponent],
  exports: [WidgetLegendComponent],
})
export class WidgetLegendModule {}
