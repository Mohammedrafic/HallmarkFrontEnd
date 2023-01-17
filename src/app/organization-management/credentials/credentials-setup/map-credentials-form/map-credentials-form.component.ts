import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  Organization,
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
} from '@shared/models/organization.model';
import {
  FieldSettingsModel,
  ISelectAllEventArgs,
  MultiSelectChangeEventArgs,
  MultiSelectComponent,
} from '@syncfusion/ej2-angular-dropdowns';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { CANCEL_CONFIRM_TEXT, DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { combineLatestWith, debounceTime, delay, filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ShowSideDialog } from '../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetupGet, CredentialSetupMappingPost } from '@shared/models/credential-setup.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { GetCredential, GetCredentialTypes } from '@organization-management/store/organization-management.actions';
import { UserState } from '../../../../store/user.state';
import {
  SaveUpdateCredentialSetupMappingData,
  SaveUpdateCredentialSetupMappingSucceeded,
} from '@organization-management/store/credentials.actions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { TakeUntilDestroy } from '@core/decorators';
import { AppState } from '../../../../store/app.state';
import { MapCredentialsService } from '@organization-management/credentials/services/map-credentials.service';
import { DropdownsList } from '@organization-management/credentials/enums';
import { MapCredentialsAdapter } from '@organization-management/credentials/adapters/map-credentials.adapter';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Query } from "@syncfusion/ej2-data";
import { FilteringEventArgs } from "@syncfusion/ej2-dropdowns";

