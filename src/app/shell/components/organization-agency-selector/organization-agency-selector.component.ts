import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import {
  GetUserAgencies,
  GetUserOrganizations,
  SaveLastSelectedOrganizationAgencyId,
  LastSelectedOrganisationAgency,
  UserOrganizationsAgenciesChanged,
} from 'src/app/store/user.actions';

import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  UserAgencyOrganization,
  UserAgencyOrganizationBusinessUnit,
} from '@shared/models/user-agency-organization.model';
import { User } from '@shared/models/user.model';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';

interface IOrganizationAgency {
  id: number;
  name: string;
  type: 'Organization' | 'Agency';
}

@Component({
  selector: 'app-organization-agency-selector',
  templateUrl: './organization-agency-selector.component.html',
  styleUrls: ['./organization-agency-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationAgencySelectorComponent implements OnInit, OnDestroy {
  public organizationAgencyControl: FormControl = new FormControl();
  public baseUrl: string;

  public optionFields = {
    text: 'name',
    value: 'id',
  };

  public organizationsAgencies$: BehaviorSubject<IOrganizationAgency[]> = new BehaviorSubject<IOrganizationAgency[]>(
    []
  );

  public organizationAgency: IOrganizationAgency;
  public isAgencyOrOrganization = true;

  @Select(AppState.isOrganizationAgencyArea)
  isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  @Select(UserState.user)
  user$: Observable<User>;

  @Select(UserState.agencies)
  agencies$: Observable<UserAgencyOrganization>;

  @Select(UserState.organizations)
  organizations$: Observable<UserAgencyOrganization>;

  private organizations: IOrganizationAgency[] = [];
  private agencies: IOrganizationAgency[] = [];

  private userOrganizations: UserAgencyOrganization;
  private userAgencies: UserAgencyOrganization;

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
    private actions$: Actions,
    @Inject(APP_SETTINGS) private appSettings: AppSettings
  ) {
    this.baseUrl = this.appSettings.host;
  }

  ngOnInit(): void {
    this.subscribeUserChange();
    this.isOrganizationAgencyAreaChange();
    this.subscribeOrganizationAgencies();

    this.organizationAgencyControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this.user$)
      )
      .subscribe((user) => {
        const agencyOrganizations = [BusinessUnitType.Agency, BusinessUnitType.Organization];
        if (!user) {
          return;
        }

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

        const selectedOrganizationAgencyId: number = this.organizationAgencyControl.value;
        const selectedOrganizationAgency = this.organizationsAgencies$
          .getValue()
          .find((i) => i.id === selectedOrganizationAgencyId);

        if (!selectedOrganizationAgency) {
          return;
        }

        const selectedType = selectedOrganizationAgency.type;

        if (selectedType === 'Organization') {
          this.store.dispatch(new LastSelectedOrganisationAgency(selectedType));
          this.store.dispatch(
            new SaveLastSelectedOrganizationAgencyId(
              {
                lastSelectedOrganizationId: selectedOrganizationAgencyId,
                lastSelectedAgencyId: this.store.selectSnapshot(UserState.lastSelectedAgencyId),
              },
              true
            )
          );
        }
        if (selectedType === 'Agency') {
          this.store.dispatch(new LastSelectedOrganisationAgency(selectedType));
          this.store.dispatch(
            new SaveLastSelectedOrganizationAgencyId(
              {
                lastSelectedOrganizationId: this.store.selectSnapshot(UserState.lastSelectedOrganizationId),
                lastSelectedAgencyId: selectedOrganizationAgencyId,
              },
              false
            )
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private subscribeUserChange(): void {
    this.actions$.pipe(ofActionDispatched(UserOrganizationsAgenciesChanged)).subscribe(() => {
      this.store.dispatch(new GetUserOrganizations());
      this.store.dispatch(new GetUserAgencies());
    });
    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      if (!user) {
        return;
      }

      const agencyOrganizations = [BusinessUnitType.Agency, BusinessUnitType.Organization];
      this.isAgencyOrOrganization = agencyOrganizations.includes(user.businessUnitType);

      this.store.dispatch(new GetUserOrganizations());
      this.store.dispatch(new GetUserAgencies());
    });
  }

  private isOrganizationAgencyAreaChange(): void {
    this.isOrganizationAgencyArea$.pipe(takeUntil(this.unsubscribe$)).subscribe((area) => {
      const isOrganizationArea = area.isOrganizationArea;
      const isAgencyArea = area.isAgencyArea;
      if (isOrganizationArea && isAgencyArea) {
        this.applyOrganizationsAgencies(isOrganizationArea, isAgencyArea);
        return;
      }
      if (isOrganizationArea || isAgencyArea) {
        const currentArea = isOrganizationArea ? 'Organization' : 'Agency';
        this.store.dispatch(new LastSelectedOrganisationAgency(currentArea)).subscribe(() => {
          this.applyOrganizationsAgencies(isOrganizationArea, isAgencyArea);
        });
      }
    });
  }

  private subscribeOrganizationAgencies(): void {
    combineLatest([this.agencies$, this.organizations$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((userAgenciesAndOrganizations) => {
        if (
          !Array.isArray(userAgenciesAndOrganizations) ||
          !userAgenciesAndOrganizations[0] ||
          !userAgenciesAndOrganizations[1]
        ) {
          return;
        }

        this.userAgencies = userAgenciesAndOrganizations[0];
        this.userOrganizations = userAgenciesAndOrganizations[1];

        const agencies = this.userAgencies.businessUnits;
        const organizations = this.userOrganizations.businessUnits;

        this.agencies = agencies.map((a: UserAgencyOrganizationBusinessUnit) => {
          const { id, name } = a;
          const agency: IOrganizationAgency = { id, name, type: 'Agency' };

          return agency;
        });

        this.organizations = organizations.map((o: UserAgencyOrganizationBusinessUnit) => {
          const { id, name } = o;
          const organization: IOrganizationAgency = { id, name, type: 'Organization' };

          return organization;
        });

        const area = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

        this.applyOrganizationsAgencies(area.isOrganizationArea, area.isAgencyArea);
      });
  }

  private applyOrganizationsAgencies(isOrganizationArea: boolean, isAgencyArea: boolean): void {
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
      this.organizationsAgencies$.next(organizationsAgencies);
    }

    const lastSelectedOrganizationId = this.store.selectSnapshot(UserState.lastSelectedOrganizationId);
    const lastSelectedAgencyId = this.store.selectSnapshot(UserState.lastSelectedAgencyId);
    const isAgency = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'Agency';

    let newOrganizationAgencyControlValue: number | null;

    if (isAgencyArea && isAgency) {
      newOrganizationAgencyControlValue = organizationsAgencies.find((i) => i.id === lastSelectedAgencyId)
        ? lastSelectedAgencyId
        : organizationsAgencies[0]?.id || null;
    } else {
      newOrganizationAgencyControlValue = organizationsAgencies.find((i) => i.id === lastSelectedOrganizationId)
        ? lastSelectedOrganizationId
        : organizationsAgencies[0]?.id || null;
    }

    this.organizationAgencyControl.patchValue(newOrganizationAgencyControlValue);

    setTimeout(() => this.cd.markForCheck());
  }
}
