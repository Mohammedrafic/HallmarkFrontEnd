import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { combineLatest, delay, filter, map, Observable, Subject, take, takeUntil, throttleTime } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

import { TakeUntilDestroy } from '@core/decorators';
import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { GetAllBusinessLines } from '@organization-management/store/business-lines.action';
import { BusinessLinesState } from '@organization-management/store/business-lines.state';
import {
  CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE,
} from '@shared/constants';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { MessageTypes } from '@shared/enums/message-types';
import { PhoneTypes } from '@shared/enums/phone-types';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { BusinessLines } from '@shared/models/business-line.model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import {
  Location, LocationFilter, LocationFilterOptions, LocationsPage,
  LocationType, TimeZoneModel,
} from '@shared/models/location.model';
import { Organization } from '@shared/models/organization.model';
import { Region } from '@shared/models/region.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { AppState } from 'src/app/store/app.state';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { UserState } from '../../store/user.state';
import {
  ClearLocationList, DeleteLocationById, ExportLocations, GetLocationFilterOptions,
  GetLocationsByRegionId, GetLocationTypes, GetOrganizationById, GetRegions, GetUSCanadaTimeZoneIds,
  SaveLocation, SaveLocationConfirm, SaveLocationSucceeded, SaveRegion, SetGeneralStatesByCountry, UpdateLocation,
} from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';
import {
  ExportImportColumnsToHideInIrp,
  ExportImportColumnsToHideInVms,
  FieldsToHideInIrp, FieldsToHideInVms, LocationExportColumns, LocationInitFilters,
  LocationsDialogConfig, LocationsDialogWithIrpConfig, LocationsExportIrpColumns,
  MESSAGE_REGIONS_NOT_SELECTED,
} from './locations.constant';
import { LocationsTrackKey } from './locations.enum';
import { LocationsFormConfig, LocationsFormSource, LocationsSubFormConfig } from './locations.interface';
import { LocationsService } from './locations.service';
import { DateTimeHelper } from '@core/helpers';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  providers: [MaskedDateTimeService],
})
@TakeUntilDestroy
export class LocationsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;
  @ViewChild('addRegionDialog') addRegionDialog: DialogComponent;

  @Select(OrganizationManagementState.statesGeneral)
  public readonly statesGeneral$: Observable<string[]>;

  @Select(OrganizationManagementState.phoneTypes)
  public readonly phoneTypes$: Observable<string[]>;

  @Select(OrganizationManagementState.regions)
  public readonly regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.locationsByRegionId)
  public readonly locations$: Observable<LocationsPage>;

  @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;

  @Select(OrganizationManagementState.locationFilterOptions)
  public readonly locationFilterOptions$: Observable<LocationFilterOptions>;

  @Select(OrganizationManagementState.locationTypes)
  public readonly locationTypes$: Observable<LocationType[]>;

  @Select(OrganizationManagementState.timeZones)
  public readonly timeZoneIds$: Observable<TimeZoneModel[]>;

  @Select(BusinessLinesState.allBusinessLines)
  public readonly businessLines$: Observable<BusinessLines[]>;

  public readonly DEFAULT_LOCATION_TIMEZONE = 'America/New_York';

  public readonly regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly dropDownfields = { text: 'text', value: 'value' };
  public locationDetailsFormGroup: FormGroup;
  public regionFormGroup: FormGroup;
  public selectedRegion: Region;
  public defaultValue: Region;
  public businessLineDataSource: DropdownOption[] = [];
  public columnsToExport: ExportColumn[] = LocationExportColumns;
  public fileName: string;
  public defaultFileName: string;
  public locationFilterForm: FormGroup;
  public filters: LocationFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager,
  };
  public filterColumns = LocationInitFilters;
  public importDialogEvent: Subject<boolean> = new Subject<boolean>();
  public isEdit: boolean;
  public editedLocationId?: number;
  public formSourcesMap: LocationsFormSource = {
    businessLineData: [],
    locationTypes: [],
    timeZoneIds: [],
    states: [],
    phoneType: [],
  };
  public locationDialogConfig = LocationsDialogConfig;
  public readonly FieldTypes = FieldType;
  /**
   * Feature flag.
   * TODO: combine flags with object (primitive type obsession)
   */
  public isFeatureIrpEnabled = false;
  public isOrgVMSEnabled = true;
  public isOrgIrpEnabled = false;

  private businessUnitId: number;
  private pageSubject = new Subject<number>();
  private componentDestroy: () => Observable<unknown>;


  get dialogHeader(): string {
    return this.isEdit ? 'Edit Location' : 'Add Location';
  }

  constructor(
    protected override store: Store,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private locationsService: LocationsService,
    private action$: Actions
  ) {
    super(store);
    this.createForms();
    this.setIrpFeatureFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForLocationUpdate();
    this.watchForPageChange();
    this.populateFilterOptions();
    this.watchForOrgChange();
    this.watchForOrganizations();
    this.populateFormOptions();
    this.store.dispatch(new GetLocationTypes());
    this.store.dispatch(new GetUSCanadaTimeZoneIds());
    this.store.dispatch(new GetAllBusinessLines());
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearLocationList());
  }

  closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  closeFilter(): void {
    this.locationFilterForm.setValue({
      externalIds: this.filters.externalIds || [],
      invoiceIds: this.filters.invoiceIds || [],
      names: this.filters.names || [],
      addresses1: this.filters.addresses1 || [],
      cities: this.filters.cities || [],
      states: this.filters.states || [],
      zipCodes: this.filters.zipCodes || [],
      contactPeople: this.filters.contactPeople || [],
      includeInIRP: this.filters.includeInIRP || null,
    });
    this.filteredItems = this.filterService.generateChips(this.locationFilterForm, this.filterColumns);
  }

  deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.locationFilterForm, this.filterColumns);
  }

  clearFilter(): void {
    this.clearFilterForm();
    this.getLocations();
  }

  applyFilter(): void {
    this.filters = this.locationFilterForm.getRawValue();
    this.filters.regionId = this.selectedRegion.id;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSizePager;
    this.filteredItems = this.filterService.generateChips(this.locationFilterForm, this.filterColumns);
    this.getLocations();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  changeRegion(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion?.id) {
      this.clearFilter();
    } else {
      this.store.dispatch(new ClearLocationList());
    }
    this.clearSelection(this.grid);
  }

  openAddRegionDialog(): void {
    this.addRegionDialog.show();
  }

  hideRegionDialog(): void {
    this.addRegionDialog.hide();
  }

  saveRegion(): void {
    if (this.regionFormGroup.valid) {
      const newRegionName = this.regionFormGroup.controls['newRegionName'].value.trim();

      this.store.dispatch(new SaveRegion({ name: newRegionName }));

      this.addRegionDialog.hide();
      this.regionFormGroup.reset();
    } else {
      this.regionFormGroup.markAsTouched();
    }
  }

  openImportDialog(): void {
    this.importDialogEvent.next(true);
  }

  openAddLocationDialog(): void {
    if (this.selectedRegion) {
      this.locationDetailsFormGroup.controls['inactiveDate'].enable();
      this.store.dispatch(new ShowSideDialog(true));
      this.getBusinessLineDataSource(null, null);
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_REGIONS_NOT_SELECTED));
    }
  }

  changeRowsPerPage(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  /**
   * TODO: remove any with correct interface
   */
  selectPage(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  editLocation(location: Location, event: Event): void {
    this.addActiveCssClass(event);

    this.locationDetailsFormGroup.setValue({
      invoiceId: location.invoiceId,
      externalId: location.externalId,
      name: location.name,
      businessLineId: location.businessLineId,
      address1: location.address1,
      address2: location.address2,
      zip: location.zip,
      city: location.city,
      state: location.state,
      glNumber: location.glNumber,
      ext: location.ext,
      contactEmail: location.contactEmail,
      contactPerson: location.contactPerson,
      inactiveDate: location.inactiveDate ? DateTimeHelper.setCurrentTimeZone(location.inactiveDate) : null,
      reactivateDate: location.reactivateDate ? DateTimeHelper.setCurrentTimeZone(location.reactivateDate) : null,
      phoneNumber: location.phoneNumber,
      phoneType: PhoneTypes[location.phoneType] || null,
      timeZone: location.timeZone,
      locationType: location.locationTypeId,
      organizationId:this.businessUnitId,
      includeInIRP: location.includeInIRP || false,
    });

    this.getBusinessLineDataSource(location.businessLineId, location.businessLine);
    this.editedLocationId = location.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
    this.inactivateDateHandler(this.locationDetailsFormGroup.controls['inactiveDate'],
    location.inactiveDate, location.reactivateDate, location.timeZone);
  }

  deleteLocation(location: Location, event: Event): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        tap(() => { this.removeActiveCssClass(); }),
        filter((confirm) => !!(confirm && location.id && this.selectedRegion.id)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.store.dispatch(new DeleteLocationById(location.id as number, this.selectedRegion.id as number, this.filters));
      });
  }

  cancelEditLocation(): void {
    if (this.locationDetailsFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter(Boolean),
          takeUntil(this.componentDestroy()),
        )
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.isEdit = false;
          this.editedLocationId = undefined;
          this.locationDetailsFormGroup.reset({ includeInIRP: false });
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedLocationId = undefined;
      this.locationDetailsFormGroup.reset({ includeInIRP: false });
      this.removeActiveCssClass();
    }
  }

  saveLocation(ignoreWarning = false): void {
    if (this.locationDetailsFormGroup.valid) {
      const inactiveDate = this.locationDetailsFormGroup.controls['inactiveDate'].value;
      const reactivateDate = this.locationDetailsFormGroup.controls['reactivateDate'].value;

      const location: Location = {
        id: this.editedLocationId,
        regionId: this.selectedRegion.id,
        invoiceId: this.locationDetailsFormGroup.controls['invoiceId'].value,
        externalId: this.locationDetailsFormGroup.controls['externalId'].value,
        name: this.locationDetailsFormGroup.controls['name'].value,
        businessLineId: this.locationDetailsFormGroup.controls['businessLineId'].value,
        address1: this.locationDetailsFormGroup.controls['address1'].value,
        address2: this.locationDetailsFormGroup.controls['address2'].value,
        zip: this.locationDetailsFormGroup.controls['zip'].value,
        city: this.locationDetailsFormGroup.controls['city'].value,
        state: this.locationDetailsFormGroup.controls['state'].value,
        glNumber: this.locationDetailsFormGroup.controls['glNumber'].value,
        ext: this.locationDetailsFormGroup.controls['ext'].value,
        contactEmail: this.locationDetailsFormGroup.controls['contactEmail'].value,
        contactPerson: this.locationDetailsFormGroup.controls['contactPerson'].value,
        inactiveDate: inactiveDate ? DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(inactiveDate)) : undefined,
        reactivateDate: reactivateDate ? DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(reactivateDate)) : undefined,
        phoneNumber: this.locationDetailsFormGroup.controls['phoneNumber'].value,
        phoneType: parseInt(PhoneTypes[this.locationDetailsFormGroup.controls['phoneType'].value]),
        timeZone: this.locationDetailsFormGroup.controls['timeZone'].value,
        locationTypeId: this.locationDetailsFormGroup.controls['locationType'].value,
        organizationId : this.businessUnitId,
        includeInIRP: this.createIrpValue(this.locationDetailsFormGroup.controls['includeInIRP'].value),
      };

      this.saveOrUpdateLocation(location, ignoreWarning);
    } else {
      this.locationDetailsFormGroup.markAllAsTouched();
    }

  }

  trackByField(index: number, item: LocationsFormConfig): string {
    return item.field;
  }

  trackByKey(index: number, item: LocationsSubFormConfig): LocationsTrackKey {
    return item.trackKey;
  }

  override updatePage(): void {
    this.getLocations();
  }

  override customExport(): void {
    this.defaultFileName = 'Organization Locations ' + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = 'Organization Locations ' + this.generateDateTime(this.datePipe);

    this.store.dispatch(new ExportLocations(new ExportPayload(
      fileType,
      { ...this.filters },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val.id) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  private inactivateDateHandler(field: AbstractControl, value: string | undefined,
    reactivateValue: string | undefined, timeZone?: string): void {
    if (value) {
      const inactiveDate = new Date(DateTimeHelper.formatDateUTC(value, 'MM/dd/yyyy'));
      const reactivateDate = reactivateValue ? new Date(DateTimeHelper.formatDateUTC(reactivateValue, 'MM/dd/yyyy')) : null;
      inactiveDate.setHours(0, 0, 0, 0);
      const nowPerTimeZone = DateTimeHelper.newDateInTimeZone(timeZone || this.DEFAULT_LOCATION_TIMEZONE);
      if (!(reactivateDate && DateTimeHelper.isDateBefore(reactivateDate, nowPerTimeZone))
      && DateTimeHelper.isDateBefore(inactiveDate, nowPerTimeZone)) {
        field.disable();
      } else {
        field.enable();
      }
    } else {
      field.enable();
    }
  }

  private watchForOrgChange(): void {
    this.organizationId$
    .pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((id) => {
      this.businessUnitId = id;
      this.getOrganization();
      this.clearFilterForm();
    });
  }

  private getLocations(): void {
    this.filters.orderBy = this.orderBy;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.store.dispatch([
      new GetLocationsByRegionId(this.selectedRegion.id as number, this.filters),
      new GetLocationFilterOptions(this.selectedRegion.id as number),
    ]);
  }

  private clearFilterForm(): void {
    this.locationFilterForm.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {
      regionId: this.selectedRegion?.id,
      pageNumber: this.currentPage,
      pageSize: this.pageSizePager,
    };
  }

  private saveOrUpdateLocation(location: Location, ignoreWarning: boolean): void {
    if (this.selectedRegion.id) {
      if (this.isEdit) {
        this.store.dispatch(new UpdateLocation(location, this.selectedRegion.id, this.filters, ignoreWarning));
        return;
      }
      this.store.dispatch(new SaveLocation(location, this.selectedRegion.id, this.filters));
    }
  }

  private createForms(): void {
    this.locationDetailsFormGroup = this.locationsService.createForm();
    this.regionFormGroup = this.locationsService.createRegionForm();
    this.locationFilterForm = this.locationsService.createFilterForm();
    this.addDatesValidation();
  }

  private addDatesValidation(): void {
    const inactiveDate = this.locationDetailsFormGroup.controls['inactiveDate'];
    const reactivateDate = this.locationDetailsFormGroup.controls['reactivateDate'];
    inactiveDate.addValidators(startDateValidator(this.locationDetailsFormGroup, 'reactivateDate'));
    reactivateDate.addValidators(endDateValidator(this.locationDetailsFormGroup, 'inactiveDate'));
    inactiveDate.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe(() =>
      reactivateDate.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
    reactivateDate.valueChanges.pipe(takeUntil(this.componentDestroy())).subscribe(() =>
      inactiveDate.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
  }

  private getBusinessLineDataSource(id: number | null, line: string | null | undefined): void {
    this.businessLines$
      .pipe(
        map((businessLines) => {
          /**
           * TODO: move to helper function
           */
          if (id && businessLines.find((item) => item.id === id)) {
            return businessLines;
          } else {
            return id && line ? [{ id, line }, ...businessLines] : businessLines;
          }
        }),
        map((lines) => {
          return lines.map((line) => ({ text: line.line, value: line.id }));
        }),
        take(1),
      )
      .subscribe((data) => {
        this.formSourcesMap.businessLineData = data;
      });
  }

  private watchForPageChange(): void {
    this.pageSubject
    .pipe(
      throttleTime(1),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((page: number) => {
      this.currentPage = page;
      this.getLocations();
    });
  }

  private watchForLocationUpdate(): void {
    this.action$.pipe(ofActionDispatched(SaveLocationSucceeded), takeUntil(this.componentDestroy())).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.locationDetailsFormGroup.reset({ includeInIRP: false });
      if (this.isEdit) {
        this.isEdit = false;
        this.editedLocationId = undefined;
      }
    });
    this.action$.pipe(ofActionDispatched(SaveLocationConfirm), takeUntil(this.componentDestroy())).subscribe(() => {
      this.confirmService
      .confirm('Location has active orders past the inactivation date. Do you want to proceed?', {
        title: 'Confirmation',
        okButtonLabel: 'Yes',
        cancelButtonLabel: 'No',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.saveLocation(true);
      });
    });
  }

  private populateFilterOptions(): void {
    this.locationFilterOptions$
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((options) => {
      this.filterColumns.externalIds.dataSource = options.externalIds;
      this.filterColumns.invoiceIds.dataSource = options.ivnoiceIds;
      this.filterColumns.names.dataSource = options.locationNames;
      this.filterColumns.addresses1.dataSource = options.addresses1;
      this.filterColumns.cities.dataSource = options.cities;
      this.filterColumns.states.dataSource = options.states;
      this.filterColumns.zipCodes.dataSource = options.zipCodes;
      this.filterColumns.contactPeople.dataSource = options.contactPersons;
      this.filterColumns.includeInIRP.dataSource = options.includeInIRP.map((item) => (
        { text: item.optionText, value: item.option }
        ));
    });
  }

  private getOrganization(): void {
    this.store.dispatch(new GetOrganizationById(
      this.businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number
    ));
  }

  private watchForOrganizations(): void {
    this.organization$
    .pipe(
      filter(Boolean),
      delay(100),
      tap((organization) => {
        this.store.dispatch(new SetGeneralStatesByCountry(organization.generalInformation.country));
        if (this.isFeatureIrpEnabled) {
          this.isOrgVMSEnabled = !!organization.preferences.isVMCEnabled;
          this.isOrgIrpEnabled = !!organization.preferences.isIRPEnabled;
          this.columnsToExport = this.isOrgIrpEnabled ? LocationsExportIrpColumns : LocationExportColumns;

          this.filterExportColumns();
          this.checkFieldsVisibility();
        }

        this.grid.getColumnByField('includeInIRPText').visible =
          this.isFeatureIrpEnabled && this.isOrgIrpEnabled && this.isOrgVMSEnabled;
        this.grid.getColumnByField('invoiceId').visible = this.isOrgVMSEnabled || !this.isFeatureIrpEnabled;
        this.grid.refreshColumns();
      }),
      concatMap(() => this.store.dispatch(new GetRegions())),
      tap((data) => {
        this.defaultValue = data.organizationManagement.regions[0]?.id as Region;
        this.selectedRegion = data.organizationManagement.regions[0];

      }),
      filter(() => !!this.selectedRegion),
      tap(() => { this.getLocations(); }),
      takeUntil(this.componentDestroy()),
    ).subscribe();
  }

  private populateFormOptions(): void {
    combineLatest([
      this.locationTypes$,
      this.timeZoneIds$,
      this.statesGeneral$,
      this.phoneTypes$,
    ])
    .pipe(
      map(([locationTypes, timeZones, states, phoneTypes]) => {
        const locationOpts: DropdownOption[] = locationTypes
        .map((type) => ({ text: type.name, value: type.locationTypeId }));

        const zoneOpts: DropdownOption[] = timeZones
        .map((zone) => ({ text: zone.systemTimeZoneName, value: zone.timeZoneId }));

        return [locationOpts, zoneOpts, states, phoneTypes] as [DropdownOption[], DropdownOption[], string[], string[]];
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(([locationTypes, timeZones, states, phoneTypes]) => {
      this.formSourcesMap.locationTypes = locationTypes;
      this.formSourcesMap.timeZoneIds = timeZones;
      this.formSourcesMap.states = states;
      this.formSourcesMap.phoneType = phoneTypes;
    });
  }

  private setIrpFeatureFlag(): void {
    this.isFeatureIrpEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);

    if (this.isFeatureIrpEnabled) {
      /**
       * TODO: investigate why constant changes are not delted after org list navigation.
       */
      this.locationDialogConfig = JSON.parse(JSON.stringify(LocationsDialogWithIrpConfig));
    }
  }

  private checkFieldsVisibility(): void {
    this.locationDialogConfig.baseForm = LocationsDialogWithIrpConfig.baseForm
    .filter((column) => {
      if (!this.isOrgVMSEnabled && !FieldsToHideInVms.includes(column.field)) {
        return !FieldsToHideInIrp.includes(column.field);
      }

      if (!this.isOrgIrpEnabled || (this.isOrgIrpEnabled && !this.isOrgVMSEnabled)) {
        return !FieldsToHideInVms.includes(column.field);
      }

      return column;
    });
  }

  private filterExportColumns(): void {
    this.columnsToExport = this.columnsToExport
    .filter((column) => {
      if (!this.isOrgVMSEnabled && !ExportImportColumnsToHideInVms.includes(column.column)) {
        return !ExportImportColumnsToHideInIrp.includes(column.column);
      }

      if (!(this.isOrgIrpEnabled && this.isOrgVMSEnabled)) {
        return !ExportImportColumnsToHideInVms.includes(column.column);
      }

      return column;
    });
  }

  private createIrpValue(value: boolean): boolean {
    if (this.isOrgIrpEnabled && !this.isOrgVMSEnabled) {
      return true;
    }

    if (this.isOrgIrpEnabled && this.isOrgVMSEnabled) {
      return value;
    }

    return false;
  }
}
