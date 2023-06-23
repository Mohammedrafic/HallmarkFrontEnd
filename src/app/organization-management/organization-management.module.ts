import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GridModule, PagerModule, PageService, ResizeService } from '@syncfusion/ej2-angular-grids';
import {
  ButtonModule,
  CheckBoxModule,
  ChipListModule,
  RadioButtonModule,
  SwitchModule,
} from '@syncfusion/ej2-angular-buttons';
import {
  AutoCompleteModule,
  DropDownListModule,
  ListBoxModule,
  MultiSelectAllModule,
} from '@syncfusion/ej2-angular-dropdowns';
import {
  MaskedTextBoxModule,
  NumericTextBoxModule,
  TextBoxModule,
  UploaderModule,
} from '@syncfusion/ej2-angular-inputs';
import { SidebarModule, TabAllModule, TabModule, TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DatePickerModule, DateTimePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DialogModule, TooltipAllModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import {
  AlertCircle,
  AlertTriangle,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Edit3,
  FileText,
  MapPin,
  Menu,
  Plus,
  Search,
  Sliders,
  Trash2,
  Upload,
} from 'angular-feather/icons';
import { NgxsModule } from '@ngxs/store';

import { OrganizationManagementState } from './store/organization-management.state';
import { CredentialsState } from './store/credentials.state';
import { SharedModule } from '@shared/shared.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { ShiftsState } from './store/shifts.state';
import { OrganizationManagementComponent } from './organization-management.component';
import { OrganizationManagementRoutingModule } from './organization-management-routing.module';
import { CredentialsSetupComponent } from './credentials/credentials-setup/credentials-setup.component';
import { GroupSetupComponent } from './credentials/credentials-setup/group-setup/group-setup.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { GroupComponent } from './credentials/credentials-setup/group/group.component';
import { HolidaysState } from './store/holidays.state';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { WorkflowState } from './store/workflow.state';
import { BillRatesState } from '@organization-management/store/bill-rates.state';
import { FilteredCredentialsComponent,
} from './credentials/credentials-setup/filtered-credentials/filtered-credentials.component';
import { MapCredentialsFormComponent,
} from './credentials/credentials-setup/map-credentials-form/map-credentials-form.component';
import { SpecialProjectState } from './store/special-project.state';
import { PurchaseOrderState } from './store/purchase-order.state';
import { SpecialProjectCategoryState } from './store/special-project-category.state';
import { SpecialProjectMappingState } from './store/special-project-mapping.state';
import { PurchaseOrderMappingState } from './store/purchase-order-mapping.state';
import { BusinessLinesState } from './store/business-lines.state';
import { GridModule as AppGridModule } from '@shared/components/grid/grid.module';
import { ImportDialogContentModule } from '@shared/components/import-dialog-content/import-dialog-content.module';
import { PenaltiesGridActionsRendererComponent,
} from './reasons/components/penalties/penalties-grid-actions-renderer/penalties-grid-actions-renderer.component';
import { TiersComponent } from './tiers/tiers.component';
import { TiersGridComponent } from './tiers/tiers-grid/tiers-grid.component';
import { GridActionRendererComponent } from './tiers/tiers-grid/grid-action-renderer/grid-action-renderer.component';
import { TiersDialogModule } from '@shared/components/tiers-dialog/tiers-dialog.module';
import { TIER_DIALOG_TYPE } from '@shared/components/tiers-dialog/constants';
import { Tiers } from '@shared/enums/tiers.enum';
import { TiersState } from '@organization-management/store/tiers.state';
import { SettingsViewService, TiersApiService } from '@shared/services';
import { ButtonGroupModule } from '@shared/components/button-group/button-group.module';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { SkillsState } from '@organization-management/store/skills.state';
import { SideMenuService } from '@shared/components/side-menu/services';
import { CredentialListModule } from '@shared/components/credentials-list/credential-list.module';
import { CredentialsSetupService } from '@organization-management/credentials/services/credentials-setup.service';
import { GroupSetupService } from '@organization-management/credentials/services/group-setup.service';
import { IrpSystemGridTextPipeModule } from '@shared/pipes/irp-system-grid-text/irp-system-grid-text.module';
import { MapCredentialsService } from '@organization-management/credentials/services/map-credentials.service';
import { TiersService } from '@organization-management/tiers/services/tiers.service';
import { BoolValuePipeModule } from '@shared/pipes/bool-values/bool-values-pipe.module';
import { WorkCommitmentModule } from './work-commitment/work-commitment.module';
import { WorkCommitmentApiService } from '@shared/services/work-commitment-api.service';
import { WorkCommitmentState } from './store/work-commitment.state';
import { ReasonsModule } from './reasons/reasons.module';
import { JoinPipeModule } from '@shared/pipes/join.pipe';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { OrientationModule } from './orientation/orientation.module';
import { PayRateComponent } from './pay-rate/pay-rate.component';
import { PayrateSetupComponent } from './pay-rate/payrate-setup/payrate-setup.component';
import { PayRatesState } from './store/pay-rates.state';
import {
  ReplacementOrderConfirmationModule,
} from '@shared/components/replacement-order-confirmation/replacement-order-confirmation.module';

const sidebarIcons = {
  Download,
  Upload,
  Sliders,
  Edit,
  Trash2,
  AlignJustify,
  Menu,
  FileText,
  MapPin,
  Plus,
  AlertCircle,
  Edit3,
  ChevronDown,
  ChevronRight,
  Copy,
  Search,
  AlertTriangle,
};
@NgModule({
  declarations: [
    OrganizationManagementComponent,
    CredentialsSetupComponent,
    CredentialsComponent,
    GroupSetupComponent,
    GroupComponent,
    FilteredCredentialsComponent,
    MapCredentialsFormComponent,
    PenaltiesGridActionsRendererComponent,
    TiersComponent,
    TiersGridComponent,
    GridActionRendererComponent,
    PayRateComponent,
    PayrateSetupComponent,
  ],
  imports: [
    CommonModule,
    OrganizationManagementRoutingModule,
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
    MultiSelectAllModule,
    AutoCompleteModule,
    DropDownButtonModule,
    MaskedTextBoxModule,
    AgGridModule,
    AppGridModule,
    TooltipAllModule,
    TooltipContainerModule,
    TiersDialogModule,
    CredentialListModule,
    ButtonGroupModule,
    WorkCommitmentModule,
    ValidateDirectiveModule,
    ReplacementOrderConfirmationModule,

    FeatherModule.pick(sidebarIcons),

    //STORE
    NgxsModule.forFeature([
      OrganizationManagementState,
      WorkflowState,
      CredentialsState,
      ShiftsState,
      HolidaysState,
      BillRatesState,
      SpecialProjectState,
      PurchaseOrderState,
      SpecialProjectCategoryState,
      SpecialProjectMappingState,
      PurchaseOrderMappingState,
      BusinessLinesState,
      TiersState,
      SkillsState,
      WorkCommitmentState,
      PayRatesState,
    ]),
    ImportDialogContentModule,
    TreeViewModule,
    IrpSystemGridTextPipeModule,
    BoolValuePipeModule,
    ReasonsModule,
    OrientationModule,
    JoinPipeModule,
  ],
  providers: [
    ResizeService,
    PageService,
    TiersApiService,
    TiersService,
    WorkCommitmentApiService,
    SideMenuService,
    SettingsViewService,
    {
      provide: TIER_DIALOG_TYPE,
      useValue: Tiers.tierSettings,
    },
    CredentialsSetupService,
    GroupSetupService,
    MapCredentialsService,
  ],
})
export class OrganizationManagementModule {}
