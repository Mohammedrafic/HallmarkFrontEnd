import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import {FormGroup } from '@angular/forms';

import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatestWith, filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import {
  FieldSettingsModel,
  ISelectAllEventArgs,
  MultiSelectChangeEventArgs,
  MultiSelectComponent,
} from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Query } from "@syncfusion/ej2-data";
import { FilteringEventArgs } from "@syncfusion/ej2-dropdowns";

import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  Organization,
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
} from '@shared/models/organization.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { CANCEL_CONFIRM_TEXT, DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ShowSideDialog } from '../../../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSetupDetails,
  CredentialSetupGet,
  CredentialSetupMappingPost,
  CredentialsSelectedItem,
} from '@shared/models/credential-setup.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import {
  ClearCredentialsAndTypes,
  GetCredential,
  GetCredentialTypes,
} from '@organization-management/store/organization-management.actions';
import { UserState } from '../../../../../../store/user.state';
import {
  GetCredentialSetupByMappingId,
  SaveUpdateCredentialSetupMappingData,
  SaveUpdateCredentialSetupMappingSucceeded,
  UpdateCredentialSetupSucceeded,
} from '@organization-management/store/credentials.actions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OutsideZone, TakeUntilDestroy } from '@core/decorators';
import { AppState } from '../../../../../../store/app.state';
import { MapCredentialsService } from '@organization-management/credentials/services/map-credentials.service';
import { DropdownsList } from '@organization-management/credentials/enums';
import { MapCredentialsAdapter } from '@organization-management/credentials/adapters/map-credentials.adapter';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { CredentialsSetupService } from '@organization-management/credentials/services';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
import { CredentialTypeSource } from '@organization-management/credentials/interfaces';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { SaveEditCredentialMessage } from '@organization-management/credentials/components/credentials-setup/constants';

