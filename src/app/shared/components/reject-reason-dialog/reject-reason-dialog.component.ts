import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { Subject, takeUntil } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RejectReason } from "@shared/models/reject-reason.model";

@Component({
  selector: 'app-reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
  styleUrls: ['./reject-reason-dialog.component.scss']
})
export class RejectReasonDialogComponent implements OnInit, OnDestroy {
  @ViewChild('rejectDialog') rejectDialog: DialogComponent;

  @Input() openEvent: Subject<boolean>;
  @Input() rejectReasonsList: RejectReason[];

  @Output() applyReject = new EventEmitter<{rejectReason: number}>();

  public form: FormGroup;
  public optionFields = {
    text: 'reason',
    value: 'id',
  };

  private unsubscribe$: Subject<void> = new Subject();

  public ngOnInit(): void {
    this.createForm();
    this.onOpenEvent();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCancel(): void {
    this.rejectDialog.hide();
  }

  public onReject(): void {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.applyReject.emit(this.form.value);
      this.rejectDialog.hide();
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((status: boolean) => {
      if (status) {
        this.rejectDialog.show();
        this.form.reset()
      }
    });
  }

  private createForm(): void {
    this.form = new FormGroup({
      rejectReason: new FormControl('', [Validators.required])
    });
  }
}
