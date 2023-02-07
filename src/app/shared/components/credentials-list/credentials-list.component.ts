import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatestWith, filter, Observable, Subject, takeUntil, tap, throttleTime } from 'rxjs';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import {
  GetCredential,
  GetCredentialForSettings,
  GetCredentialTypes,
  RemoveCredential,
  RemoveCredentialSuccess,
  SaveCredential,
  SaveCredentialSucceeded,
} from '@organization-management/store/organization-management.actions';
import { Credential,  CredentialFilterDataSources, CredentialPage } from '@shared/models/credential.model';

import { ConfirmService } from '@shared/services/confirm.service';
import { SortSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import {
  SaveAssignedCredentialValue,
  ShowExportCredentialListDialog,
} from '@organization-management/store/credentials.actions';
import { DatePipe } from '@angular/common';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { PermissionService } from 'src/app/security/services/permission.service';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import {
  ExportColumns,
  ExportIRPColumns,
  FilterColumnsIncludeIRP,
  FiltersColumns,
  OptionFields, SelectedSystems,
  SortSettings,
} from '@shared/components/credentials-list/constants';
import { CredentialFiltersService } from '@shared/components/credentials-list/services';
import { Organization } from '@shared/models/organization.model';
import { systemColumnMapper } from '@shared/components/credentials-list/helpers';
import { FormGroup } from '@angular/forms';
import { FilterColumnsModel } from '@shared/models/filter.model';
import { CredentialListState } from '@shared/components/credentials-list/store/credential-list.state';
import { CredentialList } from '@shared/components/credentials-list/store/credential-list.action';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { UserState } from '../../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AppState } from '../../../store/app.state';

@Component({
  selector: 'app-credentials-list',
  templateUrl: './credentials-list.component.html',
  styleUrls: ['./credentials-list.component.scss'],
})
export class CredentialsListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public openAssignSidebarSubject = new Subject<boolean>();
  public gridSortSettings: SortSettingsModel = SortSettings;
  public optionFields: FieldSettingsModel = OptionFields;
  public columnsToExport: ExportColumn[];
  public fileName: string;
  public defaultFileName: string;
  public selectedSystem: SelectedSystemsFlag = SelectedSystems;
  public isCredentialSettings = false;
  public filterColumns: FilterColumnsModel;
  public selectedCredential: Credential;
  public isMspUser = false;
  public isIrpFlagEnabled = false;

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @Select(OrganizationManagementState.credentialTypes)
  public credentialTypes$: Observable<CredentialType[]> ;

  @Select(OrganizationManagementState.credentials)
  private credentials$: Observable<CredentialPage>;
  @Select(CredentialListState.credentialDataSources)
  private credentialDataSources$: Observable<CredentialFilterDataSources>;
  @Select(OrganizationManagementState.organization)
  private readonly organization$: Observable<Organization>;

  constructor(protected override store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private permissionService: PermissionService,
              private credentialFiltersService: CredentialFiltersService) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.checkCurrentUser();
    this.checkIRPFlag();
    this.initFilterColumns();
    this.watchForCredentialDataSource();
    this.watchForChangePage();
    this.mapGridData();
    this.watchForAction();
    this.initExportColumns();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public changeRowDropDown(): void {
    this.grid.pageSettings.pageSize = this.pageSize = this.getActiveRowsPerPage();
    this.credentialFiltersService.updateFilters = {
      pageSize: this.pageSize,
    };
  }

  public changePage(event: { currentPage: number; value: number }): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public clearAllFilters(id: number): void {
    if(!id) {
      this.getCredentials();
    }
  }

  public applyFilters(): void {
    this.getCredentials();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public override updatePage(): void {
    this.getCredentials();
  }

  private getCredentials(): void {
    this.credentialFiltersService.updateFilters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
    };

    const credentialFilters = this.isCredentialSettings ?
      new GetCredentialForSettings(this.credentialFiltersService.filtersState) :
      new GetCredential(this.credentialFiltersService.filtersState);

    this.store.dispatch([
      credentialFilters,
      new GetCredentialTypes(),
      new CredentialList.GetCredentialsDataSources(),
      ]
    );
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    const ids = this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null;
    this.store.dispatch(new CredentialList.ExportCredentialList(new ExportPayload(
      fileType,
      { ...this.credentialFiltersService.filtersState, ids: ids },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      null,
      options?.fileName || this.defaultFileName
    ), this.isCredentialSettings));
    this.clearSelection(this.grid);
  }

  public expireDateApplicableChange(data: Credential, event: any): void {
    data.expireDateApplicable = event.checked;
    this.store.dispatch(new SaveCredential({
      id: data.id,
      name: data.name,
      credentialTypeId: data.credentialTypeId,
      expireDateApplicable: data.expireDateApplicable,
      comment: data.comment,
      includeInVMS: data.includeInVMS,
      includeInIRP: data.includeInIRP,
    }));
  }

  public editCredential(credential: Credential, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.selectedCredential = { ...credential };
    this.store.dispatch(new ShowSideDialog(true));
  }

  public removeCredential(credential: Credential, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm('Are you sure want to delete?', {
        title: 'Delete Record',
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(Boolean),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
          this.store.dispatch(
            new RemoveCredential(credential)
          );
          this.removeActiveCssClass();
      });
  }

  public showAssignSiderbar(): void {
    this.openAssignSidebarSubject.next(true);
  }

  private mapGridData(): void {
    this.credentials$.pipe(
      combineLatestWith(this.credentialTypes$),
      tap(() => this.gridDataSource = []),
      filter(([credentials, credentialTypes]) => credentials?.items?.length > 0 && credentialTypes.length > 0),
      takeUntil(this.unsubscribe$)
    ).subscribe(([credentials, credentialTypes]) => {
        this.lastAvailablePage = credentials.totalPages;
        if (credentialTypes) {
          credentials.items.map(item => {
            const credentialType = credentialTypes.find(type => type.id === item.credentialTypeId);
            item.credentialTypeName = credentialType ? credentialType.name : '';
          });
        }
        this.gridDataSource = this.getRowsPerPage(systemColumnMapper(credentials.items), this.currentPagerPage);
        this.totalDataRecords = credentials.totalCount;
    });
  }

  public gridCreated(): void {
    this.showHideGridColumns();
  }

  public clearFormDetails(form?: FormGroup): void {
    this.store.dispatch(new ShowSideDialog(false));
    form?.reset();
    form?.enable();
    this.removeActiveCssClass();
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private checkIRPFlag(): void {
    this.organization$
      .pipe(
        filter(Boolean),
        takeUntil(this.unsubscribe$)
      ).subscribe((organization: Organization) => {
      this.selectedSystem = {
        isIRP: !!organization.preferences.isIRPEnabled,
        isVMS: !!organization.preferences.isVMCEnabled,
      };

      if(this.grid) {
        this.showHideGridColumns();
      }
      const { isCredentialSettings } = this.route.snapshot.data;
      this.isCredentialSettings = isCredentialSettings;

      this.getCredentials();
    });
  }

  private showHideGridColumns(): void {
    this.grid.getColumnByField('system').visible = this.showIrpFields();
    this.grid.getColumnByField('irpComment').visible = this.showIrpFields();
    this.grid.refreshColumns();
  }

  private initFilterColumns(): void {
    this.filterColumns = FiltersColumns;
    if(this.showIrpFields() && this.isCredentialSettings) {
      this.filterColumns = {
        ...this.filterColumns,
        ...FilterColumnsIncludeIRP,
      };
    }
  }

  private watchForCredentialDataSource(): void {
    this.credentialDataSources$.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe((data: CredentialFilterDataSources) => {
      this.filterColumns['credentialIds'].dataSource = data.credentials;
      this.filterColumns['credentialTypeIds'].dataSource = data.credentialTypes;
      this.filterColumns = {...this.filterColumns};
    });
  }

  private watchForChangePage(): void {
    this.pageSubject.pipe(
      throttleTime(1),
      takeUntil(this.unsubscribe$)
      ).subscribe((page) => {
        this.currentPage = page;
        this.credentialFiltersService.updateFilters = {
          pageNumber: page,
        };
        this.getCredentials();
    });
  }

  private watchForAction(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveCredentialSucceeded),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.clearFormDetails();
      this.getCredentials();
    });

    this.actions$.pipe(
      ofActionDispatched(ShowExportDialog),
      takeUntil(this.unsubscribe$),
    ).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Credentials/Credentials List ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });

    this.actions$.pipe(
      ofActionDispatched(ShowExportCredentialListDialog),
      takeUntil(this.unsubscribe$)
    ).subscribe((event: { payload: ExportedFileType }) => {
      this.defaultFileName = 'Credentials/Credentials List ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event.payload);
    });

    this.actions$.pipe(
      ofActionSuccessful(SaveAssignedCredentialValue),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.getCredentials();
    });

    this.actions$.pipe(
      ofActionSuccessful(RemoveCredentialSuccess),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.getCredentials();
    });
  }

  private initExportColumns(): void {
    this.columnsToExport = this.showIrpFields() && this.isCredentialSettings ?
      [...ExportColumns, ...ExportIRPColumns] : ExportColumns;
  }

  private showIrpFields(): boolean {
    return this.selectedSystem.isIRP && this.selectedSystem.isVMS && this.isIrpFlagEnabled && !this.isMspUser;
  }

  private checkCurrentUser(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isMspUser = user?.businessUnitType === BusinessUnitType.MSP;
    this.isIrpFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }
}