@TakeUntilDestroy
@Component({
  selector: 'app-map-credentials-form',
  templateUrl: './map-credentials-form.component.html',
  styleUrls: ['./map-credentials-form.component.scss'],
})
export class MapCredentialsFormComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('regionsDropdown') regionsDropdown: MultiSelectComponent;
  @ViewChild('locationsDropdown') locationsDropdown: MultiSelectComponent;
  @ViewChild('departmentsDropdown') departmentsDropdown: MultiSelectComponent;
  @ViewChild('groupsDropdown') groupsDropdown: MultiSelectComponent;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.credentials)
  credentials$: Observable<Credential[]>;

  @Select(OrganizationManagementState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]>;

  @Input() orgRegions: OrganizationRegion[];
  @Input() groups: CredentialSkillGroup[];
  @Input() mappingDataForEdit$: Subject<CredentialSetupMappingPost> = new Subject();

  @Output() formClosed = new EventEmitter();

  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isGridStateInvalid = false;
  public mapCredentialsFormGroup: FormGroup;

  public credentialSetupMappingToPost?: CredentialSetupMappingPost;
  public isEdit: boolean;
  public DropdownsList = DropdownsList;

  protected componentDestroy: () => Observable<unknown>;

  private credentialSetupList: CredentialSetupGet[] = [];
  private pageSubject = new Subject<number>();
  private previouslySavedMappingsNumber: number;
  private isAllGroupsSelected?: boolean;
  private checkedDropdownItems: number[] = [];
  public allRegions: boolean = false;
  public allLocations: boolean = false;
  public allDepartments: boolean = false;
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private mapCredentialsService: MapCredentialsService
  ) {
    super();

    this.createCredentialMappingForm();
  }

  get dialogTitle(): string {
    return this.isEdit ? 'Edit Mapping' : 'Map Credentials';
  }

  ngOnInit(): void {
    this.startOrganizationWatching();
    this.organizationChangedHandler();
    this.mapGridData();
    this.dropdownChangedHandler();
    this.idFieldName = 'masterCredentialId';
    this.mappingDataSavedHandler();
    this.setFormForEditHandler();
    this.pageChangedHandler();
  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRegions = event.checked;
    const regionsControl = this.mapCredentialsFormGroup.controls['regionIds'];
    if (this.allRegions) {
      regionsControl.setValue(null);
      regionsControl.disable();
      let locations: OrganizationLocation[] = [];
      this.orgRegions.forEach((region: OrganizationRegion) => {
        const filteredLocation = region.locations || [];
        locations = [...locations, ...filteredLocation] as OrganizationLocation[];
      });
      this.locations = sortByField(locations, 'name');
    } else {
      regionsControl.enable();
    }
  }

  public allLocationsChange(event: { checked: boolean }): void {
    this.allLocations = event.checked;
    const locationsControl = this.mapCredentialsFormGroup.controls['locationIds'];
    if (this.allLocations) {
      locationsControl.setValue(null);
      locationsControl.disable();
      let departments: OrganizationDepartment[] = [];
      this.locations?.forEach((location: OrganizationLocation) => {
        const filteredDepartments = location.departments || [];
        departments = [...departments, ...filteredDepartments] as OrganizationDepartment[];
      });
      this.departments = sortByField(departments, 'name');
    } else {
      locationsControl.enable();
    }
  }

  public allDepartmentsChange(event: { checked: boolean }): void {
    this.allDepartments = event.checked;
    const departmentsControl = this.mapCredentialsFormGroup.controls['departmentIds'];
    if (this.allDepartments) {
      departmentsControl.setValue(null);
      departmentsControl.disable();
    } else {
      departmentsControl.enable();
    }
  }

  public onDepartmentsFiltering(e: FilteringEventArgs): void {
    const char = e.text.length + 1;
    let query: Query = new Query();
    query =
      e.text !== ""
        ? query.where('name', 'contains', e.text, true).take(char * 15)
        : query;
    e.updateData(this.departments as [], query);
  };

  public onSelectAllGroups(selectAllEvent: ISelectAllEventArgs): void {
    this.isAllGroupsSelected = selectAllEvent.isChecked && this.groups.length > 1;
    this.disableDropdownItemsIfSelectedAll(DropdownsList.Groups);
  }

  public disableDropdownItemsIfSelectedAll(dropdownName: string): void {
    this.checkedDropdownItems = [];
    let dropdownComponent: MultiSelectComponent = this.regionsDropdown;
    let isAllItemsSelected: boolean | undefined = false;

    switch(dropdownName) {
      case DropdownsList.Groups:
        dropdownComponent = this.groupsDropdown;
        isAllItemsSelected = this.isAllGroupsSelected;
        break;
    }

    this.manageDropdownItems(isAllItemsSelected, dropdownComponent);
  }

  public onDropdownChange(args: MultiSelectChangeEventArgs, dropdownName: string): void {
    let dropdownComponent: MultiSelectComponent = this.regionsDropdown;
    let isAllItemsSelected: boolean | undefined = false;

    switch(dropdownName) {
      case DropdownsList.Groups:
        dropdownComponent = this.groupsDropdown;
        isAllItemsSelected = this.isAllGroupsSelected;
        if (this.isAllGroupsSelected) {
          this.isAllGroupsSelected = true;
          args.value = this.groups.map(s => s.id) as number[];
          this.mapCredentialsFormGroup.controls['groupIds'].setValue(args.value);
        }
        break;
    }
  }

  public onDropdownSelect(args: any, dropdownName: string): void {
    let dropdownComponent: MultiSelectComponent = this.regionsDropdown;
    let isAllItemsSelected: boolean | undefined = false;

    if (args.itemData?.id) {
      this.checkedDropdownItems.push(parseInt(args.itemData.id));
    }

    switch(dropdownName) {
      case DropdownsList.Groups:
        if (this.checkedDropdownItems.length === this.groups.length && this.groups.length > 1) {
          this.isAllGroupsSelected = true;
        }

        dropdownComponent = this.groupsDropdown;
        isAllItemsSelected = this.isAllGroupsSelected;
        break;
    }

    this.manageDropdownItems(isAllItemsSelected, dropdownComponent);
  }

  public onDropdownBlur(): void {
    this.checkedDropdownItems = [];
  }

  private manageDropdownItems(isAllItemsSelected = false, dropdownComponent: MultiSelectComponent): void {
    // disable items in dropdown if Select All was clicked
    if (isAllItemsSelected && dropdownComponent) {
      dropdownComponent.ulElement.previousElementSibling?.querySelectorAll('.e-list-item').forEach((element: any) =>
        element.classList.add('e-hide')
      );
      dropdownComponent.getItems().forEach((element: any) => element.classList.add('e-hide'));
    } else if (dropdownComponent) {
      dropdownComponent.ulElement.previousElementSibling?.querySelectorAll('.e-list-item').forEach((element: any) =>
        element.classList.remove('e-hide')
      );
      dropdownComponent.getItems().forEach((element: any) => element.classList.remove('e-hide'));
    }
  }

  public onMapCredentialFormCancelClick(): void {
    if (
      (this.isEdit
        && (this.mapCredentialsFormGroup.dirty || this.selectedItems.length !== this.previouslySavedMappingsNumber)
      )
      || (!this.isEdit && (this.mapCredentialsFormGroup.dirty || this.selectedItems.length))
    ) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.cleanUp();
      });
    } else {
      this.cleanUp();
    }
  }

  public onMapCredentialFormSaveClick(): void {
    if (this.mapCredentialsFormGroup.valid && this.selectedItems.length) {
      const { regionIds, locationIds, departmentIds, groupIds, mappingId } = this.mapCredentialsFormGroup.getRawValue();
      const credentialSetupMapping: CredentialSetupMappingPost = {
        regionIds: this.allRegions ? null : regionIds,
        locationIds: this.allLocations ? null : locationIds,
        departmentIds: this.allDepartments ? null : departmentIds,
        skillGroupIds: this.isAllGroupsSelected ? [] : groupIds,
        credentials: MapCredentialsAdapter.prepareCredentialsDetails(this.selectedItems),
      };

      if (this.isEdit) {
        credentialSetupMapping.credentionSetupMappingId = mappingId;
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
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new GetCredential());
      this.store.dispatch(new GetCredentialTypes());
    });
  }

  private mapGridData(): void {
    this.credentials$.pipe(
      combineLatestWith(this.credentialTypes$),
      takeUntil(this.componentDestroy()),
      filter(([credentials, credentialTypes]) => credentials?.length > 0 && credentialTypes.length > 0)
    ).subscribe(([credentials, credentialTypes]) => {
      this.lastAvailablePage = this.getLastPage(credentials);
      this.totalDataRecords = credentials.length;
      this.credentialSetupList = [];

      if (credentialTypes) {
        credentials.map(item => {
          const foundCredentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
          this.credentialSetupList.push(MapCredentialsAdapter.prepareCredentialGet(item, foundCredentialType));
        });
      }
      this.gridDataSource = this.credentialSetupList;

      // reset grid invalid state
      this.isGridStateInvalid = false;
    });
  }

  private setFormForEditHandler(): void {
    // subscribe on mappingDataForEdit$ to be able to set up Mapping form in Edit mode
    this.mappingDataForEdit$.pipe(
      debounceTime(700),
      takeUntil(this.componentDestroy())
    ).subscribe(credentialSetupMapping => {
      if (credentialSetupMapping) {
        this.isEdit = true;
        // setup form data
        this.mapCredentialsFormGroup.controls['mappingId'].setValue(credentialSetupMapping.credentionSetupMappingId);

        if (!credentialSetupMapping.regionIds) {
          this.allRegions = true;
          this.mapCredentialsFormGroup.controls['regionIds'].setValue(null);
        } else {
          this.mapCredentialsFormGroup.controls['regionIds'].setValue(credentialSetupMapping.regionIds);
        }

        if (!credentialSetupMapping.locationIds) {
          this.allLocations = true;
          this.mapCredentialsFormGroup.controls['locationIds'].setValue(null);
        } else {
          this.mapCredentialsFormGroup.controls['locationIds'].setValue(credentialSetupMapping.locationIds);
        }

        if (!credentialSetupMapping.departmentIds) {
          this.allDepartments = true;
          this.mapCredentialsFormGroup.controls['departmentIds'].setValue(null);
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

  public checkboxStateChanged(
    event: { checked: boolean },
    credential: CredentialSetupGet,
    checkboxName: 'isActive' | 'reqSubmission' | 'reqOnboard'
  ): void {
    (this.grid.dataSource as []).map((item: CredentialSetupGet) => {
      if (item.masterCredentialId === credential.masterCredentialId) {
        // update checkbox state value
        item[checkboxName] = event.checked;
      }
    });
  }

  public customStopPropagation(credential: CredentialSetupGet, event: any): void {
    const foundItem = this.selectedItems.find((selectedItem: CredentialSetupGet) =>
      selectedItem.masterCredentialId === credential.masterCredentialId
    );

    if (foundItem) {
      event.stopPropagation();
    }
  }

  private dropdownChangedHandler(): void {
    this.mapCredentialsFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((regionIds: number[]) => {
      if (regionIds && regionIds.length > 0) {
        this.locations = [];
        regionIds.forEach((id) => {
          const selectedRegion = this.orgRegions.find(region => region.id === id);
          this.locations.push(...sortByField(selectedRegion?.locations ?? [], 'name') as []);
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
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.departments = [];
        locationIds.forEach(id => {
          const selectedLocation = this.locations.find(location => location.id === id);
          this.departments.push(...sortByField(selectedLocation?.departments ?? [], 'name') as []);
        });
      } else {
        this.departments = [];
      }

      this.mapCredentialsFormGroup.controls['departmentIds'].setValue(null);
    });
  }

  private mappingDataSavedHandler(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveUpdateCredentialSetupMappingSucceeded),
      takeUntil(this.componentDestroy())
    ).subscribe((response) => {
      if (response.isSucceed) {
        this.store.dispatch(new ShowSideDialog(false));
        this.formClosed.emit();
        this.store.dispatch(new GetCredential());
        this.store.dispatch(new GetCredentialTypes());
        this.clearFormDetails();
        this.allRegionsChange({checked: false});
        this.allLocationsChange({checked: false});
        this.allDepartmentsChange({checked: false});
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
        okButtonClass: '',
      }).pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
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
    this.mapCredentialsFormGroup = this.mapCredentialsService.createForm();
  }

  private clearFormDetails(): void {
    this.removeActiveCssClass();
    this.mapCredentialsFormGroup.reset();
    this.credentialSetupMappingToPost = undefined;
    this.isEdit = false;
    this.allRegions = false;
    this.allLocations = false;
    this.allDepartments = false;
    this.isAllGroupsSelected = undefined;
    this.clearSelection(this.grid);
    this.gridDataSource = [];
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
    this.pageSubject.pipe(
      throttleTime(100),
      takeUntil(this.componentDestroy())
    ).subscribe((page) => {
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

  private startOrganizationWatching(): void {
    this.organization$.pipe(
      delay(200),
      takeUntil(this.componentDestroy())
    ).subscribe((org: Organization) => {
      const { isIRPEnabled, isVMCEnabled } = org?.preferences || {};
      const user = this.store.selectSnapshot(UserState.user);

      const isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled)
        && user?.businessUnitType !== BusinessUnitType.MSP;

      if (isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled)) {
        this.startGroupIdWatching();
      }

      this.grid.getColumnByField('irpComment').visible = isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);
      this.grid.getColumnByField('system').visible = isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);

      this.grid.refreshColumns();
    });
  }

  private startGroupIdWatching(): void {
    this.mapCredentialsFormGroup.get('groupIds')?.valueChanges.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((groupIds: number[] | null) => {
      let credentialSetupList = this.credentialSetupList;

      if (groupIds?.length) {
        const groupIdsSet = new Set(groupIds);
        const selectedGroups = this.groups.filter(el => groupIdsSet.has(el.id as number));
        const isGroupHasIrp = selectedGroups.some(el => el.includeInIRP);
        const isGroupHasVMS = selectedGroups.some(el => el.includeInVMS);

        credentialSetupList = credentialSetupList.filter((el) =>
          el.includeInIRP && isGroupHasIrp || el.includeInVMS && isGroupHasVMS
        );
      }

      this.gridDataSource = credentialSetupList;
      this.grid.refresh();
    });
  }
}
