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

  public showCell: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super();
  }

  public override agInit(params: TitleValueCellRendererParams): void {
    super.agInit(params);
    const titleValueParams = params.titleValueParams;

    this.title = titleValueParams?.title || params.colDef?.headerName || '';

    if (this.title === 'Bill Rate' && params.data.timesheetTypeText === 'Expenses') {
      this.title = 'Reason'
    }
    this.value = [titleValueParams?.value, this.value].find((value: unknown) => value != null && value !== '') as string;
    this.showCell = this.value != null && this.value !== '';
  }

  public handleNavigation(event: Event): void {
    event.stopImmediatePropagation();
    const id = this.params.data.timesheetId;
    const organizationId = this.params.titleValueParams?.organizationId;

    if (id) {
      this.router.navigate(['../timesheets'], {
        relativeTo: this.route,
        state: { timesheetId: id, organizationId },
      });
    }
  }
}
