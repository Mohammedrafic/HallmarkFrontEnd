import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PercentageRatioIndicatorComponent } from "./percentage-ratio-indicator.component";

@NgModule({
  imports: [CommonModule],
  declarations:  [PercentageRatioIndicatorComponent],
  exports: [PercentageRatioIndicatorComponent],
})
export class PercentageRatioIndicatorModule {}
