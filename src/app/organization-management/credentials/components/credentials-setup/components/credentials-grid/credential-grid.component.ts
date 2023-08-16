import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { delay, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { Permission } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { TakeUntilDestroy } from '@core/decorators';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CredentialSetupFilterGet,
  CredentialSetupFilterDto,
  CredentialSetupPage,
  CredentialSetupGet,
} from '@shared/models/credential-setup.model';
import {
  ClearFilteredCredentialSetup,
  GetCredentialSetupByMappingId,
  GetFilteredCredentialSetupData,
  RemoveCredentialSetupByMappingId,
  SaveUpdateCredentialSetupMappingSucceeded,
} from '@organization-management/store/credentials.actions';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { UserState } from '../../../../../../store/user.state';
import { Organization } from '@shared/models/organization.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialsSetupService, MapCredentialsService } from '@organization-management/credentials/services';
import { ShowSideDialog } from '../../../../../../store/app.actions';
import { GetCredential, GetCredentialTypes } from '@organization-management/store/organization-management.actions';

@TakeUntilDestroy
@Component({
  selector: 'app-credentials-grid',
  templateUrl: './credential-grid.component.html',
  styleUrls: ['./credential-grid.component.scss'],
})
export class CredentialGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('filterGrid') grid: GridComponent;

  @Input() userPermission: Permission;
  @Input() isIRPFlagEnabled = false;

  @Select(CredentialsState.filteredCredentialSetupData)
  public filteredCredentials$: Observable<CredentialSetupPage>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  @Select(CredentialsState.credentialSetupList)
  private credentialSetupData$: Observable<CredentialSetupGet[]>;
  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;

  public readonly userPermissions = UserPermissions;
  public credentialSetupFilter: CredentialSetupFilterDto = {
    pageNumber: this.currentPage,
    pageSize: this.pageSize,
  };

  private pageSubject$ = new Subject<number>();

  protected componentDestroy: () => Observable<unknown>;

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private credentialsSetupService: CredentialsSetupService,
    private mapCredentialsService: MapCredentialsService,
    private actions$: Actions,
  ) {
    super();
  }

  ngOnInit(): void {
    this.startOrganizationWatching();
    this.organizationChangedHandler();
    this.watchForFilterGridChange();
    this.watchForPageChange();
    this.watchForSucceededSaveUpdateCredential();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearFilteredCredentialSetup());
  }

  public editCredentialSetup(data: CredentialSetupFilterGet): void {
    this.store.dispatch(new GetCredentialSetupByMappingId(data.mappingId)).pipe(
      switchMap(() => this.credentialSetupData$),
      take(1),
    ).subscribe((credentials: CredentialSetupGet[]) => {
      const updatedCredentials = this.credentialsSetupService.prepareSelectedCredentialMapping(
        data,
        credentials
      );
      this.mapCredentialsService.setSelectedMapping(updatedCredentials);

      this.store.dispatch([
        new GetCredential(),
        new GetCredentialTypes(),
        new ShowSideDialog(true),
      ]);
    });
  }

  public changePage(): void {
    this.credentialSetupFilter.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSubject$.next(this.credentialSetupFilter.pageNumber as number);
  }

  public nextPage(event: { currentPage?: number; value: number; }): void {
    if (event.currentPage || event.value) {
      this.pageSubject$.next(event.currentPage || event.value);
    }
  }

  public removeCredential(data: CredentialSetupFilterGet, event: Event): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
      take(1),
    ).subscribe((confirm) => {
      if (confirm) {
        this.store.dispatch(new RemoveCredentialSetupByMappingId(data.mappingId, this.credentialSetupFilter));
      }
      this.removeActiveCssClass();
    });
  }

  private watchForPageChange(): void {
    this.pageSubject$
    .pipe(
      throttleTime(1),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((page: number) => {
      this.credentialSetupFilter.pageNumber = page;
      this.dispatchNewPage();
    });
  }

  private watchForSucceededSaveUpdateCredential(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveUpdateCredentialSetupMappingSucceeded),
      filter((response) => response.isSucceed),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.dispatchNewPage();
    });
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new GetFilteredCredentialSetupData(this.credentialSetupFilter));
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.credentialSetupFilter = { pageNumber: 1, pageSize: this.pageSize };
      this.dispatchNewPage();
    });
  }

  private watchForFilterGridChange(): void {
    this.credentialsSetupService.getFiltersGridStateStream().pipe(
      filter((filters: CredentialSetupFilterDto) => !!Object.keys(filters).length),
      takeUntil(this.componentDestroy())
    ).subscribe((filters: CredentialSetupFilterDto) => {
      filters.pageSize = this.credentialSetupFilter.pageSize;
      filters.pageNumber = 1;
      this.credentialSetupFilter = filters;
      this.dispatchNewPage();
    });
  }

  private startOrganizationWatching(): void {
    this.organization$.pipe(
      delay(200),
      takeUntil(this.componentDestroy())
    ).subscribe((org: Organization) => {
      const { isIRPEnabled, isVMCEnabled } = org?.preferences || {};

      this.grid.getColumnByField('system').visible = this.isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);
      this.grid.refreshColumns();
    });
  }
}
