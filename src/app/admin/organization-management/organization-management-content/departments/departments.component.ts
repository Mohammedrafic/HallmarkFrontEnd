import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { ResizeSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { AnimationSettingsModel, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService, RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';

import { DEPARTMENT_GRID_CONFIG } from '../../../admin-menu.config';
import { SetHeaderState } from '../../../../store/app.actions';
import { Department } from '../../../../shared/models/department.model';
import {
  SaveDepartment,
  GetDepartmentsByLocationId,
  GetRegions,
  SetSuccessErrorToastState, DeleteDepartmentById
} from '../../../store/admin.actions';
import { Region } from '../../../../shared/models/region.model';
import { Location } from '../../../../shared/models/location.model';

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

  //  go to page
  lastAvailablePage = 0;
  validateDecimalOnType = true;
  decimals = 0;

  // pager
  totalDataRecords: number;
  pageSizePager = DEPARTMENT_GRID_CONFIG.initialRowsPerPage;
  currentPagerPage: number = 1;

  // department form data
  @ViewChild('departmentDialog') departmentDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  animationSettings: AnimationSettingsModel = { effect: 'SlideRight' };
  departmentsDetailsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  // @Select(AdminState.departments) // TODO: uncomment after BE implementation
  departments$: Observable<Department[]>;

  //@Select(AdminState.regions) // TODO: uncomment after BE implementation
  regions$: Observable<Region[]>;

  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;


  //@Select(AdminState.locations) // TODO: uncomment after BE implementation
  locations$: Observable<Location[]>;

  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocation: Location;

  dateValue: Date = new Date();


  @ViewChild(FormGroupDirective) departmentsForm: NgForm;

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute,
              @Inject(FormBuilder) private builder: FormBuilder) {
    store.dispatch(new SetHeaderState({ title: 'Departments' }));
    this.formBuilder = builder;
    this.createDepartmentsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegions(1)); // TODO: provide valid organizationId
    this.regions$ = of([{ id: 1, name: 'region 1', organizationId: 1 }]);//TODO: remove after BE implementation

    // store.dispatch(new GetLocations()); // TODO: uncomment after BE implementation
    this.locations$ = of([ {id: 1, name: 'location 1', locationId: 1 } ]); //TODO: remove after BE implementation

    this.store.dispatch(new GetDepartmentsByLocationId(1)); // TODO: provide valid locationId
    this.departments$ = of([ // TODO: remove after BE implementation
      {
        departmentId: 1,
        locationId: 1,
        extDepartmentId: "1234556789",
        invoiceDepartmentId: "1",
        departmentName: "Some Name 1",
        facilityContact: "facility contact",
        facilityEmail: "Email1@mail.com",
        facilityPhoneNo: "7865432345",
        inactiveDate: "04/22/2022"
      },
      {
        departmentId: 2,
        locationId: 2,
        extDepartmentId: "2134556789",
        invoiceDepartmentId: "2",
        departmentName: "Some Name 2",
        facilityContact: "facility contact",
        facilityEmail: "Email2@mail.com",
        facilityPhoneNo: "12345",
        inactiveDate: "04/22/2022"
      }
    ]);

    this.setGridDataMap();
  }

  setGridDataMap(): void {
    this.departments$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
  }

  onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedLocation = event.itemData as Location;
    this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.locationId));
  }

  formatPhoneNumber(field: string, department: Department): string {
    // @ts-ignore
    return department[field].toString().length === 5 ? department[field] : department[field].replace(/^(\d{3})(\d{3})(\d{4}).*/, '$1-$2-$3');
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

  editDepartment(department: Department): void {
    if (this.selectedLocation && this.selectedRegion) {
      this.departmentsDetailsFormGroup.setValue({
        extDepartmentId: department.extDepartmentId,
        invoiceDepartmentId: department.invoiceDepartmentId,
        departmentName: department.departmentName,
        facilityContact: department.facilityContact,
        facilityEmail: department.facilityEmail,
        facilityPhoneNo: department.facilityPhoneNo,
        inactiveDate: department.inactiveDate
      });

      this.departmentDialog.show();
    } else {
      this.store.dispatch(new SetSuccessErrorToastState({
        isSuccess: false, isShown: true, messageContent: MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED
      }));
    }
  }

  removeDepartment(department: Department): void {
    // TODO: add verification to prevent remove if department has assigned Order with any status
    if (this.selectedLocation && this.selectedRegion) {
      if (department.departmentId) {
        this.store.dispatch(new DeleteDepartmentById(department.departmentId));
      }
    }  else {
      this.store.dispatch(new SetSuccessErrorToastState({
        isSuccess: false, isShown: true, messageContent: MESSAGE_CANNOT_BE_DELETED
      }));
    }
  }

  onAddDepartmentClick(): void {
    if (this.selectedLocation && this.selectedRegion) {
      this.departmentDialog.show();
    } else {
      this.store.dispatch(new SetSuccessErrorToastState({
        isSuccess: false, isShown: true, messageContent: MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED
      }));
    }
  }

  onDepartmentFormCancelClick(): void {
    this.departmentsDetailsFormGroup.reset();
    this.departmentDialog.hide();
    // TODO: add modal dialog to confirm close
  }

  onDepartmentFormSaveClick(): void {
    if (this.departmentsDetailsFormGroup.valid) {
      this.store.dispatch(new SaveDepartment({
        locationId: this.selectedLocation.locationId,
        extDepartmentId: this.departmentsDetailsFormGroup.controls['extDepartmentId'].value,
        invoiceDepartmentId: this.departmentsDetailsFormGroup.controls['invoiceDepartmentId'].value,
        departmentName: this.departmentsDetailsFormGroup.controls['departmentName'].value,
        inactiveDate: this.departmentsDetailsFormGroup.controls['inactiveDate'].value,
        facilityPhoneNo: this.departmentsDetailsFormGroup.controls['facilityPhoneNo'].value,
        facilityEmail: this.departmentsDetailsFormGroup.controls['facilityEmail'].value,
        facilityContact: this.departmentsDetailsFormGroup.controls['facilityContact'].value
      }));

      this.departmentDialog.hide();
      this.departmentsDetailsFormGroup.reset();
    } else {
      this.departmentsDetailsFormGroup.markAllAsTouched();
    }
  }

  onRenderCalendarCell(args: RenderDayCellEventArgs): void {
    // excludes weekends
    if (args.date && (args.date.getDay() == 0 || args.date.getDay() == 6)) {
      args.isDisabled = true;
    }
  }

  private createDepartmentsForm(): void {
    this.departmentsDetailsFormGroup = this.formBuilder.group({
      extDepartmentId: ['', [Validators.required]],
      invoiceDepartmentId: ['', Validators.required],
      departmentName: ['', [Validators.required]],
      facilityContact: ['', [Validators.required]],
      facilityEmail: ['', [Validators.required, Validators.email]],
      facilityPhoneNo: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/i)]],
      inactiveDate: ['', [Validators.required]]
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
