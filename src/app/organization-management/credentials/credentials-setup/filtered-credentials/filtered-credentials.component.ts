import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { delay, Observable, Subject, takeUntil } from 'rxjs';
import { debounceTime, filter, throttleTime } from 'rxjs/operators';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CredentialSetupFilterGet,
  CredentialSetupFilterDto,
  CredentialSetupPage,
} from '@shared/models/credential-setup.model';
import { Permission } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { TakeUntilDestroy } from '@core/decorators';
import {
  ClearFilteredCredentialSetup,
  GetFilteredCredentialSetupData,
  RemoveCredentialSetupByMappingId,
} from '@organization-management/store/credentials.actions';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { UserState } from '../../../../store/user.state';
import { Organization } from '@shared/models/organization.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';

@TakeUntilDestroy
@Component({
  selector: 'app-filtered-credentials',
  templateUrl: './filtered-credentials.component.html',
  styleUrls: ['./filtered-credentials.component.scss'],
})
export class FilteredCredentialsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('filterGrid') grid: GridComponent;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;

  @Select(CredentialsState.filteredCredentialSetupData)
  filteredCredentials$: Observable<CredentialSetupPage>;

  @Input() credentialSetupFilter$: Subject<CredentialSetupFilterDto>;
  @Input() userPermission: Permission;
  @Input() isIRPFlagEnabled = false;

  @Output() selectedRow: EventEmitter<CredentialSetupFilterGet> = new EventEmitter();

  public readonly userPermissions = UserPermissions;

  protected componentDestroy: () => Observable<unknown>;

  public credentialSetupFilter: CredentialSetupFilterDto = {
    pageNumber: this.currentPage,
    pageSize: this.pageSize,
  };
  private pageSubject$ = new Subject<number>();

  constructor(
    private store: Store,
    private confirmService: ConfirmService
  ) {
    super();
  }

  ngOnInit(): void {
    this.startOrganizationWatching();
    this.organizationChangedHandler();
    this.headerFilterChangedHandler();
    this.watchForPageChange();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearFilteredCredentialSetup());
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

  private dispatchNewPage(): void {
    this.store.dispatch(new GetFilteredCredentialSetupData(this.credentialSetupFilter));
  }

  public onRemoveButtonClick(data: CredentialSetupFilterGet, event: Event): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        takeUntil(this.componentDestroy())
    ).subscribe((confirm) => {
      if (confirm) {
        this.store.dispatch(new RemoveCredentialSetupByMappingId(data.mappingId, this.credentialSetupFilter));
      }
      this.removeActiveCssClass();
    });
  }

  public onRowSelected(event: any): void {
    if (event?.data?.length) {
      this.selectedRow.emit(event.data[0]);
    } else {
      this.selectedRow.emit(event?.data);
    }
  }

  public onRowDeselected(): void {
    this.selectedRow.emit(undefined);
  }

  public onGridDataBound(): void {
    if (this.grid.dataSource && (this.grid.dataSource as []).length) {
      // select first item in the grid by its index
      this.grid.selectRows([0]);
    }
  }

  public onRowsDropDownChanged(): void {
    this.credentialSetupFilter.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSubject$.next(this.credentialSetupFilter.pageNumber as number);
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject$.next(event.currentPage || event.value);
    }
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.credentialSetupFilter.pageNumber = 1;
      this.dispatchNewPage();
    });
  }

  private headerFilterChangedHandler(): void {
    this.credentialSetupFilter$.pipe(
      filter(Boolean),
      debounceTime(300),
      takeUntil(this.componentDestroy())
    ).subscribe(filter => {
      filter.pageSize = this.credentialSetupFilter.pageSize;
      filter.pageNumber = 1;
      this.credentialSetupFilter = filter;
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
