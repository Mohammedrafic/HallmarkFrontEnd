import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { CANCEL_COFIRM_TEXT, DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { combineLatestWith, filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { ShowSideDialog } from '../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSetupDetails,
  CredentialSetupGet,
  CredentialSetupMappingPost
} from '@shared/models/credential-setup.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { GetCredential, GetCredentialTypes } from '@organization-management/store/organization-management.actions';
import { UserState } from '../../../../store/user.state';
import {
  SaveUpdateCredentialSetupMappingData,
  SaveUpdateCredentialSetupMappingSucceeded
} from '@organization-management/store/credentials.actions';

@Component({
  selector: 'app-map-credentials-form',
  templateUrl: './map-credentials-form.component.html',
  styleUrls: ['./map-credentials-form.component.scss']
})
export class MapCredentialsFormComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Input() orgRegions: OrganizationRegion[];
  @Input() groups: CredentialSkillGroup[];
  @Input() mappingDataForEdit$: Subject<CredentialSetupMappingPost> = new Subject();

  @Output() formClosed = new EventEmitter();

  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isGridStateInvalid = false;
  public mapCredentialsFormGroup: FormGroup;
  public formBuilder: FormBuilder;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.credentials)
  credentials$: Observable<Credential[]>;

  @Select(OrganizationManagementState.credentialTypes)
  credentialTypes$: Observable<CredentialType[]>;

  public formHeaderLabel: string = 'Map Credentials';
  public isDropdownEnabled = true;

  public credentialSetupMappingToPost?: CredentialSetupMappingPost;
  public isEdit: boolean;

  private credentialSetupList: CredentialSetupGet[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createCredentialMappingForm();
  }

  ngOnInit(): void {
    this.organizationChangedHandler();
    this.mapGridData();
    this.dropdownChangedHandler();
    this.idFieldName = 'masterCredentialId';
    this.mappingDataSavedHandler();
    this.setFormForEditHandler();
    this.pageChangedHandler();
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
          this.cleanUp();
        });
    } else {
      this.cleanUp();
    }
  }

  public onMapCredentialFormSaveClick(): void {
    if (this.mapCredentialsFormGroup.valid && !this.isGridStateInvalid) {
      const credentials = this.getCredentialSetupDetails();
      const isAllRegions = this.mapCredentialsFormGroup.controls['regionIds'].value.length === this.orgRegions.length;

      const credentialSetupMapping: CredentialSetupMappingPost = {
        regionIds: isAllRegions ? [] : this.mapCredentialsFormGroup.controls['regionIds'].value, // [] means All on the BE side
        locationIds: isAllRegions && this.mapCredentialsFormGroup.controls['locationIds'].value.length === this.locations.length
          ? [] : this.mapCredentialsFormGroup.controls['locationIds'].value, // [] means All on the BE side
        departmentIds: isAllRegions && this.mapCredentialsFormGroup.controls['departmentIds'].value.length === this.departments.length
          ? [] : this.mapCredentialsFormGroup.controls['departmentIds'].value, // [] means All on the BE side
        skillGroupIds: this.mapCredentialsFormGroup.controls['groupIds'].value.length === this.groups.length
          ? [] : this.mapCredentialsFormGroup.controls['groupIds'].value,
        credentials: credentials
      }

      if (this.isEdit) {
        credentialSetupMapping.credentionSetupMappingId = this.mapCredentialsFormGroup.controls['mappingId'].value;
      }

      this.credentialSetupMappingToPost = credentialSetupMapping;
      this.store.dispatch(new SaveUpdateCredentialSetupMappingData(credentialSetupMapping));
    } else {
      this.isGridStateInvalid = this.selectedItems.length === 0;
      this.mapCredentialsFormGroup.markAllAsTouched();
    }
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
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.store.dispatch(new GetCredential());
      this.store.dispatch(new GetCredentialTypes());
    });
  }

  private mapGridData(): void {
    this.credentials$.pipe(combineLatestWith(this.credentialTypes$), takeUntil(this.unsubscribe$),
      filter(([credentials, credentialTypes]) => credentials?.length > 0 && credentialTypes.length > 0))
      .subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = this.getLastPage(credentials);
        this.totalDataRecords = credentials.length;
        this.credentialSetupList = [];

        if (credentialTypes) {
          credentials.map(item => {
            let foundCredentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            let credentialSetup: CredentialSetupGet = {
              masterCredentialId: item.id as number,
              credentialType: foundCredentialType ? foundCredentialType.name : '',
              description: item.name,
              comments: item.comment
            }
            this.credentialSetupList.push(credentialSetup);
          });
        }
        this.gridDataSource = this.credentialSetupList;

        // reset grid invalid state
        this.isGridStateInvalid = false;
      });
  }

  private setFormForEditHandler(): void {
    // subscribe on mappingDataForEdit$ to be able to set up Mapping form in Edit mode
    this.mappingDataForEdit$.pipe(takeUntil(this.unsubscribe$)).subscribe(credentialSetupMapping => {
      if (credentialSetupMapping) {
        this.formHeaderLabel = 'Edit Mapping';
        this.isEdit = true;
        // disable dropdowns in Edit mode
        this.isDropdownEnabled = false;

        // setup form data
        this.mapCredentialsFormGroup.setValue({
          mappingId: credentialSetupMapping.credentionSetupMappingId,
          regionIds: credentialSetupMapping.regionIds ? credentialSetupMapping.regionIds : this.orgRegions.map(r => r.id),
          locationIds: credentialSetupMapping.locationIds ? credentialSetupMapping.locationIds : this.locations.map(l => l.id),
          departmentIds: credentialSetupMapping.departmentIds ? credentialSetupMapping.departmentIds : this.departments.map(d => d.id),
          groupIds: credentialSetupMapping.skillGroupIds ? credentialSetupMapping.skillGroupIds : this.groups.map(g => g.id),
        });

        credentialSetupMapping.credentials.forEach(savedMapping => {
          (this.gridDataSource as CredentialSetupGet[]).map((credential, index) => {
            if (credential.masterCredentialId === savedMapping.masterCredentialId) {
              credential.inactiveDate = savedMapping.inactiveDate;
              credential.isActive = savedMapping.optional;
              credential.reqSubmission = savedMapping.reqSubmission;
              credential.reqOnboard = savedMapping.reqOnboard;

              this.selectedItems.push(this.gridDataSource[index]);
            }
          });

          this.grid.refresh();
        });
      }
    });
  }

  public checkboxStateChanged(event: any, credential: CredentialSetupGet, checkboxName: string): void {
    (this.grid.dataSource as []).map((item: CredentialSetupGet) => {
      if (item.masterCredentialId === credential.masterCredentialId) {
        // update checkbox state value
        switch(checkboxName) {
          case 'isActive':
            item.isActive = event.checked;
            break;
          case 'reqSubmission':
            item.reqSubmission = event.checked;
            break;
          case 'reqOnboard':
            item.reqOnboard = event.checked;
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
        this.store.dispatch(new ShowSideDialog(false));
        this.formClosed.emit();
        this.store.dispatch(new GetCredential());
        this.store.dispatch(new GetCredentialTypes());
        this.clearFormDetails();
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
        okButtonClass: ''
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        if (this.credentialSetupMappingToPost) {
          this.credentialSetupMappingToPost.forceUpsert = true; // set force override flag for BE
          this.store.dispatch(new SaveUpdateCredentialSetupMappingData(this.credentialSetupMappingToPost));
          this.store.dispatch(new ShowSideDialog(false));
          this.formClosed.emit();
          this.store.dispatch(new GetCredential());
          this.store.dispatch(new GetCredentialTypes());
          this.clearFormDetails();
        }
      });
  }

  private createCredentialMappingForm(): void {
    this.mapCredentialsFormGroup = this.formBuilder.group({
      mappingId: [null],
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

  private clearFormDetails(): void {
    this.removeActiveCssClass();
    this.mapCredentialsFormGroup.reset();
    this.formHeaderLabel = 'Map Credentials';
    this.isDropdownEnabled = true;
    this.credentialSetupMappingToPost = undefined;
    this.isEdit = false;
    this.clearSelection(this.grid);
  }

  private cleanUp(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.clearFormDetails();
    this.credentialSetupList.map(s => {
      s.isActive = false;
      s.reqSubmission = false;
      s.reqOnboard = false;
    });
    this.grid.refresh();
    this.isGridStateInvalid = false;
  }

  private pageChangedHandler(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.gridDataSource = this.getRowsPerPage(page);
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(currentPage: number): object[] {
    return this.credentialSetupList.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
