import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ChartModule } from "@syncfusion/ej2-angular-charts";
import { TrendChartComponent } from "./trend-chart.component";

@NgModule({
  declarations: [TrendChartComponent],
  imports: [CommonModule, ChartModule ],
  exports: [TrendChartComponent],
})
export class TrendChartModule {}
