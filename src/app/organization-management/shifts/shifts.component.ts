import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShiftExportColumns } from "@organization-management/shifts/shifts.constants";
import { ShiftsService } from "@organization-management/shifts/shifts.service";
import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { SetDirtyState } from '../store/organization-management.actions';
import { DeleteShift, DeleteShiftSucceeded, ExportShifts, GetShiftsByPage,
  SaveShift, SaveShiftSucceeded } from '../store/shifts.actions';
import { ShiftsState } from '../store/shifts.state';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from 'src/app/shared/constants/messages';
import { Shift, ShiftsPage } from 'src/app/shared/models/shift.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { DatePipe } from '@angular/common';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { UserState } from 'src/app/store/user.state';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  providers: [SortService, MaskedDateTimeService],
})
export class ShiftsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(ShiftsState.shiftsPage)
  shiftsPage$: Observable<ShiftsPage>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public ShiftFormGroup: FormGroup;
  public optionFields = {
    text: 'name', value: 'id',
  };
  public title = '';
  public showForm = true;
  public maskPlaceholderValue: Object = { hour: 'HH', minute: 'MM' };
  public columnsToExport: ExportColumn[] = ShiftExportColumns;
  public fileName: string;
  public defaultFileName: string;

  constructor(protected override store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService,
              private shiftsService: ShiftsService,
              private datePipe: DatePipe) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.ShiftFormGroup = this.shiftsService.getShiftForm();
    this.watchForShiftPage();
    this.watchForShiftActions();
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

  public editShift(data: Shift, event: MouseEvent): void {
    this.showForm = true;
    this.addActiveCssClass(event);
    this.title = 'Edit';
    const [startH, startM, startS] = getHoursMinutesSeconds(data.startTime);
    const [endH, endM, endS] = getHoursMinutesSeconds(data.endTime);
    const startDate = new Date();
    const endDate = new Date();
    startDate.setHours(startH, startM, startS);
    endDate.setHours(endH, endM, endS);
    this.ShiftFormGroup.setValue({
      id: data.id,
      name: data.name,
      startTime: startDate,
      endTime: endDate,
      onCall: data.onCall,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteShift(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        take(1)
      ).subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new DeleteShift(data));
        }
        this.removeActiveCssClass();
      });
  }

  public closeDialog(): void {
    if (this.ShiftFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(confirm => !!confirm),
        take(1)
      ).subscribe(() => {
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

  private watchForShiftPage(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.currentPage = 1;
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
  }

  private watchForShiftActions(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveShiftSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.ShiftFormGroup.reset();
      this.closeDialog();
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(
      ofActionSuccessful(DeleteShiftSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.store.dispatch(new GetShiftsByPage(this.currentPage, this.pageSize));
    });
  }
}
