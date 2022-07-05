import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { InvoicesChartComponent } from "./invoices-chart.component";

@NgModule({
  declarations: [InvoicesChartComponent],
  exports: [InvoicesChartComponent],
  imports: [CommonModule],
})
export class InvoicesChartModule {}
