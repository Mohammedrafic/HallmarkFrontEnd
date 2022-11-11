import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { tap } from 'rxjs/operators';
import { filter, map, Observable, Subject, take, takeUntil, throttleTime, switchMap, merge, combineLatest } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { MessageTypes } from '@shared/enums/message-types';
import { Location, LocationFilter, LocationFilterOptions, LocationsPage, LocationType, TimeZoneModel } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import {
  ClearLocationList,
  DeleteLocationById,
  ExportLocations,
  GetLocationFilterOptions,
  GetLocationsByRegionId, GetLocationTypes, GetOrganizationById,
  GetRegions, GetUSCanadaTimeZoneIds, SaveLocation,
  SaveRegion,
  SetGeneralStatesByCountry,
  UpdateLocation
} from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';

import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE
} from '@shared/constants';
import { PhoneTypes } from '@shared/enums/phone-types';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { Organization } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { UserState } from '../../store/user.state';
import { GetAllBusinessLines } from '@organization-management/store/business-lines.action';
import { BusinessLinesState } from '@organization-management/store/business-lines.state';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BusinessLines } from '@shared/models/business-line.model';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { LocationExportColumns, LocationInitFilters, LocationsDialogConfig, MESSAGE_REGIONS_NOT_SELECTED } from './locations.constant';
import { LocationsService } from './locations.service';
import { TakeUntilDestroy } from '@core/decorators';
import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { LocationsFormSource } from './locations.interface';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  providers: [MaskedDateTimeService],
})
@TakeUntilDestroy
export class LocationsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
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
  
  public timeZoneOptionFields: FieldSettingsModel = { text: 'systemTimeZoneName', value: 'timeZoneId' };
  public locationTypeOptionFields:FieldSettingsModel = { text: 'name', value: 'locationTypeId' };
  public regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public locationDetailsFormGroup: FormGroup;
  public regionFormGroup: FormGroup;
  public selectedRegion: Region;
  public defaultValue: Region;
  public businessLineDataSource: DropdownOption[] = [];
  public readonly businessLineFields = { text: 'line', value: 'id' };
  public columnsToExport: ExportColumn[] = LocationExportColumns;
  public fileName: string;
  public defaultFileName: string;
  public locationFilterForm: FormGroup;
  public filters: LocationFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager
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

  private businessUnitId: number;
  private pageSubject = new Subject<number>();
  private componentDestroy: () => Observable<unknown>;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit Location' : 'Add Location';
  }

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private locationsService: LocationsService,
  ) {
    super();
    this.createForms();
  }

  ngOnInit(): void {
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
    this.filters.regionId = this.selectedRegion.id,
    this.filters.pageNumber = this.currentPage,
    this.filters.pageSize = this.pageSizePager
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
      inactiveDate: location.inactiveDate,
      phoneNumber: location.phoneNumber,
      phoneType: PhoneTypes[location.phoneType] || null,
      timeZone: location.timeZone,
      locationType: location.locationTypeId,
      organizationId :this.businessUnitId
    });

    this.getBusinessLineDataSource(location.businessLineId, location.businessLine);
    this.editedLocationId = location.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  deleteLocation(location: Location, event: Event): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
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
          okButtonClass: 'delete-button'
        })
        .pipe(
          filter((confirm) => !!confirm),
          takeUntil(this.componentDestroy()),
        )
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.isEdit = false;
          this.editedLocationId = undefined;
          this.locationDetailsFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedLocationId = undefined;
      this.locationDetailsFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  saveLocation(): void {
    if (this.locationDetailsFormGroup.valid) {
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
        inactiveDate: this.locationDetailsFormGroup.controls['inactiveDate'].value,
        phoneNumber: this.locationDetailsFormGroup.controls['phoneNumber'].value,
        phoneType: parseInt(PhoneTypes[this.locationDetailsFormGroup.controls['phoneType'].value]),
        timeZone: this.locationDetailsFormGroup.controls['timeZone'].value,
        locationTypeId: this.locationDetailsFormGroup.controls['locationType'].value,
        organizationId : this.businessUnitId
      }

      this.saveOrUpdateLocation(location);

      this.store.dispatch(new ShowSideDialog(false));
      this.locationDetailsFormGroup.reset();
      this.removeActiveCssClass();
    } else {
      this.locationDetailsFormGroup.markAllAsTouched();
    }
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
      pageSize: this.pageSizePager
    };
  }

  private saveOrUpdateLocation(location: Location): void {
    if (this.selectedRegion.id) {
      if (this.isEdit) {
      this.store.dispatch(new UpdateLocation(location, this.selectedRegion.id, this.filters));
        this.isEdit = false;
        this.editedLocationId = undefined;
        return;
      }
      this.store.dispatch(new SaveLocation(location, this.selectedRegion.id, this.filters));
    }
  }

  private createForms(): void {
    this.locationDetailsFormGroup = this.locationsService.createForm();
    this.regionFormGroup = this.locationsService.createRegionForm();
    this.locationFilterForm = this.locationsService.createFilterForm();
  }

  private getBusinessLineDataSource(id: number | null, line: string | null | undefined): void {
    this.businessLines$
      .pipe(
        map((businessLines) => {
          if (id && businessLines.find((item) => item.id === id)) {
            return businessLines;
          } else {
            return id && line ? [{ id, line }, ...businessLines] : businessLines
          }
        }),
        map((lines) => {
          return lines.map((line) => ({ text: line.line, value: line.id }))
        }),
        take(1),
      )
      .subscribe((data) => {
        this.formSourcesMap['businessLineData'] = data;
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

  private populateFilterOptions(): void {
    this.locationFilterOptions$
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(options => {
      this.filterColumns.externalIds.dataSource = options.externalIds;
      this.filterColumns.invoiceIds.dataSource = options.ivnoiceIds;
      this.filterColumns.names.dataSource = options.locationNames;
      this.filterColumns.addresses1.dataSource = options.addresses1;
      this.filterColumns.cities.dataSource = options.cities;
      this.filterColumns.states.dataSource = options.states;
      this.filterColumns.zipCodes.dataSource = options.zipCodes;
      this.filterColumns.contactPeople.dataSource = options.contactPersons;
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
      tap((organization) => {
        this.store.dispatch(new SetGeneralStatesByCountry(organization.generalInformation.country));
      }),
      switchMap(() => this.store.dispatch(new GetRegions())),
      takeUntil(this.componentDestroy()),
    ).subscribe((data) => {
      this.defaultValue = data.organizationManagement.regions[0]?.id as Region;
    });
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
}
