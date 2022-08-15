import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { FeatherModule } from 'angular-feather';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  Folder,
  Mail,
  MapPin,
  Percent,
  Plus,
  Send,
  Sliders,
  Trash2,
  User,
  Eye,
  EyeOff,
} from 'angular-feather/icons';
import {
  MaskedTextBoxAllModule,
  NumericTextBoxAllModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';

import { ValidateDirective } from './directives/validate.directive';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ValidationErrorPipe } from './pipes/validation-error.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageToastComponent } from './components/message-toast/message-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { DocumentUploaderComponent } from './components/document-uploader/document-uploader.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import {
  ButtonModule,
  CheckBoxModule,
  ChipListAllModule,
  RadioButtonAllModule,
  SwitchModule,
} from '@syncfusion/ej2-angular-buttons';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { SideDialogComponent } from './components/side-dialog/side-dialog.component';
import { SearchComponent } from './components/search/search.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ChipsCssClass } from '@shared/pipes/chips-css-class.pipe';
import { DialogNextPreviousComponent } from './components/dialog-next-previous/dialog-next-previous.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { AccordionModule, SidebarModule, TabAllModule } from '@syncfusion/ej2-angular-navigations';
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
import { OrderCandidatesListComponent } from './components/order-candidate-list/order-candidates-list/order-candidates-list.component';
import { OrderReOrdersListComponent } from './components/order-reorders-list/order-re-orders-list.component';
import { CustomProgressBarComponent } from './components/custom-progress-bar/custom-progress-bar.component';
import { ApplyCandidateComponent } from './components/order-candidate-list/order-candidates-list/apply-candidate/apply-candidate.component';
import { AcceptCandidateComponent } from './components/order-candidate-list/order-candidates-list/accept-candidate/accept-candidate.component';
import { DatePickerModule, DateRangePickerModule, TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { OnboardedCandidateComponent } from './components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidate.component';
import { BillRatesViewGridComponent } from './components/bill-rates-view-grid/bill-rates-view-grid.component';
import { CommentsComponent } from './components/comments/comments.component';
import { HighlightGridRowDirective } from '@shared/directives/hightlight-grid-row.directive';
import { AddBackgroundForEmptyGridDirective } from '@shared/directives/add-background-for-empty-grid.directive';
import { FormatPhoneNumberPipe } from '@shared/pipes/format-phone-number.pipe';
import { RateHourPipe } from '@shared/pipes/rate-hour.pipe';
import { OfferDeploymentComponent } from './components/order-candidate-list/order-candidates-list/offer-deployment/offer-deployment.component';
import { BillRatePipe } from '@shared/pipes/bill-rate.pipe';
import { HistoricalEventsComponent } from './components/historical-events/historical-events.component';
import { GridSubrowCandidateComponent } from './components/grid-subrow-candidate/grid-subrow-candidate.component';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { BillRateFormComponent } from '@shared/components/bill-rates/components/bill-rate-form/bill-rate-form.component';
import { BillRatesGridComponent } from '@shared/components/bill-rates/components/bill-rates-grid/bill-rates-grid.component';
import { BillRateState } from '@shared/components/bill-rates/store/bill-rate.state';
import { RejectReasonDialogComponent } from './components/reject-reason-dialog/reject-reason-dialog.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ExportButtonComponent } from './components/export-button/export-button.component';
import { TabsListComponent } from './components/tabs-list/tabs-list.component';
import { PageToolbarModule } from '@shared/components/page-toolbar/page-toolbar.module';
import { FilterDialogModule } from '@shared/components/filter-dialog/filter-dialog.module';
import { DeployCandidateMessageComponent } from './components/order-candidate-list/order-candidates-list/deploy-candidate-message/deploy-candidate-message.component';
import { ExBillRateNamesPipe } from '@shared/pipes/external-bill-rate-names.pipe';
import { SideMenuModule } from '@shared/components/side-menu/side-menu.module';
import { SecurityState } from '../security/store/security.state';
import { NavigationPanelComponent } from './components/navigation-panel/navigation-panel.component';
import { CandidateAvatarPipe } from './pipes/candidate-avatar.pipe';
import { GridSubrowReorderComponent } from './components/grid-subrow-reorder/grid-subrow-reorder.component';
import { GeneralOrderPerDiemInfoComponent } from '@shared/components/general-order-per-diem-info/general-order-per-diem-info.component';
import { GeneralReorderInfoComponent } from './components/general-reorder-info/general-reorder-info.component';
import { OrderReOrdersContainerComponent } from '@client/order-management/order-reorders-container/order-reorders-container.component';
import { OrderPerDiemCandidatesListComponent } from './components/order-candidate-list/order-per-diem-candidates-list/order-per-diem-candidates-list.component';
import { CandidatesStatusModalComponent } from './components/order-candidate-list/order-per-diem-candidates-list/candidates-status-modal/candidates-status-modal.component';
import { ReorderCandidatesListComponent } from './components/order-candidate-list/reorder-candidates-list/reorder-candidates-list.component';
import { ReorderStatusDialogComponent } from './components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/reorder-status-dialog.component';
import { AcceptFormComponent } from './components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/accept-form/accept-form.component';
import { NgxMaskModule } from 'ngx-mask';
import { CloseOrderSideDialogComponent } from '@shared/components/close-order-side-dialog/close-order-side-dialog.component';
import { OrderCloseReasonInfoComponent } from '@shared/components/order-close-reason-info/order-close-reason-info.component';
import { CommentComponent } from './components/comments/comment/comment.component';
import { CommentsState } from './components/comments/store/comments.state';
import { CandidateStatusName } from './pipes/candidate-status-name.pipe';

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
  Sliders,
  Eye,
  EyeOff,
  DollarSign,
  Percent,
};

