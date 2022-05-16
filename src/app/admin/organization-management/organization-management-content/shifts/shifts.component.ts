import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { SetDirtyState, SetImportFileDialogState } from 'src/app/admin/store/admin.actions';
import { DeleteShift, DeleteShiftSucceeded, GetShiftsByPage, SaveShift, SaveShiftSucceeded } from 'src/app/admin/store/shifts.actions';
import { ShiftsState } from 'src/app/admin/store/shifts.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { Shift } from 'src/app/shared/models/shift.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  providers: [SortService, FreezeService]
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

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.ShiftFormGroup = this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      name: new FormControl(null, [ Validators.required ]),
      shortName: new FormControl(null, [ Validators.required ]),
      startTime: new FormControl(null, [ Validators.required ]),
      endTime: new FormControl(null, [ Validators.required ]),
    });

    this.startTimeField = this.ShiftFormGroup.get('startTime') as AbstractControl;
    this.endTimeField = this.ShiftFormGroup.get('endTime') as AbstractControl;
  }

  ngOnInit() {
    this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveShiftSucceeded)).subscribe(() => {
      this.closeDialog();
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
      this.ShiftFormGroup.reset();
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DeleteShiftSucceeded)).subscribe(() => {
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public addShift(): void {
    this.title = 'Add';
    this.ShiftFormGroup.controls['id'].setValue(0);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public editShift(data: any, event: any): void {
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
    this.store.dispatch(new ShowSideDialog(false));
    this.ShiftFormGroup.reset();
    this.removeActiveCssClass();
  }

  public saveShift(): void {
    if (this.ShiftFormGroup.valid) {
      this.store.dispatch(new SaveShift(new Shift(
        this.ShiftFormGroup.getRawValue(), 2 // TODO: remove after org selection implementation
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
