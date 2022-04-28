import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ResizeSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { AnimationSettingsModel, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

import { DEPARTMENT_GRID_CONFIG } from '../../../admin-menu.config';
import { SetHeaderState } from '../../../../store/app.actions';
import { Department } from '../../../../shared/models/department.model';
import {
  SaveDepartment,
  GetDepartmentsByLocationId,
  SetSuccessErrorToastState,
  DeleteDepartmentById,
  GetRegionsByOrganizationId,
  UpdateDepartment,
  GetLocationsByRegionId, SetImportFileDialogState
} from '../../../store/admin.actions';
import { Region } from '../../../../shared/models/region.model';
import { Location } from '../../../../shared/models/location.model';
import { AdminState } from '../../../store/admin.state';

export const MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED = 'Region or Location were not selected';
export const MESSAGE_CANNOT_BE_DELETED = 'Department cannot be deleted';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  providers: [MaskedDateTimeService],
})
export class DepartmentsComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  // grid
  gridDataSource: object[] = [];
  allowPaging = DEPARTMENT_GRID_CONFIG.isPagingEnabled;
  pageSettings = DEPARTMENT_GRID_CONFIG.gridPageSettings;
  gridHeight = DEPARTMENT_GRID_CONFIG.gridHeight;
  rowHeight = DEPARTMENT_GRID_CONFIG.initialRowHeight;
  resizeSettings: ResizeSettingsModel = DEPARTMENT_GRID_CONFIG.resizeSettings;
  allowSorting = DEPARTMENT_GRID_CONFIG.isSortingEnabled;
  allowResizing = DEPARTMENT_GRID_CONFIG.isResizingEnabled;

  // rows per page
  rowsPerPageDropDown = DEPARTMENT_GRID_CONFIG.rowsPerPageDropDown;
  activeRowsPerPageDropDown = DEPARTMENT_GRID_CONFIG.rowsPerPageDropDown[0];

  // go to page
  lastAvailablePage = 0;
  validateDecimalOnType = true;
  decimals = 0;

  // pager
  totalDataRecords: number;
  pageSizePager = DEPARTMENT_GRID_CONFIG.initialRowsPerPage;
  currentPagerPage: number = 1;

  // department form data
  @ViewChild('addEditDepartmentDialog') addEditDepartmentDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  animationSettings: AnimationSettingsModel = { effect: 'SlideRight' };
  departmentsDetailsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  @Select(AdminState.departments)
  departments$: Observable<Department[]>;

  @Select(AdminState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(AdminState.locationsByRegionId)
  locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocation: Location;

  editedDepartmentId: number | undefined;
  isEdit: boolean;

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute,
              @Inject(FormBuilder) private builder: FormBuilder) {
    store.dispatch(new SetHeaderState({ title: 'Departments' }));
    this.formBuilder = builder;
    this.createDepartmentsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegionsByOrganizationId(0)); // TODO: provide valid organizationId
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
    this.isLocationsDropDownEnabled = true;
  }

  onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedLocation = event.itemData as Location;
    this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.locationId));
    this.mapGridData();
  }

  mapGridData(): void {
    this.departments$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  formatPhoneNumber(field: string, department: Department): string {
    // @ts-ignore
    return department[field].toString().length === 10 ? department[field].replace(/^(\d{3})(\d{3})(\d{4}).*/, '$1-$2-$3') : department[field];
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.departments$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onEditDepartmentClick(department: Department): void {
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
    this.addEditDepartmentDialog.show();
  }

  onRemoveDepartmentClick(department: Department): void {
    if (department.departmentId) { // TODO: add verification to prevent remove if department has assigned Order with any status
      this.store.dispatch(new DeleteDepartmentById(department.departmentId));
    }  else {
      this.store.dispatch(new SetSuccessErrorToastState({
        isSuccess: false, isShown: true, messageContent: MESSAGE_CANNOT_BE_DELETED
      }));
    }
  }

  onAddDepartmentClick(): void {
    if (this.selectedLocation && this.selectedRegion) {
      this.addEditDepartmentDialog.show();
    } else {
      this.store.dispatch(new SetSuccessErrorToastState({
        isSuccess: false, isShown: true, messageContent: MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED
      }));
    }
  }

  onDepartmentFormCancelClick(): void {
    this.departmentsDetailsFormGroup.controls['extDepartmentId'].markAsUntouched();
    this.departmentsDetailsFormGroup.reset();
    this.addEditDepartmentDialog.hide();
    // TODO: add modal dialog to confirm close
  }

  onDepartmentFormSaveClick(): void {
    if (this.departmentsDetailsFormGroup.valid) {
      const department: Department = {
        departmentId: this.editedDepartmentId,
        locationId: this.selectedLocation.locationId,
        extDepartmentId: this.departmentsDetailsFormGroup.controls['extDepartmentId'].value,
        invoiceDepartmentId: this.departmentsDetailsFormGroup.controls['invoiceDepartmentId'].value,
        departmentName: this.departmentsDetailsFormGroup.controls['departmentName'].value,
        inactiveDate: this.departmentsDetailsFormGroup.controls['inactiveDate'].value,
        facilityPhoneNo: this.departmentsDetailsFormGroup.controls['facilityPhoneNo'].value,
        facilityEmail: this.departmentsDetailsFormGroup.controls['facilityEmail'].value,
        facilityContact: this.departmentsDetailsFormGroup.controls['facilityContact'].value
      }

      if (this.isEdit) {
        this.store.dispatch(new UpdateDepartment(department));
        this.isEdit = false;
        this.editedDepartmentId = undefined;
      } else {
        this.store.dispatch(new SaveDepartment(department));
      }

      this.addEditDepartmentDialog.hide();
      this.departmentsDetailsFormGroup.reset();
    } else {
      this.departmentsDetailsFormGroup.markAllAsTouched();
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
      inactiveDate: ['']
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
