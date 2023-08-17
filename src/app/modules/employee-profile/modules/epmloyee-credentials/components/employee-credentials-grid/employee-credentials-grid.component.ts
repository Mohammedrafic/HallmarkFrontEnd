import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';

import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import { CredentialFile } from '@shared/models/candidate-credential.model';

import { CredentialsPageSettings, EmployeeCredentialsGridConfig } from '../../constants';
import { EmployeeCredentialsPage, PageSettings } from '../../interfaces';

@Component({
  selector: 'app-employee-credentials-grid',
  templateUrl: './employee-credentials-grid.component.html',
  styleUrls: ['./employee-credentials-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeCredentialsGridComponent {

  @Input() credentialsPage: EmployeeCredentialsPage;

  @Output() updateParams: EventEmitter<PageSettings> = new EventEmitter<PageSettings>();
  @Output() viewFiles: EventEmitter<number> = new EventEmitter<number>();
  @Output() downloadFile: EventEmitter<CredentialFile> = new EventEmitter<CredentialFile>();

  readonly gridDefs: ColDef[] = EmployeeCredentialsGridConfig;
  readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;
  readonly pageSettings: PageSettings = CredentialsPageSettings;
  readonly context: { componentParent: EmployeeCredentialsGridComponent };

  constructor() {
    this.context = { componentParent: this };
  }

  changePage(pageNumber: number): void {
    if (pageNumber === this.pageSettings.pageNumber) {
      return;
    }

    this.pageSettings.pageNumber = pageNumber;
    this.updateParams.emit(this.pageSettings);
  }

  changePageSize(pageSize: number): void {
    if (pageSize === this.pageSettings.pageSize) {
      return;
    }

    this.pageSettings.pageSize = pageSize;
    this.updateParams.emit(this.pageSettings);
  }
}
