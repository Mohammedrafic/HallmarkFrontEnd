import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GridHelper } from '@shared/helpers/grid.helper';
import { JobClassification } from '@shared/enums/job-classification';

@Component({
  selector: 'app-grid-classification-renderer',
  templateUrl: './grid-classification-renderer.component.html',
  styleUrls: ['./grid-classification-renderer.component.scss'],
})
export class GridClassificationRendererComponent implements ICellRendererAngularComp {
  public cellValue: string;
  public valueHelper = new GridHelper();

  constructor() {}

  public agInit(params: ICellRendererParams): void {
    this.cellValue = this.formatClassifications(params.data.classifications);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.cellValue = this.formatClassifications(params.data.classifications);
    return true;
  }

  public formatClassifications(classifications: number[]): string {
    let value = '';
    classifications.forEach((classification, index) => {
      value += JobClassification[classification];
      if (classifications.length !== (index + 1)) {
        value += ', ';
      }
    });
    return `${value}`;
  } 
}