@TakeUntilDestroy
@Component({
  selector: 'app-map-credentials-dialog',
  templateUrl: './map-credentials-dialog.component.html',
  styleUrls: ['./map-credentials-dialog.component.scss'],
})
export class MapCredentialsDialogComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Input() userPermission: Permission;
  @Input() orgRegions: OrganizationRegion[];
  @Input() groups: CredentialSkillGroup[];

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('regionsDropdown') regionsDropdown: MultiSelectComponent;
  @ViewChild('locationsDropdown') locationsDropdown: MultiSelectComponent;
  @ViewChild('departmentsDropdown') departmentsDropdown: MultiSelectComponent;
  @ViewChild('groupsDropdown') groupsDropdown: MultiSelectComponent;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  @Select(OrganizationManagementState.credentials)
  private credentials$: Observable<Credential[]>;
  @Select(OrganizationManagementState.credentialTypes)
  private credentialTypes$: Observable<CredentialType[]>;
  @Select(CredentialsState.credentialSetupList)
  private credentialSetup$: Observable<CredentialSetupGet[]>;

  public isEditCredentialModalOpen = false;
  public isIRPAndVmsEnabled: boolean;
  public isCredentialIRP = false;
  public isEdit = false;
  public selectedCredentialList: CredentialSetupDetails[] = [];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];
  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public mapCredentialsFormGroup: FormGroup;
  public credentialSetupMappingToPost?: CredentialSetupMappingPost;
  public DropdownsList = DropdownsList;
  public allRegions = false;
  public allLocations = false;
  public allDepartments = false;
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);
  public filterType = 'Contains';
  public credentialTypeSources: CredentialTypeSource[] = [];

  public readonly userPermissions = UserPermissions;
  public readonly editCredentialMessage: string = SaveEditCredentialMessage;

  private credentialSetupMapping: CredentialSetupMappingPost;
  private credentialSetupList: CredentialSetupGet[] = [];
  private allCredentialSetupList: CredentialSetupGet[] = [];
  private pageSubject: Subject<number> = new Subject<number>();
  private isAllGroupsSelected?: boolean;
  private checkedDropdownItems: number[] = [];
  private selectedCredentialTypes: null | number[] = [];

  protected readonly componentDestroy: () => Observable<unknown>;

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private mapCredentialsService: MapCredentialsService,
    private readonly ngZone: NgZone,
    private credentialsSetupService: CredentialsSetupService,
  ) {
    super();

    this.createCredentialMappingForm();
  }

  get dialogTitle(): string {
    return this.isEdit ? 'Edit Mapping' : 'Map Credentials';
  }

  ngOnInit(): void {
    this.setOrganizationConfig();
    this.organizationChangedHandler();
    this.mapGridData();
    this.dropdownChangedHandler();
    this.idFieldName = 'masterCredentialId';
    this.mappingDataSavedHandler();
    this.watchForSelectedMapping();
    this.pageChangedHandler();
    this.startGroupIdWatching();
    this.watchForCredentialTypesChange();
    this.watchForUpdateCredentialGrid();
    this.watchForSucceededUpdateCredential();
  }

  public removeSelectedCredential(credentialSetup: CredentialSetupGet): void {
    this.mapCredentialsService.removeSelectedCredential(
      this.mapCredentialsFormGroup,
      credentialSetup.masterCredentialId
    );
  }

  public editSelectedCredential(credentialSetup: CredentialSetupGet): void {
    this.isEditCredentialModalOpen = true;
    this.isCredentialIRP = this.isIRPAndVmsEnabled && !!(credentialSetup.includeInIRP);

    const credential = this.mapCredentialsService.getSelectedCredential(
      this.selectedCredentialList,
      credentialSetup.masterCredentialId
    );

    this.credentialsSetupService.setSelectedCredential(credential as CredentialSetupDetails);
    this.showEditCredentialDialog();
  }

  public hideCredentialDialog(): void {
    this.isEditCredentialModalOpen = false;
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
  }

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
    switch(dropdownName) {
      case DropdownsList.Groups:
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

  public closeMapCredentialDialog(): void {
    const isCreateModalHasChange = !this.isEdit && this.mapCredentialsFormGroup.dirty;
    const isEditModalHasChange = this.isEdit
      && (this.mapCredentialsFormGroup.dirty || this.selectedCredentialList?.length !== this.gridDataSource?.length);

    if (isEditModalHasChange || isCreateModalHasChange) {
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

  public saveCredentialMapping(): void {
    if (this.mapCredentialsFormGroup.valid && this.gridDataSource.length) {
      const { regionIds, locationIds, departmentIds, groupIds, mappingId } = this.mapCredentialsFormGroup.getRawValue();
      const credentialSetupMapping: CredentialSetupMappingPost = {
        regionIds: this.allRegions ? null : regionIds,
        locationIds: this.allLocations ? null : locationIds,
        departmentIds: this.allDepartments ? null : departmentIds,
        skillGroupIds: this.isAllGroupsSelected ? [] : groupIds,
        credentials: MapCredentialsAdapter.prepareCredentialsDetails(this.gridDataSource as CredentialsSelectedItem[]),
      };

      if (this.isEdit) {
        credentialSetupMapping.credentionSetupMappingId = mappingId;
      }

      this.credentialSetupMappingToPost = credentialSetupMapping;
      this.store.dispatch(new SaveUpdateCredentialSetupMappingData(credentialSetupMapping));
    } else {
      this.mapCredentialsFormGroup.markAllAsTouched();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private manageDropdownItems(isAllItemsSelected = false, dropdownComponent: MultiSelectComponent): void {
    // disable items in dropdown if Select All was clicked
    if (isAllItemsSelected && dropdownComponent) {
      dropdownComponent.ulElement.previousElementSibling?.querySelectorAll('.e-list-item').forEach((element: Element) =>
        element.classList.add('e-hide')
      );
      dropdownComponent.getItems().forEach((element: Element) => element.classList.add('e-hide'));
    } else if (dropdownComponent) {
      dropdownComponent.ulElement.previousElementSibling?.querySelectorAll('.e-list-item').forEach((element: Element) =>
        element.classList.remove('e-hide')
      );
      dropdownComponent.getItems().forEach((element: Element) => element.classList.remove('e-hide'));
    }
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch([
        new GetCredential(),
        new GetCredentialTypes(),
      ]);
    });
  }

  private mapGridData(): void {
    this.credentials$.pipe(
      combineLatestWith(this.credentialTypes$),
      takeUntil(this.componentDestroy()),
      filter(([credentials, credentialTypes]) => credentials?.length > 0 && credentialTypes.length > 0)
    ).subscribe(([credentials, credentialTypes]) => {
      this.updateGridColumns();
      this.lastAvailablePage = this.getLastPage(credentials);
      this.credentialSetupList = this.allCredentialSetupList = [];

      if (credentialTypes) {
        credentials.forEach(item => {
          const foundCredentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
          this.credentialSetupList.push(MapCredentialsAdapter.prepareCredentialGet(item, foundCredentialType));
        });
      }
      this.allCredentialSetupList = this.credentialSetupList;
      this.credentialTypeSources = this.mapCredentialsService.prepareCredentialTypeSources(this.allCredentialSetupList);
      this.totalDataRecords = 0;

      if (this.isEdit) {
        this.populateForm(this.credentialSetupMapping);
      }
    });
  }

  private populateForm(credentialSetupMapping: CredentialSetupMappingPost): void {
    if (!this.credentialSetupMapping) {
      return;
    }

    this.selectedCredentialList = credentialSetupMapping.credentials;
    this.mapCredentialsFormGroup.controls['mappingId'].setValue(credentialSetupMapping.credentionSetupMappingId);
    this.allRegionsChange({ checked: !credentialSetupMapping.regionIds });
    this.allLocationsChange({ checked: !credentialSetupMapping.locationIds });
    this.allDepartmentsChange({ checked: !credentialSetupMapping.departmentIds });

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

    let groupIds: (number | undefined)[] = [];
    if (!credentialSetupMapping.skillGroupIds?.length) {
      this.isAllGroupsSelected = true;
      groupIds = this.groups.map(g => g.id);
      this.mapCredentialsFormGroup.controls['groupIds'].setValue(groupIds);
    } else {
      groupIds = credentialSetupMapping.skillGroupIds;
      this.mapCredentialsFormGroup.controls['groupIds'].setValue(credentialSetupMapping.skillGroupIds);
    }

    if(credentialSetupMapping.credentialType) {
      this.mapCredentialsFormGroup.controls['credentialType'].setValue(credentialSetupMapping.credentialType);
    }

    if (this.isIRPAndVmsEnabled) {
      this.groupCredentials(groupIds);
    }

   credentialSetupMapping.credentials.forEach(savedMapping => {
      (this.gridDataSource as CredentialSetupGet[]).map((credential) => {
        if (credential.masterCredentialId === savedMapping.masterCredentialId) {
          credential.inactiveDate = savedMapping.inactiveDate;
          credential.isActive = savedMapping.isActive;
          credential.reqSubmission = savedMapping.reqSubmission;
          credential.reqOnboard = savedMapping.reqOnboard;
        }
      });
      this.grid.refresh();
    });
  }

  private watchForSelectedMapping(): void {
    this.mapCredentialsService.getSelectedMappingStream().pipe(
      filter((mapping: CredentialSetupMappingPost | null) => !!mapping),
      takeUntil(this.componentDestroy())
    ).subscribe((credentialSetupMapping: CredentialSetupMappingPost | null) => {
      if (credentialSetupMapping) {
        this.credentialSetupMapping = credentialSetupMapping;
        this.isEdit = true;
      } else {
        this.isEdit = false;
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

  public customStopPropagation(credential: CredentialSetupGet, event: Event): void {
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
      }

      this.mapCredentialsFormGroup.controls['departmentIds'].setValue(null);
    });
  }

  private closeDialog(): void {
    this.store.dispatch([new ShowSideDialog(false), new ClearCredentialsAndTypes()]);
    this.clearFormDetails();
  }

  private mappingDataSavedHandler(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveUpdateCredentialSetupMappingSucceeded),
      takeUntil(this.componentDestroy())
    ).subscribe((response) => {
      if (response.isSucceed) {
        this.closeDialog();
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
        this.closeDialog();
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
    this.selectedCredentialList = [];
    this.selectedCredentialTypes = [];
    this.mapCredentialsService.setSelectedMapping(null);
    this.allRegionsChange({checked: false});
    this.allLocationsChange({checked: false});
    this.allDepartmentsChange({checked: false});
  }

  private cleanUp(): void {
    this.closeDialog();
    this.credentialSetupList.map(s => {
      s.isActive = false;
      s.reqSubmission = false;
      s.reqOnboard = false;
    });
    this.grid.refresh();
  }

  private pageChangedHandler(): void {
    this.pageSubject.pipe(
      throttleTime(100),
      filter(() => !!this.selectedCredentialTypes?.length),
      takeUntil(this.componentDestroy())
    ).subscribe((page) => {
      const activeRowsPerPage = this.getActiveRowsPerPage();

      this.currentPage = page;
      this.gridDataSource = this.mapCredentialsService.getRowsPage(
        this.selectedCredentialTypes as number[],
        this.currentPage,
        this.credentialSetupList,
        activeRowsPerPage
      );
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }

  private setOrganizationConfig(): void {
    const {
      isIRPEnabled,
      isVMCEnabled,
    } = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};
    const user = this.store.selectSnapshot(UserState.user);

    const isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled)
      && user?.businessUnitType !== BusinessUnitType.MSP;

    this.isIRPAndVmsEnabled = isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);
  }

  private updateGridColumns(): void {
    if (this.grid) {
      this.grid.getColumnByField('irpComment').visible = this.isIRPAndVmsEnabled;
      this.grid.getColumnByField('system').visible = this.isIRPAndVmsEnabled;

      this.grid.refreshColumns();
    }
  }

  private groupCredentials(groupIds: (number | undefined)[] | null): void {
    let credentialSetupList = this.allCredentialSetupList;

    if (groupIds?.length) {
      const groupIdsSet = new Set(groupIds);
      const selectedGroups = this.groups.filter(el => groupIdsSet.has(el.id as number));
      const isGroupHasIrp = selectedGroups.some(el => el.includeInIRP);
      const isGroupHasVMS = selectedGroups.some(el => el.includeInVMS);

      credentialSetupList = credentialSetupList.filter((el) =>
        el.includeInIRP && isGroupHasIrp || el.includeInVMS && isGroupHasVMS
      );
    }
    this.credentialSetupList = credentialSetupList;
  }

  private startGroupIdWatching(): void {
    if (this.isIRPAndVmsEnabled) {
      this.mapCredentialsFormGroup.get('groupIds')?.valueChanges.pipe(
        takeUntil(this.componentDestroy()),
      ).subscribe((groupIds: number[] | null) => {
        this.groupCredentials(groupIds);
        this.credentialTypeSources = this.mapCredentialsService.prepareCredentialTypeSources(this.credentialSetupList);
      });
    }
  }

  private watchForCredentialTypesChange(): void {
    this.mapCredentialsFormGroup.get('credentialType')?.valueChanges.pipe(
      filter((values: number[]) => !!values?.length),
      takeUntil(this.componentDestroy()),
    ).subscribe((values: number[]) => {
      this.selectedCredentialTypes = values;
      this.updateGridDataSources();
    });
  }

  private watchForUpdateCredentialGrid(): void {
    this.credentialSetup$.pipe(
      filter((credential: CredentialSetupGet[]) => !!credential.length && this.isEdit ),
      takeUntil(this.componentDestroy())
    ).subscribe((credentials: CredentialSetupGet[]) => {
      this.selectedCredentialList = credentials;
      this.credentialSetupList = this.mapCredentialsService.getUpdatedCredentialSetupList(
        this.credentialSetupList,
        credentials
      );

      this.updateGridDataSources();
    });
  }

  private updateGridDataSources(): void {
    const activeRowsPerPage = this.getActiveRowsPerPage();

    this.setRowsToGridDataSource(activeRowsPerPage);
    this.totalDataRecords = this.gridDataSource.length;
    this.grid.refresh();
  }

  private setRowsToGridDataSource(activeRowsPerPage: number): void {
    if(this.isEdit) {
      const selectedCredentialListIds = this.mapCredentialsService.getSelectedCredentialListIds(
        this.selectedCredentialList
      );

      this.gridDataSource = this.mapCredentialsService.getRowsPageWithNotSavedCredential(
        this.selectedCredentialTypes as number[],
        this.currentPage,
        this.credentialSetupList,
        selectedCredentialListIds,
        activeRowsPerPage
      );
    } else {
      this.gridDataSource = this.mapCredentialsService.getRowsPage(
        this.selectedCredentialTypes as number[],
        this.currentPage,
        this.credentialSetupList,
        activeRowsPerPage
      );
    }
  }

  private watchForSucceededUpdateCredential(): void {
    this.actions$.pipe(
      ofActionDispatched(UpdateCredentialSetupSucceeded),
      takeUntil(this.componentDestroy()),
    ).subscribe(({mappingId}) => {
      this.store.dispatch(new GetCredentialSetupByMappingId(mappingId));
    });
  }

  @OutsideZone
  private showEditCredentialDialog(): void {
    //This part of code need to correctly open edit credential dialog
    setTimeout(() => {
      this.store.dispatch(new ShowSideDialog(true));
    }, 100);
  }
}
