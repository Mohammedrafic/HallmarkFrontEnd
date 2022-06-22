import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationManagementState } from '../../store/organization-management.state';
import {
  GetCredential,
  GetCredentialTypes,
  SaveUpdateCredentialSetupSucceeded,
  GetAllOrganizationSkills, GetCredentialSkillGroup
} from '../../store/organization-management.actions';
import { CredentialType } from '@shared/models/credential-type.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetup, CredentialSetupFilterDto, CredentialSetupPage } from '@shared/models/credential-setup.model';
import { Credential } from '@shared/models/credential.model';
import { UserState } from 'src/app/store/user.state';
import { Skill } from '@shared/models/skill.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { GetFilteredCredentialSetupData } from '@organization-management/store/credentials.actions';

@Component({
  selector: 'app-credentials-setup',
  templateUrl: './credentials-setup.component.html',
  styleUrls: ['./credentials-setup.component.scss'],
  providers: [FreezeService]
})
export class CredentialsSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Select(OrganizationManagementState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  @Select(OrganizationManagementState.credentials)
  credentials$: Observable<Credential[]>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];

  public locations: OrganizationLocation[] = [];

  public departments: OrganizationDepartment[] = [];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.skillGroups)
  groups$: Observable<CredentialSkillGroup[]>;
  public selectedSkillGroupId: number;

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public credentialsSetupFormGroup: FormGroup;
  public headerFilterFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialSetupId?: number;

  //@Select(OrganizationManagementState.credentialSetups) // TODO: uncomment after BE implementation
  credentialsData$: Observable<CredentialSetupPage>;

  private pageSubject = new Subject<number>();
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
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.store.dispatch(new GetCredentialTypes());
      this.store.dispatch(new GetCredential());
      this.store.dispatch(new GetAllOrganizationSkills());
      this.store.dispatch(new GetCredentialSkillGroup());
      this.store.dispatch(new GetFilteredCredentialSetupData({
        regionId: null,
        locationId: null,
        departmentId: null,
        skillGroupId: null,
        skillId: null,
        pageNumber: 1, // TODO: add pagination
        pageSize: 100 // TODO: add pagination
      }));
    });

    this.organizationStructure$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((structure: OrganizationStructure) => {
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
    });

    this.headerFilterHandler();

    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      // this.store.dispatch(new GetCredentialSetupByPage(this.currentPage, this.pageSize)); // TODO: uncomment after BE implementation
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveUpdateCredentialSetupSucceeded)).subscribe(() => {
      this.clearFormData();
      // this.store.dispatch(new GetCredentialSetupByPage(this.currentPage, this.pageSize)); // TODO: uncomment after BE implementation
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onGroupsSetupClick(): void {
    this.router.navigateByUrl('admin/organization-management/credentials/groups-setup');
  }

  public onOptionChange(credentialSetup: any, event: any): void {
    this.credentialsSetupFormGroup.setValue({
      id: credentialSetup.id,
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

  public onReqForSubmissionChange(credentialSetup: any, event: any): void {
    this.credentialsSetupFormGroup.setValue({
      id: credentialSetup.id,
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

  public onReqForOnboardChange(credentialSetup: any, event: any): void {
    this.credentialsSetupFormGroup.setValue({
      id: credentialSetup.id,
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

  public onEditCredentialClick(credentialSetup: any, event: any): void {
    this.addActiveCssClass(event);
    this.credentialsSetupFormGroup.setValue({
      id: credentialSetup.id,
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
      const credentialSetup: CredentialSetup = {
        id: this.credentialsSetupFormGroup.controls['id'].value,
        isActive: this.credentialsSetupFormGroup.controls['isActive'].value,
        masterCredentialId: this.credentialsSetupFormGroup.controls['masterCredentialId'].value, // TODO: clarify with BE
        skillGroupId: this.selectedSkillGroupId,
        comments: this.credentialsSetupFormGroup.controls['comments'].value,
        inactiveDate: this.credentialsSetupFormGroup.controls['inactiveDate'].value,
        reqSubmission: this.credentialsSetupFormGroup.controls['reqSubmission'].value,
        reqOnboard: this.credentialsSetupFormGroup.controls['reqOnboard'].value,
      }

      console.log(credentialSetup); // TODO: remove after implementation
      // this.store.dispatch(new SaveUpdateCredentialSetup(credentialSetup)); // TODO: uncomment after implementation
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormData();
      this.removeActiveCssClass();
    } else {
      this.credentialsSetupFormGroup.markAllAsTouched();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public onMappingEditClick(): void {
    // TODO: need implementation
  }

  private clearFormData(): void {
    this.credentialsSetupFormGroup.reset();
    this.editedCredentialSetupId = undefined;
  }

  private createCredentialsForm(): void {
    // TODO: pass SetupCredential model
    this.credentialsSetupFormGroup = this.formBuilder.group({
      id: [null],
      isActive: [false],
      masterCredentialId: [null],
      description: [{ value: '', disabled: true }, Validators.required],
      comments: ['', Validators.maxLength(500)],
      inactiveDate: [null],
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

  private headerFilterHandler(): void {
    this.headerFilterFormGroup.controls['regionId']?.valueChanges.subscribe((regionId: number) => {
      this.locations = [];
      this.departments = [];

      if (regionId) {
        const selectedRegion = this.orgRegions.find(region => region.id === regionId);
        this.locations.push(...selectedRegion?.locations as any);
        this.locations.forEach(location => this.departments.push(...location.departments));
      }

      this.headerFilterFormGroup.controls['locationId'].setValue(null);
      this.headerFilterFormGroup.controls['departmentId'].setValue(null);

      const filter: CredentialSetupFilterDto = {
        regionId: regionId || null,
        locationId: this.headerFilterFormGroup.controls['locationId'].value,
        departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
        skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
        skillId: this.headerFilterFormGroup.controls['skillId'].value,
        pageSize: 100, // TODO: add pagination
        pageNumber: 1 // TODO: add pagination
      };
      this.store.dispatch(new GetFilteredCredentialSetupData(filter));
    });

    this.headerFilterFormGroup.get('locationId')?.valueChanges.subscribe((locationId: number) => {
      this.departments = [];

      if (locationId) {
        const selectedLocation = this.locations.find(location => location.id === locationId);
        this.departments.push(...selectedLocation?.departments as []);
      }

      this.headerFilterFormGroup.controls['departmentId'].setValue(null);

      const filter: CredentialSetupFilterDto = {
        regionId: this.headerFilterFormGroup.controls['regionId'].value,
        locationId: locationId || null,
        departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
        skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
        skillId: this.headerFilterFormGroup.controls['skillId'].value,
        pageSize: 100, // TODO: add pagination
        pageNumber: 1 // TODO: add pagination
      };
      this.store.dispatch(new GetFilteredCredentialSetupData(filter));
    });

    this.headerFilterFormGroup.get('departmentId')?.valueChanges.subscribe((departmentId: number) => {
      const filter: CredentialSetupFilterDto = {
        regionId: this.headerFilterFormGroup.controls['regionId'].value,
        locationId: this.headerFilterFormGroup.controls['locationId'].value,
        departmentId: departmentId || null,
        skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
        skillId: this.headerFilterFormGroup.controls['skillId'].value,
        pageSize: 100, // TODO: add pagination
        pageNumber: 1 // TODO: add pagination
      };
      this.store.dispatch(new GetFilteredCredentialSetupData(filter));
    });

    this.headerFilterFormGroup.get('groupId')?.valueChanges.subscribe((groupId: number) => {
      const filter: CredentialSetupFilterDto = {
        regionId: this.headerFilterFormGroup.controls['regionId'].value,
        locationId: this.headerFilterFormGroup.controls['locationId'].value,
        departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
        skillGroupId: groupId || null,
        skillId: this.headerFilterFormGroup.controls['skillId'].value,
        pageSize: 100, // TODO: add pagination
        pageNumber: 1 // TODO: add pagination
      };
      this.store.dispatch(new GetFilteredCredentialSetupData(filter));
    });

    this.headerFilterFormGroup.get('skillId')?.valueChanges.subscribe((skillId: number) => {
      const filter: CredentialSetupFilterDto = {
        regionId: this.headerFilterFormGroup.controls['regionId'].value,
        locationId: this.headerFilterFormGroup.controls['locationId'].value,
        departmentId: this.headerFilterFormGroup.controls['departmentId'].value,
        skillGroupId: this.headerFilterFormGroup.controls['groupId'].value,
        skillId: skillId || null,
        pageSize: 100, // TODO: add pagination
        pageNumber: 1 // TODO: add pagination
      };
      this.store.dispatch(new GetFilteredCredentialSetupData(filter));
    });
  }
}
