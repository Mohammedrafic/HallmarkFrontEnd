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
  Upload,
  Edit,
  Eye,
  EyeOff,
  Folder,
  Mail,
  MapPin,
  Percent,
  Plus,
  Send,
  Sliders,
  Trash2,
  User,
  Flag,
  ArrowUp,
  Info,
  RotateCw,
} from 'angular-feather/icons';
import {
  MaskedTextBoxAllModule,
  NumericTextBoxAllModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';

import { CommonModule, DatePipe } from '@angular/common';
import { MessageToastComponent } from './components/message-toast/message-toast.component';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { ImageUploaderComponent } from './components/image-uploader/image-uploader.component';
import { DocumentUploaderComponent } from './components/document-uploader/document-uploader.component';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { ButtonModule, CheckBoxModule,
  ChipListAllModule, RadioButtonAllModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule, TooltipModule } from '@syncfusion/ej2-angular-popups';
import { SideDialogComponent } from './components/side-dialog/side-dialog.component';
import { SearchComponent } from './components/search/search.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownButtonAllModule, DropDownButtonModule, SplitButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DialogNextPreviousComponent } from './components/dialog-next-previous/dialog-next-previous.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { AccordionModule, SidebarModule, TabAllModule, TreeViewAllModule } from '@syncfusion/ej2-angular-navigations';
import { OrderTypeName } from '@shared/pipes/order-type-name.pipe';
import { PayOrderTypeName } from '@shared/pipes/payrate-order-type.pipe';
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
import { OrderCandidatesListComponent,
} from './components/order-candidate-list/order-candidates-list/order-candidates-list.component';
import { CustomProgressBarComponent } from './components/custom-progress-bar/custom-progress-bar.component';
import { ApplyCandidateComponent,
} from './components/order-candidate-list/order-candidates-list/apply-candidate/apply-candidate.component';
import { AcceptCandidateComponent,
} from './components/order-candidate-list/order-candidates-list/accept-candidate/accept-candidate.component';
import { DatePickerModule, DateRangePickerModule, TimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { OnboardedCandidateComponent,
} from './components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidate.component';
import { BillRatesViewGridComponent } from './components/bill-rates-view-grid/bill-rates-view-grid.component';
import { CommentsComponent } from './components/comments/comments.component';
import { HighlightGridRowDirective } from '@shared/directives/hightlight-grid-row.directive';
import { FormatPhoneNumberPipe } from '@shared/pipes/format-phone-number.pipe';
import { RateHourPipe } from '@shared/pipes/rate-hour.pipe';
import { OfferDeploymentComponent,
} from './components/order-candidate-list/order-candidates-list/offer-deployment/offer-deployment.component';
import { BillRatePipe } from '@shared/pipes/bill-rate.pipe';
import { BulkBillRatePipe } from '@shared/pipes/bulk-bill-rate.pipe';
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
import { DeployCandidateMessageComponent,
} from './components/order-candidate-list/order-candidates-list/deploy-candidate-message/deploy-candidate-message.component';
import { ExBillRateNamesPipe } from '@shared/pipes/external-bill-rate-names.pipe';
import { SideMenuModule } from '@shared/components/side-menu/side-menu.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SecurityState } from '../security/store/security.state';
import { NavigationPanelComponent } from './components/navigation-panel/navigation-panel.component';
import { CandidateAvatarPipe } from './pipes/candidate-avatar.pipe';
import { GridSubrowReorderComponent } from './components/grid-subrow-reorder/grid-subrow-reorder.component';
import { GeneralReorderInfoComponent } from './components/general-reorder-info/general-reorder-info.component';
import { OrderPerDiemCandidatesListComponent,
} from './components/order-candidate-list/order-per-diem-candidates-list/order-per-diem-candidates-list.component';
import { CandidatesStatusModalComponent,
} from './components/order-candidate-list/order-per-diem-candidates-list/candidates-status-modal/candidates-status-modal.component';
import { ReorderCandidatesListComponent,
} from './components/order-candidate-list/reorder-candidates-list/reorder-candidates-list.component';
import { ReorderStatusDialogComponent,
} from './components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/reorder-status-dialog.component';
import { AcceptFormComponent,
} from './components/order-candidate-list/reorder-candidates-list/reorder-status-dialog/accept-form/accept-form.component';
import { NgxMaskModule } from 'ngx-mask';
import { CloseOrderSideDialogComponent } from '@shared/components/close-order-side-dialog/close-order-side-dialog.component';
import { CommentComponent } from './components/comments/comment/comment.component';
import { CommentsState } from './components/comments/store/comments.state';
import { OpenFirstAccordionDirective } from './directives/always-open-first-accordition.directive';
import { CandidateStatusName } from './pipes/candidate-status-name.pipe';
import { RouterModule } from '@angular/router';
import { ExtensionCandidateComponent,
} from '@shared/components/order-candidate-list/order-candidates-list/extension-candidate/extension-candidate.component';
import { CustomIconComponent } from './components/custom-icon/custom-icon.component';
import { EmailSideDialogComponent } from '@shared/components/email-side-dialog/email-side-dialog.component';
import { SmsSideDialogComponent } from '@shared/components/sms-side-dialog/sms-side-dialog.component';
import { OnScreenSideDialogComponent } from '@shared/components/on-screen-side-dialog/on-screen-side-dialog.component';
import { CustomNoRowsOverlayComponent,
} from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { AlertsState } from '@admin/store/alerts.state';
import { ImportDialogContentComponent } from './components/import-dialog-content/import-dialog-content.component';
import { GridErroredCellComponent } from './components/import-dialog-content/grid-errored-cell/grid-errored-cell.component';
import { HideBeforeSyncfusionLoadDirective } from './directives/hide-before-syncfusion-load.directive';
import { UnsavedFormDirective } from './directives/unsaved-form.directive';
import { ClearCacheComponent } from './components/clear-cache/clear-cache.component';
import { CandidateCancellationDialogComponent,
} from './components/candidate-cancellation-dialog/candidate-cancellation-dialog.component';
import { OrderHistoricalEventsComponent } from './components/order-historical-events/order-historical-events.component';
import { AssignCredentialSideComponent,
} from './components/credentials-list/assign-credential-side/assign-credential-side.component';
import { SendEmailSideDialogComponent } from './components/send-email-side-dialog/send-email-side-dialog.component';
import { DocumentPreviewSideDialogComponent,
} from './components/document-preview-side-dialog/document-preview-side-dialog.component';
import { CustomSideDialogComponent } from './components/custom-side-dialog/custom-side-dialog.component';
import { OrderManagementState } from '@agency/store/order-management.state';
import { HideByCandidateStatusPipe } from './pipes/hide-by-candidate-status.pipe';
import { ValidateDirectiveModule } from './directives/validate-directive/validate-directive.module';
import { BoolValuePipeModule } from './pipes/bool-values/bool-values-pipe.module';
import { ActionCellRendererComponent } from './components/cell-renderers/actions-cell/action-cellrenderer.component';
import { TabsMobileShadowDirective } from './directives/tabs-mobile-shadow.directive';
import { LocalDateTimePipe } from './pipes/local-date-time.pipe';
import { NumericTextboxModule as CustomNumericTextboxModule} from './components/form-controls/numeric-textbox/numeric-textbox.module';
import { ValidationErrorModule } from './pipes/validation-error/validation.error.module';
import { GridPaginationModule } from './components/grid/grid-pagination/grid-pagination.module';
import { EditIrpCandidateModule } from '@shared/components/order-candidate-list/edit-irp-candidate/edit-irp-candidate.module';
import { CustomExportDialogComponent } from './components/custom-export-dialog/custom-export-dialog.component';
import { CommentsIrpComponent } from './components/comments-irp/comments-irp.component';
import { CommentdataComponent } from './components/comments-irp/commentdata/commentdata.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrderCloseReasonInfoModule } from './components/order-close-reason-info/order-close-reason-info.module';
import { GeneralOrderPerDiemInfoModule } from './components/general-order-per-diem-info/general-order-per-diem-info.module';
import { ChipsCssClassPipeModule } from './pipes/chip-css-class/chip-css-class-pipe.module';

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
  Upload,
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
  Flag,
  ArrowUp,
  Info,
  RotateCw,
};

const COMPONENTS = [
  OrderTypeName,
  PayOrderTypeName,
  CandidateStatusName,
  FormatPhoneNumberPipe,
  RateHourPipe,
  BillRatePipe,
  BulkBillRatePipe,
  ExBillRateNamesPipe,
  HideBeforeSyncfusionLoadDirective,
  OpenFirstAccordionDirective,
  HighlightGridRowDirective,
  ClickOutsideDirective,
  ImageUploaderComponent,
  DocumentUploaderComponent,
  SideDialogComponent,
  CloseOrderSideDialogComponent,
  MessageToastComponent,
  FileUploadDialogComponent,
  ExportDialogComponent,
  DialogNextPreviousComponent,
  OrderDetailsComponent,
  SearchComponent,
  GeneralOrderInfoComponent,
  OrderCandidatesListComponent,
  OrderPerDiemCandidatesListComponent,
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
  ReorderCandidatesListComponent,
  ExtensionCandidateComponent,
  CustomIconComponent,
  ActionCellRendererComponent,
  EmailSideDialogComponent,
  SmsSideDialogComponent,
  OnScreenSideDialogComponent,
  UnsavedFormDirective,
  ClearCacheComponent,
  CandidateCancellationDialogComponent,
  AssignCredentialSideComponent,
  SendEmailSideDialogComponent,
  DocumentPreviewSideDialogComponent,
  CustomSideDialogComponent,
  CustomExportDialogComponent,
  CommentsIrpComponent,
  CommentdataComponent,
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
    DropDownButtonAllModule,
    TooltipContainerModule,
    NgxsModule.forFeature([BillRateState, SecurityState, CommentsState, AlertsState, OrderManagementState]),
    PageToolbarModule,
    FilterDialogModule,
    SideMenuModule,
    SwitchModule,
    MultiSelectModule,
    NgxMaskModule.forChild(),
    SidebarModule,
    RouterModule,
    TreeViewAllModule,
    SplitButtonModule,
    ValidateDirectiveModule,
    BoolValuePipeModule,
    CustomNumericTextboxModule,
    ValidationErrorModule,
    GridPaginationModule,
    EditIrpCandidateModule,
    FontAwesomeModule,
    ChipsCssClassPipeModule,
    OrderCloseReasonInfoModule,
    GeneralOrderPerDiemInfoModule,
  ],
  exports: [
    ...COMPONENTS,
    TabsListComponent,
    PageToolbarModule,
    FilterDialogModule,
    SideMenuModule,
    NavigationPanelComponent,
    CandidateAvatarPipe,
    AcceptFormComponent,

    ImportDialogContentComponent,
    MultiSelectModule,
    TooltipModule,
    TabsMobileShadowDirective,
    CustomNumericTextboxModule,
    ValidationErrorModule,
    ChipsCssClassPipeModule,
    OrderCloseReasonInfoModule,
    GeneralOrderPerDiemInfoModule,
  ],
  declarations: [
    ...COMPONENTS,
    BillRateFormComponent,
    BillRatesGridComponent,
    TabsListComponent,
    NavigationPanelComponent,
    CandidateAvatarPipe,
    CandidatesStatusModalComponent,
    ReorderStatusDialogComponent,
    AcceptFormComponent,
    CustomNoRowsOverlayComponent,
    GridErroredCellComponent,
    ImportDialogContentComponent,
    OrderHistoricalEventsComponent,
    SendEmailSideDialogComponent,
    DocumentPreviewSideDialogComponent,
    CustomSideDialogComponent,
    HideByCandidateStatusPipe,
    TabsMobileShadowDirective,
    LocalDateTimePipe,
    CommentsIrpComponent,
    CommentsComponent,
    CommentdataComponent,
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
