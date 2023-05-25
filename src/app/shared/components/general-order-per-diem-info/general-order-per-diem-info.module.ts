import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FeatherModule } from "angular-feather";

import { GeneralOrderPerDiemInfoComponent } from "./general-order-per-diem-info.component";
import { BoolValuePipeModule } from "@shared/pipes/bool-values/bool-values-pipe.module";

@NgModule({
  declarations: [GeneralOrderPerDiemInfoComponent],
  exports: [GeneralOrderPerDiemInfoComponent],
  imports: [CommonModule, BoolValuePipeModule, FeatherModule],
})
export class GeneralOrderPerDiemInfoModule { }
