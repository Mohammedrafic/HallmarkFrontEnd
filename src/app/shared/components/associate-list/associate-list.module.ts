import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssociateListComponent } from './associate-list.component';
import { AssociateGridComponent } from './associate-grid/associate-grid.component';
import { FeatherModule } from 'angular-feather';
import { GridModule } from '@shared/components/grid/grid.module';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, CheckBoxModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { NgxsModule } from '@ngxs/store';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { AssociateService } from '@shared/components/associate-list/services/associate.service';
import { EditAssociateDialogComponent } from './associate-grid/edit-associate-dialog/edit-associate-dialog.component';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { TabAllModule } from '@syncfusion/ej2-angular-navigations';
import { FeeSettingsComponent } from './associate-grid/edit-associate-dialog/fee-settings/fee-settings.component';
import { AddNewFeeDialogComponent } from './associate-grid/edit-associate-dialog/fee-settings/add-new-fee-dialog/add-new-fee-dialog.component';
import { PartnershipSettingsComponent } from './associate-grid/edit-associate-dialog/partnership-settings/partnership-settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InviteDialogComponent } from './associate-grid/invite-dialog/invite-dialog.component';
import { TierSettingsComponent } from './associate-grid/edit-associate-dialog/tier-settings/tier-settings.component';
import { TierSettingsGridComponent } from './associate-grid/edit-associate-dialog/tier-settings/tier-settings-grid/tier-settings-grid.component';
import { TiersDialogModule } from '@shared/components/tiers-dialog/tiers-dialog.module';
import { SettingsViewService, TiersApiService } from '@shared/services';
import { TIER_DIALOG_TYPE } from '@shared/components/tiers-dialog/constants';
import { TooltipContainerModule } from "@shared/components/tooltip-container/tooltip.module";
import { Tiers } from '@shared/enums/tiers.enum';
import { ActionRendererComponent } from './associate-grid/edit-associate-dialog/tier-settings/tier-settings-grid/action-renderer/action-renderer.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ChipsCssClassPipeModule } from '@shared/pipes/chip-css-class/chip-css-class-pipe.module';
import { GridPaginationModule } from '../grid/grid-pagination/grid-pagination.module';

@NgModule({
  declarations: [
    AssociateListComponent,
    AssociateGridComponent,
    EditAssociateDialogComponent,
    FeeSettingsComponent,
    AddNewFeeDialogComponent,
    PartnershipSettingsComponent,
    InviteDialogComponent,
    TierSettingsComponent,
    TierSettingsGridComponent,
    ActionRendererComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule,
    GridModule,
    GridAllModule,
    DatePickerModule,
    ButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    PagerModule,
    DialogAllModule,
    TabAllModule,
    MultiSelectAllModule,
    CheckBoxModule,
    ReactiveFormsModule,
    TiersDialogModule,
    TooltipContainerModule,
    ChipListModule,
    ChipsCssClassPipeModule,
    NgxsModule.forFeature([AssociateListState]),
    GridPaginationModule,
  ],
  providers: [
    AssociateService,
    TiersApiService,
    SettingsViewService,
    {
      provide: TIER_DIALOG_TYPE,
      useValue: Tiers.tierException
    }
  ],
  exports: [AssociateListComponent],
})
export class AssociateListModule {}
