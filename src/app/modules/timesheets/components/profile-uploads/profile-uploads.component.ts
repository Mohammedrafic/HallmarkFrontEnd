import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TimesheetUploadedFile } from "../../interface";
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
  public uploads: TimesheetUploadedFile[] = [];

  public constructor(
    private readonly store: Store,
  ) {
  }

  public removeInvoice(item: TimesheetUploadedFile): void {}
}
