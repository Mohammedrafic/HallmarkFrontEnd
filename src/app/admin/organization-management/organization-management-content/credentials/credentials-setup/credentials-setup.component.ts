import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, of } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import {
  AbstractGridConfigurationComponent
} from '../../../../../shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowSideDialog, ShowToast } from '../../../../../store/app.actions';
import { RECORD_ADDED } from '../../../../../shared/constants/messages';
import { MessageTypes } from '../../../../../shared/enums/message-types';
import { AdminState } from '../../../../store/admin.state';
import { Region } from '../../../../../shared/models/region.model';
import { GetMasterSkillsByPage, GetRegionsByOrganizationId } from '../../../../store/admin.actions';
import { CredentialType } from '../../../../../shared/models/credential-type.model';
import { Credential } from '../../../../../shared/models/credential.model';
import { SkillsPage } from '../../../../../shared/models/skill.model';

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
  @ViewChild('addGroupDialog') addGroupDialog: DialogComponent;

  @Input() isActive: boolean = false;

  isRegionDropDownShown = false;
  isSkillDropDownShown = false;
  isGroupDropDownShow = false;
  isAddGroupButtonShown = false;

  credentialsFilter$: Observable<CredentialsFilter[]> = of([CredentialsFilter.ByOrg, CredentialsFilter.ByRegion, CredentialsFilter.BySkill]);

  // @Select(AdminState.credentials)
  credentials$: Observable<any>

  @Select(AdminState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  @Select(AdminState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  // TODO: add selector, Skill model
  @Select(AdminState.masterSkills)
  skills$: Observable<SkillsPage[]>;

  // TODO: add selector, Group model
  groups$: Observable<any>;

  credentialsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  fakeOrganizationId = 2; // TODO: remove after BE implementation

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createCredentialsForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegionsByOrganizationId(this.fakeOrganizationId)); // TODO: provide valid organizationId
    this.store.dispatch(new GetMasterSkillsByPage(this.currentPage, this.pageSize)); // TODO: provide action without page
    this.mapGridData();
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
    } else if (data.itemData.value === CredentialsFilter.BySkill) {
      this.isRegionDropDownShown = false;
      this.isSkillDropDownShown = true;
      this.isGroupDropDownShow = true;
      this.isAddGroupButtonShown = true;
    }
  }

  onCredentialTypeDropDownChanged(event: any): void {
    //  TODO: implementation
  }

  onRegionDropDownChanged(event: any): void {
    this.selectedRegion = event.itemData as Region;
    //  TODO: implementation
  }

  onSkillDropDownChanged(event: any): void {
    //  TODO: implementation
  }

  onGroupDropDownChanged(event: any): void {
    //  TODO: implementation
  }

  onAddGroupClick(): void {
    this.addGroupDialog.show();
  }

  hideDialog(): void {
    this.addGroupDialog.hide();
  }

  onSaveNewGroupClick(): void {
    //  TODO: implementation
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

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.credentials$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  onFormCancelClick(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.credentialsFormGroup.reset();
    // TODO: add modal dialog to confirm close
  }

  onFormSaveClick(): void {
    if (this.credentialsFormGroup.valid) {
      const credential: any = { // TODO: add model
        credentialDescription: this.credentialsFormGroup.controls['credentialDescription'].value,
        credentialComment: this.credentialsFormGroup.controls['credentialComment'].value,
        inactiveDate: this.credentialsFormGroup.controls['inactiveDate'].value,
        includeCheckbox: this.credentialsFormGroup.controls['includeCheckbox'].value,
        reqForSubmissionCheckbox: this.credentialsFormGroup.controls['reqForSubmissionCheckbox'].value,
        reqForOnboardCheckbox: this.credentialsFormGroup.controls['reqForOnboardCheckbox'].value,
      }

      // this.store.dispatch(new SaveCredential(credential)); //  TODO: implementation
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      this.store.dispatch(new ShowSideDialog(false));
      this.credentialsFormGroup.reset();
    } else {
      this.credentialsFormGroup.markAllAsTouched();
    }
  }

  mapGridData(): void {
    this.credentials$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private createCredentialsForm(): void {
    // TODO: pass SetupCredential model
    this.credentialsFormGroup = this.formBuilder.group({
      credentialDescription: [{ value: '', disabled: true }, Validators.required],
      credentialComment: ['', Validators.maxLength(50)],
      inactiveDate: [null],
      includeCheckbox: [false],
      reqForSubmissionCheckbox: [true],
      reqForOnboardCheckbox: [false]
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
