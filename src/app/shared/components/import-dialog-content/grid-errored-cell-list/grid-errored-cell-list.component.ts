import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ErroedListData, ErroredData } from '@shared/models/candidate-profile-import.model';

@Component({
  selector: 'app-grid-errored-cell-list',
  templateUrl: './grid-errored-cell-list.component.html',
  styleUrls: ['./grid-errored-cell-list.component.scss'],
})
export class GridErroredCellListComponent implements ICellRendererAngularComp {
  public cellValue: ErroedListData;
  public value: string;
  public colId: string;

  // get isErrored(): boolean {
  //   return this.cellValue.errorProperties.some((item: string) => item.toLowerCase() === this.colId.toLowerCase());
  // }

  public agInit(params: ICellRendererParams): void {
    this.cellValue = params.data;
    this.colId = params.column?.getColId() as string;
    this.value = params.valueFormatted;
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.data;
    this.value = params.valueFormatted;
    return true;
  }
}
