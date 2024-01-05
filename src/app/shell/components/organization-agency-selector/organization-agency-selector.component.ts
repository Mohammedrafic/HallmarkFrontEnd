import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  zip,
  delay
} from 'rxjs';

import {
  GetUserAgencies,
  GetUserOrganizations,
  SaveLastSelectedOrganizationAgencyId,
  LastSelectedOrganisationAgency,
  UserOrganizationsAgenciesChanged,
  SetAgencyActionsAllowed,
  SetAgencyInvoicesActionsAllowed,
  SetLastSelectedOrganizationAgencyId,
  GetUserMsps,
  UserMspsChanged,
  SaveLastSelectedMspId,
  SetLastSelectedMspId,
} from 'src/app/store/user.actions';

import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  UserAgencyOrganization,
} from '@shared/models/user-agency-organization.model';
import { User } from '@shared/models/user.model';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { AgencyStatus } from 'src/app/shared/enums/status';
import { UserStateModel } from '../../../store/user.state';
import { ToggleSidebarState } from 'src/app/store/app.actions';
import { ActivatedRoute } from '@angular/router';
import { IOrganizationAgency } from './unit-selector.interface';
import { UnitSelectorHelper } from './unit-selector.helper';
import { GetUserMenuConfig } from '../../../store/user.actions';
import { UserMsp } from '../../../shared/models/user-msp.model';
import { IsMspAreaStateModel } from '../../../shared/models/is-msp-area-state.model';

