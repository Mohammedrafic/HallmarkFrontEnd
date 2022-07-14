import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Store } from '@ngxs/store';

import { downloadBlobFile } from '@shared/utils/file.utils';
import { TimesheetAttachment } from '../../interface';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

@Component({
  selector: 'app-profile-uploads',
  templateUrl: './profile-uploads.component.html',
  styleUrls: ['./profile-uploads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUploadsComponent {
  @Input()
  public attachments: TimesheetAttachment[] | null = [];

  constructor(
    private store: Store,
  ) {
  }

  public trackById(_: number, item: TimesheetAttachment): number {
    return item.id;
  }

  public removeFile(item: TimesheetAttachment): void {
    this.store.dispatch(new TimesheetDetails.DeleteFile(item.id));
  }

  public downloadFile(item: TimesheetAttachment): void {
    item.blob && downloadBlobFile(item.blob, item.fileName);
  }
}
