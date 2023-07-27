import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomReportGridComponent } from './components/custom-report-grid/custom-report-grid.component';
import { LogiCustomReportRoutingModule } from './logi-custom-report-routing.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { SharedModule } from '@shared/shared.module';
import { DropDownListModule, ListBoxModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, ResizeService, PagerModule, PageService } from '@syncfusion/ej2-angular-grids';
import {
  ButtonModule, ChipListModule, CheckBoxModule,
  RadioButtonModule, SwitchModule
} from '@syncfusion/ej2-angular-buttons';
import { UploaderModule, TextBoxModule, NumericTextBoxModule, MaskedTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { SidebarModule, TabModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { TooltipContainerModule } from "@shared/components/tooltip-container/tooltip.module";
import { InputModule } from '@shared/components/form-controls/input/input.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskModule } from 'ngx-mask';
import { TrendingUp} from 'angular-feather/icons';
import { NgxsModule } from '@ngxs/store';
import { LogiCustomReportState } from './store/state/logi-custom-report.state';
import { CustomReportDialogComponent } from './components/custom-report-grid/custom-report-dialog/custom-report-dialog.component';
import { LogiReportModule } from '../../shared/components/logi-report/logi-report.module';
import { LogiReportState } from '../../organization-management/store/logi-report.state';
import { ScheduleApiService } from '../schedule/services/schedule-api.service';
import { VendorscorecardService } from '../../admin/analytics/vendor-scorecard/vendorscorecard.service';

const sidebarIcons = {
  TrendingUp
};

@NgModule({
  declarations: [
    CustomReportGridComponent,
    CustomReportDialogComponent
  ],
  imports: [
    CommonModule,
    LogiCustomReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ListBoxModule,
    PagerModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    DropDownListModule,
    CheckBoxModule,
    UploaderModule,
    RadioButtonModule,
    TextBoxModule,
    NumericTextBoxModule,
    SidebarModule,
    DatePickerModule,
    DialogModule,
    TabModule,
    TabAllModule,
    TimePickerModule,
    DateTimePickerModule,
    MultiSelectAllModule,
    SwitchModule,
    MaskedTextBoxModule,
    MultiSelectAllModule,
    DropDownButtonModule,
    TooltipContainerModule,
    AgGridModule,
    InputModule,
    FontAwesomeModule,
    LogiReportModule,
    FeatherModule.pick(sidebarIcons),
    NgxMaskModule.forChild(),
    NgxsModule.forFeature([
      LogiCustomReportState,
      LogiReportState
    ]),

  ],
  providers: [
    ScheduleApiService,
    VendorscorecardService
  ]
})
export class LogiCustomReportModule { }
