import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

import { DestroyDialog } from '@core/helpers';
import { WARNING_TITLE } from '@shared/constants';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-candidate-confirm-dialog',
  templateUrl: './candidate-confirm-dialog.component.html',
  styleUrls: ['./candidate-confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateConfirmDialogComponent extends DestroyDialog implements OnInit {
  @Input() text: string;
  @Input() $confirmDialog: Subject<boolean>;

  public WARNING_TITLE = WARNING_TITLE;

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  public onYes(): void {
    this.$confirmDialog.next(true);
    this.closeDialog();
  }

  public onCancel(): void {
    this.$confirmDialog.next(false);
    this.closeDialog();
  }

  public closeOnEscape(): void {
    this.onCancel();
  }
}
