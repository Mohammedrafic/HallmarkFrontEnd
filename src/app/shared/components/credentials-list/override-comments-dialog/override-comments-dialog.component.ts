import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  AfterViewInit,
  ViewChild,
} from '@angular/core';

import { timer } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { ConfirmOverrideComments } from '@organization-management/credentials/interfaces';
import { OverrideCommentsTitle } from '@organization-management/credentials/components/credentials-setup/constants';


@Component({
  selector: 'app-override-comments-dialog',
  templateUrl: './override-comments-dialog.component.html',
  styleUrls: ['./override-comments-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverrideCommentsDialogComponent implements AfterViewInit {
  @ViewChild('destroyableDialog') destroyableDialog: DialogComponent;

  @Output() confirm = new EventEmitter<ConfirmOverrideComments>();
  @Output() destroyDialog = new EventEmitter<void>();

  public warningTitle = OverrideCommentsTitle;
  public animationSettings = { effect: 'Zoom', duration: 400, delay: 0 };
  public credentialMappring = false;
  public openInProgressOrders = false;

  private isConfirmed = false;

  public ngAfterViewInit(): void {
    this.destroyableDialog.show();
  }

  public close(): void {
    if (!this.isConfirmed) {
      this.closeDialog();
    }
  }

  public cancel(): void {
    this.isConfirmed = true;
    this.closeDialog();
  }

  public confirmOverriding(): void {
    this.isConfirmed = true;
    this.confirm.emit(this.getDialogState());
    this.closeDialog();
  }

  private getDialogState(): ConfirmOverrideComments {
    return ({
      updateMappingCredentials: this.credentialMappring,
      updateOrderCredentials: this.openInProgressOrders,
    });
  }

  private closeDialog(): void {
    this.destroyableDialog.hide();
    this.destroyCommentsDialog();
  }

  private destroyCommentsDialog(): void {
    timer(400).subscribe(() => {
      this.destroyDialog.emit();
    });
  }
}
