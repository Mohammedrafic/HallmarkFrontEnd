import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import {
  filter,
  Observable,
  takeUntil,
  tap,
  concatMap,
} from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { CustomFormGroup } from '@core/interface';
import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

import { TimesheetsState } from '../../store/state/timesheets.state';
import { ProfileTimeSheetActionType } from '../../enums';
import { ProfileTimeSheetDetail } from '../../store/model/timesheets.model';
import { EditTimesheetService } from '../../services/edit-timesheet.service';
import { EditTimsheetForm } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetEditDialogConfig } from '../../constants';
import { DialogConfigField } from '../../interface';
import { FieldType } from '../../enums';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends Destroyable implements OnInit {
  @ViewChild('sideEditDialog') protected sideEditDialog: DialogComponent;

  @Select(TimesheetsState.timeSheetEditDialogOpen)
  readonly editDialogType$: Observable<{ dialogType: ProfileTimeSheetActionType, timesheet: ProfileTimeSheetDetail}>;

  @Output() updateTable: EventEmitter<void> = new EventEmitter<void>();

  public targetElement: HTMLBodyElement;

  public form: CustomFormGroup<EditTimsheetForm>;

  public startTimeField: AbstractControl;
  public endTimeField: AbstractControl;
  public maxTime: Date;
  public minTime: Date;

  public readonly today = Date.now();

  public readonly FieldTypes = FieldType;

  /**
   * TODO: remove mock data after back-end changes
   */
  public dialogConfig = TimesheetEditDialogConfig;

  constructor(
    private confirmService: ConfirmService,
    private store: Store,
    private editTimsheetService: EditTimesheetService,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) private readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
    this.createForm();
  }

  ngOnInit(): void {
    this.getDialogState();
    this.startTimeValidation();
  }

  public cancelChanges(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => confirm))
        .subscribe(() => {
          this.form.reset();
          this.store.dispatch(new Timesheets.CloseProfileTimesheetAddDialog());
          this.cd.detectChanges();
        });
    } else {
      this.form.reset();
      this.store.dispatch(new Timesheets.CloseProfileTimesheetAddDialog());
      this.cd.detectChanges();
    }
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public trackByField(index: number, item: DialogConfigField): string {
    return item.field;
  }

  public saveForm(): void {
    if (this.form.valid) {
      this.store.dispatch(new Timesheets.PostProfileTimesheet(this.form.getRawValue())).pipe(
        concatMap(() => this.store.dispatch(new Timesheets.CloseProfileTimesheetAddDialog())),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.updateTable.emit();
        this.form.reset();
        this.cd.detectChanges();
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  private getDialogState(): void {
    this.editDialogType$
    .pipe(
      filter(() => !!this.sideEditDialog),
      tap((event) => {
        if (!event) {
          this.sideEditDialog.hide();
        }
      }),
      filter((event) => !!event),
      takeUntil(this.componentDestroy())
      )
    .subscribe((event: { dialogType: ProfileTimeSheetActionType, timesheet: ProfileTimeSheetDetail}) => {
      this.populateForm();
      this.sideEditDialog.show();
      this.cd.markForCheck();
    })
  }

  private createForm(): void {
    this.form = this.editTimsheetService.createForm();
  }

  private populateForm(): void {
    // this.form.patchValue({
    //   day: timesheet.day,
    //   timeIn: timesheet.timeIn,
    //   timeOut: timesheet.timeOut,
    //   costCenter: timesheet.costCenter,
    //   category: timesheet.category,
    //   hours: timesheet.hours,
    //   rate: timesheet.rate,
    //   total: timesheet.total,
    // });
  }

  private startTimeValidation(): void {
    this.startTimeField = this.form.get('timeIn') as AbstractControl;
    this.endTimeField = this.form.get('timeOut') as AbstractControl;

    this.startTimeField.addValidators(startTimeValidator(this.form, 'timeOut'));
    this.endTimeField.addValidators(endTimeValidator(this.form, 'timeIn'));

    this.startTimeField.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value) => {
      this.minTime = value;
      this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      this.cd.detectChanges();
    });

    this.endTimeField.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value) => {
      this.maxTime = value;
      this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      this.cd.detectChanges();
    });
  }
}
