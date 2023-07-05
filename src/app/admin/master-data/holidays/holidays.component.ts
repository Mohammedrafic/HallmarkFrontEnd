import { DeleteHoliday, DeleteHolidaySucceeded, ExportHolidays, FilterChanged, GetHolidaysByPage, SaveHoliday, SaveHolidaySucceeded, SetYearFilter } from '@admin/store/holidays.actions';
import { HolidaysState } from '@admin/store/holidays.state';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { Holiday } from '@shared/models/holiday.model';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetDirtyState } from 'src/app/admin/store/admin.actions';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  ERROR_START_LESS_END_DATE
} from 'src/app/shared/constants/messages';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { DateTimeHelper } from '@core/helpers';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss'],
  providers: [SortService]
})
export class MasterHolidaysComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @ViewChild('grid') grid: GridComponent;

  @Select(HolidaysState.holidaysPage)
  holidaysPage$: Observable<any>;

  public HolidayFormGroup: FormGroup;
  public title = '';
  public startTimeField: AbstractControl;
  public endTimeField: AbstractControl;
  public today = new Date();
  public maxDate = new Date(2099, 11, 31);
  public yearsList: number[] = [];
  public format = {
    type:'date', format: 'MM/dd/yyyy HH:mm'
  };
  public showForm = true;
  public columnsToExport: ExportColumn[] = [
    { text:'Holiday Name', column: 'HolidayName'},
    { text:'Start Date & Time', column: 'StartDateTime'},
    { text:'End Date & Time', column: 'EndDateTime'}
  ];
  public fileName: string;
  public defaultFileName: string;
  public yearFilter: number;
  public datesValidationMessage = ERROR_START_LESS_END_DATE;

  constructor(protected override store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super(store);
    this.today.setHours(0, 0, 0);
    this.HolidayFormGroup = this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      holidayName: new FormControl(null, [ Validators.required ]),
      startDateTime: new FormControl(null, [ Validators.required ]),
      endDateTime: new FormControl(null, [ Validators.required ]),
    });

    const prevYear = this.today.getFullYear() - 1;
    for(let i = 0; i < 7; i++) {
      this.yearsList.push(prevYear + i);
    }

    this.startTimeField = this.HolidayFormGroup.get('startDateTime') as AbstractControl;
    this.startTimeField.addValidators(startDateValidator(this.HolidayFormGroup, 'endDateTime'));
    this.startTimeField.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
    this.endTimeField = this.HolidayFormGroup.get('endDateTime') as AbstractControl;
    this.endTimeField.addValidators(endDateValidator(this.HolidayFormGroup, 'startDateTime'));
    this.endTimeField.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveHolidaySucceeded)).subscribe(() => {
      this.HolidayFormGroup.reset();
    this.closeDialog();
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DeleteHolidaySucceeded)).subscribe(() => {
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(FilterChanged)).subscribe(() => {
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override customExport(): void {
    this.defaultFileName = 'Master Holidays ' + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = 'Master Holidays ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportHolidays(new ExportPayload(
      fileType,
      {
        year: this.yearFilter,
        offset: Math.abs(new Date().getTimezoneOffset()),
        ids: this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public copyHoliday(data: any, event: any): void {
    this.showForm = true;
    this.title = 'Copy';
    this.addActiveCssClass(event);
    this.HolidayFormGroup.setValue({
      id: 0,
      holidayName: data.holidayName,
      startDateTime: DateTimeHelper.setCurrentUtcDate(data.startDateTime),
      endDateTime: DateTimeHelper.setCurrentUtcDate(data.endDateTime),
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public yearChanged(event: { value: number }): void {
    this.yearFilter = event.value;
    this.store.dispatch(new SetYearFilter(event.value));
  }

  public addHoliday(): void {
    this.showForm = true;
    this.title = 'Add';
    this.HolidayFormGroup.controls['id'].setValue(0);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public editHoliday(data: any, event: any): void {
    this.showForm = true;
    this.addActiveCssClass(event);
    this.title = 'Edit';
    this.HolidayFormGroup.setValue({
      id: data.id,
      holidayName: data.holidayName,
      startDateTime: DateTimeHelper.setCurrentUtcDate(data.startDateTime),
      endDateTime: DateTimeHelper.setCurrentUtcDate(data.endDateTime),
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteHoliday(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new DeleteHoliday(data));
        }
        this.removeActiveCssClass();
      });
  }

  public closeDialog(): void {
    if (this.HolidayFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(
        filter(confirm => !!confirm),
        takeUntil(this.unsubscribe$),
      ).subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.showForm = false;
        this.HolidayFormGroup.reset();
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.showForm = false;
      this.HolidayFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  public saveHoliday(): void {
    if (this.HolidayFormGroup.valid) {
      this.store.dispatch(new SaveHoliday(new Holiday(
        this.HolidayFormGroup.getRawValue()
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.HolidayFormGroup.markAllAsTouched();
    }
    this.removeActiveCssClass();
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }
}
