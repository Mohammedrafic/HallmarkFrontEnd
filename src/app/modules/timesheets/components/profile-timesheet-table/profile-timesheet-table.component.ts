import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable, takeUntil, forkJoin } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { TabComponent, SelectingEventArgs } from '@syncfusion/ej2-angular-navigations';

import { ConfirmService } from '@shared/services/confirm.service';
import { Destroyable } from '@core/helpers';
import { RecordFields } from './../../enums/timesheet-common.enum';
import { RecordValue } from './../../interface/common.interface';
import { TimesheetRecordsColdef } from './../../constants/timsheets-details.constant';
import { TimesheetRecordsDto } from '../../interface';
import { TimesheetRecordsService } from '../../services/timesheet-records.service';
import { GridApi, GridReadyEvent, IClientSideRowModel, Module } from '@ag-grid-community/core';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

@Component({
  selector: 'app-profile-timesheet-table',
  templateUrl: './profile-timesheet-table.component.html',
  styleUrls: ['./profile-timesheet-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTimesheetTableComponent extends Destroyable implements OnChanges, AfterViewInit {

  @ViewChild('tabs') tabs: TabComponent;

  @ViewChild('grid') grid: IClientSideRowModel;

  @Input() candidateRecords: TimesheetRecordsDto;

  @Input() candidateId: number;

  @Output() openAddSideDialog: EventEmitter<number> = new EventEmitter<number>();

  @Output() updateTable: EventEmitter<void> = new EventEmitter<void>();

  @Output() deleteTableItemId: EventEmitter<{ profileId: number; tableItemId: number | any }>

    = new EventEmitter<{ profileId: number; tableItemId: number | any }>();

  @Select(TimesheetsState.tmesheetRecords)
  public timesheetRecords$: Observable<TimesheetRecordsDto>;

  public isEditOn = false;

  public timesheetColDef = TimesheetRecordsColdef;

  public readonly modules: Module[] = [ClientSideRowModelModule];

  private gridApi: GridApi;

  private records: TimesheetRecordsDto;

  private currentTab: RecordFields = RecordFields.Time;

  private formControls: Record<string, FormGroup> = {};

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private timesheetRecordsService: TimesheetRecordsService,
    private apiService: TimesheetsApiService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnChanges(): void {
    this.setTabItems();
  }

  ngAfterViewInit(): void {
    this.setTabItems();
    this.getRecords();
  }

  public editTimesheets(): void {
    this.isEditOn = true;
    this.createForm();
    this.setColDef();
  }

  public selectTab(event: SelectingEventArgs): void {}

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.getFormOptions();
  }

  public cancelChanges(): void {
    this.setInitialTableState();
  }

  public saveChanges(): void {
    const diffs = this.timesheetRecordsService.findDiffs(
      this.records[this.currentTab], this.formControls, this.timesheetColDef);
    this.store.dispatch(new TimesheetDetails.PatchTimesheetRecords(this.candidateId, diffs))
    .pipe(
      takeUntil(this.componentDestroy())
    )
    .subscribe(() => {
      this.setInitialTableState();
    })
  }

  private setTabItems(): void {
    if (this.candidateRecords && this.tabs) {
      this.timesheetRecordsService.createTabs(this.candidateRecords, this.tabs);
    }
  }

  private getFormOptions(): void {
    forkJoin([
      this.apiService.getCandidateCostCenters(this.candidateId),
      this.apiService.getCandidateBillRates(this.candidateId),
    ])
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe(([costCenters, billRates]) => {
      this.timesheetRecordsService.setCostOptions(this.timesheetColDef, costCenters);
      this.timesheetRecordsService.setBillRatesOptions(this.timesheetColDef, billRates);

      this.gridApi.setColumnDefs(this.timesheetColDef);
    });
  }

  private createForm(): void {
    this.records[this.currentTab].forEach((record) => {
      const config = this.timesheetColDef.filter((item) => item.cellRendererParams?.editMode);
      const controls: Record<string, string[] | number[] | Validators[]> = {};

      config.forEach((column) => {
        const field = column.field as keyof RecordValue;
        const value = record[field];

        controls[field] = [value, Validators.required];
      });

      this.formControls[record.id] = this.fb.group(controls);
    });
  }

  private getRecords(): void {
    this.timesheetRecords$
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((res) => {
      this.records = res;
    });
  }

  private setColDef(): void {
    this.timesheetColDef = this.timesheetColDef.map((def) => {
      if (def.cellRendererParams && def.cellRendererParams.editMode) {
        def.cellRendererParams.isEditable = this.isEditOn;
        def.width = 135;
        def.cellRendererParams.formGroup = this.formControls;
      }
      return def;
    });

    this.gridApi.setColumnDefs(this.timesheetColDef);
  }

  private setInitialTableState(): void {
    this.isEditOn = false;
    this.formControls = {};
    this.setColDef();
  }
}
