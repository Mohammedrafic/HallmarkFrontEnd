import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil, throttleTime ,take} from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationManagementState } from '../store/organization-management.state';
import { Region, regionFilter } from '@shared/models/region.model';
import {
  ClearLocationList,
  DeleteLocationById,
  ExportLocations,
  GetLocationFilterOptions,
  GetLocationsByRegionId,
  GetOrganizationById,
  GetRegions,
  SaveLocation, SaveRegion, SetGeneralStatesByCountry,DeleteRegionById,
  SetImportFileDialogState,
  UpdateLocation,
  UpdateRegion
} from '../store/organization-management.actions';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { Location, LocationFilter, LocationFilterOptions, LocationsPage } from '@shared/models/location.model';

import { PhoneTypes } from '@shared/enums/phone-types';
import {
  CANCEL_CONFIRM_TEXT,
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
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.scss']
})
export class RegionsComponent extends AbstractGridConfigurationComponent  implements OnInit ,OnDestroy{

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;
  @ViewChild('addRegionDialog') addRegionDialog: DialogComponent;

  @Select(OrganizationManagementState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(OrganizationManagementState.phoneTypes)
  phoneTypes$: Observable<FieldSettingsModel[]>;

  @Select(OrganizationManagementState.regions)

  defaultValue:any;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;

  regionFormGroup: FormGroup;

  formBuilder: FormBuilder;

  @Select(OrganizationManagementState.organization)
  organization$: Observable<Organization>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.locationFilterOptions)
  locationFilterOptions$: Observable<LocationFilterOptions>;

  isEdit: boolean;
  editedRegionId?: number;

  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

  selectedRegion: any;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  public columnsToExport: ExportColumn[] = [
    { text:'Region', column: 'name'},
    { text:'Id', column: 'id'},

  ];
  public fileName: string;
  public defaultFileName: string;
  private businessUnitId: number;
  public regionFilterFormGroup: FormGroup;
  public filters: regionFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager
  };
  public filterColumns: any;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private filterService: FilterService
              ) {
    super();

    this.formBuilder = builder;
    this.createLocationForm();
  }

  ngOnInit(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
     this.getRegions();

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
      this.clearFilters();
    });
    this.organization$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(organization => {
      this.store.dispatch(new SetGeneralStatesByCountry(organization.generalInformation.country));
      this.store.dispatch(new GetRegions()).pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.defaultValue=data.organizationManagement.regions[0].id;
      });;
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

  private getRegions() {

    this.store.dispatch(new GetRegions())
  }

  public override updatePage(): void {
    this.getRegions();
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
    this.regionFilterFormGroup.setValue({
      names: this.filters.name || [],
      id: this.filters.id || [],

    });

  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.regionFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.regionFilterFormGroup.reset();
    // this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {

      pageNumber: this.currentPage,
      pageSize: this.pageSizePager
    };
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.getRegions();
  }

  public onFilterApply(): void {
    this.filters = this.regionFilterFormGroup.getRawValue();

    this.filters.pageNumber = this.currentPage,
    this.filters.pageSize = this.pageSizePager
    this.getRegions();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion?.id) {
      this.onFilterClearAll();
    } else {
      this.store.dispatch(new ClearLocationList());
    }

  }

  onAddRegionClick(): void {
      this.store.dispatch(new ShowSideDialog(true));
  }

  hideDialog(): void {
    this.addRegionDialog.hide();
  }



  onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  onAddDepartmentClick(): void {

    this.store.dispatch(new ShowSideDialog(true));

  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  onEditButtonClick(region: Region, event: any): void {
    this.addActiveCssClass(event);
    this.regionFormGroup.setValue({
      id: region?.id,
      region: region?.name,


    });
    this.editedRegionId = region?.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveButtonClick(region: Region, event: any): void {
    this.addActiveCssClass(event);
    debugger;
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && region.id ) {
          this.store.dispatch(new DeleteRegionById(region.id));
          this.regionFormGroup.reset();
        }
        this.removeActiveCssClass();
      });
  }

  onFormCancelClick(): void {
    if (this.regionFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.isEdit = false;
          this.editedRegionId = undefined;
          this.regionFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedRegionId = undefined;
      this.regionFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  onFormSaveClick(): void {
      const Region: Region = {
     id: this.editedRegionId,

        name: this.regionFormGroup.controls['region'].value,

      }

      this.saveOrUpdateRegion(Region);

      this.store.dispatch(new ShowSideDialog(false));
      this.regionFormGroup.reset();
      this.removeActiveCssClass();

  }


  private saveOrUpdateRegion(Region: Region): void {

      if (this.isEdit) {
        this.store.dispatch(new UpdateRegion(Region));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        this.isEdit = false;
        this.editedRegionId = undefined;
        return;
      }
      this.store.dispatch(new SaveRegion(Region));
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));

  }

  onAllowDeployWOCreadentialsCheck(event: any): void {

  }

  private createLocationForm(): void {
    this.regionFormGroup = this.formBuilder.group({
      id: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      region: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],

    });


    this.regionFilterFormGroup = this.formBuilder.group({
     region:[[]]
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
