import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { TitleValueCellRendererParams } from '../../models';

@Component({
  selector: 'app-title-value-cell-renderer',
  templateUrl: './title-value-cell-renderer.component.html',
  styleUrls: ['./title-value-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleValueCellRendererComponent implements ICellRendererAngularComp {
  public title: string = '';
  public value: string = '';

  public agInit(params: TitleValueCellRendererParams): void {
    const titleValueParams = params.titleValueParams;

    this.title = (titleValueParams ? titleValueParams.title : params.colDef?.headerName) || '';
    this.value = titleValueParams ? titleValueParams.value : params.getValue?.();
  }

  public refresh(params: TitleValueCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }
}
