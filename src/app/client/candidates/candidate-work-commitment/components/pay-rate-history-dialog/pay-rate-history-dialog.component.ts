import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Subject, takeUntil, filter, take } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { DateRanges } from '@client/candidates/departments/departments.model';

@Component({
  selector: 'app-pay-rate-history-dialog',
  templateUrl: './pay-rate-history-dialog.component.html',
  styleUrls: ['./pay-rate-history-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayRateHistoryDialogComponent extends Destroyable implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() public dateRanges: DateRanges = {};
  @Input() public dialogSubject$: Subject<{ isOpen: boolean }>;

  @Output() public submitFormData: EventEmitter<void> = new EventEmitter();

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  public actionTitle = 'Add';
  public formatPayRate = '#.###';

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly confirmService: ConfirmService,
  ) { super(); }

  ngOnInit(): void {
    this.openCloseDialog();
  }

  public closeDialog(): void {
    this.confirmCloseDialog();
  }

  public submitForm(): void {
    this.submitFormData.emit();
  }

  private openCloseDialog(): void {
    this.dialogSubject$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((data) => {
        if (data.isOpen) {
          this.sideDialog.show();
        } else {
          this.closeSideDialog();
        }
      });
  }

  private closeSideDialog(): void {
    this.sideDialog.hide();
    this.formGroup.reset();
  }

  private confirmCloseDialog(): void {
    if (this.formGroup.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }
}
