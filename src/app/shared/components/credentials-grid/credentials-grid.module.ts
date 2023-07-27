import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsGridComponent } from './credentials-grid.component';
import { OrderMatchColumnComponent } from './order-match-column/order-match-column.component';
import { FeatherModule } from 'angular-feather';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { SharedModule } from '@shared/shared.module';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NumericTextBoxModule, UploaderModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipContainerModule } from '@shared/components/tooltip-container/tooltip.module';
import { AgencyFileViewerModule } from '@agency/candidates/add-edit-candidate/file-viewer/agency-file-viewer.module';
import { ValidateDirectiveModule } from '@shared/directives/validate-directive/validate-directive.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CredentialGridService } from '@agency/services/credential-grid.service';
import { CredentialStorageService } from '@agency/services/credential-storage.service';
import { CredentialStorageFacadeService } from '@agency/services/credential-storage-facade.service';
import { DepartmentMatchCellComponent } from './department-match-cell/department-match-cell.component';
import { GridPaginationModule } from '../grid/grid-pagination/grid-pagination.module';
import { ScrollToTopModule } from '../scroll-to-top/scroll-to-top.module';


@NgModule({
  declarations: [
    CredentialsGridComponent,
    OrderMatchColumnComponent,
    DepartmentMatchCellComponent,
  ],
  exports: [CredentialsGridComponent],
  imports: [
    CommonModule,
    FeatherModule,
    GridModule,
    PagerModule,
    SharedModule,
    DropDownListModule,
    DatePickerModule,
    UploaderModule,
    NumericTextBoxModule,
    ChipListModule,
    TooltipContainerModule,
    ButtonModule,
    AgencyFileViewerModule,
    ValidateDirectiveModule,
    ReactiveFormsModule,
    GridPaginationModule,
    ScrollToTopModule,
  ],
  providers: [CredentialGridService, CredentialStorageService, CredentialStorageFacadeService,
  ],
})
export class CredentialsGridModule {
}
