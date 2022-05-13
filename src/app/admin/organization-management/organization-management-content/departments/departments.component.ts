import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Actions, Select, Store } from '@ngxs/store';
import { filter, Observable } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

import { ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { Department } from '../../../../shared/models/department.model';
import {
  SaveDepartment,
  GetDepartmentsByLocationId,
  DeleteDepartmentById,
  GetRegionsByOrganizationId,
  UpdateDepartment,
  GetLocationsByRegionId,
  SetImportFileDialogState,
} from '../../../store/admin.actions';
import { Region } from '../../../../shared/models/region.model';
import { Location } from '../../../../shared/models/location.model';
import { AdminState } from '../../../store/admin.state';
import { MessageTypes } from '../../../../shared/enums/message-types';
import { AbstractGridConfigurationComponent } from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_COFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED
} from '../../../../shared/constants/messages';
import { ConfirmService } from '../../../../shared/services/confirm.service';

export const MESSAGE_REGIONS_OR_LOCATIONS_NOT_SELECTED = 'Region or Location were not selected';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  providers: [MaskedDateTimeService],
})
export class DepartmentsComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  // department form data
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

  editedDepartmentId?: number;
  isEdit: boolean;

  invalidDate = '0001-01-01T00:00:00+00:00';

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              private actions$: Actions,
              private router: Router,
              private route: ActivatedRoute,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createDepartmentsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegionsByOrganizationId(1)); // TODO: provide valid organizationId
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
      this.isLocationsDropDownEnabled = true;
    }
  }

  onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedLocation = event.itemData as Location;
    if (this.selectedLocation.id) {
      this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.id));
      this.mapGridData();
    }
  }

  mapGridData(): void {
    this.departments$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      data.forEach(item => item.inactiveDate === this.invalidDate ? item.inactiveDate = '' : item.inactiveDate);
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

      if (this.isEdit) {
        this.store.dispatch(new UpdateDepartment(department));
        this.isEdit = false;
        this.editedDepartmentId = undefined;
      } else {
        this.store.dispatch(new SaveDepartment(department));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      }

      this.store.dispatch(new ShowSideDialog(false));
      this.removeActiveCssClass();
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
      inactiveDate: [null]
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
