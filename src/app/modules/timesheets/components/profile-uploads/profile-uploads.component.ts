import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProfileUploadedFile } from "../../interface";
import { Store } from "@ngxs/store";
import { TimesheetDetails } from "../../store/actions/timesheet-details.actions";

@Component({
  selector: 'app-profile-uploads',
  templateUrl: './profile-uploads.component.html',
  styleUrls: ['./profile-uploads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUploadsComponent {
  @Input()
  public uploads: ProfileUploadedFile[] = [];

  public constructor(
    private readonly store: Store,
  ) {
  }

  public removeInvoice(item: ProfileUploadedFile): void {
    this.store.dispatch(new TimesheetDetails.RemoveFile(item));
  }
}
