import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { AdminState } from '../../../store/admin.state';
import { Region } from '../../../../shared/models/region.model';
import {
  DeleteLocationById,
  GetLocationsByRegionId, GetOrganizationById,
  GetRegionsByOrganizationId,
  SaveLocation, SaveRegion, SetGeneralStatesByCountry,
  SetImportFileDialogState,
  UpdateLocation
} from '../../../store/admin.actions';
import { SetHeaderState, ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '../../../../shared/enums/message-types';
import { Location } from '../../../../shared/models/location.model';

import { MESSAGE_CANNOT_BE_DELETED } from '../departments/departments.component';
import { PhoneTypes } from '../../../../shared/enums/phone-types';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Country } from '../../../../shared/enums/states';
import { MESSAGE_RECORD_HAS_BEEN_ADDED } from '../../../../shared/constants/messages';

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
  @ViewChild('addRegionDialog') addRegionDialog: DialogComponent;

  @Select(AdminState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(AdminState.phoneTypes)
  phoneTypes$: Observable<FieldSettingsModel[]>;

  @Select(AdminState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(AdminState.locationsByRegionId)
  locations$: Observable<Location[]>;

  locationDetailsFormGroup: FormGroup;
  newRegionName: string;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedLocationId?: number;

  fakeOrganizationId = 2; // TODO: remove after BE implementation

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Locations' }));
    this.formBuilder = builder;
    this.createLocationForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegionsByOrganizationId(this.fakeOrganizationId)); // TODO: provide valid organizationId
    this.store.dispatch(new GetOrganizationById(this.fakeOrganizationId));  // TODO: provide valid organizationId

    // TODO: get states list by countryId from organization
    this.actions$.pipe(ofActionDispatched(GetOrganizationById)).subscribe(organization => {
      this.store.dispatch(new SetGeneralStatesByCountry(parseInt(Country[organization.generalInformation.country])));
    });
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
    }
    this.mapGridData();
  }

  onAddRegionClick(): void {
    this.addRegionDialog.show();
  }

  hideDialog(): void {
    this.addRegionDialog.hide();
  }

  onOkDialogClick(): void {
    this.newRegionName.trim();
    if (this.newRegionName) {
      this.store.dispatch(new SaveRegion({ name: this.newRegionName, organizationId: this.fakeOrganizationId }))
      this.addRegionDialog.hide();
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

  mapGridData(): void {
    this.locations$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
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
      phoneType: PhoneTypes[location.phoneType]
    });
    this.editedLocationId = location.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveButtonClick(location: Location): void {
    if (location.id && this.selectedRegion.id) { // TODO: add verification to prevent remove if department has assigned Order with any status
      this.store.dispatch(new DeleteLocationById(location.id, this.selectedRegion.id));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, MESSAGE_CANNOT_BE_DELETED));
    }
  }

  onFormCancelClick(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.locationDetailsFormGroup.reset();
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
        address2: this.locationDetailsFormGroup.controls['address2'].value === ''
          ? null : this.locationDetailsFormGroup.controls['address2'].value,
        zip: this.locationDetailsFormGroup.controls['zip'].value,
        city: this.locationDetailsFormGroup.controls['city'].value,
        state: this.locationDetailsFormGroup.controls['state'].value,
        glNumber: this.locationDetailsFormGroup.controls['glNumber'].value === ''
          ? null : this.locationDetailsFormGroup.controls['glNumber'].value,
        ext: this.locationDetailsFormGroup.controls['ext'].value === ''
          ? null : this.locationDetailsFormGroup.controls['ext'].value,
        invoiceNote: this.locationDetailsFormGroup.controls['invoiceNote'].value === ''
          ? null : this.locationDetailsFormGroup.controls['invoiceNote'].value,
        contactEmail: this.locationDetailsFormGroup.controls['contactEmail'].value,
        contactPerson: this.locationDetailsFormGroup.controls['contactPerson'].value,
        inactiveDate: this.locationDetailsFormGroup.controls['inactiveDate'].value === ''
          ? null : this.locationDetailsFormGroup.controls['inactiveDate'].value,
        phoneNumber: this.locationDetailsFormGroup.controls['phoneNumber'].value,
        phoneType: parseInt(PhoneTypes[this.locationDetailsFormGroup.controls['phoneType'].value]),
      }

      if (this.isEdit) {
        if (this.selectedRegion.id) {
          this.store.dispatch(new UpdateLocation(location, this.selectedRegion.id));
          this.isEdit = false;
          this.editedLocationId = undefined;
        }
      } else {
        if (this.selectedRegion.id) {
          this.store.dispatch(new SaveLocation(location, this.selectedRegion.id));
          this.store.dispatch(new ShowToast(MessageTypes.Success, MESSAGE_RECORD_HAS_BEEN_ADDED))
        }
      }

      this.store.dispatch(new ShowSideDialog(false));
      this.locationDetailsFormGroup.reset();
    } else {
      this.locationDetailsFormGroup.markAllAsTouched();
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
      address1: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      address2: ['', [Validators.maxLength(50)]],
      zip: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      state: ['', [Validators.required]],
      glNumber: ['', Validators.maxLength(50)],
      invoiceNote: ['', Validators.maxLength(50)],
      ext: ['', Validators.maxLength(50)],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPerson: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      inactiveDate: [''],
      phoneNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
      phoneType: ['', Validators.required],
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
