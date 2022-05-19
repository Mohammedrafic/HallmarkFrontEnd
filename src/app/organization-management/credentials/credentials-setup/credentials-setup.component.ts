import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { Location }  from '@shared/models/location.model';
import {
  GetCredential, GetCredentialSetup,
  GetCredentialTypes, GetDepartmentsByLocationId, GetLocationsByRegionId,
  GetRegions,
  GetCredentialSkillGroup
} from '../../store/organization-management.actions';
import { CredentialType } from '@shared/models/credential-type.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetup } from '@shared/models/credential-setup.model';
import { Department } from '@shared/models/department.model';
import { Credential } from '@shared/models/credential.model';

export enum CredentialsFilter {
  ByOrganization = 'By Organization',
  BySkill = 'By Skill'
}

@Component({
  selector: 'app-credentials-setup',
  templateUrl: './credentials-setup.component.html',
  styleUrls: ['./credentials-setup.component.scss']
})
export class CredentialsSetupComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  @Input() isActive: boolean = false;

  public isFilteredBySkill = false;
  public credentials = [CredentialsFilter.ByOrganization, CredentialsFilter.BySkill];

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
  groups$: Observable<CredentialSkillGroup>;
  public selectedSkillGroupId: number;

  public credentialsSetupFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialSetupId?: number;

  private fakeOrganizationId = 2; // TODO: remove after BE implementation
  private invalidDate = '0001-01-01T00:00:00+00:00';
  private credentialsData$: Observable<any>;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCredentialTypes());
    this.store.dispatch(new GetCredential());
    // this.store.dispatch(new GetCredentialSetup()); // TODO: uncomment after BE implementation
    // this.mapGridData(); // TODO: uncomment after BE implementation
  }

  onFilterDropDownChanged(data: any): void {
    if (data.itemData.value === CredentialsFilter.ByOrganization) {
      this.isFilteredBySkill = false;
    } else if (data.itemData.value === CredentialsFilter.BySkill) {
      this.isFilteredBySkill = true;
      this.store.dispatch(new GetCredentialSkillGroup(this.fakeOrganizationId));
      this.store.dispatch(new GetRegions());
    }
  }

  onRegionDropDownChanged(event: any): void {
    this.selectedRegionId = event.itemData.id;
    this.store.dispatch(new GetLocationsByRegionId(this.selectedRegionId));
  }

  onLocationDropDownChanged(event: any): void {
    this.selectedLocationId = event.itemData.id;
    this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocationId));
  }

  onDepartmentDropDownChanged(event: any): void {
    this.selectedDepartmentId = event.itemData.id;
  }

  onGroupDropDownChanged(event: any): void {
    this.selectedSkillGroupId = event.itemData.id;
  }

  onGroupsSetupClick(): void {
    this.router.navigate(['./groups-setup'], { relativeTo: this.route });
  }

  onExpiryDateAppliedChange(event: any): void {
    //  TODO: implementation
  }

  onOptionChange(event: any): void {
    //  TODO: implementation
  }

  onReqForSubmissionChange(event: any): void {
    //  TODO: implementation
  }

  onReqForOnboardChange(event: any): void {
    //  TODO: implementation
  }

  onEditButtonClick(credentialSetup: any): void {
    //  TODO: setup form values

    this.store.dispatch(new ShowSideDialog(true));
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
        this.clearFormData();
        this.removeActiveCssClass();
      });
  }

  onFormSaveClick(): void {
    if (this.credentialsSetupFormGroup.valid) {
      const credentialSetup: CredentialSetup = {
        id: 1,
        isActive: false, // TODO: clarify with BE
        masterCredentialId: 1,
        regionId: this.selectedRegionId,
        organizationId: this.fakeOrganizationId,
        skillGroupId: this.selectedSkillGroupId,
        comments: this.credentialsSetupFormGroup.controls['comments'].value,
        inactiveDate: this.credentialsSetupFormGroup.controls['inactiveDate'].value,
        expiryDateApplied: this.credentialsSetupFormGroup.controls['expiryDateApplied'].value,
        optional: this.credentialsSetupFormGroup.controls['optional'].value,
        reqSubmission: this.credentialsSetupFormGroup.controls['reqSubmission'].value,
        reqOnboard: this.credentialsSetupFormGroup.controls['reqOnboard'].value,
      }

      console.log(credentialSetup); // TODO: remove after implementation
      // this.store.dispatch(new SaveUpdateCredentialSetup(credentialSetup, this.fakeOrganizationId)); // TODO: uncomment after implementation
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormData();
      this.removeActiveCssClass();
    } else {
      this.credentialsSetupFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    // TODO: map credential types by id
    this.credentialsData$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      data.forEach((item: any) => {
        item.inactiveDate === this.invalidDate ? item.inactiveDate = '' : item.inactiveDate;
      });

      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.credentialsData$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  private clearFormData(): void {
    this.credentialsSetupFormGroup.reset();
    this.editedCredentialSetupId = undefined;
  }

  private createCredentialsForm(): void {
    // TODO: pass SetupCredential model
    this.credentialsSetupFormGroup = this.formBuilder.group({
      description: [{ value: '', disabled: true }, Validators.required],
      comments: ['', Validators.maxLength(500)],
      inactiveDate: [null],
      expiryDateApplied: [false],
      optional: [false],
      reqSubmission: [true],
      reqOnboard: [false]
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
