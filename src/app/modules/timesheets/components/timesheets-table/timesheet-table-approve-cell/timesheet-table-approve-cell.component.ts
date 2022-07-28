import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { MessageTypes } from '@shared/enums/message-types';

import { TimesheetDetails } from '../../../store/actions/timesheet-details.actions';
import { Timesheets } from '../../../store/actions/timesheets.actions';
import { ShowToast } from '../../../../../store/app.actions';
import { approveTimesheetDialogData } from '../../../constants';

@Component({
  selector: 'app-timesheet-table-status-cell',
  templateUrl: './timesheet-table-approve-cell.component.html',
  styleUrls: ['./timesheet-table-approve-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetTableApproveCellComponent implements ICellRendererAngularComp {
  private isAgency = false;
  private params: ICellRendererParams;

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.isAgency = this.router.url.includes('agency');
  }

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  public approveItem(): void {
    const { successMessage } = approveTimesheetDialogData;
    const timesheetId = this.params.data.id;

    this.store.dispatch(
      new TimesheetDetails.OrganizationApproveTimesheet(timesheetId, null)
   ).subscribe(() => {
      this.store.dispatch([
        new ShowToast(MessageTypes.Success, successMessage),
        new Timesheets.GetAll(),
      ]);
    });
  }
}
