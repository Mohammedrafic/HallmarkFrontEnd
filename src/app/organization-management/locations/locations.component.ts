import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Actions, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FreezeService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationManagementState } from '../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import {
  ClearLocationList,
  DeleteLocationById,
  ExportLocations,
  GetLocationFilterOptions,
  GetLocationsByRegionId,
  GetOrganizationById,
  GetRegions,
  SaveLocation, SaveRegion, SetGeneralStatesByCountry,
  SetImportFileDialogState,
  UpdateLocation
} from '../store/organization-management.actions';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { Location, LocationFilter, LocationFilterOptions, LocationsPage } from '@shared/models/location.model';

import { PhoneTypes } from '@shared/enums/phone-types';
import {
  CANCEL_COFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED,
  RECORD_MODIFIED
} from '@shared/constants';
import { Organization } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { UserState } from '../../store/user.state';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

export const MESSAGE_REGIONS_NOT_SELECTED = 'Region was not selected';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  providers: [MaskedDateTimeService, FreezeService],
})
export class LocationsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;
  @ViewChild('addRegionDialog') addRegionDialog: DialogComponent;

  @Select(OrganizationManagementState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(OrganizationManagementState.phoneTypes)
  phoneTypes$: Observable<FieldSettingsModel[]>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<LocationsPage>;

  locationDetailsFormGroup: FormGroup;
  regionFormGroup: FormGroup;
  formBuilder: FormBuilder;

  @Select(OrganizationManagementState.organization)
  organization$: Observable<Organization>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.locationFilterOptions)
  locationFilterOptions$: Observable<LocationFilterOptions>;

  isEdit: boolean;
  editedLocationId?: number;

  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  public columnsToExport: ExportColumn[] = [
    { text:'Ext Location ID', column: 'ExternalId'},
    { text:'Invoice Location ID', column: 'InvoiceId'},
    { text:'Location Name', column: 'Name'},
    { text:'Address 1', column: 'Address1'},
    { text:'Address 2', column: 'Address2'},
    { text:'City', column: 'City'},
    { text:'State', column: 'State'},
    { text:'Zip', column: 'Zip'},
    { text:'Contact Person', column: 'ContactPerson'}
  ];
  public fileName: string;
  public defaultFileName: string;
  private businessUnitId: number;
  public LocationFilterFormGroup: FormGroup;
  public filters: LocationFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager
  };
  public filterColumns: any;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private filterService: FilterService) {
    super();

    this.formBuilder = builder;
    this.createLocationForm();
  }

  ngOnInit(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getLocations();
    });
    this.filterColumns = {
      externalIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      invoiceIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      names: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      addresses1: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      cities: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      states: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      zipCodes: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      contactPeople: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
    }
    this.locationFilterOptions$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(options => {
      this.filterColumns.externalIds.dataSource = options.externalIds;
      this.filterColumns.invoiceIds.dataSource = options.ivnoiceIds;
      this.filterColumns.names.dataSource = options.locationNames;
      this.filterColumns.addresses1.dataSource = options.addresses1;
      this.filterColumns.cities.dataSource = options.cities;
      this.filterColumns.states.dataSource = options.states;
      this.filterColumns.zipCodes.dataSource = options.zipCodes;
      this.filterColumns.contactPeople.dataSource = options.contactPersons;
    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.businessUnitId = id;
      this.getOrganization();
    });
    this.organization$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(organization => {
      this.store.dispatch(new SetGeneralStatesByCountry(organization.generalInformation.country));
      this.store.dispatch(new GetRegions());
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new ClearLocationList());
  }

  private getOrganization() {
    if (this.businessUnitId) {
      this.store.dispatch(new GetOrganizationById(this.businessUnitId));
    } else {
      this.store.dispatch(new GetOrganizationById(this.store.selectSnapshot(UserState.user)?.businessUnitId as number));
    }
  }

  private getLocations() {
    this.filters.orderBy = this.orderBy;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.store.dispatch([
      new GetLocationsByRegionId(this.selectedRegion.id as number, this.filters),
      new GetLocationFilterOptions(this.selectedRegion.id as number)
    ]);
  }

  public override updatePage(): void {
    this.getLocations();
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization Locations ' + this.generateDateTime(this.datePipe);
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

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterClose() {
    this.LocationFilterFormGroup.setValue({
      externalIds: this.filters.externalIds || [],
      invoiceIds: this.filters.invoiceIds || [],
      names: this.filters.names || [],
      addresses1: this.filters.addresses1 || [],
      cities: this.filters.cities || [],
      states: this.filters.states || [],
      zipCodes: this.filters.zipCodes || [],
      contactPeople: this.filters.contactPeople || [],
    });
    this.filteredItems = this.filterService.generateChips(this.LocationFilterFormGroup, this.filterColumns);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.LocationFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.LocationFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {
      regionId: this.selectedRegion.id,
      pageNumber: this.currentPage,
      pageSize: this.pageSizePager
    };
    this.getLocations();
  }
  
  public onFilterApply(): void {
    this.filters = this.LocationFilterFormGroup.getRawValue();
    this.filters.regionId = this.selectedRegion.id,
    this.filters.pageNumber = this.currentPage,
    this.filters.pageSize = this.pageSizePager
    this.filteredItems = this.filterService.generateChips(this.LocationFilterFormGroup, this.filterColumns);
    this.getLocations();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion?.id) {
      this.onFilterClearAll();
    } else {
      this.store.dispatch(new ClearLocationList());
    }
    this.clearSelection(this.grid);
  }

  onAddRegionClick(): void {
    this.addRegionDialog.show();
  }

  hideDialog(): void {
    this.addRegionDialog.hide();
  }

  onOkDialogClick(): void {
    if (this.regionFormGroup.valid) {
      let newRegionName = this.regionFormGroup.controls['newRegionName'].value.trim();
      this.store.dispatch(new SaveRegion({ name: newRegionName }));
      this.addRegionDialog.hide();
      this.regionFormGroup.reset();
    } else {
      this.regionFormGroup.markAsTouched();
    }
  }

  onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  onAddDepartmentClick(): void {
    if (this.selectedRegion) {
      this.store.dispatch(new ShowSideDialog(true));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_REGIONS_NOT_SELECTED));
    }
  }

  onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  onEditButtonClick(location: Location, event: any): void {
    this.addActiveCssClass(event);
    this.locationDetailsFormGroup.setValue({
      invoiceId: location.invoiceId,
      externalId: location.externalId,
      name: location.name,
      address1: location.address1,
      address2: location.address2,
      zip: location.zip,
      city: location.city,
      state: location.state,
      glNumber: location.glNumber,
      ext: location.ext,
      invoiceNote: location.invoiceNote,
      contactEmail: location.contactEmail,
      contactPerson: location.contactPerson,
      inactiveDate: location.inactiveDate,
      phoneNumber: location.phoneNumber,
      phoneType: PhoneTypes[location.phoneType]
    });
    this.editedLocationId = location.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveButtonClick(location: Location, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && location.id && this.selectedRegion.id) {
          this.store.dispatch(new DeleteLocationById(location.id, this.selectedRegion.id));
        }
        this.removeActiveCssClass();
      });
  }

  onFormCancelClick(): void {
    if (this.locationDetailsFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
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

  onFormSaveClick(): void {
    if (this.locationDetailsFormGroup.valid) {
      const location: Location = {
        id: this.editedLocationId,
        regionId: this.selectedRegion.id,
        invoiceId: this.locationDetailsFormGroup.controls['invoiceId'].value,
        externalId: this.locationDetailsFormGroup.controls['externalId'].value,
        name: this.locationDetailsFormGroup.controls['name'].value,
        address1: this.locationDetailsFormGroup.controls['address1'].value,
        address2: this.locationDetailsFormGroup.controls['address2'].value,
        zip: this.locationDetailsFormGroup.controls['zip'].value,
        city: this.locationDetailsFormGroup.controls['city'].value,
        state: this.locationDetailsFormGroup.controls['state'].value,
        glNumber: this.locationDetailsFormGroup.controls['glNumber'].value,
        ext: this.locationDetailsFormGroup.controls['ext'].value,
        invoiceNote: this.locationDetailsFormGroup.controls['invoiceNote'].value,
        contactEmail: this.locationDetailsFormGroup.controls['contactEmail'].value,
        contactPerson: this.locationDetailsFormGroup.controls['contactPerson'].value,
        inactiveDate: this.locationDetailsFormGroup.controls['inactiveDate'].value,
        phoneNumber: this.locationDetailsFormGroup.controls['phoneNumber'].value,
        phoneType: parseInt(PhoneTypes[this.locationDetailsFormGroup.controls['phoneType'].value]),
      }

      this.saveOrUpdateLocation(location);

      this.store.dispatch(new ShowSideDialog(false));
      this.locationDetailsFormGroup.reset();
      this.removeActiveCssClass();
    } else {
      this.locationDetailsFormGroup.markAllAsTouched();
    }
  }

  private saveOrUpdateLocation(location: Location): void {
    if (this.selectedRegion.id) {
      if (this.isEdit) {
        this.store.dispatch(new UpdateLocation(location, this.selectedRegion.id));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        this.isEdit = false;
        this.editedLocationId = undefined;
        return;
      }
      this.store.dispatch(new SaveLocation(location, this.selectedRegion.id));
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
    }
  }

  onAllowDeployWOCreadentialsCheck(event: any): void {
  //  TODO: add functionality after BE implementation
  }

  private createLocationForm(): void {
    this.locationDetailsFormGroup = this.formBuilder.group({
      invoiceId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      externalId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      address1: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      address2: [null, [Validators.maxLength(50)]],
      zip: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern('^[0-9]*$')]],
      city: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      state: ['', [Validators.required]],
      glNumber: [null, Validators.maxLength(50)],
      invoiceNote: [null, Validators.maxLength(50)],
      ext: [null, Validators.maxLength(50)],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPerson: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      inactiveDate: [null],
      phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      phoneType: ['', Validators.required],
    });

    this.regionFormGroup = this.formBuilder.group({
      newRegionName: ['', [Validators.required,  Validators.minLength(1),  Validators.maxLength(50)]]
    });

    this.LocationFilterFormGroup = this.formBuilder.group({
      externalIds: [[]],
      invoiceIds: [[]],
      names: [[]],
      addresses1: [[]],
      cities: [[]],
      states: [[]],
      zipCodes: [[]],
      contactPeople: [[]]
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
