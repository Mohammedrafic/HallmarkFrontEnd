import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { Department, DepartmentFilter, DepartmentFilterOptions, DepartmentsPage } from '@shared/models/department.model';
import {
  SaveDepartment,
  GetDepartmentsByLocationId,
  DeleteDepartmentById,
  GetRegions,
  UpdateDepartment,
  GetLocationsByRegionId,
  ExportDepartments,
  ClearLocationList,
  ClearDepartmentList,
  GetDepartmentFilterOptions, GetOrganizationById
} from '../store/organization-management.actions';
import { Region } from '@shared/models/region.model';
import { Location } from '@shared/models/location.model';
import { OrganizationManagementState } from '../store/organization-management.state';
import { MessageTypes } from '@shared/enums/message-types';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED,
  RECORD_MODIFIED
} from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { UserState } from 'src/app/store/user.state';
import { FilterService } from '@shared/services/filter.service';
import { OrganizationRegion } from '@shared/models/organization.model';
import { FilterColumnsModel, FilteredItem } from '@shared/models/filter.model';
import { DepartmentService } from '@organization-management/departments/services/department.service';
import { TakeUntilDestroy } from '@core/decorators';
import { AppState } from '../../store/app.state';
import { DepartmentsExportCols } from '@organization-management/departments/constants';
import { DepartmentsAdapter } from '@organization-management/departments/adapters/departments.adapter';

export const MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED = 'Region or Location were not selected';

@TakeUntilDestroy
@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  providers: [MaskedDateTimeService],
})
export class DepartmentsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Select(OrganizationManagementState.departments)
  public departments$: Observable<DepartmentsPage>;

  @Select(OrganizationManagementState.departmentFilterOptions)
  private departmentFilterOptions$: Observable<DepartmentFilterOptions>;

  @Select(OrganizationManagementState.sortedRegions)
  public regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.sortedLocationsByRegionId)
  public locations$: Observable<Location[]>;

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  departmentsDetailsFormGroup: FormGroup;
  fieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  irpFieldsSettings: FieldSettingsModel = { text: 'text', value: 'value' };
  defaultValue: any;
  isLocationsDropDownEnabled: boolean = false;
  columnsToExport: ExportColumn[];
  fileName: string;
  defaultLocationValue: any;
  DepartmentFilterFormGroup: FormGroup;
  filterColumns: FilterColumnsModel;
  importDialogEvent: Subject<boolean> = new Subject<boolean>();
  isIRPFlagEnabled = false;
  isOrgIRPEnabled = false;
  isInvoiceDepartmentIdFieldShow = true;

  protected componentDestroy: () => Observable<unknown>;

  private selectedRegion: Region;
  private selectedLocation: Location;
  private editedDepartmentId?: number;
  private isEdit: boolean;
  private defaultFileName: string;
  private filters: DepartmentFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager
  };
  private regions: OrganizationRegion[] = [];
  private pageSubject = new Subject<number>();

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private departmentService: DepartmentService
  ) {
    super();

    this.idFieldName = 'departmentId';
  }

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  ngOnInit(): void {
    this.checkIRPFlag();
    this.createDepartmentsForm();

    this.columnsToExport = DepartmentsExportCols(this.isIRPFlagEnabled);
    this.filterColumns = this.departmentService.initFilterColumns(this.isIRPFlagEnabled);

    this.startDepartmentOptionsWatching();
    this.startPageNumberWatching();
    this.startOrgIdWatching();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
  }

  public override updatePage(): void {
    this.getDepartments();
  }

  public onFilterClose() {
    this.departmentService.populateFilterForm(this.DepartmentFilterFormGroup, this.filters, this.isIRPFlagEnabled);

    this.filteredItems = this.filterService.generateChips(this.DepartmentFilterFormGroup, this.filterColumns, this.datePipe);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.DepartmentFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.clearFilters();
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
      options?.fileName || this.defaultFileName,
      this.selectedItems.length ? 180 : null
    )));
    this.clearSelection(this.grid);
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion?.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id)).pipe(takeUntil(this.componentDestroy()))
        .subscribe((data) => {
          if (data.organizationManagement.locations.length > 0) {
            this.defaultLocationValue = data.organizationManagement.locations[0].id;
          }
        });
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
    } else {
      this.grid.dataSource = [];
    }
  }

  formatPhoneNumber(field: string, department: Department): string {
    // @ts-ignore
    return department[field]?.toString().length === 10 ? department[field].replace(/^(\d{3})(\d{3})(\d{4}).*/, '$1-$2-$3') : department[field];
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

  onEditDepartmentClick(department: Department, event: any): void {
    this.addActiveCssClass(event);
    this.departmentService.populateDepartmentDetailsForm(this.departmentsDetailsFormGroup, department, this.isIRPFlagEnabled);

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
      }).pipe(
        takeUntil(this.componentDestroy()),
    ).subscribe((confirm) => {
      if (confirm && department.departmentId) {
        this.store.dispatch(new DeleteDepartmentById(department, this.filters));
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
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
          filter(Boolean),
          takeUntil(this.componentDestroy()),
      ).subscribe(() => {
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
      const department: Department = DepartmentsAdapter.prepareToSave(
        this.editedDepartmentId,
        this.selectedLocation.id,
        this.departmentsDetailsFormGroup
      );

      this.saveOrUpdateDepartment(department);

      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.departmentsDetailsFormGroup.reset();
    } else {
      this.departmentsDetailsFormGroup.markAllAsTouched();
    }
  }

  onImportDataClick(): void {
    this.importDialogEvent.next(true);
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

  private checkIRPFlag(): void {
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }

  private checkOrgPreferences(): void {
    const { isIRPEnabled, isVMCEnabled } = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};

    this.isOrgIRPEnabled = !!isIRPEnabled;
    this.isInvoiceDepartmentIdFieldShow = !this.isIRPFlagEnabled
      || !!isVMCEnabled
      || !(!isVMCEnabled && isIRPEnabled);

    if (!this.isInvoiceDepartmentIdFieldShow) {
      this.departmentsDetailsFormGroup.removeControl('invoiceDepartmentId');
    }
  }

  private createDepartmentsForm(): void {
    this.departmentsDetailsFormGroup = this.departmentService.createDepartmentDetailForm(this.isIRPFlagEnabled);
    this.DepartmentFilterFormGroup = this.departmentService.createDepartmentFilterForm(this.isIRPFlagEnabled);
  }

  private startDepartmentOptionsWatching(): void {
    this.departmentFilterOptions$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe(options => {
      this.departmentService.populateDataSources(this.filterColumns, options as any, this.isIRPFlagEnabled);
    });
  }

  private startPageNumberWatching(): void {
    this.pageSubject.pipe(
      throttleTime(1),
      takeUntil(this.componentDestroy())
    ).subscribe((page) => {
      this.currentPage = page;
      this.getDepartments();
    });
  }

  private startOrgIdWatching(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(id => {
      this.clearFilters();
      this.getOrganization(id);
      this.store.dispatch(new GetRegions()).pipe(
        takeUntil(this.componentDestroy())
      ).subscribe((data) => {
        this.defaultValue = data.organizationManagement.regions[0]?.id;
      });
    });
  }

  private getOrganization(businessUnitId: number) {
    const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

    this.store.dispatch(new GetOrganizationById(id)).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.checkOrgPreferences();
    });
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

  private clearFilters(): void {
    this.DepartmentFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }
}
