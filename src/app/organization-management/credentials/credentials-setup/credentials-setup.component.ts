import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationManagementState } from '../../store/organization-management.state';
import {
  GetCredentialSkillGroup
} from '../../store/organization-management.actions';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSetupFilterDto,
  CredentialSetupFilterGet,
  CredentialSetupGet,
  CredentialSetupPost
} from '@shared/models/credential-setup.model';
import { UserState } from 'src/app/store/user.state';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { GetCredentialSetupByMappingId, UpdateCredentialSetupSucceeded } from '@organization-management/store/credentials.actions';

@Component({
  selector: 'app-credentials-setup',
  templateUrl: './credentials-setup.component.html',
  styleUrls: ['./credentials-setup.component.scss'],
  providers: [FreezeService]
})
export class CredentialsSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.skillGroups)
  groups$: Observable<CredentialSkillGroup[]>;
  groups: CredentialSkillGroup[];

  public skills: MasterSkillByOrganization[];
  public skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public credentialsSetupFormGroup: FormGroup;
  public headerFilterFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialSetupId?: number;

  public credentialSetupFilter = new Subject<CredentialSetupFilterDto>();

  @Select(CredentialsState.credentialSetupList)
  credentialSetupData$: Observable<CredentialSetupGet[]>;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
    this.createHeaderFilterFormGroup();
  }

  ngOnInit(): void {
    this.organizationChangedHandler();
    this.onRegionsDataLoaded();
    this.onSkillGroupDataLoaded();
    this.headerFilterHandler();
    this.credentialSetupUpdateHandler();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onGroupsSetupClick(): void {
    this.router.navigateByUrl('admin/organization-management/credentials/groups-setup');
  }

  public onOptionChange(credentialSetup: CredentialSetupGet, event: any): void {
    this.credentialsSetupFormGroup.setValue({
      mappingId: credentialSetup.mappingId,
      isActive: event.checked,
      masterCredentialId: credentialSetup.masterCredentialId,
      description: credentialSetup.description,
      comments: credentialSetup.comments,
      inactiveDate: credentialSetup.inactiveDate,
      reqSubmission: credentialSetup.reqSubmission,
      reqOnboard: credentialSetup.reqOnboard
    });
    this.onCredentialFormSaveClick();
  }

  public onReqForSubmissionChange(credentialSetup: CredentialSetupGet, event: any): void {
    this.credentialsSetupFormGroup.setValue({
      mappingId: credentialSetup.mappingId,
      isActive: credentialSetup.isActive,
      masterCredentialId: credentialSetup.masterCredentialId,
      description: credentialSetup.description,
      comments: credentialSetup.comments,
      inactiveDate: credentialSetup.inactiveDate,
      reqSubmission: event.checked,
      reqOnboard: credentialSetup.reqOnboard
    });
    this.onCredentialFormSaveClick();
  }

  public onReqForOnboardChange(credentialSetup: CredentialSetupGet, event: any): void {
    this.credentialsSetupFormGroup.setValue({
      mappingId: credentialSetup.mappingId,
      isActive: credentialSetup.isActive,
      masterCredentialId: credentialSetup.masterCredentialId,
      description: credentialSetup.description,
      comments: credentialSetup.comments,
      inactiveDate: credentialSetup.inactiveDate,
      reqSubmission: credentialSetup.reqSubmission,
      reqOnboard: event.checked
    });
    this.onCredentialFormSaveClick();
  }

  public onEditCredentialClick(credentialSetup: CredentialSetupGet, event: any): void {
    this.addActiveCssClass(event);
    this.credentialsSetupFormGroup.setValue({
      mappingId: credentialSetup.mappingId,
      isActive: credentialSetup.isActive,
      masterCredentialId: credentialSetup.masterCredentialId,
      description: credentialSetup.description,
      comments: credentialSetup.comments,
      inactiveDate: credentialSetup.inactiveDate,
      reqSubmission: credentialSetup.reqSubmission,
      reqOnboard: credentialSetup.reqOnboard
    });
  }

  public onCredentialFormCancelClick(): void {
    if (this.credentialsSetupFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
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

      console.log(credentialSetup); // TODO: remove after implementation
      // this.store.dispatch(new UpdateCredentialSetup(credentialSetup)); // TODO: uncomment after implementation
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormData();
      this.removeActiveCssClass();
    } else {
      this.credentialsSetupFormGroup.markAllAsTouched();
    }
  }

  public mapGridData(): void {
    this.credentialSetupData$.subscribe(data => {
      if (data) {
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
      this.credentialSetupData$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  public onMappingEditClick(): void {
    // TODO: need implementation
  }

  public onSelectedCredentialClick(data: CredentialSetupFilterGet): void {
    // TODO: need implementation
    if (data) {
      console.log(data);
      this.store.dispatch(new GetCredentialSetupByMappingId(data.mappingId));
    }
  }

  private clearFormData(): void {
    this.credentialsSetupFormGroup.reset();
    this.editedCredentialSetupId = undefined;
  }

  private createCredentialsForm(): void {
    this.credentialsSetupFormGroup = this.formBuilder.group({
      mappingId: [null],
      masterCredentialId: [null],
      description: [{ value: '', disabled: true }, Validators.required],
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
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
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
    this.groups$.subscribe(groups => {
      if (groups) {
        this.groups = groups;
      }
    });
  }

  private headerFilterHandler(): void {
    this.headerFilterFormGroup.controls['regionId']?.valueChanges.subscribe((regionId: number) => {
      this.locations = [];
      this.departments = [];

      if (regionId) {
        const selectedRegion = this.orgRegions.find(region => region.id === regionId);
        this.locations.push(...selectedRegion?.locations as any);
        this.locations.forEach(location => this.departments.push(...location.departments));

        const filter: CredentialSetupFilterDto = {
          regionId: regionId || null,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
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
        this.departments.push(...selectedLocation?.departments as []);

        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: locationId || null,
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
          departmentId: departmentId || null,
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
        this.skills.push(...selectedGroup?.skills as []);

        const filter: CredentialSetupFilterDto = {
          regionId: this.headerFilterFormGroup.controls['regionId'].value,
          locationId: this.headerFilterFormGroup.controls['locationId'].value,
          departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
          skillGroupId: groupId || null,
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
          skillId: skillId || null,
        };
        this.credentialSetupFilter.next(filter);
      }
    });
  }

  private credentialSetupUpdateHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(UpdateCredentialSetupSucceeded)).subscribe(() => {
      this.clearFormData();
      // this.store.dispatch(new GetCredentialSetupByMappingId(this.currentPage, this.pageSize)); // TODO: uncomment after BE implementation
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
