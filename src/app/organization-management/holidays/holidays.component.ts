import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Holiday, HolidayFilters, OrganizationHoliday, OrganizationHolidaysPage } from '@shared/models/holiday.model';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { FilterService } from '@shared/services/filter.service';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { SetDirtyState, SetImportFileDialogState } from 'src/app/admin/store/admin.actions';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { CheckIfExist, DeleteHoliday, DeleteHolidaySucceeded, EditHoliday, ExportHolidays, GetAllMasterHolidays, GetHolidayDataSources, GetHolidaysByPage, SaveHoliday, SaveHolidaySucceeded } from '../store/holidays.actions';
import { HolidaysState } from '../store/holidays.state';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss'],
  providers: [SortService, FreezeService]
})
export class HolidaysComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private holidayIdUnderEdit: number = 0;

  @ViewChild('grid') grid: GridComponent;

  @Select(HolidaysState.holidaysPage)
  holidaysPage$: Observable<OrganizationHolidaysPage>;

  @Select(HolidaysState.masterHolidays)
  masterHolidays$: Observable<Holiday[]>;

  @Select(HolidaysState.holidayDataSource)
  holidayDataSource$: Observable<string[]>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public HolidayFormGroup: FormGroup;
  public HolidayFilterFormGroup: FormGroup;
  public title: DialogMode = DialogMode.Add;
  public startTimeField: AbstractControl;
  public endTimeField: AbstractControl;
  public today = new Date();
  public maxDate = new Date(2099, 11, 31);
  public format = {
    type:'date', format: 'MM/dd/yyyy hh:mm a'
  };
  public optionFields = {
    text: 'name', value: 'id'
  };
  public holidayOptionFields = {
    value: 'holidayName'
  };
  public showForm = true;
  public regions: OrganizationRegion[] = [];
  public orgStructure: OrganizationStructure;
  public selectedRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public masterHolidays: Holiday[] = [];
  private isAllRegionsSelected = false;
  private isAllLocationsSelected = false;
  public columnsToExport: ExportColumn[] = [
    { text:'Region', column: 'Region'},
    { text:'Location', column: 'Location'},
    { text:'Holiday Name', column: 'HolidayName'},
    { text:'Start Date & Time', column: 'StartDateTime'},
    { text:'End Date & Time', column: 'EndDateTime'}
  ];
  public fileName: string;
  public defaultFileName: string;
  public filters: HolidayFilters = {};
  public filterColumns: any;
  public yearsList: number[] = [];

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private filterService: FilterService,
              private datePipe: DatePipe) {
    super();
    this.idFieldName = 'foreignKey';
    this.today.setHours(0, 0, 0);
    this.HolidayFilterFormGroup = this.fb.group({
      holidayNames: new FormControl([]),
      years: new FormControl([]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
    });
    this.HolidayFormGroup = this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      masterHolidayId: new FormControl(0),
      regionId: new FormControl(0, [ Validators.required ]),
      locationId: new FormControl(0, [ Validators.required ]),
      locations: new FormControl(null, [ Validators.required ]),
      regions: new FormControl(null, [ Validators.required ]),
      holidayName: new FormControl(null, [ Validators.required ]),
      startDateTime: new FormControl(null, [ Validators.required ]),
      endDateTime: new FormControl(null, [ Validators.required ]),
    });

    this.startTimeField = this.HolidayFormGroup.get('startDateTime') as AbstractControl;
    this.startTimeField.addValidators(startDateValidator(this.HolidayFormGroup, 'endDateTime', this.today));
    this.startTimeField.valueChanges.subscribe(() => this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
    this.endTimeField = this.HolidayFormGroup.get('endDateTime') as AbstractControl;
    this.endTimeField.addValidators(endDateValidator(this.HolidayFormGroup, 'startDateTime', this.today));
    this.endTimeField.valueChanges.subscribe(() => this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));
    this.HolidayFormGroup.get('regionId')?.valueChanges.subscribe((val: number) => {
      if (this.title === DialogMode.Edit || this.title === DialogMode.Copy) {
        this.selectedRegions = [];
        if (val !== null) {
          this.selectedRegions.push(this.regions.find(region => region.id === val) as OrganizationRegion);
          this.selectedRegions.forEach(region => {
            region.locations?.forEach(location => location.regionName = region.name);
            this.locations = [...region.locations as []];
          });
        } else {
          this.locations = [];
          this.isAllRegionsSelected = false;
        }
      }
    });
    this.HolidayFormGroup.get('regions')?.valueChanges.subscribe((val: number[]) => {
      if (this.title === DialogMode.Add) {
        this.selectedRegions = [];
        if (val) {
          val.forEach(id => this.selectedRegions.push(this.regions.find(region => region.id === id) as OrganizationRegion));
          this.locations = [];
          this.isAllRegionsSelected = val.length === this.regions.length;
          this.selectedRegions.forEach(region => {
            region.locations?.forEach(location => location.regionName = region.name);
            this.locations.push(...region.locations as [])
          });
        } else {
          this.locations = [];
          this.isAllRegionsSelected = false;
        }
        this.HolidayFormGroup.get('locations')?.setValue(null);
      }
    });
    this.HolidayFilterFormGroup.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach(id => selectedRegions.push(this.regions.find(region => region.id === id) as OrganizationRegion));
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach(region => {
          region.locations?.forEach(location => location.regionName = region.name);
          this.filterColumns.locationIds.dataSource.push(...region.locations as [])
        });
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.HolidayFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.HolidayFilterFormGroup, this.filterColumns);
      }
    });
    this.HolidayFormGroup.get('locations')?.valueChanges.subscribe((val: number[]) => {
      if (this.title === DialogMode.Add) {
        if (val && val.length === this.locations.length) {
          this.isAllLocationsSelected = true;
        } else {
          this.isAllLocationsSelected = false;
        }
      }
    });
    this.HolidayFormGroup.get('holidayName')?.valueChanges.subscribe((val: string) => {
      const selectedHoliday = this.masterHolidays.find(holiday => holiday.holidayName === val);
      if (selectedHoliday) {
        this.HolidayFormGroup.get('masterHolidayId')?.setValue(selectedHoliday.id);
      } else {
        this.HolidayFormGroup.get('masterHolidayId')?.setValue(0);
      }
    })
  }

  ngOnInit() {
    this.filterColumns = {
      holidayNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [], valueField: 'name' },
      years: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      regionIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      locationIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
    }
    const prevYear = this.today.getFullYear() - 1;
    for(let i = 0; i < 7; i++) {
      this.yearsList.push(prevYear + i);
    }
    this.filterColumns.years.dataSource = this.yearsList;
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.currentPage = 1;
      this.clearFilters();
      this.store.dispatch([new GetAllMasterHolidays(), new GetHolidayDataSources()]);
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    });
    this.masterHolidays$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((holidays: Holiday[]) => {
      this.masterHolidays = holidays;
    });
    this.organizationStructure$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((structure: OrganizationStructure) => {
      this.orgStructure = structure;
      this.regions = structure.regions;
      this.filterColumns.regionIds.dataSource = this.regions;
    });
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveHolidaySucceeded)).subscribe(() => {
      this.HolidayFormGroup.reset();
    this.closeDialog();
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DeleteHolidaySucceeded)).subscribe(() => {
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    });
    this.holidayDataSource$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe((dataSource) => {
      this.filterColumns.holidayNames.dataSource = dataSource;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization Holidays ' + this.generateDateTime(this.datePipe);
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
    this.defaultFileName = 'Organization Holidays ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportHolidays(new ExportPayload(
      fileType,
      {
        ...this.filters,
        orderBy: this.orderBy,
        masterOrgIds: this.selectedItems.length ? this.selectedItems.map(val => {
          return { item1: val.masterHolidayId, item2: val.id };
        }) : null,
        offset: Math.abs(new Date().getTimezoneOffset())
      },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public onFilterClose() {
    this.HolidayFilterFormGroup.setValue({
      holidayNames: this.filters.holidayNames || [],
      years: this.filters.years || [],
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
    });
    this.filteredItems = this.filterService.generateChips(this.HolidayFilterFormGroup, this.filterColumns);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.HolidayFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.HolidayFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
  }

  public onFilterApply(): void {
    this.filters = this.HolidayFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.HolidayFilterFormGroup, this.filterColumns);
    this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  public addHoliday(): void {
    this.changeAbilityOfHolidayName();
    this.showForm = true;
    this.title = DialogMode.Add;
    this.regions = this.orgStructure.regions;
    this.HolidayFormGroup.controls['id'].setValue(0);
    this.HolidayFormGroup.controls['regionId'].setValue(0);
    this.HolidayFormGroup.controls['locationId'].setValue(0);
    this.store.dispatch(new ShowSideDialog(true));
  }

  private populateDropdownWithAll(data: any): void {
    if (data.regionId === null) {
      this.regions =[{
        name: 'All',
        id: 0,
        locations: [{
          name: 'All',
          id: 0,
          departments: []
        }]
      }];
      this.isAllRegionsSelected = this.isAllLocationsSelected = true;
    } else {
      this.regions = this.orgStructure.regions;
    }
    if (data.locationId === null) {
      this.locations = [{
        name: 'All',
        id: 0,
        departments: []
      }];
    }
  }

  public editHoliday(holiday: OrganizationHoliday, event: MouseEvent): void {
    this.changeAbilityOfHolidayName(holiday.isOrganizationHoliday);
    this.holidayIdUnderEdit = holiday.masterHolidayId;
    this.showForm = true;
    this.addActiveCssClass(event);
    this.title = DialogMode.Edit;
    this.populateDropdownWithAll(holiday);
    this.HolidayFormGroup.setValue({
      id: holiday.id,
      masterHolidayId: holiday.masterHolidayId || 0,
      regionId: holiday.regionId || 0,
      locationId: holiday.locationId || 0,
      locations: [0],
      regions: [0],
      holidayName: holiday.holidayName,
      startDateTime: holiday.startDateTime,
      endDateTime: holiday.endDateTime,
    });

    this.store.dispatch(new ShowSideDialog(true));
  }

  public copyHoliday(holiday: OrganizationHoliday, event: MouseEvent): void {
    this.changeAbilityOfHolidayName();
    this.showForm = true;
    this.title = DialogMode.Copy;
    this.addActiveCssClass(event);
    this.populateDropdownWithAll(holiday);
    this.HolidayFormGroup.setValue({
      id: 0,
      masterHolidayId: holiday.masterHolidayId || 0,
      regionId: holiday.regionId || 0,
      locationId: holiday.locationId || 0,
      locations: [holiday.locationId || 0],
      regions: [holiday.regionId || 0],
      holidayName: holiday.holidayName,
      startDateTime: holiday.startDateTime,
      endDateTime: holiday.endDateTime,
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
      }).pipe(takeUntil(this.unsubscribe$))
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
      }).pipe(filter(confirm => !!confirm), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.cleanUp();
      });
    } else {
      this.cleanUp();
    }
  }

  public saveHoliday(): void {
    if (this.HolidayFormGroup.valid) {
      if (this.title === DialogMode.Add) {
        this.store.dispatch(new CheckIfExist(new OrganizationHoliday(
          this.HolidayFormGroup.getRawValue(),
          this.selectedRegions,
          this.isAllRegionsSelected && this.isAllLocationsSelected
        ))).subscribe(val => {
          if (val.orgHolidays.isExist) {
            this.confirmService
            .confirm(DATA_OVERRIDE_TEXT, {
              title: DATA_OVERRIDE_TITLE,
              okButtonLabel: 'Confirm',
              okButtonClass: ''
            }).pipe(filter(confirm => !!confirm), takeUntil(this.unsubscribe$))
            .subscribe(() => {
              this.saveHandler(true);
            });
          } else {
            this.saveHandler(false);
          }
        });
      } else {
        this.editOrCopyHandler();
      }
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

  private saveHandler(isExist?: boolean): void {
    const holiday = this.HolidayFormGroup.getRawValue() as OrganizationHoliday;
    this.dispatchSave(this.prepareToCreate(holiday), isExist);
  }

  private editOrCopyHandler(): void {
    const holidayToUpdate = this.HolidayFormGroup.getRawValue() as OrganizationHoliday;
    if (this.isEditMode()) {
      holidayToUpdate.masterHolidayId = this.holidayIdUnderEdit;
      this.dispatchEdit(holidayToUpdate);
      return;
    }
    this.dispatchSave(holidayToUpdate, false);
  }

  private dispatchSave(holiday: OrganizationHoliday, isExist?: boolean): void {
    this.store.dispatch(new SaveHoliday(new OrganizationHoliday(
      holiday,
      this.hasSelectedRegions() ? this.selectedRegions : undefined,
      this.isAllRegionsSelected && this.isAllLocationsSelected,
      isExist
    )));
    this.store.dispatch(new SetDirtyState(false));
    this.holidayIdUnderEdit = 0;
  }

  private dispatchEdit(holiday: OrganizationHoliday): void {
    this.store.dispatch(new EditHoliday(new OrganizationHoliday(
      holiday,
      this.hasSelectedRegions() ? this.selectedRegions : undefined,
      this.isAllRegionsSelected && this.isAllLocationsSelected,
      false
    )));
    this.store.dispatch(new SetDirtyState(false));
    this.holidayIdUnderEdit = 0;
  }

  private hasSelectedRegions(): boolean {
    return this.title === DialogMode.Add || this.title === DialogMode.Copy || (this.isEditMode() && this.HolidayFormGroup.controls['id'].value === 0);
  }

  private isEditMode(): boolean {
    return this.title === DialogMode.Edit;
  }

  private cleanUp(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.holidayIdUnderEdit = 0;
    this.showForm = false;
    this.HolidayFormGroup.reset();
    this.removeActiveCssClass();
  }

  private changeAbilityOfHolidayName(state = true): void {
    const action = state ? 'enable' : 'disable';
    if (this.holidayName[action]) {
      this.holidayName[action]();
    }
  }

  private get holidayName(): AbstractControl {
    return this.HolidayFormGroup.get('holidayName') as AbstractControl;
  }

  private prepareToCreate(holiday: OrganizationHoliday): OrganizationHoliday {
    return {...holiday, masterHolidayId: 0};
  }
}
