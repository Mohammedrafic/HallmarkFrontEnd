import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import {
  FieldSettingsModel,
  ISelectAllEventArgs,
  MultiSelectComponent,
} from '@syncfusion/ej2-angular-dropdowns';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { CANCEL_COFIRM_TEXT, DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { combineLatestWith, filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ShowSideDialog } from '../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSetupDetails,
  CredentialSetupGet,
  CredentialSetupMappingPost
} from '@shared/models/credential-setup.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { GetCredential, GetCredentialTypes } from '@organization-management/store/organization-management.actions';
import { UserState } from '../../../../store/user.state';
import {
  SaveUpdateCredentialSetupMappingData,
  SaveUpdateCredentialSetupMappingSucceeded
} from '@organization-management/store/credentials.actions';

export enum DropdownsList {
  Regions = 'regions',
  Locations = 'locations',
  Departments = 'departments',
  Groups = 'groups'
}

@Component({
  selector: 'app-map-credentials-form',
  templateUrl: './map-credentials-form.component.html',
  styleUrls: ['./map-credentials-form.component.scss']
})
export class MapCredentialsFormComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('regionsDropdown') regionsDropdown: MultiSelectComponent;
  @ViewChild('locationsDropdown') locationsDropdown: MultiSelectComponent;
  @ViewChild('departmentsDropdown') departmentsDropdown: MultiSelectComponent;
  @ViewChild('groupsDropdown') groupsDropdown: MultiSelectComponent;

  @Input() orgRegions: OrganizationRegion[];
  @Input() groups: CredentialSkillGroup[];
  @Input() mappingDataForEdit$: Subject<CredentialSetupMappingPost> = new Subject();

  @Output() formClosed = new EventEmitter();

  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isGridStateInvalid = false;
  public mapCredentialsFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.credentials)
  credentials$: Observable<Credential[]>;

  @Select(OrganizationManagementState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]>;

  public credentialSetupMappingToPost?: CredentialSetupMappingPost;
  public isEdit: boolean;
  public DropdownsList = DropdownsList;

  get dialogTitle(): string {
    return this.isEdit ? 'Edit Mapping' : 'Map Credentials';
  }

  private credentialSetupList: CredentialSetupGet[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();
  private previouslySavedMappingsNumber: number;
  private isAllRegionsSelected?: boolean;
  private isAllLocationsSelected?: boolean;
  private isAllDepartmentsSelected?: boolean;
  private isAllGroupsSelected?: boolean;

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createCredentialMappingForm();
  }

  ngOnInit(): void {
    this.organizationChangedHandler();
    this.mapGridData();
    this.dropdownChangedHandler();
    this.idFieldName = 'masterCredentialId';
    this.mappingDataSavedHandler();
    this.setFormForEditHandler();
    this.pageChangedHandler();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onSelectAllRegions(selectAllEvent: ISelectAllEventArgs): void {
    this.isAllRegionsSelected = selectAllEvent.isChecked && this.orgRegions.length > 1;
    this.disableDropdownItemsIfSelectedAll(DropdownsList.Regions);
  }

  public onSelectAllLocations(selectAllEvent: ISelectAllEventArgs): void {
    this.isAllLocationsSelected = selectAllEvent.isChecked && this.locations.length > 1;
    this.disableDropdownItemsIfSelectedAll(DropdownsList.Locations);
  }

  public onSelectAllDepartments(selectAllEvent: ISelectAllEventArgs): void {
    this.isAllDepartmentsSelected = selectAllEvent.isChecked && this.departments.length > 1;
    this.disableDropdownItemsIfSelectedAll(DropdownsList.Departments);
  }

  public onSelectAllGroups(selectAllEvent: ISelectAllEventArgs): void {
    this.isAllGroupsSelected = selectAllEvent.isChecked && this.groups.length > 1;
    this.disableDropdownItemsIfSelectedAll(DropdownsList.Groups);
  }

  public disableDropdownItemsIfSelectedAll(dropdownName: string): void {
    let dropdownComponent: MultiSelectComponent = this.regionsDropdown;
    let isAllItemsSelected = this.isAllRegionsSelected;

    switch(dropdownName) {
      case DropdownsList.Regions:
        dropdownComponent = this.regionsDropdown;
        isAllItemsSelected = this.isAllRegionsSelected;
        break;
      case DropdownsList.Locations:
        dropdownComponent = this.locationsDropdown;
        isAllItemsSelected = this.isAllLocationsSelected;
        break;
      case DropdownsList.Departments:
        dropdownComponent = this.departmentsDropdown;
        isAllItemsSelected = this.isAllDepartmentsSelected;
        break;
      case DropdownsList.Groups:
        dropdownComponent = this.groupsDropdown;
        isAllItemsSelected = this.isAllGroupsSelected;
        break;
    }

    // disable items in dropdown if Select All was clicked
    if (isAllItemsSelected && dropdownComponent) {
      dropdownComponent.ulElement.previousElementSibling?.querySelectorAll('.e-list-item').forEach((element: any) => element.classList.add('e-hide'));
      dropdownComponent.getItems().forEach((element: any) => element.classList.add('e-hide'));
    } else if (dropdownComponent) {
      dropdownComponent.ulElement.previousElementSibling?.querySelectorAll('.e-list-item').forEach((element: any) => element.classList.remove('e-hide'));
      dropdownComponent.getItems().forEach((element: any) => element.classList.remove('e-hide'));
    }
  }

  public onMapCredentialFormCancelClick(): void {
    if ((this.isEdit && (this.mapCredentialsFormGroup.dirty || this.selectedItems.length !== this.previouslySavedMappingsNumber))
      || (!this.isEdit && (this.mapCredentialsFormGroup.dirty || this.selectedItems.length))) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.cleanUp();
        });
    } else {
      this.cleanUp();
    }
  }

  public onMapCredentialFormSaveClick(): void {
    if (this.mapCredentialsFormGroup.valid && this.selectedItems.length) {
      const credentials = this.getCredentialSetupDetails();
      const credentialSetupMapping: CredentialSetupMappingPost = {
        regionIds: this.isAllRegionsSelected ? [] : this.mapCredentialsFormGroup.controls['regionIds'].value, // [] means All on the BE side
        locationIds: this.isAllLocationsSelected ? [] : this.mapCredentialsFormGroup.controls['locationIds'].value, // [] means All on the BE side
        departmentIds: this.isAllDepartmentsSelected ? [] : this.mapCredentialsFormGroup.controls['departmentIds'].value, // [] means All on the BE side
        skillGroupIds: this.isAllGroupsSelected ? [] : this.mapCredentialsFormGroup.controls['groupIds'].value,
        credentials: credentials
      }

      if (this.isEdit) {
        credentialSetupMapping.credentionSetupMappingId = this.mapCredentialsFormGroup.controls['mappingId'].value;
      }

      this.credentialSetupMappingToPost = credentialSetupMapping;
      this.store.dispatch(new SaveUpdateCredentialSetupMappingData(credentialSetupMapping));
    } else {
      this.isGridStateInvalid = this.selectedItems.length === 0;
      this.mapCredentialsFormGroup.markAllAsTouched();
    }
  }

  public onRowSelected(event: any, grid: any): void {
    this.rowSelected(event, grid);

    // grid validation
    this.isGridStateInvalid = false;
  }

  public onRowDeselected(event: any, grid: any): void {
    this.rowDeselected(event, grid);

    // grid validation
    this.isGridStateInvalid = this.selectedItems.length === 0;
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.store.dispatch(new GetCredential());
      this.store.dispatch(new GetCredentialTypes());
    });
  }

  private mapGridData(): void {
    this.credentials$.pipe(combineLatestWith(this.credentialTypes$), takeUntil(this.unsubscribe$),
      filter(([credentials, credentialTypes]) => credentials?.length > 0 && credentialTypes.length > 0))
      .subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = this.getLastPage(credentials);
        this.totalDataRecords = credentials.length;
        this.credentialSetupList = [];

        if (credentialTypes) {
          credentials.map(item => {
            let foundCredentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            let credentialSetup: CredentialSetupGet = {
              masterCredentialId: item.id as number,
              credentialType: foundCredentialType ? foundCredentialType.name : '',
              description: item.name,
              comments: item.comment
            }
            this.credentialSetupList.push(credentialSetup);
          });
        }
        this.gridDataSource = this.credentialSetupList;

        // reset grid invalid state
        this.isGridStateInvalid = false;
      });
  }

  private setFormForEditHandler(): void {
    // subscribe on mappingDataForEdit$ to be able to set up Mapping form in Edit mode
    this.mappingDataForEdit$.pipe(takeUntil(this.unsubscribe$)).subscribe(credentialSetupMapping => {
      if (credentialSetupMapping) {
        this.isEdit = true;
        // setup form data
        this.mapCredentialsFormGroup.controls['mappingId'].setValue(credentialSetupMapping.credentionSetupMappingId);

        if (!credentialSetupMapping.regionIds) {
          this.isAllRegionsSelected = true;
          const allRegions = this.orgRegions.map(r => r.id);
          this.mapCredentialsFormGroup.controls['regionIds'].setValue(allRegions);
        } else {
          this.mapCredentialsFormGroup.controls['regionIds'].setValue(credentialSetupMapping.regionIds);
        }

        if (!credentialSetupMapping.locationIds) {
          this.isAllLocationsSelected = true;
          const locationIds = this.locations.map(location => location.id);
          this.mapCredentialsFormGroup.controls['locationIds'].setValue(locationIds);
        } else {
          this.mapCredentialsFormGroup.controls['locationIds'].setValue(credentialSetupMapping.locationIds);
        }

        if (!credentialSetupMapping.departmentIds) {
          this.isAllDepartmentsSelected = true;
          const departmentIds = this.departments.map(department => department.id);
          this.mapCredentialsFormGroup.controls['departmentIds'].setValue(departmentIds);
        } else {
          this.mapCredentialsFormGroup.controls['departmentIds'].setValue(credentialSetupMapping.departmentIds);
        }

        if (!credentialSetupMapping.skillGroupIds) {
          this.isAllGroupsSelected = true;
          const groupIds = this.groups.map(g => g.id);
          this.mapCredentialsFormGroup.controls['groupIds'].setValue(groupIds);
        } else {
          this.mapCredentialsFormGroup.controls['groupIds'].setValue(credentialSetupMapping.skillGroupIds);
        }

        credentialSetupMapping.credentials.forEach(savedMapping => {
          (this.gridDataSource as CredentialSetupGet[]).map((credential, index) => {
            if (credential.masterCredentialId === savedMapping.masterCredentialId) {
              credential.inactiveDate = savedMapping.inactiveDate;
              credential.isActive = savedMapping.optional;
              credential.reqSubmission = savedMapping.reqSubmission;
              credential.reqOnboard = savedMapping.reqOnboard;

              this.selectedItems.push(this.gridDataSource[index]);
            }
          });

          this.previouslySavedMappingsNumber = this.selectedItems.length;
          this.grid.refresh();
        });
      }
    });
  }

  public checkboxStateChanged(event: any, credential: CredentialSetupGet, checkboxName: string): void {
    (this.grid.dataSource as []).map((item: CredentialSetupGet) => {
      if (item.masterCredentialId === credential.masterCredentialId) {
        // update checkbox state value
        switch(checkboxName) {
          case 'isActive':
            item.isActive = event.checked;
            break;
          case 'reqSubmission':
            item.reqSubmission = event.checked;
            break;
          case 'reqOnboard':
            item.reqOnboard = event.checked;
            break;
        }
      }
    });
  }

  public customStopPropagation(credential: CredentialSetupGet, event: any): void {
    const foundItem = this.selectedItems.find((selectedItem: CredentialSetupGet) => selectedItem.masterCredentialId === credential.masterCredentialId);

    if (foundItem) {
      event.stopPropagation();
    }
  }

  private dropdownChangedHandler(): void {
    this.mapCredentialsFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((regionIds: number[]) => {
      if (regionIds && regionIds.length > 0) {
        this.locations = [];
        regionIds.forEach((id) => {
          const selectedRegion = this.orgRegions.find(region => region.id === id);
          this.locations.push(...selectedRegion?.locations as any);
        });
        this.departments = [];
        this.locations.forEach(location => {
          this.departments.push(...location.departments);
        });
      } else {
        this.locations = [];
        this.departments = [];
      }

      this.mapCredentialsFormGroup.controls['locationIds'].setValue(null);
      this.mapCredentialsFormGroup.controls['departmentIds'].setValue(null);
    });

    this.mapCredentialsFormGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.departments = [];
        locationIds.forEach(id => {
          const selectedLocation = this.locations.find(location => location.id === id);
          this.departments.push(...selectedLocation?.departments as []);
        });
      } else {
        this.departments = [];
      }

      this.mapCredentialsFormGroup.controls['departmentIds'].setValue(null);
    });
  }

  private mappingDataSavedHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveUpdateCredentialSetupMappingSucceeded)).subscribe((response) => {
      if (response.isSucceed) {
        this.store.dispatch(new ShowSideDialog(false));
        this.formClosed.emit();
        this.store.dispatch(new GetCredential());
        this.store.dispatch(new GetCredentialTypes());
        this.clearFormDetails();
      } else {
        this.showConfirmationPopup();
      }
    });
  }

  private showConfirmationPopup(): void {
    this.confirmService
      .confirm(DATA_OVERRIDE_TEXT, {
        title: DATA_OVERRIDE_TITLE,
        okButtonLabel: 'Confirm',
        okButtonClass: ''
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        if (this.credentialSetupMappingToPost) {
          this.credentialSetupMappingToPost.forceUpsert = true; // set force override flag for BE
          this.store.dispatch(new SaveUpdateCredentialSetupMappingData(this.credentialSetupMappingToPost));
          this.store.dispatch(new ShowSideDialog(false));
          this.formClosed.emit();
          this.store.dispatch(new GetCredential());
          this.store.dispatch(new GetCredentialTypes());
          this.clearFormDetails();
        }
      });
  }

  private createCredentialMappingForm(): void {
    this.mapCredentialsFormGroup = this.formBuilder.group({
      mappingId: [null],
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
      groupIds: [null, Validators.required]
    });
  }

  private getCredentialSetupDetails(): CredentialSetupDetails[] {
    const credentialSetupDetails: CredentialSetupDetails[] = [];
    this.selectedItems.forEach(item => {
      let credential: CredentialSetupDetails = {
        masterCredentialId: item.masterCredentialId,
        comments: item.comments,
        optional: item.isActive,
        reqSubmission: item.reqSubmission,
        reqOnboard: item.reqOnboard,
        inactiveDate: item.inactiveDate
      }
      credentialSetupDetails.push(credential);
    });

    return credentialSetupDetails;
  }

  private clearFormDetails(): void {
    this.removeActiveCssClass();
    this.mapCredentialsFormGroup.reset();
    this.credentialSetupMappingToPost = undefined;
    this.isEdit = false;
    this.isAllRegionsSelected = undefined;
    this.isAllLocationsSelected = undefined;
    this.isAllDepartmentsSelected = undefined;
    this.isAllGroupsSelected = undefined;
    this.clearSelection(this.grid);
  }

  private cleanUp(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.clearFormDetails();
    this.credentialSetupList.map(s => {
      s.isActive = false;
      s.reqSubmission = false;
      s.reqOnboard = false;
    });
    this.grid.refresh();
    this.isGridStateInvalid = false;
  }

  private pageChangedHandler(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.gridDataSource = this.getRowsPerPage(page);
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(currentPage: number): object[] {
    return this.credentialSetupList.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
