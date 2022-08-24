import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssociateListComponent } from './associate-list.component';
import { AssociateGridComponent } from './associate-grid/associate-grid.component';
import { FeatherModule } from 'angular-feather';
import { GridModule } from '@shared/components/grid/grid.module';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
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

@NgModule({
  declarations: [
    AssociateListComponent,
    AssociateGridComponent,
    EditAssociateDialogComponent,
    FeeSettingsComponent,
    AddNewFeeDialogComponent,
    PartnershipSettingsComponent,
    InviteDialogComponent,
  ],
  imports: [
    CommonModule,
    FeatherModule,
    GridModule,
    GridAllModule,
    ButtonModule,
    DropDownListModule,
    NumericTextBoxModule,
    PagerModule,
    DialogAllModule,
    TabAllModule,
    MultiSelectAllModule,
    CheckBoxModule,
    ReactiveFormsModule,

    NgxsModule.forFeature([AssociateListState]),
  ],
  providers: [AssociateService],
  exports: [AssociateListComponent],
})
export class AssociateListModule {}
