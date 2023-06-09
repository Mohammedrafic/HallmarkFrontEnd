import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-onboard-candidate-message-dialog',
  templateUrl: './onboard-candidate-message-dialog.component.html',
  styleUrls: ['./onboard-candidate-message-dialog.component.scss'],
})
export class OnboardCandidateMessageDialogComponent implements OnInit, OnDestroy {

  @ViewChild('onBoradCandidateMessageDialog') onBoradCandidateMessageDialog: DialogComponent;

  @Input() openEvent: Subject<boolean>;

  @Output() sendMessage = new EventEmitter<any>();
  @Output() cancelMessage = new EventEmitter();

  private unsubscribe$: Subject<void> = new Subject();
  sendMessageFlag :boolean = false;
  public form: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      message: new FormControl('', [Validators.required]),
    });
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((status: boolean) => {
      if (status) {
        this.onBoradCandidateMessageDialog.show();
        this.sendMessageFlag = false;
         this.form.reset();
      }
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCancel(): void {
    this.cancelMessage.emit();
    this.onBoradCandidateMessageDialog.hide();
  }

  public onSendMessage(): void {
   this.form.markAllAsTouched();
    if (this.form.valid) {
      this.sendMessage.emit(this.form.value);
      this.form.reset();
      this.onBoradCandidateMessageDialog.hide();
    }
    
  }

}
