
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

import { Select, Store } from '@ngxs/store';
import {
  filter,
  takeUntil,
  Observable,
} from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { tap } from 'rxjs/operators';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { CustomFormGroup } from '@core/interface';
import { ConfirmService } from '@shared/services/confirm.service';
import { TimesheetsState } from './../../store/state/timesheets.state';
import { AddRecordService } from '../../services/add-record.service';
import { EditTimsheetForm } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetEditDialogConfig } from '../../constants';
import { DialogAction, FieldType, RecordFields } from '../../enums';
import { ConfirmAddFormCancel } from '../../constants/confirm-delete-timesheet-dialog-content.const';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends Destroyable implements OnInit {
  @ViewChild('sideAddDialog') protected sideAddDialog: DialogComponent;

  @Input() profileId: number;

  @Output() updateTable: EventEmitter<void> = new EventEmitter<void>();

  public targetElement: HTMLBodyElement;

  public form: CustomFormGroup<EditTimsheetForm>;

  public readonly FieldTypes = FieldType;

  public dialogConfig = TimesheetEditDialogConfig;

  public formType: RecordFields;

  public timeSettings = {
    min: 0,
    max: 0,
  }

  public initTime: string;


  @Select(TimesheetsState.addDialogOpen)
  public readonly dialogState$: Observable<{ state: boolean, type: RecordFields, initDate: string }>

  constructor(
    private confirmService: ConfirmService,
    private store: Store,
    private addRecordService: AddRecordService,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  public cancelChanges(): void {
    if (this.form.touched) {
      this.confirmService.confirm(ConfirmAddFormCancel, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((value) => !!value),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.closeDialog();
      })
    } else {
      this.closeDialog();
    }
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public saveForm(): void {
    if (this.form.valid) {
      this.sideAddDialog.hide();
    } else {
      this.form.updateValueAndValidity();
      this.cd.detectChanges();
    }
  }

  public updateValidity(): void {
    this.form.updateValueAndValidity();
  }

  private getDialogState(): void {
    this.dialogState$
    .pipe(
      filter((value) => !!value.state),
      tap((value) => {
        this.form = this.addRecordService.createForm(value.type);
        this.formType = value.type;
        this.initTime = value.initDate;
        this.populateOptions();
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      console.log(this.initTime)
      this.sideAddDialog.show();
      this.cd.markForCheck();
    })
  }

  private closeDialog(): void {
    this.form.reset();
    this.sideAddDialog.hide();
    this.store.dispatch(new Timesheets.ToggleTimesheetAddDialog(DialogAction.Close, this.formType, ''));
  }

  private populateOptions(): void {
    this.dialogConfig[this.formType].forEach((item) => {
      if (item.optionsStateKey) {
        item.options = this.store.snapshot().timesheets[item.optionsStateKey]
      }
    })
  }
}
