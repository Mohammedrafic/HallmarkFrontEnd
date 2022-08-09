import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { GridValuesHelper } from '../../../helpers';

@Component({
  selector: 'app-grid-day',
  templateUrl: './grid-day.component.html',
  styleUrls: ['./grid-day.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridDayComponent implements ICellRendererAngularComp {

  public dayName: string;

  public dayDate: string;

  public agInit(params: ICellRendererParams): void {
    this.setDayValues(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setDayValues(params);
    return true;
  }

  private setDayValues(params: ICellRendererParams): void {
    this.dayName = GridValuesHelper.formatDate(params.value, 'E');
    this.dayDate = GridValuesHelper.formatDate(params.value, 'MMM d');
  }
}
