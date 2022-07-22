import { ActivatedRoute } from '@angular/router';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { combineLatest, Observable, takeUntil } from 'rxjs';
import { filter, skip, take, tap, switchMap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { TabComponent, SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';
import { GridApi, GridReadyEvent, IClientSideRowModel, Module } from '@ag-grid-community/core';

import { Destroyable } from '@core/helpers';
import { RecordFields } from './../../enums/timesheet-common.enum';
import {
  TimesheetRecordsColdef,
  TimesheetRecordsColConfig,
  RecordsTabConfig,
} from './../../constants/timsheets-details.constant';
import { ConfirmService } from './../../../../shared/services/confirm.service';
import { TabConfig, DropdownOption } from './../../interface/common.interface';
import { ConfirmTabChange } from './../../constants/confirm-delete-timesheet-dialog-content.const';
import { DialogActionPayload, OpenAddDialogMeta, TimesheetRecordsDto } from '../../interface';
import { TimesheetRecordsService } from '../../services/timesheet-records.service';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { RecordsAdapter } from '../../helpers';
import { TIMETHEETS_STATUSES } from '../../enums';

/**
 * TODO: move tabs into separate component if possible
 */
@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTimesheetTableComponent extends Destroyable implements AfterViewInit, OnInit {
  @ViewChild('tabs') readonly tabs: TabComponent;

  @ViewChild('grid') readonly grid: IClientSideRowModel;

  @Input() timesheetId: number;

  @Input() isAgency: boolean;

  @Output() readonly openAddSideDialog: EventEmitter<OpenAddDialogMeta> = new EventEmitter<OpenAddDialogMeta>();

  @Output() readonly changesSaved: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Select(TimesheetsState.tmesheetRecords)
  public readonly timesheetRecords$: Observable<TimesheetRecordsDto>;

  @Select(TimesheetsState.isTimesheetOpen)
  public readonly isTimesheetOpen$: Observable<DialogActionPayload>;

  @Select(TimesheetsState.billRateTypes)
  private readonly billRates$: Observable<DropdownOption[]>;

  @Select(TimesheetsState.costCenters)
  private readonly costCenters$: Observable<DropdownOption[]>;

  public isEditOn = false;

  public timesheetColDef = TimesheetRecordsColdef;

  public readonly modules: Module[] = [ClientSideRowModelModule];

  public tabsConfig: TabConfig[] = RecordsTabConfig;

  public records: TimesheetRecordsDto;

  public currentTab: RecordFields = RecordFields.Time;

  public isFirstSelected = true;

  public actionsAvaliable = true;

  private isChangesSaved = true;

  private formControls: Record<string, FormGroup> = {};

  private gridApi: GridApi;

  private slectingindex: number;

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private timesheetRecordsService: TimesheetRecordsService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.checkIfActionsAvaliable();
  }

  ngAfterViewInit(): void {
    this.getRecords();
    this.watchForDialogState();
  }

  public onTabSelect(selectEvent: SelectingEventArgs): void {
    this.isFirstSelected = false;

    if (!this.isChangesSaved && (this.slectingindex !== selectEvent.selectedIndex)) {
      this.confirmService.confirm(ConfirmTabChange, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        take(1),
      )
      .subscribe((submitted) => {
        if (submitted) {
          this.isChangesSaved = true;
          this.setInitialTableState();
          this.selectTab(selectEvent.selectedIndex);
        } else {
          this.slectingindex = selectEvent.previousIndex;
          this.tabs.select(selectEvent.previousIndex);
        }
      });
    } else {
      if (this.isChangesSaved) {
        this.setInitialTableState();
      }
      this.selectTab(selectEvent.selectedIndex);
    }
  }

  public openAddDialog(): void {
    const startDate = this.store.snapshot().timesheets.selectedTimeSheet.startDate;
    console.log(this.store.snapshot().timesheets.selectedTimeSheet)

    this.openAddSideDialog.emit({
      currentTab: this.currentTab,
      initDate: startDate,
    });
  }

  public editTimesheets(): void {
    this.isEditOn = true;
    this.createForm();
    this.setEditModeColDef();
  }

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  public cancelChanges(): void {
    this.changesSaved.emit(true);
    this.isChangesSaved = true;
    this.setInitialTableState();
  }

  public saveChanges(): void {
    const diffs = this.timesheetRecordsService.findDiffs(
      this.records[this.currentTab], this.formControls, this.timesheetColDef);

    const recordsToUpdate = this.records[this.currentTab].map((record) => {
      const updatedItem = diffs.find((item) => item.id === record.id);
      if (updatedItem) {
        return updatedItem
      }
      return record;
    });

    const { organizationId, id } = this.store.snapshot().timesheets.selectedTimeSheet;
    const dto = RecordsAdapter.adaptRecordPutDto(recordsToUpdate, organizationId, id, this.currentTab);
    this.store.dispatch(new TimesheetDetails.PutTimesheetRecords(dto, this.isAgency))
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.changesSaved.emit(true);
      this.isChangesSaved = true;
      this.setInitialTableState();
    });
  }

  public trackByIndex(index: number, item: TabConfig): number {
    return index;
  }

  private selectTab(index: number): void {
    this.changeColDefs(index);
  }

  private createForm(): void {
    this.formControls = this.timesheetRecordsService.createEditForm(
      this.records, this.currentTab, this.timesheetColDef);
    this.watchFormChanges();
  }

  private getRecords(): void {
    this.timesheetRecords$
    .pipe(
      tap((res) => { this.records = res;}),
      switchMap(() => {
        return combineLatest([
          this.billRates$,
          this.costCenters$,
        ]);
      }),
      filter(() => !!this.gridApi),
      tap((data) => { this.controlTabsVisibility(data[0]) }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.gridApi.setColumnDefs(this.timesheetColDef);
    });
  }

  private setEditModeColDef(): void {
    this.timesheetColDef = this.timesheetColDef.map((def) => {
      if (def.cellRendererParams && def.cellRendererParams.editMode) {
        def.cellRendererParams.isEditable = this.isEditOn;
        def.cellRendererParams.formGroup = this.formControls;
      }
      return def;
    });

    this.gridApi.setColumnDefs(this.timesheetColDef);
  }

  private setInitialTableState(): void {
    this.isEditOn = false;
    this.formControls = {};
    this.setEditModeColDef();
  }

  private changeColDefs(idx: number): void {
    this.currentTab = this.timesheetRecordsService.getCurrentTabName(idx);
    this.timesheetColDef = TimesheetRecordsColConfig[this.currentTab];
    this.cd.markForCheck();
  }

  private watchForDialogState(): void {
    this.isTimesheetOpen$
    .pipe(
      skip(1),
      filter((payload) => !payload),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.cancelChanges();
    })
  }

  private watchFormChanges(): void {
    this.timesheetRecordsService.watchFormChanges(this.formControls)
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      if (this.timesheetRecordsService.checkIfFormTouched(this.formControls)) {
        this.isChangesSaved = false;
        this.changesSaved.emit(false);
      }
    })
  }

  private controlTabsVisibility(billRates: DropdownOption[]): void {
    const isMilageAvaliable = billRates.some((rate) => rate.text.includes('Mileage'));
    const isExpensesAvaliable = billRates.some((rate) => rate.text.includes('Expenses'));

    this.tabs.hideTab(1, !isMilageAvaliable);
    this.tabs.hideTab(2, !isExpensesAvaliable);
  }

  private checkIfActionsAvaliable(): void {
    const status = this.store.snapshot().timesheets.selectedTimeSheet.statusText;

    this.actionsAvaliable = status !== TIMETHEETS_STATUSES.ORG_APPROVED
    && status !== TIMETHEETS_STATUSES.APPROVED;
  }
}
