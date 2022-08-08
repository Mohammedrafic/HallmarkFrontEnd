import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, Observable, skip, switchMap, take, tap } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { DateWeekService } from '@core/services';
import { approveTimesheetDialogData, submitTimesheetDialogData } from '../constants';
import { TimesheetDetails } from '../store/actions/timesheet-details.actions';
import { ShowToast } from '../../../store/app.actions';
import { Timesheets } from '../store/actions/timesheets.actions';
import { Attachment, AttachmentsListConfig } from '@shared/components/attachments';
import { TimesheetDetailsApiService } from './timesheet-details-api.service';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';


@Injectable()
export class TimesheetDetailsService {
  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private timesheetDetailsApiService: TimesheetDetailsApiService,
    private weekService: DateWeekService,
  ) {
  }

  public approveTimesheet(timesheetId: number): Observable<void> {
    const { title, submitButtonText, confirmMessage, successMessage } = approveTimesheetDialogData;

    return this.confirmService.confirm(confirmMessage, {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        filter((submitted: boolean) => submitted),
        switchMap(() => this.store.dispatch(
          new TimesheetDetails.OrganizationApproveTimesheet(timesheetId, null))
        ),
        tap(() => {
          this.store.dispatch([
            new ShowToast(MessageTypes.Success, successMessage),
            new Timesheets.GetAll(),
          ]);
        })
      );
  }

  public submitTimesheet(timesheetId: number, orgId: number): Observable<void> {
    const { title, submitButtonText, confirmMessage, successMessage } = submitTimesheetDialogData;

    return this.confirmService.confirm(confirmMessage, {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        filter((submitted: boolean) => submitted),
        switchMap(() => this.store.dispatch(
          new TimesheetDetails.AgencySubmitTimesheet(timesheetId, orgId))
        ),
        tap(() => {
          this.store.dispatch([
            new ShowToast(MessageTypes.Success, successMessage),
            new Timesheets.GetAll(),
          ]);
        })
      );
  }

  public getAttachmentsListConfig(
    timesheetId: number,
    organizationId: number | null,
    isAgency: boolean
  ): AttachmentsListConfig {
    return {
      delete: (item: Attachment) =>
        this.confirmService.confirm(`Are you sure you want to delete an attachment "${item.fileName}"?`, {
          title: 'Delete Attachment',
          okButtonLabel: 'Proceed',
          okButtonClass: 'delete-button',
        })
          .pipe(
            take(1),
            filter(Boolean),
            switchMap(() => this.store.dispatch(new TimesheetDetails.DeleteAttachment({
              fileId: item.id,
              organizationId: organizationId,
              timesheetId: timesheetId,
            }))),
          )
          .subscribe(() => this.store.dispatch(
            new Timesheets.GetTimesheetDetails(timesheetId, organizationId as number, isAgency))
          ),
      download: (item: Attachment) => this.store.dispatch(
        new TimesheetDetails.DownloadAttachment({
          fileId: item.id,
          fileName: item.fileName,
          organizationId: organizationId,
        })
      ),
      preview: ({fileName, id: fileId}: Attachment) => this.store.dispatch(
        new FileViewer.Open({
          fileName,
          getPDF: () => this.timesheetDetailsApiService.downloadPDFAttachment({
            fileId,
            organizationId: organizationId,
          }),
          getOriginal: () => this.timesheetDetailsApiService.downloadAttachment({
            fileId,
            organizationId: organizationId
          })
        })
      )
    }
  }

  public watchRangeStream(): Observable<[string, string]> {
    return this.weekService.getRangeStream()
    .pipe(
      skip(1),
      distinctUntilChanged((prev, next) => {
        return (prev[0] === next[0]) || (prev[1] === next[1]);
      }),
    )
  }

  public confirmTimesheetLeave(message: string): Observable<boolean> {
    return this.confirmService.confirm(message, {
      title: 'Unsaved Progress',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
    .pipe(
      take(1),
      filter((submitted) => submitted)
    )
  }
}
