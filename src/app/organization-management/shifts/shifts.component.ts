import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetDirtyState } from '../store/organization-management.actions';
import { DeleteShift, DeleteShiftSucceeded, ExportShifts, GetShiftsByPage, SaveShift, SaveShiftSucceeded } from '../store/shifts.actions';
import { ShiftsState } from '../store/shifts.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { Shift } from 'src/app/shared/models/shift.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { DatePipe } from '@angular/common';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  providers: [SortService, FreezeService, MaskedDateTimeService]
})
export class ShiftsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(ShiftsState.shiftsPage)
  shiftsPage$: Observable<any>;

  public ShiftFormGroup: FormGroup;
  public optionFields = {
    text: 'name', value: 'id'
  };
  public title = '';
  public startTimeField: AbstractControl;
  public endTimeField: AbstractControl;
  public showForm = true;
  public defaultMaxTime = new Date();
  public defaultMinTime = new Date();
  public maxTime = this.defaultMaxTime;
  public minTime = this.defaultMinTime;
  public maskPlaceholderValue: Object = { hour: 'HH', minute: 'MM' };
  public columnsToExport: ExportColumn[] = [
    { text:'Shift Name', column: 'Name'},
    { text:'Shift Short Name', column: 'ShortName'},
    { text:'Start Time', column: 'StartTime'},
    { text:'End Time', column: 'EndTime'}
  ];
  public fileName: string;
  public defaultFileName: string;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super();
    this.defaultMaxTime.setHours(23, 59, 59);
    this.defaultMinTime.setHours(0, 0, 0);
    this.ShiftFormGroup = this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      name: new FormControl(null, [ Validators.required ]),
      shortName: new FormControl(null, [ Validators.required ]),
      startTime: new FormControl(null, [ Validators.required ]),
      endTime: new FormControl(null, [ Validators.required ]),
    });

    this.startTimeField = this.ShiftFormGroup.get('startTime') as AbstractControl;
    this.endTimeField = this.ShiftFormGroup.get('endTime') as AbstractControl;
    this.endTimeField.valueChanges.subscribe(val => { 
      this.maxTime = val || this.defaultMaxTime; this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }); 
    });
    this.startTimeField.valueChanges.subscribe(val => {
      this.minTime = val || this.defaultMinTime; this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.startTimeField.addValidators(startTimeValidator(this.ShiftFormGroup, 'endTime'));
    this.endTimeField.addValidators(endTimeValidator(this.ShiftFormGroup, 'startTime'));
  }

  ngOnInit() {
    this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveShiftSucceeded)).subscribe(() => {
      this.ShiftFormGroup.reset();
      this.closeDialog();
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DeleteShiftSucceeded)).subscribe(() => {
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization Shifts ' + this.generateDateTime(this.datePipe);
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
    this.defaultFileName = 'Organization Shifts ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportShifts(new ExportPayload(
      fileType, 
      { /** TODO: put filters here */ }, 
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val.id) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public addShift(): void {
    this.showForm = true;
    this.title = 'Add';
    this.ShiftFormGroup.controls['id'].setValue(0);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public editShift(data: any, event: any): void {
    this.showForm = true;
    this.addActiveCssClass(event);
    this.title = 'Edit';
    let [startH, startM, startS] = getHoursMinutesSeconds(data.startTime);
    let [endH, endM, endS] = getHoursMinutesSeconds(data.endTime);
    let startDate = new Date();
    let endDate = new Date();
    startDate.setHours(startH, startM, startS);
    endDate.setHours(endH, endM, endS);
    this.ShiftFormGroup.setValue({
      id: data.id,
      name: data.name,
      shortName: data.shortName,
      startTime: startDate,
      endTime: endDate,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteShift(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new DeleteShift(data));
        }
        this.removeActiveCssClass();
      });
  }

  public closeDialog(): void {
    if (this.ShiftFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.showForm = false;
        this.store.dispatch(new ShowSideDialog(false));
        this.ShiftFormGroup.reset();
        this.removeActiveCssClass();
      });
    } else {
      this.showForm = false;
      this.store.dispatch(new ShowSideDialog(false));
      this.ShiftFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  public saveShift(): void {
    if (this.ShiftFormGroup.valid) {
      this.store.dispatch(new SaveShift(new Shift(
        this.ShiftFormGroup.getRawValue()
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.ShiftFormGroup.markAllAsTouched();
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
