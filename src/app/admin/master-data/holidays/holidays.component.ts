import { DeleteHoliday, DeleteHolidaySucceeded, FilterChanged, GetHolidaysByPage, SaveHoliday, SaveHolidaySucceeded, SetYearFilter } from '@admin/store/holidays.actions';
import { HolidaysState } from '@admin/store/holidays.state';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ExportColumn } from '@shared/models/export.model';
import { Holiday } from '@shared/models/holiday.model';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetDirtyState, SetImportFileDialogState } from 'src/app/admin/store/admin.actions';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss'],
  providers: [SortService, FreezeService]
})
export class MasterHolidaysComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
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
    type:'date', format: 'MM/dd/yyyy hh:mm a'
  };
  public showForm = true;
  public columnsToExport: ExportColumn[] = [
    { text:'Holiday Name', column: 'holidayName'},
    { text:'Start Date & Time', column: 'startDateTime'},
    { text:'End Date & Time', column: 'endDateTime'}
  ];
  public fileName: string;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super();
    this.fileName = 'Master Holidays ' + datePipe.transform(Date.now(),'MM/dd/yyyy');
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
    this.startTimeField.addValidators(startDateValidator(this.HolidayFormGroup, 'endDateTime', this.today));
    this.startTimeField.valueChanges.subscribe(() => this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
    this.endTimeField = this.HolidayFormGroup.get('endDateTime') as AbstractControl;
    this.endTimeField.addValidators(endDateValidator(this.HolidayFormGroup, 'startDateTime', this.today));
    this.endTimeField.valueChanges.subscribe(() => this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
  }

  ngOnInit() {
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

  public closeExport() {
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: any): void {
    console.log(event);
    this.store.dispatch(new ShowExportDialog(false));
    this.clearSelection(this.grid);
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public copyHoliday(data: any, event: any): void {
    this.showForm = true;
    this.title = 'Copy';
    this.addActiveCssClass(event);
    this.HolidayFormGroup.setValue({
      id: 0,
      holidayName: data.holidayName,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public yearChanged(event: { value: number }): void {
    this.store.dispatch(new SetYearFilter(event.value));
  }

  public onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
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
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
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
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
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
