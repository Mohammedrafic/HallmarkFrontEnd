import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { FeatherModule } from 'angular-feather';

import {
  AlertCircle,
  CheckCircle,
  User,
  Briefcase,
  Download,
  Folder,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Mail,
  Send,
  Edit,
  Plus,
  Trash2,
} from 'angular-feather/icons';
import {
  MaskedTextBoxAllModule,
  NumericTextBoxAllModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageToastComponent } from './components/message-toast/message-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { DocumentUploaderComponent } from './components/document-uploader/document-uploader.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { ButtonModule, ChipListAllModule, RadioButtonAllModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { SideDialogComponent } from './components/side-dialog/side-dialog.component';
import { SearchComponent } from './components/search/search.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousComponent } from './components/dialog-next-previous/dialog-next-previous.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { AccordionModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { OrderTypeName } from '@shared/pipes/order-type-name.pipe';
import { GeneralOrderInfoComponent } from './components/general-order-info/general-order-info.component';
import {
  ColumnMenuService,
  EditService,
  FilterService,
  GridAllModule,
  GridModule,
  GroupService,
  PagerAllModule,
  PagerModule,
  PageService,
  ResizeService,
  SortService,
  ToolbarService,
} from '@syncfusion/ej2-angular-grids';
import { OrderCandidatesListComponent } from './components/order-candidates-list/order-candidates-list.component';
import { CustomProgressBarComponent } from './components/custom-progress-bar/custom-progress-bar.component';
import { ApplyCandidateComponent } from './components/order-candidates-list/apply-candidate/apply-candidate.component';
import { AcceptCandidateComponent } from './components/order-candidates-list/accept-candidate/accept-candidate.component';
import { DatePickerModule, DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { OnboardedCandidateComponent } from './components/order-candidates-list/onboarded-candidate/onboarded-candidate.component';
import { BillRatesViewGridComponent } from './components/bill-rates-view-grid/bill-rates-view-grid.component';
import { CommentsComponent } from './components/comments/comments.component';
import { HighlightGridRowDirective } from '@shared/directives/hightlight-grid-row.directive';
import { AddBackgroundForEmptyGridDirective } from '@shared/directives/add-background-for-empty-grid.directive';
import { FormatPhoneNumberPipe } from '@shared/pipes/format-phone-number.pipe';
import { RateHourPipe } from '@shared/pipes/rate-hour.pipe';
import { OfferDeploymentComponent } from './components/order-candidates-list/offer-deployment/offer-deployment.component';
import { BillRatePipe } from "@shared/pipes/bill-rate.pipe";
import { HistoricalEventsComponent } from './components/historical-events/historical-events.component';
import { GridSubrowCandidateComponent } from './components/grid-subrow-candidate/grid-subrow-candidate.component';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { BillRateFormComponent } from '@shared/components/bill-rates/components/bill-rate-form/bill-rate-form.component';
import { BillRatesGridComponent } from '@shared/components/bill-rates/components/bill-rates-grid/bill-rates-grid.component';
import { BillRateState } from '@shared/components/bill-rates/store/bill-rate.state';
import { ChildOrderDialogComponent } from '@shared/components/child-order-dialog/child-order-dialog.component';
import { RejectReasonDialogComponent } from './components/reject-reason-dialog/reject-reason-dialog.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ExportButtonComponent } from './components/export-button/export-button.component';
import { TabsListComponent } from './components/tabs-list/tabs-list.component';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { DeployCandidateMessageComponent } from './components/order-candidates-list/deploy-candidate-message/deploy-candidate-message.component';
import {ExBillRateNamesPipe} from "@shared/pipes/external-bill-rate-names.pipe";
import { SideMenuModule } from '@shared/components/side-menu/side-menu.module';
import {SecurityState} from "../security/store/security.state";
import { NavigationPanelComponent } from './components/navigation-panel/navigation-panel.component';

const icons = {
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  Folder,
  MapPin,
  Calendar,
  Download,
  Mail,
  Send,
  Edit,
  Plus,
  Trash2,
};

const COMPONENTS = [
  ValidationErrorPipe,
  ChipsCssClass,
  OrderTypeName,
  FormatPhoneNumberPipe,
  RateHourPipe,
  BillRatePipe,
  ExBillRateNamesPipe,
  ValidateDirective,
  HighlightGridRowDirective,
  AddBackgroundForEmptyGridDirective,
  ClickOutsideDirective,
  ImageUploaderComponent,
  DocumentUploaderComponent,
  SideDialogComponent,
  MessageToastComponent,
  FileUploadDialogComponent,
  ExportDialogComponent,
  SearchComponent,
  DialogNextPreviousComponent,
  OrderDetailsComponent,
  SearchComponent,
  GeneralOrderInfoComponent,
  OrderCandidatesListComponent,
  CustomProgressBarComponent,
  ApplyCandidateComponent,
  AcceptCandidateComponent,
  CustomProgressBarComponent,
  BillRatesViewGridComponent,
  CommentsComponent,
  AcceptCandidateComponent,
  OnboardedCandidateComponent,
  ApplyCandidateComponent,
  OfferDeploymentComponent,
  HistoricalEventsComponent,
  BillRatesComponent,
  RejectReasonDialogComponent,
  GridSubrowCandidateComponent,
  ChildOrderDialogComponent,
  ExportButtonComponent,
  DeployCandidateMessageComponent
];

@NgModule({
  imports: [
    FeatherModule.pick(icons),
    CommonModule,
    UploaderModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    RadioButtonAllModule,
    ChipListAllModule,
    FormsModule,
    DropDownButtonModule,
    GridAllModule,
    DropDownListModule,
    NumericTextBoxAllModule,
    PagerAllModule,
    AccordionModule,
    ReactiveFormsModule,
    DateRangePickerModule,
    DatePickerModule,
    CheckBoxModule,
    TooltipModule,
    GridModule,
    NumericTextBoxModule,
    PagerModule,
    TextBoxModule,
    MaskedTextBoxAllModule,
    TabAllModule,
    NgxsModule.forFeature([BillRateState, SecurityState]),
    PageToolbarModule,
    FilterDialogModule,
    SideMenuModule,
  ],
  exports: [...COMPONENTS, TabsListComponent, PageToolbarModule, FilterDialogModule, SideMenuModule, NavigationPanelComponent],
  declarations: [...COMPONENTS, ErrorMessageComponent, BillRateFormComponent, BillRatesGridComponent, TabsListComponent, NavigationPanelComponent],
  providers: [
    DatePipe,
    ColumnMenuService,
    EditService,
    FilterService,
    GroupService,
    PageService,
    ResizeService,
    SortService,
    ToolbarService,
  ],
})
export class SharedModule {}