@Component({
  selector: 'app-organization-agency-selector',
  templateUrl: './organization-agency-selector.component.html',
  styleUrls: ['./organization-agency-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationAgencySelectorComponent implements OnInit, OnDestroy {
  public organizationAgencyControl: FormControl = new FormControl();
  public baseUrl: string;
  public agencyStatuses = AgencyStatus;
  public eliteBusinessUnitId:number;
  @Input() public isDarkTheme: boolean | null;

  public optionFields = {
    text: 'name',
    value: 'id',
  };

  public organizationsAgencies$: BehaviorSubject<IOrganizationAgency[]> = new BehaviorSubject<IOrganizationAgency[]>(
    []
  );

  public organizationAgency: IOrganizationAgency;
  public isAgencyOrOrganization = true;
  public isMspAndMspArea = false;
  public isMsp = false;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  @Select(AppState.isMspArea)
  isMspArea$: Observable<IsMspAreaStateModel>;

  @Select(UserState.user)
  user$: Observable<User>;

  @Select(UserState.agencies)
  agencies$: Observable<UserAgencyOrganization>;

  @Select(UserState.organizations)
  organizations$: Observable<UserAgencyOrganization>;

  @Select(UserState.msps)
  msps$: Observable<UserMsp>;

  private organizations: IOrganizationAgency[] = [];
  private agencies: IOrganizationAgency[] = [];
  private msps: IOrganizationAgency[] = [];

  private userOrganizations: UserAgencyOrganization;
  private userAgencies: UserAgencyOrganization;
  private userMsps: UserMsp;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    private actions$: Actions,
    @Inject(APP_SETTINGS) private appSettings: AppSettings,
    private route: ActivatedRoute,
  ) {
    this.baseUrl = this.appSettings.host;
  }

  ngOnInit(): void {
    this.eliteBusinessUnitId = JSON.parse((localStorage.getItem('BussinessUnitID') || '0')) as number;
    (!this.eliteBusinessUnitId)?this.eliteBusinessUnitId=0:""
    const user = this.store.selectSnapshot(UserState.user);
    this.subscribeUserChange();
    this.isOrganizationAgencyAreaChange();
    this.isMspAreaChange();
    this.subscribeOrganizationAgencies();
    this.subscribeMsps();
    this.observeSelectorControl();
  }

  public selectBusinesUnitType(): void {
    const isMobile = this.store.selectSnapshot(AppState.isMobileScreen);
    if (isMobile) {
      this.store.dispatch(new ToggleSidebarState(false));
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private subscribeUserChange(): void {
    this.actions$
    .pipe(
      ofActionDispatched(UserOrganizationsAgenciesChanged),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(new GetUserOrganizations());
      this.store.dispatch(new GetUserAgencies());
    });

    this.actions$
      .pipe(
        ofActionDispatched(UserMspsChanged),
        takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(new GetUserMsps());
    })

    this.user$
    .pipe(
      filter((user) => !!user),
      takeUntil(this.unsubscribe$),
    ).subscribe((user) => {
      const agencyOrganizations = [BusinessUnitType.Agency, BusinessUnitType.Organization];
      this.isAgencyOrOrganization = agencyOrganizations.includes(user.businessUnitType);
      this.isMsp = user.businessUnitType == BusinessUnitType.MSP ? true : false;

      this.store.dispatch(new GetUserOrganizations());
      this.store.dispatch(new GetUserAgencies());
      this.store.dispatch(new GetUserMsps());
    });
  }

  private isOrganizationAgencyAreaChange(): void {
    this.isOrganizationAgencyArea$
    .pipe(
      distinctUntilChanged((prev, next) => {
        return prev.isAgencyArea === next.isAgencyArea && prev.isOrganizationArea === next.isOrganizationArea;
      }),
      takeUntil(this.unsubscribe$),
    )
    .subscribe((area) => {
      const isOrganizationArea = area.isOrganizationArea;
      const isAgencyArea = area.isAgencyArea;

      if (isOrganizationArea && isAgencyArea) {
        this.applyOrganizationsAgencies(isOrganizationArea, isAgencyArea);
        return;
      }
      if (isOrganizationArea || isAgencyArea) {
        const currentArea = isOrganizationArea ? 'Organization' : 'Agency';

        this.store.dispatch(new LastSelectedOrganisationAgency(currentArea)).pipe(
          takeUntil(this.unsubscribe$),
        ).subscribe(() => {
          this.applyOrganizationsAgencies(isOrganizationArea, isAgencyArea);
        });
      }
    });
  }

  private isMspAreaChange(): void {
    this.isMspArea$
      .pipe(
        distinctUntilChanged((prev, next) => {
          return prev.isMSPArea === next.isMSPArea;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((area) => {
        const isMspArea = area.isMSPArea;

        if (isMspArea) {
          const currentArea = 'MSP';

          this.store.dispatch(new LastSelectedOrganisationAgency(currentArea)).pipe(
            takeUntil(this.unsubscribe$),
          ).subscribe(() => {
            this.applyMsps(isMspArea);
          });
        }
      });
  }

  private subscribeMsps(): void {
    zip(this.msps$)
      .pipe(
        delay(500),
        filter((value) => {
          const dataExist = Array.isArray(value);
          const valueExists = !!value[0];

          return dataExist && valueExists;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((userMspsData) => {
        this.userMsps = userMspsData[0];
        this.msps = UnitSelectorHelper.createMsps(this.userMsps.businessUnits);

        const area = this.store.selectSnapshot(AppState.isMspArea);
        this.applyMsps(area.isMSPArea);

        this.cd.markForCheck();
      });
  }

  private subscribeOrganizationAgencies(): void {
    zip(this.agencies$, this.organizations$)
      .pipe(
        filter((value) => {
          const dataExist = Array.isArray(value);
          const bothValuesExist = !!value[0] && !!value[1];

          return dataExist && bothValuesExist;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((userAgenciesAndOrganizations) => {
        this.userAgencies = userAgenciesAndOrganizations[0];
        this.userOrganizations = userAgenciesAndOrganizations[1];

        this.agencies = UnitSelectorHelper.createAgencies(this.userAgencies.businessUnits);
        this.organizations = UnitSelectorHelper.createOrganizations(this.userOrganizations.businessUnits);        

        const area = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
        this.applyOrganizationsAgencies(area.isOrganizationArea, area.isAgencyArea);

        this.cd.markForCheck();
      });
  }

  private applyOrganizationsAgencies(isOrganizationArea: boolean, isAgencyArea: boolean): void {
    this.isMspAndMspArea = false;
    if (!isOrganizationArea && !isAgencyArea) {
      return;
    }

    let organizationsAgencies: IOrganizationAgency[] = [];

    if (isOrganizationArea) {
      organizationsAgencies = [...organizationsAgencies, ...this.organizations];
    }

    if (isAgencyArea) {
      organizationsAgencies = [...organizationsAgencies, ...this.agencies];
    }

    if (this.isAgencyOrOrganization) {
      this.organizationAgency = this.organizations[0] || this.agencies[0];
    } else {
      this.organizationsAgencies$.next(organizationsAgencies.sort((a, b) => a.name.localeCompare(b.name)));
    }
 
    const lastSelectedOrganizationId = this.store.selectSnapshot(UserState.lastSelectedOrganizationId);
    const lastSelectedAgencyId = this.store.selectSnapshot(UserState.lastSelectedAgencyId);
    const isAgency = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'Agency';

    let newOrganizationAgencyControlValue: number | null;

    if (isAgencyArea && isAgency) {
      const navigateAgencyId = this.route.snapshot.queryParams['agId'] ? Number(this.route.snapshot.queryParams['agId'])
      : null;
      const aid = navigateAgencyId || lastSelectedAgencyId;
      const currentAgency = organizationsAgencies.find((agency) => agency.id === aid);
      newOrganizationAgencyControlValue = currentAgency ? aid : organizationsAgencies[0]?.id || null;
      this.eliteBusinessUnitId=0;
      this.setAgencyStatus(currentAgency);
    } else {
      const navigateOrgId = this.route.snapshot.queryParams['orgId'] ? Number(this.route.snapshot.queryParams['orgId'])
      : null;
      const orgId = navigateOrgId || lastSelectedOrganizationId;

      newOrganizationAgencyControlValue = organizationsAgencies.find((i) => i.id === orgId)
        ? orgId
        : organizationsAgencies[0]?.id || null;
    }

     if(this.eliteBusinessUnitId>0){
      newOrganizationAgencyControlValue = organizationsAgencies.find((i) => i.id === this.eliteBusinessUnitId)
        ? this.eliteBusinessUnitId
        : organizationsAgencies[0]?.id || null;
    }

    this.organizationAgencyControl.patchValue(newOrganizationAgencyControlValue);

    this.cd.detectChanges();
    setTimeout(() => this.cd.markForCheck());
  }

  private applyMsps(isMspArea: boolean): void {
    this.isMspAndMspArea = isMspArea && this.isMsp;
    if (!isMspArea) {
      return;
    }

    let mspsData: IOrganizationAgency[] = [];

    mspsData = [...mspsData, ...this.msps];
    

    if (this.isMsp) {
      this.organizationAgency = this.msps[0];
    } else {
      this.organizationsAgencies$.next(mspsData.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const lastSelectedMspId = this.store.selectSnapshot(UserState.lastSelectedMspId);

    let newOrganizationAgencyControlValue: number | null;

    const navigateMspId = this.route.snapshot.queryParams['mspId'] ? Number(this.route.snapshot.queryParams['mspId'])
        : null;
    const mspId = navigateMspId || lastSelectedMspId;

    newOrganizationAgencyControlValue = mspsData.find((i) => i.id === mspId)
        ? mspId
      : mspsData[0]?.id || null;

    if (this.eliteBusinessUnitId > 0) {
      newOrganizationAgencyControlValue = mspsData.find((i) => i.id === this.eliteBusinessUnitId)
        ? this.eliteBusinessUnitId
        : mspsData[0]?.id || null;
    }

    this.organizationAgencyControl.patchValue(newOrganizationAgencyControlValue);

    this.cd.detectChanges();
    setTimeout(() => this.cd.markForCheck());
  }

  private setAgencyStatus(agency: IOrganizationAgency | undefined): void {
    const agencyIsActive = agency?.status !== AgencyStatus.Inactive && agency?.status !== AgencyStatus.Terminated;
    const userUnit = (this.store.snapshot(). user as UserStateModel).user?.businessUnitType;

    let invoiceActionsActive: boolean;

    if (agency?.status === AgencyStatus.Inactive) {
      invoiceActionsActive = userUnit === BusinessUnitType.Hallmark;
    } else if (agency?.status === AgencyStatus.Terminated) {
      invoiceActionsActive = false;
    } else {
      invoiceActionsActive = true;
    }

    this.store.dispatch(new SetAgencyActionsAllowed(agencyIsActive));
    this.store.dispatch(new SetAgencyInvoicesActionsAllowed(invoiceActionsActive));
  }

  private observeSelectorControl(): void {
    this.organizationAgencyControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this.user$),
        filter((user) => !!user),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((user) => {
        const agencyOrganizations = [BusinessUnitType.Agency, BusinessUnitType.Organization];
                
        if (agencyOrganizations.includes(user.businessUnitType)) {
          this.store.dispatch(new LastSelectedOrganisationAgency(user.businessUnitName));
          const isAgency = user.businessUnitType === BusinessUnitType.Agency;

          this.store.dispatch(
            new SaveLastSelectedOrganizationAgencyId(
              {
                lastSelectedOrganizationId: !isAgency ? user.businessUnitId : null,
                lastSelectedAgencyId: isAgency ? user.businessUnitId : null,
              },
              !isAgency
            )
          );
        }
        else if (user.businessUnitType == BusinessUnitType.MSP) {
          this.store.dispatch(new LastSelectedOrganisationAgency(user.businessUnitName));          
          this.store.dispatch(
            new SaveLastSelectedMspId(
              {
                lastSelectedMspId: user.businessUnitId ?? null,
              },
            )
          );
        }

        const selectedOrganizationAgencyId: number = this.organizationAgencyControl.value;

        const selectedOrganizationAgency = this.organizationsAgencies$
          .getValue()
          .find((i) => i.id === selectedOrganizationAgencyId);

        if (!selectedOrganizationAgency) {
          return;
        }

        const selectedType = selectedOrganizationAgency.type;

        if (selectedType === 'Organization') {
          this.selectOrganization(selectedType, selectedOrganizationAgencyId);
        }

        if (selectedType === 'Agency') {
          this.selectAgency(selectedType, selectedOrganizationAgencyId, selectedOrganizationAgency);
        }

        if (selectedType === 'MSP') {
          this.selectMSP(selectedOrganizationAgencyId);
        }

        this.store.dispatch(new GetUserMenuConfig(user.businessUnitType,false));
      });
  }

  private selectMSP(selectedId: number): void {
    this.store.dispatch(new LastSelectedOrganisationAgency('MSP'));
    this.store.dispatch(
      new SetLastSelectedMspId({
        lastSelectedMspId: selectedId,
      }));
    this.store.dispatch(
      new SaveLastSelectedMspId(
        {
          lastSelectedMspId: selectedId,
        },
      )
    );
  }

  private selectOrganization(type: 'Organization' | 'Agency', selectedId: number): void {
    this.store.dispatch(new LastSelectedOrganisationAgency(type));
    this.store.dispatch(
      new SetLastSelectedOrganizationAgencyId({
        lastSelectedAgencyId: this.store.selectSnapshot(UserState.lastSelectedAgencyId),
        lastSelectedOrganizationId: selectedId
      }));
    this.store.dispatch(
      new SaveLastSelectedOrganizationAgencyId(
        {
          lastSelectedOrganizationId: selectedId,
          lastSelectedAgencyId: this.store.selectSnapshot(UserState.lastSelectedAgencyId),
        },
        true
      )
    );
  }

  private selectAgency(type: 'Organization' | 'Agency', selectedId: number, unit: IOrganizationAgency): void {
    this.store.dispatch(new LastSelectedOrganisationAgency(type));
    this.store.dispatch(
      new SetLastSelectedOrganizationAgencyId({
        lastSelectedOrganizationId: this.store.selectSnapshot(UserState.lastSelectedOrganizationId),
          lastSelectedAgencyId: selectedId,
      }));
    this.store.dispatch(
      new SaveLastSelectedOrganizationAgencyId(
        {
          lastSelectedOrganizationId: this.store.selectSnapshot(UserState.lastSelectedOrganizationId),
          lastSelectedAgencyId: selectedId,
        },
        false
      )
    );

    this.setAgencyStatus(unit);
  }
}
