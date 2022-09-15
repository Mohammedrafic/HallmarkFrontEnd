import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GridCellRenderer, TitleValueCellRendererParams } from '../../models';

@Component({
  selector: 'app-title-value-cell-renderer',
  templateUrl: './title-value-cell-renderer.component.html',
  styleUrls: ['./title-value-cell-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleValueCellRendererComponent extends GridCellRenderer<TitleValueCellRendererParams> {
  public title: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super();
  }

  public override agInit(params: TitleValueCellRendererParams): void {
    super.agInit(params);
    const titleValueParams = params.titleValueParams;

    this.title = titleValueParams?.title || params.colDef?.headerName || '-';
    this.value = [titleValueParams?.value, this.value, '-'].find((value: unknown) => value != null) as string;
  }

  public handleNavigation(event: Event): void {
    event.stopImmediatePropagation();
    const id = this.params.data.timesheetId;

    if (id) {
      this.router.navigate(['../timesheets'], { relativeTo: this.route, state: { timesheetId: id }});
    }
  }
}
