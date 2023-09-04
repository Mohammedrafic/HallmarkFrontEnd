import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  AfterViewInit,
  ViewChild,
} from '@angular/core';

import { of, delay, take } from 'rxjs';
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

  public ngAfterViewInit(): void {
    this.destroyableDialog.show();
  }

  public submit(): void {
    this.confirm.emit(this.getDialogState(true));
  }

  public cancel(): void {
    this.confirm.emit(this.getDialogState(false));
    this.closeDialog();
  }

  private getDialogState(isVisible: boolean): ConfirmOverrideComments {
    return ({
      isVisible,
      credentialMappring: this.credentialMappring,
      openInProgressOrders: this.openInProgressOrders,
    });
  }

  private destroyCommentsDialog(): void {
    of(true).pipe(
      take(1),
      delay(400)
    ).subscribe(() => {
      this.destroyDialog.emit();
    });
  }

  private closeDialog(): void {
    this.destroyableDialog.hide();
    this.destroyCommentsDialog();
  }
}
