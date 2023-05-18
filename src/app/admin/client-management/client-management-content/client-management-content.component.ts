import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { FilterService } from '@shared/services/filter.service';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { OrganizationStatus, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import {
  Organization,
  OrganizationDataSource,
  OrganizationFilter,
  OrganizationPage,
} from 'src/app/shared/models/organization.model';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ExportOrganizations, GetOrganizationDataSources, GetOrganizationsByPage } from '../../store/admin.actions';
import { AdminState } from '../../store/admin.state';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { BreakpointObserverService } from '@core/services';

@Component({
  selector: 'app-client-management-content',
  templateUrl: './client-management-content.component.html',
  styleUrls: ['./client-management-content.component.scss'],
  providers: [SortService],
})
export class ClientManagementContentComponent
  extends AbstractPermissionGrid
  implements OnInit, AfterViewInit, OnDestroy
{
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  public columnsToExport: ExportColumn[] = [
    { text: 'Organization Name', column: 'OrganizationName' },
    { text: 'Organization Status', column: 'OrganizationStatus' },
    { text: 'City', column: 'City' },
    { text: 'Contact', column: 'Contact' },
    { text: 'Phone', column: 'Phone' },
  ];
  public fileName: string;
  public defaultFileName: string;
  public readonly organizationStatus = OrganizationStatus;

  readonly ROW_HEIGHT = 64;

  @Select(AdminState.organizations)
  organizations$: Observable<OrganizationPage>;

  @Select(AdminState.organizationDataSources)
  organizationDataSources$: Observable<OrganizationDataSource>;

  @Select(AdminState.statuses)
  statuses$: Observable<string[]>;

  @Select(UserState.currentUserPermissions)
  currentUserPermissions$: Observable<any[]>;

  @ViewChild('grid')
  public grid: GridComponent;

  public OrganizationFilterFormGroup: FormGroup;
  public filters: OrganizationFilter = {};
  public filterColumns: any;
  public isMobile = false;
  public isSmallDesktop = false;

  private permissions: CurrentUserPermission[] = [];

  constructor(
    protected override store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private fb: FormBuilder,
    private breakpointService: BreakpointObserverService
  ) {
    super(store);
    this.idFieldName = 'organizationId';
    this.fileName = 'Organizations ' + datePipe.transform(Date.now(), 'MM/dd/yyyy');
    store.dispatch(new SetHeaderState({ title: 'Organization List', iconName: 'organization', custom: true }));
    this.OrganizationFilterFormGroup = this.fb.group({
      searchTerm: new FormControl(''),
      businessUnitNames: new FormControl([]),
      statuses: new FormControl([]),
      cities: new FormControl([]),
      contacts: new FormControl([]),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getDeviceScreen();
    this.idFieldName = 'organizationId';
    this.filterColumns = {
      searchTerm: { type: ControlTypes.Text },
      businessUnitNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      statuses: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      cities: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      contacts: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
    };
    this.organizationDataSources$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((data: OrganizationDataSource) => {
        this.filterColumns.businessUnitNames.dataSource = data.businessUnitNames;
        this.filterColumns.contacts.dataSource = data.contacts;
        this.filterColumns.cities.dataSource = data.cities;
      });
    this.statuses$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((data: string[]) => {
      this.filterColumns.statuses.dataSource = data;
    });
    this.store.dispatch(new GetOrganizationDataSources());
    this.getOrganizationList();
    this.pageSubject.pipe(throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getOrganizationList();
    });

    this.subscribeOnPermissions();
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = this.ROW_HEIGHT;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.getOrganizationList();
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private getOrganizationList(): void {
    this.filters.orderBy = this.orderBy;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize, this.filters));
  }

  public onFilterClose() {
    this.OrganizationFilterFormGroup.setValue({
      searchTerm: this.filters.searchTerm || '',
      businessUnitNames: this.filters.businessUnitNames || [],
      statuses: this.filters.statuses || [],
      cities: this.filters.cities || [],
      contacts: this.filters.contacts || [],
    });
    this.filteredItems = this.filterService.generateChips(
      this.OrganizationFilterFormGroup,
      this.filterColumns,
      this.datePipe
    );
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.OrganizationFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.OrganizationFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.getOrganizationList();
  }

  public onFilterApply(): void {
    this.filters = this.OrganizationFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.OrganizationFilterFormGroup, this.filterColumns);
    this.getOrganizationList();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization List ' + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
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
    this.defaultFileName = 'Organization List ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(
      new ExportOrganizations(
        new ExportPayload(
          fileType,
          {
            ...this.getFiltersForExport(),
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val[this.idFieldName]) : null,
          },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
    this.clearSelection(this.grid);
  }

  public navigateToOrganizationForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  //TODO: create a pipe
  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public editOrganization(data: Organization): void {
    this.router.navigate(['./edit', data.organizationId], { relativeTo: this.route });
  }

  private getFiltersForExport(): OrganizationFilter & { organizationNames: string[] } {
    const { businessUnitNames, ...filtersRest } = this.filters;

    return { ...filtersRest, organizationNames: this.filters.businessUnitNames as string[] };
  }

  private subscribeOnPermissions(): void {
    this.currentUserPermissions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((permissions) => (this.permissions = permissions));
  }

  private getDeviceScreen(): void {
    this.breakpointService
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((screen) => {
        this.isMobile = screen.isMobile;
        this.isSmallDesktop = screen.isDesktopSmall;
      });
  }
}
