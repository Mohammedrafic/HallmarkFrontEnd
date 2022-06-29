import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GetFilteredCredentialSetupData, RemoveCredentialSetupByMappingId } from '@organization-management/store/credentials.actions';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../../../store/user.state';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CredentialSetupFilterGet, CredentialSetupFilterDto } from '@shared/models/credential-setup.model';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-filtered-credentials',
  templateUrl: './filtered-credentials.component.html',
  styleUrls: ['./filtered-credentials.component.scss']
})
export class FilteredCredentialsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('filterGrid') grid: GridComponent;

  @Input() credentialSetupFilter$: Subject<CredentialSetupFilterDto>;

  @Output() selectedRow: EventEmitter<CredentialSetupFilterGet> = new EventEmitter();

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(CredentialsState.filteredCredentialSetupData)
  filteredCredentials$: Observable<CredentialSetupFilterGet[]>;

  private credentialSetupFilter: CredentialSetupFilterDto;
  private MAX_PAGE_SIZE = 9999;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.initializeDefaultFilterState();
    this.organizationChangedHandler();
    this.headerFilterChangedHandler();
    this.mapGridData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onRemoveButtonClick(data: CredentialSetupFilterGet, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveCredentialSetupByMappingId(data.mappingId, this.credentialSetupFilter));
        }
        this.removeActiveCssClass();
      });
  }

  public mapGridData(): void {
    this.filteredCredentials$.subscribe(data => {
      if (data) {
        this.currentPagerPage = 1;
        this.lastAvailablePage = this.getLastPage(data);
        this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
        this.totalDataRecords = data.length;
      }
    });
  }

  public onRowSelected(event: any): void {
    if (event?.data?.length) {
      this.selectedRow.emit(event.data[0]);
    } else {
      this.selectedRow.emit(event?.data);
    }
  }

  public onRowDeselected(event: any): void {
    this.selectedRow.emit(undefined);
  }

  public onGridDataBound(): void {
    if ((this.grid.dataSource as []).length) {
      // select first item in the grid by its index
      this.grid.selectRows([0]);
    }
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.filteredCredentials$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  private initializeDefaultFilterState(): void {
    this.credentialSetupFilter = {
      pageNumber: this.currentPagerPage,
      pageSize: this.MAX_PAGE_SIZE
    };
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.currentPagerPage = 1;
      this.store.dispatch(new GetFilteredCredentialSetupData(this.credentialSetupFilter));
    });
  }

  private headerFilterChangedHandler(): void {
    this.credentialSetupFilter$.subscribe(filter => {
      if (filter) {
        filter.pageNumber = this.currentPagerPage;
        filter.pageSize = this.MAX_PAGE_SIZE;
        this.currentPagerPage = 1;
        this.credentialSetupFilter = filter;
        this.store.dispatch(new GetFilteredCredentialSetupData(filter));
      }
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
}
