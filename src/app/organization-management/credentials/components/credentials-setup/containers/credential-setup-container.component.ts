import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';

import { TakeUntilDestroy } from '@core/decorators';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { UserState } from '../../../../../store/user.state';
import { AppState } from '../../../../../store/app.state';

@Component({
  selector: 'app-credential-setup-container',
  templateUrl: './credential-setup-container.component.html',
  styleUrls: ['./credential-setup-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class CredentialSetupContainerComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  public isIRPFlagEnabled = false;
  public orgRegions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];
  public groups: CredentialSkillGroup[];

  @Select(OrganizationManagementState.skillGroups)
  public groups$: Observable<CredentialSkillGroupPage>;

  @Select(UserState.organizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;

  private componentDestroy: () => Observable<unknown>;

  constructor(
    protected override store: Store,
    private cdr: ChangeDetectorRef
    ) {
    super(store);

    this.checkIRPFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForOrgStructure();
    this.watchForSkillGroup();
  }

  ngOnDestroy(): void {}

  private checkIRPFlag(): void {
    const user = this.store.selectSnapshot(UserState.user);

    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled)
      && user?.businessUnitType !== BusinessUnitType.MSP;
  }

  private watchForSkillGroup(): void {
    this.groups$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    ).subscribe(groupsPages => {
      this.groups = groupsPages.items;
    });
  }

  private watchForOrgStructure(): void {
    this.organizationStructure$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    ).subscribe((structure: OrganizationStructure) => {
      this.orgRegions = structure.regions;
      this.allRegions = [...this.orgRegions];
      this.cdr.markForCheck();
    });
  }
}
