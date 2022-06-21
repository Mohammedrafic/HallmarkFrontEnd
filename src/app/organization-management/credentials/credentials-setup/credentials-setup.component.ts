import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FreezeService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { combineLatest, filter, Observable, of, Subject, takeUntil, throttleTime } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { Location }  from '@shared/models/location.model';
import {
  GetCredential,
  GetCredentialTypes,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetRegions,
  ClearDepartmentList,
  ClearLocationList,
  GetCredentialSetupByPage,
  SaveUpdateCredentialSetupSucceeded, GetAllOrganizationSkills
} from '../../store/organization-management.actions';
import { CredentialType } from '@shared/models/credential-type.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetup, CredentialSetupPage } from '@shared/models/credential-setup.model';
import { Department } from '@shared/models/department.model';
import { Credential } from '@shared/models/credential.model';
import { MockCredentialSetupPage } from './mock-credential-setup-list';
import { UserState } from 'src/app/store/user.state';
import { Skill } from '@shared/models/skill.model';

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

  public regionLocationSkillGroupDropDownFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  public selectedRegionId: number;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;
  public selectedLocationId: number;

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  public selectedDepartmentId: number;

  @Select(OrganizationManagementState.skillGroups)
  groups$: Observable<CredentialSkillGroup[]>;
  public selectedSkillGroupId: number;

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public selectedSkillId: number;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public credentialsSetupFormGroup: FormGroup;
  public headerFilterFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialSetupId?: number;

  //@Select(OrganizationManagementState.credentialSetups) // TODO: uncomment after BE implementation
  credentialsData$: Observable<CredentialSetupPage> = of(MockCredentialSetupPage);

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
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.store.dispatch(new GetRegions());
      this.store.dispatch(new GetCredentialTypes());
      this.store.dispatch(new GetCredential());
      this.store.dispatch(new GetAllOrganizationSkills());
      // this.store.dispatch(new GetCredentialSkillGroup()); // TODO: uncomment after BE fix
    });

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

  public onRegionDropDownChanged(event: any): void {
    if (event.itemData) {
      this.selectedRegionId = event.itemData.id;
      this.store.dispatch(new ClearDepartmentList());
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegionId));
    }
  }

  public onLocationDropDownChanged(event: any): void {
    if (event.itemData) {
      this.selectedLocationId = event.itemData.id;
      this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocationId));
    }
  }

  public onDepartmentDropDownChanged(event: any): void {
    if (event.itemData) {
      this.selectedDepartmentId = event.itemData.id;
    }
  }

  public onGroupDropDownChanged(event: any): void {
    if (event.itemData) {
      this.selectedSkillGroupId = event.itemData.id;
    }
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
    this.onFormSaveClick();
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
    this.onFormSaveClick();
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
    this.onFormSaveClick();
  }

  public onEditButtonClick(credentialSetup: any, event: any): void {
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

  public onFormCancelClick(): void {
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

  public onFormSaveClick(): void {
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

    });
  }
}
