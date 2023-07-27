import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Holiday, HolidayFilters, OrganizationHoliday, OrganizationHolidaysPage } from '@shared/models/holiday.model';
import { Organization, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { FilterService } from '@shared/services/filter.service';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { SetDirtyState } from 'src/app/admin/store/admin.actions';
import {
  CANCEL_CONFIRM_TEXT,
  DATA_OVERRIDE_TEXT,
  DATA_OVERRIDE_TITLE,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE, ERROR_START_LESS_END_DATE
} from 'src/app/shared/constants/messages';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  CheckIfExist,
  DeleteHoliday,
  DeleteHolidaySucceeded,
  EditHoliday,
  ExportHolidays,
  GetAllMasterHolidays,
  GetHolidayDataSources,
  GetHolidaysByPage,
  SaveHoliday,
  SaveHolidaySucceeded,
} from '../store/holidays.actions';
import { HolidaysState } from '../store/holidays.state';
import { GetOrganizationStructure } from '../../store/user.actions';
import { DateTimeHelper } from '@core/helpers';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { MessageTypes } from '@shared/enums/message-types';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { SelectedSystems } from '@shared/components/credentials-list/constants';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss'],
  providers: [SortService],
})
export class HolidaysComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
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

  @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;

  public selectedSystem: SelectedSystemsFlag = SelectedSystems;
  protected componentDestroy: () => Observable<unknown>;
  public HolidayFormGroup: FormGroup;
  public HolidayFilterFormGroup: FormGroup;
  public title: DialogMode = DialogMode.Add;
  public startTimeField: AbstractControl;
  public endTimeField: AbstractControl;
  public today = new Date();
  public maxDate = new Date(2099, 11, 31);
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public holidayOptionFields = {
    value: 'holidayName',
  };
  public showForm = true;
  public regions: OrganizationRegion[] = [];
  public editRegions: OrganizationRegion[] = [];
  public orgStructure: OrganizationStructure;
  public selectedRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public masterHolidays: Holiday[] = [];
  private isAllRegionsSelected = false;
  private isAllLocationsSelected = false;
  public columnsToExport: ExportColumn[] = [
    { text: 'Region', column: 'Region' },
    { text: 'Location', column: 'Location' },
    { text: 'Holiday Name', column: 'HolidayName' },
    { text: 'System', column: 'System' },
    { text: 'Start Date & Time', column: 'StartDateTime' },
    { text: 'End Date & Time', column: 'EndDateTime' },
  ];
  public fileName: string;
  public defaultFileName: string;
  public filters: HolidayFilters = {};
  public filterColumns: any;
  public yearsList: number[] = [];
  public datesValidationMessage = ERROR_START_LESS_END_DATE;
  public showSystem:boolean = false;
  public holidayItems: any[] = [];
  public filterType: string = 'Contains';
  constructor(
    protected override store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private cd : ChangeDetectorRef
  ) {
    super(store);
    this.idFieldName = 'foreignKey';
    this.today.setHours(0, 0, 0);
    this.HolidayFilterFormGroup = this.fb.group({
      holidayNames: new FormControl([]),
      years: new FormControl([]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
    });
    this.HolidayFormGroup = this.fb.group({
      id: new FormControl(0, [Validators.required]),
      masterHolidayId: new FormControl(0),
      regionId: new FormControl(0, [Validators.required]),
      locationId: new FormControl(0, [Validators.required]),
      locations: new FormControl(null, [Validators.required]),
      regions: new FormControl(null, [Validators.required]),
      holidayName: new FormControl(null, [Validators.required]),
      startDateTime: new FormControl(null, [Validators.required]),
      endDateTime: new FormControl(null, [Validators.required]),
      includeInIRP : new FormControl(false, [Validators.required]),
      includeInVMS : new FormControl(false, [Validators.required])
    });

    this.startTimeField = this.HolidayFormGroup.get('startDateTime') as AbstractControl;
    this.startTimeField.addValidators(startDateValidator(this.HolidayFormGroup, 'endDateTime'));
    this.startTimeField.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() =>
      this.endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
    this.endTimeField = this.HolidayFormGroup.get('endDateTime') as AbstractControl;
    this.endTimeField.addValidators(endDateValidator(this.HolidayFormGroup, 'startDateTime'));
    this.endTimeField.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() =>
      this.startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
    this.HolidayFormGroup.get('regionId')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number) => {
      if (this.title === DialogMode.Edit) {
        this.selectedRegions = [];
        if (val !== null) {
          this.selectedRegions.push(this.regions.find((region) => region.id === val) as OrganizationRegion);
          const locations: OrganizationLocation[] = []
          this.selectedRegions.forEach((region) => {
            if (region) {
              region.locations?.forEach((location) => (location.regionName = region.name));
              locations.push(...(region.locations as []));
            } else {
              locations.push(
                {
                  name: 'All',
                  id: 0,
                  departments: [],
                },
              );
            }
          });
          this.locations.push(...sortByField(locations, 'name'));
        } else {
          this.locations = [];
          this.isAllRegionsSelected = false;
        }
      }
    });
    this.HolidayFormGroup.get('regions')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (this.title === DialogMode.Assign) {
        this.selectedRegions = [];
        if (val) {
          val.forEach((id) =>
            this.selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
          );
          const locations: OrganizationLocation[] = [];
          this.isAllRegionsSelected = val.length === this.regions.length;
          this.selectedRegions.forEach((region) => {
            region.locations?.forEach((location) => (location.regionName = region.name));
            locations.push(...(region.locations as []));
          });
          this.locations = sortByField(locations, 'name');
        } else {
          this.locations = [];
          this.isAllRegionsSelected = false;
        }
        this.HolidayFormGroup.get('locations')?.setValue(null);
      }
    });
    this.HolidayFilterFormGroup.get('regionIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        const locations: OrganizationLocation[] = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          locations.push(...(region.locations as []))
        });
        this.filterColumns.locationIds.dataSource.push(...sortByField(locations, 'name'));
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.HolidayFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.HolidayFilterFormGroup, this.filterColumns);
      }
    });
    this.HolidayFormGroup.get('locations')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (this.title === DialogMode.Assign) {
        if (val && val.length === this.locations.length) {
          this.isAllLocationsSelected = true;
        } else {
          this.isAllLocationsSelected = false;
        }
      }
    });
    this.HolidayFormGroup.get('holidayName')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: string) => {
      const selectedHoliday = this.masterHolidays.find((holiday) => holiday.holidayName === val);
      if (selectedHoliday) {
        this.HolidayFormGroup.get('masterHolidayId')?.setValue(selectedHoliday.id);
        this.HolidayFormGroup.get('startDateTime')?.setValue(DateTimeHelper.setCurrentTimeZone(selectedHoliday.startDateTime));
        this.HolidayFormGroup.get('endDateTime')?.setValue(DateTimeHelper.setCurrentTimeZone(selectedHoliday.endDateTime));
      } else {
        this.HolidayFormGroup.get('masterHolidayId')?.setValue(0);
      }
    });
  }

  override ngOnInit() {
    super.ngOnInit();
    this.getOrganizagionData();
    this.holidaysPage$.pipe(
      filter(x => x !== null && x !== undefined), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if ((this.selectedSystem.isVMS) && (!this.selectedSystem.isIRP))
          this.holidayItems = data.items.filter((f) => f.includeInVMS == true)
        if ((!this.selectedSystem.isVMS) && (this.selectedSystem.isIRP))
          this.holidayItems = data.items.filter((f) => f.includeInIRP == true)
        if (this.selectedSystem.isVMS && this.selectedSystem.isIRP)
          this.holidayItems = data.items
        this.holidayItems = [...this.holidayItems];
        this.cd.detectChanges();
      });
    this.filterColumns = {
      holidayNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [], valueField: 'name' },
      years: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
    };
    const prevYear = this.today.getFullYear() - 1;
    for (let i = 0; i < 7; i++) {
      this.yearsList.push(prevYear + i);
    }
    this.filterColumns.years.dataSource = this.yearsList;
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      this.currentPage = 1;
      this.clearFilters();
      this.store.dispatch([new GetAllMasterHolidays(), new GetHolidayDataSources()]);
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    });
    this.masterHolidays$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((holidays: Holiday[]) => {
      this.masterHolidays = sortByField(holidays, 'holidayName');
    });
    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.editRegions = [this.editRegions[0], ...structure.regions];
        this.regions = structure.regions;
        this.filterColumns.regionIds.dataSource = structure.regions;
      });
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveHolidaySucceeded)).subscribe(() => {
      this.HolidayFormGroup.reset();
      this.closeDialog();
      this.store.dispatch([new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters), new GetHolidayDataSources()]);
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DeleteHolidaySucceeded)).subscribe(() => {
      this.store.dispatch([new GetHolidaysByPage(this.currentPage, this.pageSize, this.orderBy, this.filters), new GetHolidayDataSources()]);
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
    this.store.dispatch(
      new ExportHolidays(
        new ExportPayload(
          fileType,
          {
            ...this.filters,
            orderBy: this.orderBy,
            masterOrgIds: this.selectedItems.length
              ? this.selectedItems.map((val) => {
                  return { item1: val.masterHolidayId, item2: val.id };
                })
              : null,
            offset: Math.abs(new Date().getTimezoneOffset()),
          },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
          options?.fileName || this.defaultFileName
        )
      )
    );
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

  public addHoliday(): void {
    this.getOrganizationStructure();
    this.changeAbilityOfHolidayName();
    this.showForm = true;
    this.title = DialogMode.Assign;
    this.regions = this.orgStructure.regions;
    this.HolidayFormGroup.controls['id'].setValue(0);
    this.HolidayFormGroup.controls['regionId'].setValue(0);
    this.HolidayFormGroup.controls['locationId'].setValue(0);
    this.store.dispatch(new ShowSideDialog(true));
  }

  private populateDropdownWithAll(data: any): void {
    if (data.regionId === null) {
      this.editRegions = [
        {
          name: 'All',
          id: 0,
          locations: [
            {
              name: 'All',
              id: 0,
              departments: [],
            },
          ],
        },
      ];
      this.isAllRegionsSelected = this.isAllLocationsSelected = true;
    } else {
      this.editRegions = this.orgStructure.regions;
    }
    if (data.locationId === null) {
      this.locations = [
        {
          name: 'All',
          id: 0,
          departments: [],
        },
      ];
    }
  }

  public editHoliday(holiday: OrganizationHoliday, event: MouseEvent): void {
    this.getOrganizationStructure();
    this.changeAbilityOfHolidayName(false);
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
      startDateTime: DateTimeHelper.setCurrentTimeZone(holiday.startDateTime),
      endDateTime: DateTimeHelper.setCurrentTimeZone(holiday.endDateTime),
      includeInIRP : holiday.includeInIRP,
      includeInVMS : holiday.includeInVMS
    });

    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteHoliday(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(takeUntil(this.unsubscribe$))
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
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this.cleanUp();
        });
    } else {
      this.cleanUp();
    }
  }

  public saveHoliday(): void {
    if (this.HolidayFormGroup.controls['holidayName'].value != null && this.HolidayFormGroup.controls['locations'].value.length != 0 && this.HolidayFormGroup.controls['regions'].value.length != 0) {
      if(this.selectedSystem.isIRP && this.selectedSystem.isVMS){
        if(this.HolidayFormGroup.controls['includeInIRP'].value || this.HolidayFormGroup.controls['includeInVMS'].value){
          if (this.title === DialogMode.Assign) {
            this.store
              .dispatch(
                new CheckIfExist(
                  new OrganizationHoliday(
                    this.HolidayFormGroup.getRawValue(),
                    this.selectedRegions,
                    this.isAllRegionsSelected, this.isAllLocationsSelected
                  )
                )
              ).pipe(
                  takeUntil(this.unsubscribe$)
              ).subscribe((val) => {
                if (val.orgHolidays.isExist) {
                  this.confirmService
                    .confirm(DATA_OVERRIDE_TEXT, {
                      title: DATA_OVERRIDE_TITLE,
                      okButtonLabel: 'Confirm',
                      okButtonClass: '',
                    })
                    .pipe(
                      filter((confirm) => !!confirm),
                      takeUntil(this.unsubscribe$)
                    )
                    .subscribe(() => {
                      this.saveHandler(true);
                    });
                } else {
                  this.saveHandler(false);
                }
              });
          } else {
            this.editHandler();
          }
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, "Atleast one system should be selected"));
        }
      } else {
        this.HolidayFormGroup.controls["includeInIRP"].setValue(this.selectedSystem.isIRP);
        this.HolidayFormGroup.controls["includeInVMS"].setValue(this.selectedSystem.isVMS);
        if (this.title === DialogMode.Assign) {
          this.store
            .dispatch(
              new CheckIfExist(
                new OrganizationHoliday(
                  this.HolidayFormGroup.getRawValue(),
                  this.selectedRegions,
                  this.isAllRegionsSelected, this.isAllLocationsSelected
                )
              )
            ).pipe(takeUntil(this.unsubscribe$))
            .subscribe((val) => {
              if (val.orgHolidays.isExist) {
                this.confirmService
                  .confirm(DATA_OVERRIDE_TEXT, {
                    title: DATA_OVERRIDE_TITLE,
                    okButtonLabel: 'Confirm',
                    okButtonClass: '',
                  })
                  .pipe(
                    filter((confirm) => !!confirm),
                    takeUntil(this.unsubscribe$)
                  )
                  .subscribe(() => {
                    this.saveHandler(true);
                  });
              } else {
                this.saveHandler(false);
              }
            });
        } else {
          this.editHandler();
        }
      }
    } else {
    this.HolidayFormGroup.markAllAsTouched();
    this.store.dispatch(new ShowToast(MessageTypes.Error, "Please fill the required Fields"));
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
    this.dispatchSave(holiday, isExist);
  }

  private editHandler(): void {
    const holidayToUpdate = this.HolidayFormGroup.getRawValue() as OrganizationHoliday;
    if (this.isEditMode()) {
      holidayToUpdate.masterHolidayId = this.holidayIdUnderEdit;
      this.dispatchEdit(holidayToUpdate);
      return;
    }
    this.dispatchSave(holidayToUpdate, false);
  }

  private dispatchSave(holiday: OrganizationHoliday, isExist?: boolean): void {
    this.store.dispatch(
      new SaveHoliday(
        new OrganizationHoliday(
          holiday,
          this.hasSelectedRegions() ? this.selectedRegions : undefined,
          this.isAllRegionsSelected, this.isAllLocationsSelected,
          isExist
        )
      )
    );
    this.store.dispatch(new SetDirtyState(false));
    this.holidayIdUnderEdit = 0;
  }

  private dispatchEdit(holiday: OrganizationHoliday): void {
    this.store.dispatch(
      new EditHoliday(
        new OrganizationHoliday(
          holiday,
          this.hasSelectedRegions() ? this.selectedRegions : undefined,
          this.isAllRegionsSelected, this.isAllLocationsSelected,
          false
        )
      )
    );
    this.store.dispatch(new SetDirtyState(false));
    this.holidayIdUnderEdit = 0;
  }

  private hasSelectedRegions(): boolean {
    return (
      this.title === DialogMode.Assign ||
      (this.isEditMode() && this.HolidayFormGroup.controls['id'].value === 0)
    );
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

  private getOrganizationStructure(): void {
    this.store.dispatch(new GetOrganizationStructure());
  }

  private getOrganizagionData(): void {
    this.organization$
    .pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    )
    .subscribe((organization : Organization) => {
      const isOrgUser = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.Organization;
      this.selectedSystem = {
        isIRP: !!organization.preferences.isIRPEnabled,
        isVMS: !!organization.preferences.isVMCEnabled,
      };
    });
  }
}
