import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TimesheetUploadedFile } from "../../interface";

@Component({
  selector: 'app-profile-uploads',
  templateUrl: './profile-uploads.component.html',
  styleUrls: ['./profile-uploads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileUploadsComponent {
  @Input()
  public uploads: TimesheetUploadedFile[] = [];

  public removeInvoice(item: TimesheetUploadedFile): void {}
}
