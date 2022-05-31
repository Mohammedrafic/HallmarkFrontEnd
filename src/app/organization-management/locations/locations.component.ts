import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Actions, Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FreezeService, GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationManagementState } from '../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import {
  DeleteLocationById,
  ExportLocations,
  GetLocationsByRegionId,
  GetOrganizationById,
  GetRegions,
  SaveLocation, SaveRegion, SetGeneralStatesByCountry,
  SetImportFileDialogState,
  UpdateLocation
} from '../store/organization-management.actions';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { Location } from '@shared/models/location.model';

import { PhoneTypes } from '@shared/enums/phone-types';
import { Country } from '@shared/enums/states';
import {
  CANCEL_COFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED
} from '@shared/constants';
import { Organization } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { UserState } from '../../store/user.state';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';

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
  locations$: Observable<Location[]>;

  locationDetailsFormGroup: FormGroup;
  newRegionName: string;
  formBuilder: FormBuilder;

  @Select(OrganizationManagementState.organization)
  organization$: Observable<Organization>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  isEdit: boolean;
  editedLocationId?: number;

  private unsubscribe$: Subject<void> = new Subject();

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

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super();
    /**
     * TODO: pending filtering
     *    this.filteredItems = [
            { text: 'Some filter option', column: 'extLocationId', value: 'fdfsd' }
          ];
     */

    this.fileName = 'Organization Locations ' + datePipe.transform(Date.now(),'MM/dd/yyyy');
    this.formBuilder = builder;
    this.createLocationForm();
  }

  ngOnInit(): void {
    this.organizationId$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe(id => {
      this.store.dispatch(new GetOrganizationById(id));
    });

    this.organization$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe(organization => {
      this.store.dispatch(new SetGeneralStatesByCountry(parseInt(Country[organization.generalInformation.country])));
      this.store.dispatch(new GetRegions());
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport() {
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.store.dispatch(new ShowExportDialog(false));
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.store.dispatch(new ExportLocations(new ExportPayload(
      fileType, 
      { regionId: this.selectedRegion.id }, 
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val.id) : null,
      options?.fileName || this.fileName
    )));
    this.clearSelection(this.grid);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
      this.clearSelection(this.grid);
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
      this.store.dispatch(new SaveRegion({ name: this.newRegionName }))
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

      if (this.isEdit) {
        if (this.selectedRegion.id) {
          this.store.dispatch(new UpdateLocation(location, this.selectedRegion.id));
          this.isEdit = false;
          this.editedLocationId = undefined;
        }
      } else {
        if (this.selectedRegion.id) {
          this.store.dispatch(new SaveLocation(location, this.selectedRegion.id));
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED))
        }
      }

      this.store.dispatch(new ShowSideDialog(false));
      this.locationDetailsFormGroup.reset();
      this.removeActiveCssClass();
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
      phoneNumber: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
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
