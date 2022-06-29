import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FreezeService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { Department, DepartmentFilter, DepartmentFilterOptions, DepartmentsPage } from '../../shared/models/department.model';
import {
  SaveDepartment,
  GetDepartmentsByLocationId,
  DeleteDepartmentById,
  GetRegions,
  UpdateDepartment,
  GetLocationsByRegionId,
  SetImportFileDialogState,
  ExportDepartments,
  ClearLocationList,
  ClearDepartmentList,
  GetDepartmentFilterOptions,
} from '../store/organization-management.actions';
import { Region } from '../../shared/models/region.model';
import { Location } from '../../shared/models/location.model';
import { OrganizationManagementState } from '../store/organization-management.state';
import { MessageTypes } from '../../shared/enums/message-types';
import { AbstractGridConfigurationComponent } from '../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_COFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED,
  RECORD_MODIFIED
} from '../../shared/constants/messages';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { UserState } from 'src/app/store/user.state';
import { FilterService } from '@shared/services/filter.service';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilteredItem } from '@shared/models/filter.model';

export const MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED = 'Region or Location were not selected';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  providers: [MaskedDateTimeService, FreezeService],
})
export class DepartmentsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  // department form data
  departmentsDetailsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.departments)
  departments$: Observable<DepartmentsPage>;

  @Select(OrganizationManagementState.departmentFilterOptions)
  departmentFilterOptions$: Observable<DepartmentFilterOptions>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocation: Location;

  editedDepartmentId?: number;
  isEdit: boolean;

  public columnsToExport: ExportColumn[] = [
    { text:'Ext Department ID', column: 'ExtDepartmentId'},
    { text:'Invoice Department ID', column: 'InvoiceDepartmentId'},
    { text:'Department Name', column: 'DepartmentName'},
    { text:'Facility Email', column: 'FacilityEmail'},
    { text:'Facility Contact', column: 'FacilityContact'},
    { text:'Facility Phone NO', column: 'FacilityPhoneNo'},
    { text:'Inactivate Date', column: 'InactiveDate'}
  ];
  public fileName: string;
  public defaultFileName: string;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  public DepartmentFilterFormGroup: FormGroup;
  public filters: DepartmentFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager
  };
  public filterColumns: any;
  public orgStructure: OrganizationStructure;
  public regions: OrganizationRegion[] = [];

  private pageSubject = new Subject<number>();

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private filterService: FilterService) {
    super();
    this.formBuilder = builder;
    this.idFieldName = 'departmentId';
    this.createDepartmentsForm();
  }

  ngOnInit(): void {
    this.filterColumns = {
      externalIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      invoiceIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      departmentNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: []},
      facilityContacts: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      facilityEmails: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      inactiveDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    }
    this.departmentFilterOptions$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(options => {
      this.filterColumns.externalIds.dataSource = options.externalIds;
      this.filterColumns.invoiceIds.dataSource = options.ivnoiceIds;
      this.filterColumns.departmentNames.dataSource = options.departmentNames;
      this.filterColumns.facilityContacts.dataSource = options.facilityContacts;
      this.filterColumns.facilityEmails.dataSource = options.facilityEmails;
    });
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getDepartments();
    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.store.dispatch(new GetRegions());
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
  }

  public override updatePage(): void {
    this.getDepartments();
  }

  private getDepartments(): void {
    this.filters.locationId = this.selectedLocation.id;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.filters.orderBy = this.orderBy;
    this.store.dispatch([
      new GetDepartmentsByLocationId(this.selectedLocation.id, this.filters),
      new GetDepartmentFilterOptions(this.selectedLocation.id as number)
    ]);
  }

  public onFilterClose() {
    this.DepartmentFilterFormGroup.setValue({
      externalIds: this.filters.externalIds || [],
      invoiceIds: this.filters.invoiceIds || [],
      departmentNames: this.filters.departmentNames || [],
      facilityContacts: this.filters.facilityContacts || [],
      facilityEmails: this.filters.facilityEmails || [],
      inactiveDate: this.filters.inactiveDate || null,
    });
    this.filteredItems = this.filterService.generateChips(this.DepartmentFilterFormGroup, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.DepartmentFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.DepartmentFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.getDepartments();
  }

  public onFilterApply(): void {
    this.filters = this.DepartmentFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.DepartmentFilterFormGroup, this.filterColumns, this.datePipe);
    this.getDepartments();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization Departments ' + this.generateDateTime(this.datePipe);
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
    this.defaultFileName = 'Organization Departments ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportDepartments(new ExportPayload(
      fileType,
      { ...this.filters, offset: Math.abs(new Date().getTimezoneOffset()) },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion?.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
      this.isLocationsDropDownEnabled = true;
    } else {
      this.store.dispatch(new ClearLocationList());
      this.store.dispatch(new ClearDepartmentList());
    }
    this.clearSelection(this.grid);
  }

  onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedLocation = event.itemData as Location;
    if (this.selectedLocation?.id) {
      this.getDepartments();
      this.clearSelection(this.grid);
    }
  }

  formatPhoneNumber(field: string, department: Department): string {
    // @ts-ignore
    return department[field].toString().length === 10 ? department[field].replace(/^(\d{3})(\d{3})(\d{4}).*/, '$1-$2-$3') : department[field];
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

  onEditDepartmentClick(department: Department, event: any ): void {
    this.addActiveCssClass(event);
    this.departmentsDetailsFormGroup.setValue({
      extDepartmentId: department.extDepartmentId,
      invoiceDepartmentId: department.invoiceDepartmentId,
      departmentName: department.departmentName,
      facilityContact: department.facilityContact,
      facilityEmail: department.facilityEmail,
      facilityPhoneNo: department.facilityPhoneNo,
      inactiveDate: department.inactiveDate
    });
    this.editedDepartmentId = department.departmentId;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveDepartmentClick(department: Department, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && department.departmentId) {
          this.store.dispatch(new DeleteDepartmentById(department));
        }
        this.removeActiveCssClass();
      });
  }

  onAddDepartmentClick(): void {
    if (this.selectedLocation && this.selectedRegion) {
      this.store.dispatch(new ShowSideDialog(true));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED));
    }
  }

  onDepartmentFormCancelClick(): void {
    if (this.departmentsDetailsFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.isEdit = false;
          this.editedDepartmentId = undefined;
          this.departmentsDetailsFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedDepartmentId = undefined;
      this.departmentsDetailsFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  onDepartmentFormSaveClick(): void {
    if (this.departmentsDetailsFormGroup.valid) {
      const department: Department = {
        departmentId: this.editedDepartmentId,
        locationId: this.selectedLocation.id,
        extDepartmentId: this.departmentsDetailsFormGroup.controls['extDepartmentId'].value,
        invoiceDepartmentId: this.departmentsDetailsFormGroup.controls['invoiceDepartmentId'].value,
        departmentName: this.departmentsDetailsFormGroup.controls['departmentName'].value,
        inactiveDate: this.departmentsDetailsFormGroup.controls['inactiveDate'].value,
        facilityPhoneNo: this.departmentsDetailsFormGroup.controls['facilityPhoneNo'].value,
        facilityEmail: this.departmentsDetailsFormGroup.controls['facilityEmail'].value,
        facilityContact: this.departmentsDetailsFormGroup.controls['facilityContact'].value
      }

      this.saveOrUpdateDepartment(department);

      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.departmentsDetailsFormGroup.reset();
    } else {
      this.departmentsDetailsFormGroup.markAllAsTouched();
    }
  }

  private saveOrUpdateDepartment(department: Department): void {
    if (this.isEdit) {
      this.store.dispatch(new UpdateDepartment(department, this.filters));
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      this.isEdit = false;
      this.editedDepartmentId = undefined;
    } else {
      this.store.dispatch(new SaveDepartment(department, this.filters));
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
    }
  }

  onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  private createDepartmentsForm(): void {
    this.departmentsDetailsFormGroup = this.formBuilder.group({
      extDepartmentId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      invoiceDepartmentId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      departmentName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      facilityContact: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      facilityEmail: ['', [Validators.required, Validators.email]],
      facilityPhoneNo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(/^\d+$/i)]],
      inactiveDate: [null]
    });
    this.DepartmentFilterFormGroup = this.formBuilder.group({
      externalIds: new FormControl([]),
      invoiceIds: new FormControl([]),
      departmentNames: new FormControl([]),
      facilityContacts: new FormControl([]),
      facilityEmails: new FormControl([]),
      inactiveDate: new FormControl(null),
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
