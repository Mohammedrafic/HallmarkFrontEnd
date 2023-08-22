import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CredentialFileViewerModule } from '@shared/components/credential-file-viewer/credential-file-viewer.module';

import {
  EmployeeCredentialsContainerComponent,
} from './containers/employee-credentials-container/employee-credentials-container.component';
import { EmployeeCredentialsApiService } from './services/employee-credentials-api.service';
import { EmployeeCredentialsService } from './services/employee-credentials.service';
import { EmployeeCredentialsGridModule } from './components/employee-credentials-grid/employee-credentials-grid.module';
import { CredentialStatusCellModule } from './components/credential-status-cell/credential-status-cell.module';
import { DepartmentMatchCellModule } from './components/department-match-cell/department-match-cell.module';
import { CredentialFileCellModule } from './components/credential-file-cell/credential-file-cell.module';
import { EmployeeCredentialsRoutingModule } from './employee-credentials-routing.module';

@NgModule({
  declarations: [EmployeeCredentialsContainerComponent],
  imports: [
    CommonModule,
    EmployeeCredentialsRoutingModule,
    EmployeeCredentialsGridModule,
    DepartmentMatchCellModule,
    CredentialStatusCellModule,
    CredentialFileCellModule,
    CredentialFileViewerModule,
  ],
  providers: [
    EmployeeCredentialsService,
    EmployeeCredentialsApiService,
  ],
})
export class EmployeeCredentialsModule { }
