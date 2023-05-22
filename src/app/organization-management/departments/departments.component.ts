import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { DatePicker, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { Department, DepartmentFilter, DepartmentFilterOptions, DepartmentsPage } from '@shared/models/department.model';
import {
  ClearDepartmentList,
  ClearLocationList,
  DeleteDepartmentById,
  ExportDepartments,
  GetAssignedSkillsByOrganization,
  GetDepartmentFilterOptions,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetOrganizationById,
  GetRegions,
  SaveDepartment,
  SaveDepartmentConfirm,
  SaveDepartmentSucceeded,
  UpdateDepartment,
} from '../store/organization-management.actions';
import { Region } from '@shared/models/region.model';
import { Location } from '@shared/models/location.model';
import { OrganizationManagementState } from '../store/organization-management.state';
import { MessageTypes } from '@shared/enums/message-types';
import { 
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  DEPARTMENT_SKILL_CHANGE_WARNING,
  RECORD_ADDED,
  RECORD_MODIFIED,
  WARNING_TITLE,
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
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';
import { DateTimeHelper } from '@core/helpers';
import { ListOfSkills } from '@shared/models/skill.model';
import { difference } from 'lodash';
import { SystemType } from '@shared/enums/system-type.enum';

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

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  skills$: Observable<ListOfSkills[]>;

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;
  @ViewChild('reactivationDatepicker') reactivationDatepicker: DatePicker;
  @ViewChild('inactivationDatepicker') inactivationDatepicker: DatePicker;

  departmentsDetailsFormGroup: FormGroup;
  fieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  irpFieldsSettings: FieldSettingsModel = { text: 'text', value: 'value' };
  skillFields: FieldSettingsModel = { text: 'name', value: 'masterSkillId' };

  defaultValue: number | undefined;
  isLocationsDropDownEnabled = false;
  columnsToExport: ExportColumn[];
  fileName: string;
  defaultLocationValue: number;
  DepartmentFilterFormGroup: FormGroup;
  filterColumns: FilterColumnsModel;
  importDialogEvent: Subject<boolean> = new Subject<boolean>();
  isIRPFlagEnabled = false;
  isLocationIRPEnabled = false;
  isOrgUseIRPAndVMS = false;
  isInvoiceDepartmentIdFieldShow = true;
  primarySkills: ListOfSkills[] = [];
  secondarySkills: ListOfSkills[] = [];
  areSkillsAvailable: boolean;

  protected componentDestroy: () => Observable<unknown>;

  private selectedRegion: Region;
  public selectedLocation: Location;
  private editedDepartmentId?: number;
  public isEdit: boolean;
  private defaultFileName: string;
  private filters: DepartmentFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager,
  };
  private regions: OrganizationRegion[] = [];
  private pageSubject = new Subject<number>();

  public minReactivateDate: string | null;
  public maxInactivateDate: string | null;

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private departmentService: DepartmentService,
    private action$: Actions
  ) {
    super();

    this.idFieldName = 'departmentId';
    this.checkIRPFlag();
  }

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  ngOnInit(): void {
    this.createDepartmentsForm();

    this.filterColumns = this.departmentService.initFilterColumns(this.isIRPFlagEnabled);
    this.watchForDepartmentUpdate();
    this.startDepartmentOptionsWatching();
    this.startPageNumberWatching();
    this.startOrgIdWatching();
    this.getSkills();
    this.listenPrimarySkill();
    this.listenIncludeInIRPToggleChanges();
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
    const { inactiveDate, ...formValue } = this.DepartmentFilterFormGroup.getRawValue();

    this.filters = formValue;
    this.filters.inactiveDate = inactiveDate ? DateTimeHelper.toUtcFormat(inactiveDate) : '';
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

  private watchForDepartmentUpdate(): void {
    this.action$.pipe(ofActionDispatched(SaveDepartmentSucceeded), takeUntil(this.componentDestroy())).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
      this.departmentsDetailsFormGroup.reset();
      if (this.isEdit) {
        this.isEdit = false;
        this.editedDepartmentId = undefined;
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      } else {
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      }
    });
    this.action$.pipe(ofActionDispatched(SaveDepartmentConfirm), takeUntil(this.componentDestroy())).subscribe(() => {
      this.confirmService
      .confirm('Department has active orders past the inactivation date. Do you want to proceed?', {
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
        this.onDepartmentFormSaveClick(true);
      });
    });
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
      this.isLocationIRPEnabled = this.selectedLocation.includeInIRP;
    } else {
      this.grid.dataSource = [];
    }
  }

  formatPhoneNumber(field: string, department: Department): string {
    const departmentValue = department[field as keyof Department] as string;
    return departmentValue?.toString().length === 10
      ? departmentValue.replace(/^(\d{3})(\d{3})(\d{4}).*/, '$1-$2-$3')
      : departmentValue;
  }

  onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  changeTablePagination(event: { currentPage?: number; value: number; }): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  onEditDepartmentClick(department: Department, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.departmentService.populateDepartmentDetailsForm(
      this.departmentsDetailsFormGroup,
      department,
      this.isIRPFlagEnabled
    );

    this.editedDepartmentId = department.departmentId;
    this.isLocationIRPEnabled = !!department.locationIncludeInIRP;
    this.isEdit = true;
    this.reactivationDateHandler(department);
    this.store.dispatch(new ShowSideDialog(true));
    this.inactivateDateHandler(
      this.departmentsDetailsFormGroup.controls['inactiveDate'],
      department.inactiveDate, department.reactivateDate
    );
  }

  private inactivateDateHandler(field: AbstractControl, value: string | null, reactivateValue: string | null): void {
    if (value) {
      const inactiveDate = new Date(DateTimeHelper.formatDateUTC(value, 'MM/dd/yyyy'));
      const reactivateDate = reactivateValue ? new Date(DateTimeHelper.formatDateUTC(reactivateValue, 'MM/dd/yyyy')) : null;
      inactiveDate.setHours(0, 0, 0, 0);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const areDatesInThePast = (reactivateDate && DateTimeHelper.isDateBefore(reactivateDate, now)) &&
        DateTimeHelper.isDateBefore(inactiveDate, now);
      if (!areDatesInThePast) {
        field.disable();
      } else {
        field.enable();
      }
    } else {
      field.enable();
    }
  }

  onRemoveDepartmentClick(department: Department, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        takeUntil(this.componentDestroy()),
    ).subscribe((confirm) => {
      if (confirm && department.departmentId) {
        this.store.dispatch(new DeleteDepartmentById(department, this.filters));
      }
      this.removeActiveCssClass();
    });
  }

  private reactivationDateHandler(department?: Department): void {
    if (this.selectedLocation) {
      const reactivationDateField = this.departmentsDetailsFormGroup.controls['reactivateDate'];
      const reactivateDate = this.selectedLocation.reactivateDate ? new Date(this.selectedLocation.reactivateDate) : null;
      const inactiveDate = this.selectedLocation.inactiveDate ? new Date(this.selectedLocation.inactiveDate) : null;
      this.minReactivateDate = reactivateDate ? 
        DateTimeHelper.formatDateUTC(reactivateDate.toISOString(), 'MM/dd/yyyy') : 
        null;
      this.maxInactivateDate = inactiveDate ? DateTimeHelper.formatDateUTC(inactiveDate.toISOString(), 'MM/dd/yyyy') : null;
      if (!this.selectedLocation.reactivateDate && this.selectedLocation.isDeactivated) {
        reactivationDateField.disable();
      } else {
        reactivationDateField.enable();
        this.reactivationDatepicker.refresh();
        this.inactivationDatepicker.refresh();
      }
    }
  }

  onAddDepartmentClick(): void {
    if (this.selectedLocation && this.selectedRegion) {
      this.departmentsDetailsFormGroup.controls['inactiveDate'].enable();
      this.departmentsDetailsFormGroup.controls['includeInIRP']?.setValue(this.isIRPFlagEnabled && !this.isOrgUseIRPAndVMS);
      this.isLocationIRPEnabled = this.selectedLocation.includeInIRP;
      this.reactivationDateHandler();
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
          okButtonClass: 'delete-button',
        }).pipe(
          filter(Boolean),
          takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.closeDepartmentWindowHandler();
      });
    } else {
      this.closeDepartmentWindowHandler();
    }
  }

  onDepartmentFormSaveClick(ignoreWarning = false): void {
    if (this.departmentsDetailsFormGroup.valid) {
      const department: Department = DepartmentsAdapter.prepareToSave(
        this.editedDepartmentId,
        this.selectedLocation.id,
        this.departmentsDetailsFormGroup
      );
      this.saveOrUpdateDepartment(department, ignoreWarning);
    } else {
      this.departmentsDetailsFormGroup.markAllAsTouched();
    }
  }

  onImportDataClick(): void {
    this.importDialogEvent.next(true);
  }

  private closeDepartmentWindowHandler(): void {
    this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedDepartmentId = undefined;
      this.departmentsDetailsFormGroup.reset();
      this.removeActiveCssClass();
  }

  private updateDepartmentHandler(department: Department, ignoreWarning: boolean): void {
    if (this.isSkillChanged()) {
      this.confirmService
        .confirm(DEPARTMENT_SKILL_CHANGE_WARNING, {
          title: WARNING_TITLE,
          okButtonLabel: 'Yes',
          okButtonClass: 'delete-button',
        }).pipe(
          filter(Boolean),
          takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.store.dispatch(new UpdateDepartment(department, this.filters, ignoreWarning));
      });
    } else {
      this.store.dispatch(new UpdateDepartment(department, this.filters, ignoreWarning));
    }
  }

  private saveOrUpdateDepartment(department: Department, ignoreWarning: boolean): void {
    if (this.isEdit) {
      this.updateDepartmentHandler(department, ignoreWarning);
    } else {
      this.store.dispatch(new SaveDepartment(department, this.filters));
    }
  }

  private checkIRPFlag(): void {
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }

  private checkOrgPreferences(): void {
    const { isIRPEnabled, isVMCEnabled } =
    this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};

    this.isOrgUseIRPAndVMS = !!(isVMCEnabled && isIRPEnabled);
    this.isInvoiceDepartmentIdFieldShow = !this.isIRPFlagEnabled
      || !!isVMCEnabled
      || !(!isVMCEnabled && isIRPEnabled);

    if (!this.isInvoiceDepartmentIdFieldShow) {
      this.departmentsDetailsFormGroup.removeControl('invoiceDepartmentId');
    }

    this.grid.getColumnByField('invoiceDepartmentId').visible = this.isInvoiceDepartmentIdFieldShow;
    this.grid.getColumnByField('includeInIRP').visible = this.isIRPFlagEnabled && this.isOrgUseIRPAndVMS;
    this.grid.getColumnByField('primarySkillNames').visible = this.isIRPFlagEnabled && !!isIRPEnabled;
    this.grid.getColumnByField('secondarySkillNames').visible = this.isIRPFlagEnabled && !!isIRPEnabled;

    this.columnsToExport = DepartmentsExportCols(
      this.isIRPFlagEnabled && this.isOrgUseIRPAndVMS,
      this.isInvoiceDepartmentIdFieldShow
    );
    this.grid.refreshColumns();
  }

  private createDepartmentsForm(): void {
    this.departmentsDetailsFormGroup = 
      this.departmentService.createDepartmentDetailForm(this.isIRPFlagEnabled, this.isOrgUseIRPAndVMS);
    this.DepartmentFilterFormGroup = this.departmentService.createDepartmentFilterForm(this.isIRPFlagEnabled);
    this.addDatesValidation();
  }

  private addDatesValidation(): void {
    const inactiveDate = this.departmentsDetailsFormGroup.controls['inactiveDate'];
    const reactivateDate = this.departmentsDetailsFormGroup.controls['reactivateDate'];
    inactiveDate.addValidators(startDateValidator(this.departmentsDetailsFormGroup, 'reactivateDate'));
    reactivateDate.addValidators(endDateValidator(this.departmentsDetailsFormGroup, 'inactiveDate'));
    inactiveDate.valueChanges.subscribe(() =>
      reactivateDate.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
    reactivateDate.valueChanges.subscribe(() =>
      inactiveDate.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
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
      ).subscribe(() => {
        const regions = this.store.selectSnapshot(OrganizationManagementState.regions);
        this.defaultValue = regions[0]?.id;
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
      new GetDepartmentFilterOptions(this.selectedLocation.id as number),
    ]);
  }

  private clearFilters(): void {
    this.DepartmentFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  private getSkills(): void {
    this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } }));
    this.skills$.pipe(takeUntil(this.componentDestroy())).subscribe((skills) => {
      this.primarySkills = skills;
      this.secondarySkills = skills;
    });
  }

  private listenPrimarySkill(): void {
    this.departmentsDetailsFormGroup.get('primarySkills')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((formValue) => {
        const diff = difference(this.primarySkills.map(({ masterSkillId }: ListOfSkills) => masterSkillId), formValue);
        this.secondarySkills = this.primarySkills.filter(({ masterSkillId }: ListOfSkills) => diff.includes(masterSkillId));
        this.departmentsDetailsFormGroup.get('secondarySkills')?.reset();
      });
  }

  private listenIncludeInIRPToggleChanges(): void {
    const { preferences } = this.store.selectSnapshot(OrganizationManagementState.organization) || {};

    if (!!preferences?.isVMCEnabled && !!preferences?.isIRPEnabled) {
      this.departmentsDetailsFormGroup.get('includeInIRP')?.valueChanges
        .pipe(
          takeUntil(this.componentDestroy())
        )
        .subscribe((state: boolean) => {
          if (state && this.isIRPFlagEnabled && preferences?.isIRPEnabled) {
            this.areSkillsAvailable = true;
          } else {
            this.areSkillsAvailable = false;
            this.departmentsDetailsFormGroup.get('primarySkills')?.reset();
            this.departmentsDetailsFormGroup.get('secondarySkills')?.reset();
          }
        });
    } else {
      this.areSkillsAvailable = this.isIRPFlagEnabled && !!preferences?.isIRPEnabled;
    }
  }

  private isSkillChanged(): boolean {
    return !!(this.departmentsDetailsFormGroup.get('primarySkills')?.dirty ||
      this.departmentsDetailsFormGroup.get('secondarySkills')?.dirty);
  }
}
