import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { delay, filter, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { OrganizationManagementState } from '../../store/organization-management.state';
import {
  GetCredential,
  GetCredentialSkillGroup,
  GetCredentialTypes,
} from '../../store/organization-management.actions';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSetupFilterDto,
  CredentialSetupFilterGet,
  CredentialSetupGet,
  CredentialSetupMappingPost,
} from '@shared/models/credential-setup.model';
import { UserState } from 'src/app/store/user.state';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import {
  Organization,
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { CredentialsState } from '@organization-management/store/credentials.state';
import {
  ClearCredentialSetup,
  GetCredentialSetupByMappingId, GetFilteredCredentialSetupData,
  UpdateCredentialSetup,
  UpdateCredentialSetupSucceeded,
} from '@organization-management/store/credentials.actions';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { CredentialsSetupService } from '@organization-management/credentials/services/credentials-setup.service';
import { TakeUntilDestroy } from '@core/decorators';
import { CredentialSetupAdapter } from '@organization-management/credentials/adapters/credential-setup.adapter';
import { AppState } from '../../../store/app.state';
import { systemOptions } from '../constants';
import { CredentialSetupSystemEnum } from '@organization-management/credentials/enums';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { FilteredCredentialsComponent } from './filtered-credentials/filtered-credentials.component';

@TakeUntilDestroy
@Component({
  selector: 'app-credentials-setup',
  templateUrl: './credentials-setup.component.html',
  styleUrls: ['./credentials-setup.component.scss'],
  providers: [MaskedDateTimeService],
})
export class CredentialsSetupComponent extends AbstractPermissionGrid implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('filteredGrid') filteredGrid: FilteredCredentialsComponent;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.skillGroups)
  groups$: Observable<CredentialSkillGroupPage>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(CredentialsState.credentialSetupList)
  credentialSetupData$: Observable<CredentialSetupGet[]>;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;

  public systemOptions: { id: number; name: string }[] = systemOptions;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public skills: MasterSkillByOrganization[];
  public groups: CredentialSkillGroup[];
  public credentialsSetupFormGroup: FormGroup;
  public headerFilterFormGroup: FormGroup;
  public systemIdControl: FormControl = new FormControl(null);
  public editedCredentialSetupId?: number;
  public isCredentialSetupEdit = false;
  public mappingData: CredentialSetupGet[];
  public isIRPAndVMSEnabled = false;
  public isIRPFlagEnabled = false;
  public isCredentialIRP = false;

  public mappingDataForEditChanged$: Subject<CredentialSetupMappingPost> = new Subject();
  public credentialSetupFilter = new Subject<CredentialSetupFilterDto>();

  protected componentDestroy: () => Observable<unknown>;

  private lastSelectedCredential: CredentialSetupFilterGet | null;
  private systemIdSubscription: Subscription;
  public filterType: string = 'Contains';
  constructor(
    protected override store: Store,
    private actions$: Actions,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private credentialsSetupService: CredentialsSetupService
  ) {
    super(store);

    this.checkIRPFlag();

    this.createCredentialsForm();
    this.createHeaderFilterFormGroup();
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.startOrganizationWatching();
    this.organizationChangedHandler();
    this.onRegionsDataLoaded();
    this.onSkillGroupDataLoaded();
    this.headerFilterHandler();
    this.credentialSetupUpdateHandler();
    this.mapGridData();
  }

  public onCredentialCheckboxChange(
    credentialSetup: CredentialSetupGet,
    checkboxName: string,
    event: { checked: boolean }
  ): void {
    this.isCredentialIRP = this.isIRPAndVMSEnabled && !!(credentialSetup.includeInIRP);
    this.credentialsSetupService.irpCommentFieldSettings(this.credentialsSetupFormGroup, this.isCredentialIRP);
    this.credentialsSetupService.populateCredentialSetupForm(
      this.credentialsSetupFormGroup,
      credentialSetup,
      this.isCredentialIRP,
      checkboxName,
      event.checked,
    );

    this.onCredentialFormSaveClick();
  }

  public onEditCredentialClick(credentialSetup: CredentialSetupGet, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.isCredentialSetupEdit = true;

    this.isCredentialIRP = this.isIRPAndVMSEnabled && !!(credentialSetup.includeInIRP);
    this.credentialsSetupService.irpCommentFieldSettings(this.credentialsSetupFormGroup, this.isCredentialIRP);
    this.credentialsSetupService.populateCredentialSetupForm(
      this.credentialsSetupFormGroup,
      credentialSetup,
      this.isCredentialIRP,
    );

    setTimeout(() => this.store.dispatch(new ShowSideDialog(true)), 40);
  }

  public onCredentialFormCancelClick(): void {
    if (this.credentialsSetupFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.closeDialog();
      });
    } else {
      this.closeDialog();
    }
  }

  public onCredentialFormSaveClick(): void {
    if (this.credentialsSetupFormGroup.valid) {
      this.store.dispatch(new UpdateCredentialSetup(
        this.credentialsSetupFormGroup.getRawValue()
      ));
    } else {
      this.credentialsSetupFormGroup.markAllAsTouched();
    }
  }

  public mapGridData(): void {
    this.credentialSetupData$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe(data => {
      this.mappingData = data;
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public changeTablePagination(event: { currentPage?: number; value: number; }): void {
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
      this.store.dispatch(new ShowSideDialog(true));
      this.mappingDataForEditChanged$.next(
        CredentialSetupAdapter.credentialMappingForEdit(this.lastSelectedCredential, this.mappingData)
      );
    }
  }

  public onMappingFormClosed(): void {
    this.store.dispatch(new GetFilteredCredentialSetupData(this.filteredGrid.credentialSetupFilter));
  }

  public onSelectedCredentialClick(selectedCredential: CredentialSetupFilterGet): void {
    if (selectedCredential && selectedCredential.mappingId) {
      this.lastSelectedCredential = selectedCredential;
      // get mapping for selected credential
      this.store.dispatch(new GetCredentialSetupByMappingId(selectedCredential.mappingId));

      this.grid.getColumnByField('irpComments').visible =
        this.isIRPAndVMSEnabled && !!selectedCredential.includeInIRP;
      this.grid.refreshColumns();
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
    this.credentialsSetupFormGroup = this.credentialsSetupService.createCredentialsSetupForm();
  }

  private createHeaderFilterFormGroup(): void {
    this.headerFilterFormGroup = this.credentialsSetupService.createFilterGroup();
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.lastSelectedCredential = null;
      this.gridDataSource = [];
      this.store.dispatch(new ClearCredentialSetup());
      this.store.dispatch(new GetCredentialSkillGroup(1, 1000));
    });
  }

  private onRegionsDataLoaded(): void {
    this.organizationStructure$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((structure: OrganizationStructure) => {
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
    });
  }

  private onSkillGroupDataLoaded(): void {
    this.groups$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe(groupsPages => {
      this.groups = groupsPages.items;
    });
  }

  private headerFilterHandler(): void {
    this.headerFilterFormGroup.controls['regionId']?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((regionId: number) => {
      this.locations = [];
      this.departments = [];

      if (regionId) {
        const selectedRegion = this.orgRegions.find(region => region.id === regionId);
        this.locations.push(...sortByField(selectedRegion?.locations ?? [], 'name') as []);
        const departments: OrganizationDepartment[] = [];
        this.locations.forEach(location => departments.push(...location.departments));
        this.departments = sortByField(departments, 'name');

        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
        );
      } else {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFiltersByKeys(
            this.headerFilterFormGroup,
            ['groupId', 'skillId'],
          )
        );
      }

      this.headerFilterFormGroup.controls['locationId'].setValue(null);
      this.headerFilterFormGroup.controls['departmentId'].setValue(null);
    });

    this.headerFilterFormGroup.get('locationId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((locationId: number) => {
      this.departments = [];

      if (locationId) {
        const selectedLocation = this.locations.find(location => location.id === locationId);
        this.departments.push(...sortByField(selectedLocation?.departments ?? [], 'name') as []);

        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
        );
      } else {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFiltersByKeys(
            this.headerFilterFormGroup,
            ['regionId', 'departmentId', 'groupId', 'skillId'],
          )
        );
      }

      this.headerFilterFormGroup.controls['departmentId'].setValue(null);
    });

    this.headerFilterFormGroup.get('departmentId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((departmentId: number) => {
      if (departmentId) {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
        );
      } else {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFiltersByKeys(
            this.headerFilterFormGroup,
            ['regionId', 'locationId', 'groupId', 'skillId'],
          )
        );
      }
    });

    this.headerFilterFormGroup.get('groupId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((groupId: number) => {
      this.skills = [];

      if (groupId) {
        const selectedGroup = this.groups.find(group => group.id === groupId);
        this.skills.push(...sortByField(selectedGroup?.skills ?? [], 'name') as []);

        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
        );
      } else {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFiltersByKeys(
            this.headerFilterFormGroup,
            ['regionId', 'locationId', 'departmentId', 'skillId'],
          )
        );
      }

      this.headerFilterFormGroup.controls['skillId'].setValue(null);
    });

    this.headerFilterFormGroup.get('skillId')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((skillId: number) => {
      if (skillId) {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
        );
      } else {
        this.credentialSetupFilter.next(
          CredentialSetupAdapter.prepareFiltersByKeys(
            this.headerFilterFormGroup,
            ['regionId', 'locationId', 'departmentId', 'groupId'],
          )
        );
      }
    });
  }

  private credentialSetupUpdateHandler(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateCredentialSetupSucceeded),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormData();
      this.removeActiveCssClass();

      // get data to credential grid with the same header filter
      this.credentialSetupFilter.next(
        CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
      );
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

  private closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.clearFormData();
    this.removeActiveCssClass();
  }

  private checkIRPFlag(): void {
    const user = this.store.selectSnapshot(UserState.user);

    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled)
      && user?.businessUnitType !== BusinessUnitType.MSP;
  }

  private startOrganizationWatching(): void {
    this.organization$.pipe(
      delay(200),
      takeUntil(this.componentDestroy())
    ).subscribe((org: Organization) => {
      const { isIRPEnabled, isVMCEnabled } = org?.preferences || {};

      this.isIRPAndVMSEnabled = this.isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);

      this.credentialsSetupService.systemFieldSettings(this.headerFilterFormGroup, this.isIRPAndVMSEnabled);

      if (this.isIRPAndVMSEnabled) {
        this.startSystemControlWatching();
      }
    });
  }

  private startSystemControlWatching(): void {
    if (this.systemIdSubscription) {
      this.systemIdSubscription.unsubscribe();
    }

    this.systemIdSubscription = this.systemIdControl?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((systemId: number) => {
      const includeInIRP = systemId === CredentialSetupSystemEnum.All || systemId === CredentialSetupSystemEnum.IRP;
      const includeInVMS = systemId === CredentialSetupSystemEnum.All || systemId === CredentialSetupSystemEnum.VMS;

      this.headerFilterFormGroup.patchValue({ includeInIRP, includeInVMS });

      this.credentialSetupFilter.next(
        CredentialSetupAdapter.prepareFilter(this.headerFilterFormGroup)
      );
    });
  }
}
