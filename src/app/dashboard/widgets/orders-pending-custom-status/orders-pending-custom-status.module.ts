import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersPendingCustomStatusComponent } from './orders-pending-custom-status.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';


@NgModule({
    imports: [WidgetWrapperModule, CommonModule, TooltipModule, FeatherModule.pick({ Info })],
    exports: [OrdersPendingCustomStatusComponent],
    declarations: [OrdersPendingCustomStatusComponent],
  })
  export class OrdersPendingCustomStatusModule { }