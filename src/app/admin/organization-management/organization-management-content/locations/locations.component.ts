import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {  DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AbstractGridConfigurationComponent } from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { AdminState } from '../../../store/admin.state';
import { Region } from '../../../../shared/models/region.model';
import {
  DeleteDepartmentById,
  GetLocationsByRegionId,
  GetRegionsByOrganizationId,
  SaveLocation,
  SetImportFileDialogState,
  UpdateLocation
} from '../../../store/admin.actions';
import { SetHeaderState, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '../../../../shared/enums/message-types';
import { Location } from '../../../../shared/models/location.model';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { Department } from '../../../../shared/models/department.model';
import { MESSAGE_CANNOT_BE_DELETED } from '../departments/departments.component';

export const MESSAGE_REGIONS_NOT_SELECTED = 'Region was not selected';
export const MESSAGE_REGION_LOCATION_CANNOT_BE_DELETED = 'Region/Location cannot be deleted';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Select(AdminState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(AdminState.locationsByRegionId)
  locations$: Observable<Location[]>;

  // location form data
  @ViewChild('addEditDialog') addEditDialog: DialogComponent;
  targetElement: HTMLElement = document.body;
  locationDetailsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedLocationId?: number;

  fakeOrganizationId = 1; // TODO: remove after BE implementation

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Locations' }));
    this.formBuilder = builder;
    this.createLocationForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegionsByOrganizationId(this.fakeOrganizationId)); // TODO: provide valid organizationId
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
  }

  onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  onAddDepartmentClick(): void {
    if (this.selectedRegion) {
      this.addEditDialog.show();
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_REGIONS_NOT_SELECTED));
    }
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.locations$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onEditButtonClick(location: Location): void {
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
      phoneType: location.phoneType
    });
    this.editedLocationId = location.id;
    this.isEdit = true;
    this.addEditDialog.show();
  }

  onRemoveButtonClick(department: Department): void {
    if (department.departmentId) { // TODO: add verification to prevent remove if department has assigned Order with any status
      this.store.dispatch(new DeleteDepartmentById(department.departmentId));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_CANNOT_BE_DELETED));
    }
  }

  onFormCancelClick(): void {
    this.locationDetailsFormGroup.reset();
    this.addEditDialog.hide();
    // TODO: add modal dialog to confirm close
  }

  onFormSaveClick(): void {
    if (this.locationDetailsFormGroup.valid) {
      const location: Location = {
        id: this.editedLocationId,
        regionId: this.selectedRegion.id,
        organizationId: this.fakeOrganizationId,
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
        phoneType: this.locationDetailsFormGroup.controls['phoneType'].value,
      }

      if (this.isEdit) {
        this.store.dispatch(new UpdateLocation(location));
        this.isEdit = false;
        this.editedLocationId = undefined;
      } else {
        this.store.dispatch(new SaveLocation(location));
      }

      this.addEditDialog.hide();
      this.locationDetailsFormGroup.reset();
    } else {
      this.locationDetailsFormGroup.markAllAsTouched();
    }
  }

  private createLocationForm(): void {
    this.locationDetailsFormGroup = this.formBuilder.group({
      invoiceId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      externalId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      address1: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      address2: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      zip: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      glNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      ext: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      invoiceNote: ['', [Validators.maxLength(50)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPerson: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      inactiveDate: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      phoneType: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
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
