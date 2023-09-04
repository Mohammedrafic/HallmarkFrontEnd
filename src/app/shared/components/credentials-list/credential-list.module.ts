import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxsModule } from '@ngxs/store';
import { GridModule, PagerAllModule } from '@syncfusion/ej2-angular-grids';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { NumericTextBoxAllModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

import { CredentialsListComponent } from '@shared/components/credentials-list/credentials-list.component';
import { SharedModule } from '@shared/shared.module';
import { FiltersComponent } from './filters/filters.component';
import { CredentialFiltersService, CredentialListApiService, CredentialListService } from '@shared/components/credentials-list/services';
import { Icons } from '@shared/components/credentials-list/constants';
import { AddEditCredentialComponent } from './add-edit-credential/add-edit-credential.component';
import { CredentialListState } from '@shared/components/credentials-list/store/credential-list.state';
import { OverrideCommentsDialogComponent } from './override-comments-dialog/override-comments-dialog.component';
import { DialogModule } from '@syncfusion/ej2-angular-popups';

@NgModule({
  declarations: [CredentialsListComponent, FiltersComponent, AddEditCredentialComponent, OverrideCommentsDialogComponent],
  imports: [
    FeatherModule.pick(Icons),
    CommonModule,
    GridModule,
    CheckBoxModule,
    TextBoxModule,
    DropDownButtonAllModule,
    DropDownListModule,
    NumericTextBoxAllModule,
    PagerAllModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,

    //STORE
    NgxsModule.forFeature([CredentialListState]),
  ],
  exports: [CredentialsListComponent],
  providers: [CredentialListService, CredentialFiltersService, CredentialListApiService]
})
export class CredentialListModule { }
