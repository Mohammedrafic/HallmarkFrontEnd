import { Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ErroredData } from '@shared/models/candidate-profile-import.model';

@Component({
  selector: 'app-grid-errored-cell',
  templateUrl: './grid-errored-cell.component.html',
  styleUrls: ['./grid-errored-cell.component.scss'],
})
export class GridErroredCellComponent implements ICellRendererAngularComp {
  public cellValue: ErroredData;
  public colId: string;

  get isErrored(): boolean {
    return this.cellValue.errorProperties.some((item: string) => item.toLowerCase() === this.colId.toLowerCase());
  }

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params.data;
    this.colId = params.column?.getColId() as string;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.data;
    return true;
  }
}
