import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationManagementState } from '../../store/organization-management.state';
import {
  GetCredential,
  GetCredentialSkillGroup,
  GetCredentialTypes
} from '../../store/organization-management.actions';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSetupDetails,
  CredentialSetupFilterDto,
  CredentialSetupFilterGet,
  CredentialSetupGet, CredentialSetupMappingPost,
  CredentialSetupPost
} from '@shared/models/credential-setup.model';
import { UserState } from 'src/app/store/user.state';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { CredentialsState } from '@organization-management/store/credentials.state';
import {
  ClearCredentialSetup,
  GetCredentialSetupByMappingId, GetFilteredCredentialSetupData,
  UpdateCredentialSetup,
  UpdateCredentialSetupSucceeded
} from '@organization-management/store/credentials.actions';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-credentials-setup',
  templateUrl: './credentials-setup.component.html',
  styleUrls: ['./credentials-setup.component.scss'],
  providers: [MaskedDateTimeService]
})
export class CredentialsSetupComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
@ViewChild('grid') grid: GridComponent;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.skillGroups)
  groups$: Observable<CredentialSkillGroupPage>;
  public groups: CredentialSkillGroup[];

  public skills: MasterSkillByOrganization[];

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public credentialsSetupFormGroup: FormGroup;
  public headerFilterFormGroup: FormGroup;
  public formBuilder: FormBuilder;
  public mappingDataForEditChanged$: Subject<CredentialSetupMappingPost> = new Subject();

  public editedCredentialSetupId?: number;
  public isCredentialSetupEdit = false;
  public credentialSetupFilter = new Subject<CredentialSetupFilterDto>();

  @Select(CredentialsState.credentialSetupList)
  credentialSetupData$: Observable<CredentialSetupGet[]>;
  public mappingData: CredentialSetupGet[];

  private unsubscribe$: Subject<void> = new Subject();
  private lastSelectedCredential: CredentialSetupFilterGet | null;

  constructor(protected override store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private confirmService: ConfirmService) {
    super(store);
    this.formBuilder = builder;
    this.createCredentialsForm();
    this.createHeaderFilterFormGroup();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.organizationChangedHandler();
    this.onRegionsDataLoaded();
    this.onSkillGroupDataLoaded();
    this.headerFilterHandler();
    this.credentialSetupUpdateHandler();
    this.mapGridData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCredentialCheckboxChange(credentialSetup: CredentialSetupGet, checkboxName: string, event: any): void {
    this.credentialsSetupFormGroup.controls['mappingId'].setValue(credentialSetup.mappingId);
    this.credentialsSetupFormGroup.controls['masterCredentialId'].setValue(credentialSetup.masterCredentialId);
    this.credentialsSetupFormGroup.controls['credentialType'].setValue(credentialSetup.credentialType);
    this.credentialsSetupFormGroup.controls['description'].setValue(credentialSetup.description);
    this.credentialsSetupFormGroup.controls['comments'].setValue(credentialSetup.comments);
    this.credentialsSetupFormGroup.controls['inactiveDate'].setValue(credentialSetup.inactiveDate);

    switch(checkboxName) {
      case 'isActive':
        this.credentialsSetupFormGroup.controls['isActive'].setValue(event.checked);
        this.credentialsSetupFormGroup.controls['reqSubmission'].setValue(credentialSetup.reqSubmission);
        this.credentialsSetupFormGroup.controls['reqOnboard'].setValue(credentialSetup.reqOnboard);
        break;
      case 'reqSubmission':
        this.credentialsSetupFormGroup.controls['isActive'].setValue(credentialSetup.isActive);
        this.credentialsSetupFormGroup.controls['reqSubmission'].setValue(event.checked);
        this.credentialsSetupFormGroup.controls['reqOnboard'].setValue(credentialSetup.reqOnboard);
        break;
      case 'reqOnboard':
        this.credentialsSetupFormGroup.controls['isActive'].setValue(credentialSetup.isActive);
        this.credentialsSetupFormGroup.controls['reqSubmission'].setValue(credentialSetup.reqSubmission);
        this.credentialsSetupFormGroup.controls['reqOnboard'].setValue(event.checked);
        break;
    }

    this.onCredentialFormSaveClick();
  }

  public onEditCredentialClick(credentialSetup: CredentialSetupGet, event: any): void {
    this.addActiveCssClass(event);
    this.isCredentialSetupEdit = true;
    this.credentialsSetupFormGroup.setValue({
      mappingId: credentialSetup.mappingId,
      masterCredentialId: credentialSetup.masterCredentialId,
      credentialType: credentialSetup.credentialType,
      description: credentialSetup.description,
      comments: credentialSetup.comments,
      inactiveDate: credentialSetup.inactiveDate,
      isActive: credentialSetup.isActive,
      reqSubmission: credentialSetup.reqSubmission,
      reqOnboard: credentialSetup.reqOnboard
    });

    setTimeout(() => this.store.dispatch(new ShowSideDialog(true)), 40);
  }

  public onCredentialFormCancelClick(): void {
    if (this.credentialsSetupFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.clearFormData();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormData();
      this.removeActiveCssClass();
    }
  }

  public onCredentialFormSaveClick(): void {
    if (this.credentialsSetupFormGroup.valid) {
      const credentialSetup: CredentialSetupPost = {
        mappingId: this.credentialsSetupFormGroup.controls['mappingId'].value,
        masterCredentialId: this.credentialsSetupFormGroup.controls['masterCredentialId'].value,
        isActive: this.credentialsSetupFormGroup.controls['isActive'].value,
        reqSubmission: this.credentialsSetupFormGroup.controls['reqSubmission'].value,
        reqOnboard: this.credentialsSetupFormGroup.controls['reqOnboard'].value,
        comments: this.credentialsSetupFormGroup.controls['comments'].value,
        inactiveDate: this.credentialsSetupFormGroup.controls['inactiveDate'].value,
      }

      this.store.dispatch(new UpdateCredentialSetup(credentialSetup));
    } else {
      this.credentialsSetupFormGroup.markAllAsTouched();
    }
  }

  public mapGridData(): void {
    this.credentialSetupData$.subscribe(data => {
      if (data) {
        this.mappingData = data;
        this.lastAvailablePage = this.getLastPage(data);
        this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
        this.totalDataRecords = data.length;
      }
    });
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.gridDataSource = this.getRowsPerPage(this.mappingData, event.currentPage || event.value);
      this.currentPagerPage = event.currentPage || event.value;
    }
  }

  public onCredentialMappingClick(): void {
    this.store.dispatch(new GetCredential());
    this.store.dispatch(new GetCredentialTypes());
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onMappingEditClick(): void {
    this.store.dispatch(new GetCredential());
    this.store.dispatch(new GetCredentialTypes());

    // check if we have selected credential row in Credential grid, then proceed to Edit Mapping
    if (this.lastSelectedCredential) {
      const savedCredentials: CredentialSetupDetails[] = [];
      this.mappingData.forEach(credential => {
        let data: CredentialSetupDetails = {
          masterCredentialId: credential.masterCredentialId,
          optional: credential.isActive,
          reqSubmission: credential.reqSubmission,
          reqOnboard: credential.reqOnboard,
          comments: credential.comments,
          inactiveDate: credential.inactiveDate
        }
        savedCredentials.push(data);
      });

      const mappingDataForEdit: CredentialSetupMappingPost = {
        credentionSetupMappingId: this.lastSelectedCredential.mappingId,
        regionIds: this.lastSelectedCredential.regionId ? [this.lastSelectedCredential.regionId] : undefined,
        locationIds: this.lastSelectedCredential.locationId ? [this.lastSelectedCredential.locationId] : undefined,
        departmentIds:  this.lastSelectedCredential.departmentId ? [this.lastSelectedCredential.departmentId] : undefined,
        skillGroupIds: this.lastSelectedCredential.skillGroups?.length !== 0
          ? this.lastSelectedCredential.skillGroups?.map(s => s.id) as number[] : undefined,
        credentials: savedCredentials
      };
      this.store.dispatch(new ShowSideDialog(true));
      this.mappingDataForEditChanged$.next(mappingDataForEdit);
    }
  }

  public onMappingFormClosed(): void {
    this.store.dispatch(new GetFilteredCredentialSetupData({ pageNumber: 1, pageSize: 9999 }));
  }

  public onSelectedCredentialClick(selectedCredential: CredentialSetupFilterGet): void {
    if (selectedCredential && selectedCredential.mappingId) {
      this.lastSelectedCredential = selectedCredential;
      // get mapping for selected credential
      this.store.dispatch(new GetCredentialSetupByMappingId(selectedCredential.mappingId));
    } else {
      // if no selected credential in Credential grid, then clear data from Mapping grid
      this.lastSelectedCredential = null;
      this.gridDataSource = [];
      this.store.dispatch(new ClearCredentialSetup());
    }
  }

  private clearFormData(): void {
    this.credentialsSetupFormGroup.reset();
    this.editedCredentialSetupId = undefined;
    this.isCredentialSetupEdit = false;
  }

  private createCredentialsForm(): void {
    this.credentialsSetupFormGroup = this.formBuilder.group({
      mappingId: [null],
      masterCredentialId: [null],
      credentialType: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      comments: ['', Validators.maxLength(500)],
      inactiveDate: [null],
      isActive: [false],
      reqSubmission: [false],
      reqOnboard: [false]
    });
  }

  private createHeaderFilterFormGroup(): void {
    this.headerFilterFormGroup = this.formBuilder.group({
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      groupId: [null],
      skillId: [null]
    });
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((organizationId) => {
      this.lastSelectedCredential = null;
      this.gridDataSource = [];
      this.store.dispatch(new ClearCredentialSetup());
      this.store.dispatch(new GetCredentialSkillGroup());
    });
  }

  private onRegionsDataLoaded(): void {
    this.organizationStructure$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((structure: OrganizationStructure) => {
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
    });
  }

  private onSkillGroupDataLoaded(): void {
    this.groups$.subscribe(groupsPages => {
      if (groupsPages) {
        this.groups = groupsPages.items;
      }
    });
  }

  private headerFilterHandler(): void {
    this.headerFilterFormGroup.controls['regionId']?.valueChanges.subscribe((regionId: number) => {
      this.locations = [];
      this.departments = [];

      if (regionId) {
        const selectedRegion = this.orgRegions.find(region => region.id === regionId);
        this.locations.push(...sortByField(selectedRegion?.locations ?? [], 'name') as []);
        this.locations.forEach(location => this.departments.push(...location.departments));

        const filter: CredentialSetupFilterDto = {
          regionId: regionId,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      } else {
        const filter: CredentialSetupFilterDto = {
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      }

      this.headerFilterFormGroup.controls['locationId'].setValue(null);
      this.headerFilterFormGroup.controls['departmentId'].setValue(null);
    });

    this.headerFilterFormGroup.get('locationId')?.valueChanges.subscribe((locationId: number) => {
      this.departments = [];

      if (locationId) {
        const selectedLocation = this.locations.find(location => location.id === locationId);
        this.departments.push(...sortByField(selectedLocation?.departments ?? [], 'name') as []);

        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: locationId,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      } else {
        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      }

      this.headerFilterFormGroup.controls['departmentId'].setValue(null);
    });

    this.headerFilterFormGroup.get('departmentId')?.valueChanges.subscribe((departmentId: number) => {
      if (departmentId) {
        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: departmentId,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      } else {
        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      }
    });

    this.headerFilterFormGroup.get('groupId')?.valueChanges.subscribe((groupId: number) => {
      this.skills = [];

      if (groupId) {
        const selectedGroup = this.groups.find(group => group.id === groupId);
        this.skills.push(...sortByField(selectedGroup?.skills ?? [], 'name') as []);

        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: groupId,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      } else {
        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillId: this.headerFilterFormGroup.controls['skillId'].value,
        };
        this.credentialSetupFilter.next(filter);
      }

      this.headerFilterFormGroup.controls['skillId'].setValue(null);
    });

    this.headerFilterFormGroup.get('skillId')?.valueChanges.subscribe((skillId: number) => {
      if (skillId) {
        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
          skillId: skillId,
        };
        this.credentialSetupFilter.next(filter);
      } else {
        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
        };
        this.credentialSetupFilter.next(filter);
      }
    });
  }

  private credentialSetupUpdateHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateCredentialSetupSucceeded)).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormData();
      this.removeActiveCssClass();

      // get data to credential grid with the same header filter
      const filter: CredentialSetupFilterDto = {
        regionId: this.headerFilterFormGroup.controls['regionId'].value,
        locationId: this.headerFilterFormGroup.controls['locationId'].value,
        departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
        skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
        skillId: this.headerFilterFormGroup.controls['skillId'].value,
      };
      this.credentialSetupFilter.next(filter);
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
