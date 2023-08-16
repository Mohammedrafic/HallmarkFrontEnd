import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { CredentialFile } from '@shared/models/candidate-credential.model';

import { EmployeeCredentialsGridComponent } from '../employee-credentials-grid/employee-credentials-grid.component';

@Component({
  selector: 'app-credential-file-cell',
  templateUrl: './credential-file-cell.component.html',
  styleUrls: ['./credential-file-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialFileCellComponent implements ICellRendererAngularComp  {

  file: CredentialFile;

  private componentParent: EmployeeCredentialsGridComponent;

  agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  downloadFile(event: MouseEvent, file: CredentialFile): void {
    event.stopPropagation();
    this.componentParent.downloadFile.emit(file);
  }

  viewFiles(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.componentParent.viewFiles.emit(id);
  }

  private setData(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.file = params.data.files[0];
  }
}
