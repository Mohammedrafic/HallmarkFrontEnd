import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ChartModule } from "@syncfusion/ej2-angular-charts";
import { PercentageRatioIndicatorModule } from "../percentage-ratio-indicator/percentage-ratio-indicator.module";
import { TrendChartComponent } from "./trend-chart.component";

@NgModule({
  declarations: [TrendChartComponent],
  imports: [CommonModule, ChartModule, PercentageRatioIndicatorModule],
  exports: [TrendChartComponent],
})
export class TrendChartModule {}
