import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { InlineLoaderModule } from "@shared/components/inline-loader/inline-loader.module";
import { GridModule } from "@syncfusion/ej2-angular-grids";
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { WidgetListComponent } from "./widget-list.component";

@NgModule({
  imports: [CommonModule, GridModule, InlineLoaderModule, DialogModule],
  declarations: [WidgetListComponent],
  exports: [WidgetListComponent],
})
export class WidgetListModule {}
