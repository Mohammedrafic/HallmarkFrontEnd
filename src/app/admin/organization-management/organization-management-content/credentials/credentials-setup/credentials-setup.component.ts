import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog } from '../../../../../store/app.actions';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { AdminState } from '@admin/store/admin.state';
import { Region } from '@shared/models/region.model';
import {
  GetCredentialTypes,
  GetMasterSkillsByPage,
  GetRegionsByOrganizationId,
  GetSkillGroup, SaveUpdateCredentialSetup
} from '@admin/store/admin.actions';
import { CredentialType } from '@shared/models/credential-type.model';
import { SkillsPage } from '@shared/models/skill.model';
import { SkillGroup } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetup } from '@shared/models/credential-setup.model';

export enum CredentialsFilter {
  ByOrg = 'By Org',
  ByRegion = 'By Region',
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

  isRegionDropDownShown = false;
  isSkillDropDownShown = false;
  isGroupDropDownShow = false;
  isAddGroupButtonShown = false;

  isSkillDropDownEnabled = false;

  isReadMore = false;

  invalidDate = '0001-01-01T00:00:00+00:00';

  credentials = [CredentialsFilter.ByOrg, CredentialsFilter.ByRegion, CredentialsFilter.BySkill];
  initialValue = CredentialsFilter.ByOrg;

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;
  credentialTypesFields: FieldSettingsModel = { text: 'name', value: 'id' }

  @Select(AdminState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(AdminState.masterSkills)
  skills$: Observable<SkillsPage[]>;

  @Select(AdminState.skillGroups)
  groups$: Observable<SkillGroup>;
  skillGroupsFields: FieldSettingsModel = { text: 'name', value: 'id' };

  credentialsSetupFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedCredentialSetupId?: number;

  fakeOrganizationId = 2; // TODO: remove after BE implementation

  credentialsData$: Observable<any>;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private router: Router,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCredentialTypes());
    // this.store.dispatch(new GetCredentialSetup(this.fakeOrganizationId)); // TODO: uncomment after BE implementation
    // this.mapGridData(); // TODO: uncomment after BE implementation
  }

  onCredentialsDropDownChanged(data: any): void {
    if (data.itemData.value === CredentialsFilter.ByOrg) {
      this.isRegionDropDownShown = false;
      this.isSkillDropDownShown = false;
      this.isGroupDropDownShow = false;
      this.isAddGroupButtonShown = false;
    } else if (data.itemData.value === CredentialsFilter.ByRegion) {
      this.isRegionDropDownShown = true;
      this.isSkillDropDownShown = false;
      this.isGroupDropDownShow = false;
      this.isAddGroupButtonShown = false;
      this.store.dispatch(new GetRegionsByOrganizationId(this.fakeOrganizationId)); // TODO: provide valid organizationId
    } else if (data.itemData.value === CredentialsFilter.BySkill) {
      this.isRegionDropDownShown = false;
      this.isSkillDropDownShown = true;
      this.isGroupDropDownShow = true;
      this.isAddGroupButtonShown = true;
      this.store.dispatch(new GetSkillGroup(this.fakeOrganizationId));
      this.store.dispatch(new GetMasterSkillsByPage(this.currentPage, this.pageSize)); // TODO: provide action without page
    }
  }

  onCredentialTypeDropDownChanged(event: any): void {
    //  TODO: implementation
  }

  onRegionDropDownChanged(event: any): void {
    this.selectedRegion = event.itemData as Region;
    //  TODO: implementation
  }

  onGroupDropDownChanged(event: any): void {
    this.isSkillDropDownEnabled = true;
  }

  onSkillDropDownChanged(event: any): void {
    //  TODO: implementation
  }

  onGroupsSetupClick(): void {
    this.router.navigate(['./admin/organization-management/credentials/groups-setup']);
  }

  onIncludeExcludeChange(event: any): void {
//  TODO: implementation
  }

  onReqForSubmissionChange(event: any): void {
    //  TODO: implementation
  }

  onReqForOnboardChange(event: any): void {
//  TODO: implementation
  }

  onEditButtonClick(credential: any): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  onViewMoreLessTextClick(): void {
    this.isReadMore = !this.isReadMore;
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

  onFormCancelClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.credentialsSetupFormGroup.reset();
        this.isEdit = false;
        this.editedCredentialSetupId = undefined;
        this.removeActiveCssClass();
      });
  }

  onFormSaveClick(): void {
    if (this.credentialsSetupFormGroup.valid) {
      const credentialSetup = new CredentialSetup( {
        description: this.credentialsSetupFormGroup.controls['description'].value,
        comments: this.credentialsSetupFormGroup.controls['comments'].value,
        inactiveDate: this.credentialsSetupFormGroup.controls['inactiveDate'].value,
        include: this.credentialsSetupFormGroup.controls['include'].value,
        reqForSubmission: this.credentialsSetupFormGroup.controls['reqForSubmission'].value,
        reqForOnboard: this.credentialsSetupFormGroup.controls['reqForOnboard'].value,
      });

      this.store.dispatch(new SaveUpdateCredentialSetup(credentialSetup, this.fakeOrganizationId));
      this.store.dispatch(new ShowSideDialog(false));
      this.credentialsSetupFormGroup.reset();
    } else {
      this.credentialsSetupFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    // TODO: map credential types by id
    this.credentialsData$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      data.forEach((item: any) => item.inactiveDate === this.invalidDate ? item.inactiveDate = '' : item.inactiveDate);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private createCredentialsForm(): void {
    // TODO: pass SetupCredential model
    this.credentialsSetupFormGroup = this.formBuilder.group({
      description: [{ value: '', disabled: true }, Validators.required],
      comments: ['', Validators.maxLength(500)],
      inactiveDate: [null],
      include: [false],
      reqForSubmission: [true],
      reqForOnboard: [false]
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
