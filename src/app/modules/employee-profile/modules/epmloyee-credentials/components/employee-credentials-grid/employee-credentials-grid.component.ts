import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';

import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';

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

  readonly gridDefs: ColDef[] = EmployeeCredentialsGridConfig;
  readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;
  readonly pageSettings: PageSettings = CredentialsPageSettings;

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
