import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { combineLatestWith, filter, Observable, Subject, takeUntil } from 'rxjs';
import { ShowSideDialog } from '../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetupDetails, CredentialSetupGet, CredentialSetupMappingPost } from '@shared/models/credential-setup.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { GetCredential, GetCredentialTypes } from '@organization-management/store/organization-management.actions';
import { UserState } from '../../../../store/user.state';
import {
  SaveUpdateCredentialSetupMappingData,
  SaveUpdateCredentialSetupMappingSucceeded,
  UpdateCredentialSetupSucceeded
} from '@organization-management/store/credentials.actions';

@Component({
  selector: 'app-map-credentials-form',
  templateUrl: './map-credentials-form.component.html',
  styleUrls: ['./map-credentials-form.component.scss']
})
export class MapCredentialsFormComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Input() orgRegions: OrganizationRegion[] = [];
  @Input() groups: CredentialSkillGroup[] = [];
  @Input() dataSource: CredentialSetupMappingPost;
  @Input() isEdit = false;

  public credentialSetupList: CredentialSetupGet[] = [];
  public allRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];
  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isGridStateInvalid = false;
  public mapCredentialsFormGroup: FormGroup;
  public formBuilder: FormBuilder;
  public organizationId: number;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.credentials)
  credentials$: Observable<Credential[]>;

  @Select(OrganizationManagementState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]> ;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit Mapping' : 'Map Credentials';
  }

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createMapCredentialForm();
  }

  ngOnInit(): void {
    this.organizationChangedHandler();
    this.mapGridData();
    this.dropdownChangedHandler();
    this.idFieldName = 'masterCredentialId';
    this.mappingDataSavedHandler();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onMapCredentialFormCancelClick(): void {
    if (this.mapCredentialsFormGroup.dirty) {
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

  public rowDataBound(data: any): void {
    // TODO: use in Edit, to select required columns
  }

  public customGridDataBound(grid: any): void {
    // TODO: use in Edit, to select required columns
    this.gridDataBound(grid);
  }

  public onMapCredentialFormSaveClick(): void {
    if (this.mapCredentialsFormGroup.valid && !this.isGridStateInvalid) {
      const credentials = this.getCredentialSetupDetails();
      const credentialSetupMapping: CredentialSetupMappingPost = {
        regionIds: this.mapCredentialsFormGroup.controls['regionIds'].value,
        locationIds: this.mapCredentialsFormGroup.controls['locationIds'].value,
        departmentIds: this.mapCredentialsFormGroup.controls['departmentIds'].value,
        skillGroupIds: this.mapCredentialsFormGroup.controls['groupIds'].value,
        organizationId: this.organizationId,
        credentials: credentials
      }

      this.store.dispatch(new SaveUpdateCredentialSetupMappingData(credentialSetupMapping));
    } else {
      this.isGridStateInvalid = this.selectedItems.length === 0;
      this.mapCredentialsFormGroup.markAllAsTouched();
    }
  }

  public onOptionalChange(credential: CredentialSetupGet, event: any): void {
    this.updateAndSelectItem(event.checked, credential,'isActive');
  }

  public onReqForSubmissionChange(credential: CredentialSetupGet, event: any): void {
    this.updateAndSelectItem(event.checked, credential,'reqSubmission');
  }

  public onReqForOnboardChange(credential: CredentialSetupGet, event: any): void {
    this.updateAndSelectItem(event.checked, credential,'reqOnboard');
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
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.gridDataSource = this.getRowsPerPage(this.credentialSetupList, event.currentPage || event.value);
      this.currentPagerPage = event.currentPage || event.value;
    }
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(organizationId => {
      this.organizationId = organizationId;
      this.store.dispatch(new GetCredential());
      this.store.dispatch(new GetCredentialTypes());
    });
  }

  private mapGridData(): void {
    this.credentials$.pipe(combineLatestWith(this.credentialTypes$),
      filter(([credentials, credentialTypes]) => credentials?.length > 0 && credentialTypes.length > 0))
      .subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = this.getLastPage(credentials);
        this.credentialSetupList = [];

        if (credentialTypes) {
          credentials.map(item => {
            let foundCredentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            let credentialSetup: CredentialSetupGet = {
              masterCredentialId: item.id as number,
              credentialType: foundCredentialType ? foundCredentialType.name : '',
              description: item.name,
              comments: item.comment,
              inactiveDate: null,
              isActive: false,
              reqOnboard: false,
              reqSubmission: false
            }
            this.credentialSetupList.push(credentialSetup);
          });

          // TODO: check and highlight rows on the grid that belongs to current mapping in Edit mode
          // if (this.isEdit) {
          //   this.dataSource.credentials.forEach(data => {
          //     let foundElementIndex = this.credentialSetupList.findIndex(credential => credential.masterCredentialId === data.masterCredentialId);
          //     // this.selectedItems.push();
          //   });
          // }
        }
        this.gridDataSource = this.getRowsPerPage(this.credentialSetupList, this.currentPagerPage);
        this.totalDataRecords = credentials.length;
      });
  }

  private updateAndSelectItem(checkboxState: boolean, credential: CredentialSetupGet, checkboxName: string): void {
    (this.grid.dataSource as []).map((item: CredentialSetupGet, rowIndex: number) => {
      if (item.masterCredentialId === credential.masterCredentialId) {
        // update checkbox value
        switch(checkboxName) {
          case 'isActive':
            item.isActive = checkboxState;
            break;
          case 'reqSubmission':
            item.reqSubmission = checkboxState;
            break;
          case 'reqOnboard':
            item.reqOnboard = checkboxState;
            break;
        }
      }
    });
  }

  public customStopPropagation(credential: CredentialSetupGet, event: any): void {
    const foundItem = this.selectedItems.find((selectedItem: CredentialSetupGet) => selectedItem.masterCredentialId === credential.masterCredentialId);

    if (foundItem) {
      event.stopPropagation();
    }
  }

  private dropdownChangedHandler(): void {
    this.mapCredentialsFormGroup.get('regionIds')?.valueChanges.subscribe((regionIds: number[]) => {
      if (regionIds && regionIds.length > 0) {
        this.locations = [];
        regionIds.forEach((id) => {
          const selectedRegion = this.orgRegions.find(region => region.id === id);
          this.locations.push(...selectedRegion?.locations as any);
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

    this.mapCredentialsFormGroup.get('locationIds')?.valueChanges.subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.departments = [];
        locationIds.forEach(id => {
          const selectedLocation = this.locations.find(location => location.id === id);
          this.departments.push(...selectedLocation?.departments as []);
        });
      } else {
        this.departments = [];
      }

      this.mapCredentialsFormGroup.controls['departmentIds'].setValue(null);
    });
  }

  private mappingDataSavedHandler(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveUpdateCredentialSetupMappingSucceeded)).subscribe((isSucceed) => {
      if (isSucceed) {
        this.clearFormData();
        this.store.dispatch(new ShowSideDialog(false));
      }
    });
  }

  private createMapCredentialForm(): void {
    this.mapCredentialsFormGroup = this.formBuilder.group({
      regionIds: [null, Validators.required],
      locationIds: [null, Validators.required],
      departmentIds: [null, Validators.required],
      groupIds: [null, Validators.required]
    });
  }

  private getCredentialSetupDetails(): CredentialSetupDetails[] {
    const credentialSetupDetails: CredentialSetupDetails[] = [];
    this.selectedItems.forEach(item => {
      let credential: CredentialSetupDetails = {
        masterCredentialId: item.masterCredentialId,
        comments: item.comments,
        optional: item.isActive,
        reqSubmission: item.reqSubmission,
        reqOnboard: item.reqOnboard,
        inactiveDate: item.inactiveDate
      }
      credentialSetupDetails.push(credential);
    });

    return credentialSetupDetails;
  }

  private clearFormData(): void {
    this.mapCredentialsFormGroup.reset();
    this.isGridStateInvalid = false;
    this.clearSelection(this.grid);
    this.credentialSetupList = [];
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
