import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, of, Subject, takeUntil } from 'rxjs';
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
  GetCredential,
  GetCredentialTypes,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetRegions,
  ClearDepartmentList,
  GetCredentialSkillGroup, ClearLocationList
} from '../../store/organization-management.actions';
import { CredentialType } from '@shared/models/credential-type.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetup } from '@shared/models/credential-setup.model';
import { Department } from '@shared/models/department.model';
import { Credential } from '@shared/models/credential.model';
import { FilterCredentialSetup } from '@shared/enums/credential-setup-filter';
import { CredentialsState } from '../../store/credentials.state';
import { CredentialSetupFilter } from '@shared/models/credential-setup-filter.model';
import { MockCredentialSetupList } from './mock-credential-setup-list';
import { SetCredentialSetupFilter } from '../../store/credentials.actions';

@Component({
  selector: 'app-credentials-setup',
  templateUrl: './credentials-setup.component.html',
  styleUrls: ['./credentials-setup.component.scss']
})
export class CredentialsSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public isFilteredBySkill = false;
  public credentials = [FilterCredentialSetup.ByOrganization, FilterCredentialSetup.BySkill];
  public selectedFilterSetupBy: FilterCredentialSetup;

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

  @Select(CredentialsState.setupFilter)
  setupFilter$: Observable<CredentialSetupFilter>;

  public credentialsSetupFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  public editedCredentialSetupId?: number;

  // @Select(OrganizationManagementState.credentialSetups) // TODO: uncomment after BE implementation
  credentialsData$: Observable<CredentialSetup[]> = of(MockCredentialSetupList);

  private invalidDate = '0001-01-01T00:00:00+00:00';
  private unsubscribe$: Subject<void> = new Subject();

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
    this.store.dispatch(new GetRegions());
    this.store.dispatch(new GetCredentialTypes());
    this.store.dispatch(new GetCredential());
    // this.store.dispatch(new GetCredentialSkillGroup()); // TODO: uncomment after BE implementation

    this.setupFilter$.pipe(takeUntil(this.unsubscribe$)).subscribe(setupFilter => {
      if (setupFilter) {
        this.store.dispatch(new GetLocationsByRegionId(setupFilter.regionId));
        this.store.dispatch(new GetDepartmentsByLocationId(setupFilter.locationId));

        this.isFilteredBySkill = true;
        this.selectedFilterSetupBy = FilterCredentialSetup.BySkill;
        setTimeout(() => {
          this.selectedRegionId = setupFilter.regionId;
          this.selectedLocationId = setupFilter.locationId;
          this.selectedDepartmentId = setupFilter.departmentId;
          this.selectedSkillGroupId = setupFilter.skillGroupId;
        }, 500);
      } else {
        this.selectedFilterSetupBy = FilterCredentialSetup.ByOrganization;
          // this.store.dispatch(new GetCredentialSetup()); // TODO: uncomment after BE implementation
        this.mapGridData();
        this.groups$.pipe(filter(Boolean),takeUntil(this.unsubscribe$)).subscribe((groups) => {
          if (groups && groups.length > 0 && groups[0].id) {
            this.selectedSkillGroupId = groups[0].id;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new SetCredentialSetupFilter(null));
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
  }

  public onFilterDropDownChanged(data: any): void {
    if (data.itemData.value === FilterCredentialSetup.ByOrganization) {
      this.isFilteredBySkill = false;
    } else if (data.itemData.value === FilterCredentialSetup.BySkill) {
      this.isFilteredBySkill = true;
    }
  }

  public onRegionDropDownChanged(event: any): void {
    if (event.itemData) {
      this.selectedRegionId = event.itemData.id;
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
      isActive: credentialSetup.isActive,
      masterCredentialId: credentialSetup.masterCredentialId,
      description: credentialSetup.description,
      comments: credentialSetup.comments,
      inactiveDate: credentialSetup.inactiveDate,
      optional: event.checked,
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
      optional: credentialSetup.optional,
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
      optional: credentialSetup.optional,
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
      optional: credentialSetup.optional,
      reqSubmission: credentialSetup.reqSubmission,
      reqOnboard: credentialSetup.reqOnboard
    });

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onFormCancelClick(): void {
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

  public onFormSaveClick(): void {
    if (this.credentialsSetupFormGroup.valid) {
      const credentialSetup: CredentialSetup = {
        id: this.credentialsSetupFormGroup.controls['id'].value,
        isActive: this.credentialsSetupFormGroup.controls['isActive'].value, // TODO: clarify with BE
        masterCredentialId: this.credentialsSetupFormGroup.controls['masterCredentialId'].value, // TODO: clarify with BE
        regionId: this.selectedRegionId,
        skillGroupId: this.selectedSkillGroupId,
        comments: this.credentialsSetupFormGroup.controls['comments'].value,
        inactiveDate: this.credentialsSetupFormGroup.controls['inactiveDate'].value,
        optional: this.credentialsSetupFormGroup.controls['optional'].value,
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
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.credentialsData$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  private mapGridData(): void {
    this.credentialsData$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      data.forEach((item: any) => {
        item.inactiveDate === this.invalidDate ? item.inactiveDate = '' : item.inactiveDate;
      });
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
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
      optional: [false],
      reqSubmission: [false],
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
