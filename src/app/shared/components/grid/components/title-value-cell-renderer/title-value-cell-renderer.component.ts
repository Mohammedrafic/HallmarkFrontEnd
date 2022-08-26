import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridCellRenderer, TitleValueCellRendererParams } from '../../models';

@Component({
  selector: 'app-title-value-cell-renderer',
  templateUrl: './title-value-cell-renderer.component.html',
  styleUrls: ['./title-value-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleValueCellRendererComponent extends GridCellRenderer<TitleValueCellRendererParams> {
  public title: string = '';

  public override agInit(params: TitleValueCellRendererParams): void {
    super.agInit(params);
    const titleValueParams = params.titleValueParams;

    this.title = titleValueParams?.title || params.colDef?.headerName || '-';
    this.value = [titleValueParams?.value, this.value, '-'].find((value: unknown) => value != null) as string;
  }
}
