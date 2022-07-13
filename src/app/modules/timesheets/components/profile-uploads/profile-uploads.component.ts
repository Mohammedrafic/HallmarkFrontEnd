import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TimesheetUploadedFile } from "../../interface";
import { Store } from '@ngxs/store';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { downloadBlobFile } from '@shared/utils/file.utils';

@Component({
  selector: 'app-profile-uploads',
  templateUrl: './profile-uploads.component.html',
  styleUrls: ['./profile-uploads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUploadsComponent {
  @Input()
  public uploads: TimesheetUploadedFile[] = [];

  constructor(
    private store: Store,
  ) {
  }

  public removeFile(item: TimesheetUploadedFile): void {
    this.store.dispatch(new TimesheetDetails.DeleteFile(item.id));
  }

  public downloadFile(item: TimesheetUploadedFile): void {
    item.blob && downloadBlobFile(item.blob, item.name);
  }
}
