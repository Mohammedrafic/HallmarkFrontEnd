import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { Store } from '@ngxs/store';
import {
  filter,
  takeUntil,
  concatMap,
} from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Destroyable } from '@core/helpers';
import { GlobalWindow } from '@core/tokens';
import { CustomFormGroup } from '@core/interface';
import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

import { EditTimesheetService } from '../../services/edit-timesheet.service';
import { EditTimsheetForm } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { TimesheetEditDialogConfig, WeekDaysOptions } from '../../constants';
import { DialogConfigField } from '../../interface';
import { FieldType } from '../../enums';

@Component({
  selector: 'app-add-timesheet',
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTimesheetComponent extends Destroyable implements OnInit, OnChanges {
  @ViewChild('sideEditDialog') protected sideEditDialog: DialogComponent;

  @Input() profileId: number;

  @Output() updateTable: EventEmitter<void> = new EventEmitter<void>();

  public targetElement: HTMLBodyElement;

  public form: CustomFormGroup<EditTimsheetForm>;

  public startTimeField: AbstractControl;
  public endTimeField: AbstractControl;
  public maxTime: Date;
  public minTime: Date = new Date(0);

  public readonly FieldTypes = FieldType;

  /**
   * TODO: remove mock data after back-end changes
   */
  public dialogConfig = TimesheetEditDialogConfig;

  private profile: any;
  private timsheets: any;

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
    this.startTimeValidation();
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  ngOnChanges(): void {
    if (this.profileId) {
      this.profile = JSON.parse(localStorage.getItem('profile') as string);
      this.timsheets = JSON.parse(localStorage.getItem('timesheet-details-tables') as string);
    }
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
      const values = this.form.value;
      const item = {
        category: values.category,
        costCenter: values.costCenter,
        day: this.setDayDate(values.day),
        hours: Number(values.hours),
        id: 700 + Math.random() * 8,
        rate: values.rate,
        timeIn: this.setTimeDate(values.timeIn, values.day),
        timeOut: this.setTimeDate(values.timeOut, values.day),
        total: values.rate * values.hours,
      };
      this.timsheets[this.profileId].push(item);
      localStorage.setItem('timesheet-details-tables', JSON.stringify(this.timsheets));

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
    
  }

  private createForm(): void {
    this.form = this.editTimsheetService.createForm();
  }

  private startTimeValidation(): void {
    this.startTimeField = this.form.get('timeIn') as AbstractControl;
    this.endTimeField = this.form.get('timeOut') as AbstractControl;

    this.startTimeField.addValidators(startTimeValidator(this.form, 'timeOut'));
    this.endTimeField.addValidators(endTimeValidator(this.form, 'timeIn'));

    this.startTimeField.valueChanges.pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy())
    ).subscribe((value) => {
      this.minTime = value;
      this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      if (this.form.get('timeOut')?.valid) {
        const timeIn = this.form.get('timeIn')?.value;
        const timeOut = this.form.get('timeOut')?.value;
        const calcHours = Math.abs(timeOut.getTime() - timeIn.getTime()) / 36e5;

        this.form.patchValue({ hours: calcHours })
      }
      this.cd.markForCheck();
    });

    this.endTimeField.valueChanges.pipe(
      filter((value) => !!value),
      takeUntil(this.componentDestroy())
    ).subscribe((value: Date) => {
      this.maxTime = value;
      this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      if (this.form.get('timeIn')?.valid) {
        const timeIn = this.form.get('timeIn')?.value;
        const timeOut = this.form.get('timeOut')?.value;
        const calcHours = Math.abs(timeOut.getTime() - timeIn.getTime()) / 36e5;

        this.form.patchValue({ hours: calcHours })
      }
      this.cd.markForCheck();
    });
  }

  private resetForm(): void {
    this.form.reset();
  }

  private setDayDate(value: string): Date {
    const dayValue: number = WeekDaysOptions.find((option) => option.text === value)?.value as number;
    const profileDate = new Date(this.profile.startDate);
    const diff = dayValue - profileDate.getDay();

    return new Date(profileDate.setDate(profileDate.getDate() + diff));
  }

  private setTimeDate(time: Date, day: string): Date {
    const weekDayDate = this.setDayDate(day);
    weekDayDate.setHours(time.getHours());
    weekDayDate.setMinutes(time.getMinutes());

    return weekDayDate;
  }
}