const COMPONENTS = [
  ValidationErrorPipe,
  ChipsCssClass,
  OrderTypeName,
  CandidateStatusName,
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
  CloseOrderSideDialogComponent,
  MessageToastComponent,
  FileUploadDialogComponent,
  ExportDialogComponent,
  SearchComponent,
  DialogNextPreviousComponent,
  OrderDetailsComponent,
  SearchComponent,
  GeneralOrderInfoComponent,
  GeneralOrderPerDiemInfoComponent,
  OrderCandidatesListComponent,
  OrderPerDiemCandidatesListComponent,
  CustomProgressBarComponent,
  ApplyCandidateComponent,
  AcceptCandidateComponent,
  CustomProgressBarComponent,
  BillRatesViewGridComponent,
  CommentsComponent,
  CommentComponent,
  AcceptCandidateComponent,
  OnboardedCandidateComponent,
  ApplyCandidateComponent,
  OfferDeploymentComponent,
  HistoricalEventsComponent,
  BillRatesComponent,
  RejectReasonDialogComponent,
  GridSubrowCandidateComponent,
  ExportButtonComponent,
  DeployCandidateMessageComponent,
  GeneralReorderInfoComponent,
  GridSubrowReorderComponent,
  OrderReOrdersListComponent,
  ReorderCandidatesListComponent,
  OrderReOrdersContainerComponent,
  OrderCloseReasonInfoComponent,
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
    TimePickerAllModule,
    GridModule,
    NumericTextBoxModule,
    PagerModule,
    TextBoxModule,
    MaskedTextBoxAllModule,
    TabAllModule,
    NgxsModule.forFeature([BillRateState, SecurityState, CommentsState]),
    PageToolbarModule,
    FilterDialogModule,
    SideMenuModule,
    SwitchModule,
    MultiSelectModule,
    NgxMaskModule.forChild(),
    SidebarModule,
  ],
  exports: [
    ...COMPONENTS,
    TabsListComponent,
    PageToolbarModule,
    FilterDialogModule,
    SideMenuModule,
    NavigationPanelComponent,
    ErrorMessageComponent,
    CandidateAvatarPipe,
    AcceptFormComponent,
  ],
  declarations: [
    ...COMPONENTS,
    ErrorMessageComponent,
    BillRateFormComponent,
    BillRatesGridComponent,
    TabsListComponent,
    NavigationPanelComponent,
    CandidateAvatarPipe,
    CandidatesStatusModalComponent,
    ReorderStatusDialogComponent,
    AcceptFormComponent,
  ],
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
