import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { delay, filter, Observable, Subscription, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  Organization,
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { Destroyable } from '@core/helpers';
import { CredentialsSetupService } from '@organization-management/credentials/services';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { systemOptions } from '@organization-management/credentials/constants';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { CredentialSetupSystemEnum } from '@organization-management/credentials/enums';
import { CredentialSetupAdapter } from '@organization-management/credentials/adapters/credential-setup.adapter';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ClearCredentialSetup } from '@organization-management/store/credentials.actions';
import { GetCredentialSkillGroup } from '@organization-management/store/organization-management.actions';
import { UserState } from '../../../../../../store/user.state';

@Component({
  selector: 'app-setup-grid-filters',
  templateUrl: './setup-grid-filters.component.html',
  styleUrls: ['./setup-grid-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupGridFiltersComponent extends Destroyable implements OnInit {
  @Input() isIRPFlagEnabled = false;
  @Input() allRegions: OrganizationRegion[];
  @Input() groups: CredentialSkillGroup[];
  @Input() set organizationRegions(regions: OrganizationRegion[]) {
    if (regions.length) {
      this.setClearOrgStructure(regions);
    }
  }

  @Select(OrganizationManagementState.skillGroups)
  public groups$: Observable<CredentialSkillGroupPage>;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;
  @Select(UserState.organizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  public filterForm: FormGroup;
  public isIRPAndVMSEnabled = false;
  public systemOptions: { id: number; name: string }[] = systemOptions;
  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public filterType = 'Contains';
  public orgRegions: OrganizationRegion[];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];
  public skills: MasterSkillByOrganization[];
  public systemIdControl: FormControl = new FormControl(null);

  private systemIdSubscription: Subscription;

  constructor(
    private store: Store,
    private credentialsSetupService: CredentialsSetupService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.startOrganizationWatching();
    this.watchForOrganizationChange();
    this.watchForSkillGroup();
    this.watchForFiltersValue();
  }

  public clearFilters(): void {
    this.filterForm.reset();
    this.systemIdControl.reset();
  }

  private createFilterForm(): void {
    this.filterForm = this.credentialsSetupService.createFilterGroup();
  }

  private setClearOrgStructure(regions: OrganizationRegion[]): void {
    this.clearFilters();
    this.orgRegions = regions;
    this.locations = [];
    this.departments = [];
  }

  private startOrganizationWatching(): void {
    this.organization$.pipe(
      delay(200),
      takeUntil(this.componentDestroy())
    ).subscribe((org: Organization) => {
      const { isIRPEnabled, isVMCEnabled } = org?.preferences || {};

      this.isIRPAndVMSEnabled = this.isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);
      this.credentialsSetupService.systemFieldSettings(this.filterForm, this.isIRPAndVMSEnabled);

      if (this.isIRPAndVMSEnabled) {
        this.watchForSystemControl();
      }

      this.cdr.markForCheck();
    });
  }

  private watchForSkillGroup(): void {
    this.groups$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe(groupsPages => {
      this.groups = groupsPages.items;
    });
  }

  private watchForFiltersValue(): void {
    this.filterForm.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.setGridFilterForm();
    });

    this.filterForm.controls['regionId']?.valueChanges.pipe(
      filter((regionId: number) => !!regionId),
      takeUntil(this.componentDestroy())
    ).subscribe((regionId: number) => {
      this.locations = [];
      this.departments = [];

      const selectedRegion = this.orgRegions.find(region => region.id === regionId);
      this.locations.push(...sortByField(selectedRegion?.locations ?? [], 'name') as []);
      const departments: OrganizationDepartment[] = [];
      this.locations.forEach(location => departments.push(...location.departments));
      this.departments = sortByField(departments, 'name');

      this.filterForm.controls['locationId'].setValue(null, { emitEvent: false, onlySelf: false });
      this.filterForm.controls['departmentId'].setValue(null, { emitEvent: false, onlySelf: false });
      this.cdr.markForCheck();
    });

    this.filterForm.get('locationId')?.valueChanges.pipe(
      filter((locationId: number) => !!locationId),
      takeUntil(this.componentDestroy())
    ).subscribe((locationId: number) => {
      this.departments = [];
      const selectedLocation = this.locations.find(location => location.id === locationId);
      this.departments.push(...sortByField(selectedLocation?.departments ?? [], 'name') as []);

      this.filterForm.controls['departmentId'].setValue(null, { emitEvent: false, onlySelf: false });
      this.cdr.markForCheck();
    });

    this.filterForm.get('groupId')?.valueChanges.pipe(
      filter((groupId: number) => !!groupId),
      takeUntil(this.componentDestroy())
    ).subscribe((groupId: number) => {
      this.skills = [];
      const selectedGroup = this.groups.find(group => group.id === groupId);
      this.skills.push(...sortByField(selectedGroup?.skills ?? [], 'name') as []);

      this.filterForm.controls['skillId'].setValue(null, { emitEvent: false, onlySelf: false });
      this.cdr.markForCheck();
    });
  }

  private watchForOrganizationChange(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch([
        new ClearCredentialSetup(),
        new GetCredentialSkillGroup(1, 1000),
      ]);
    });
  }

  private watchForSystemControl(): void {
    if (this.systemIdSubscription) {
      this.systemIdSubscription.unsubscribe();
    }

    this.systemIdSubscription = this.systemIdControl?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((systemId: number) => {
      const includeInIRP = systemId === CredentialSetupSystemEnum.All || systemId === CredentialSetupSystemEnum.IRP;
      const includeInVMS = systemId === CredentialSetupSystemEnum.All || systemId === CredentialSetupSystemEnum.VMS;

      this.filterForm.patchValue({ includeInIRP, includeInVMS });
    });
  }

  private setGridFilterForm(): void {
    this.credentialsSetupService.setFilterGridState(
      CredentialSetupAdapter.prepareFilter(this.filterForm)
    );
  }
}
