import { RowNode } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TakeUntilDestroy } from '@core/decorators';
import { findSelectedItems } from '@core/helpers';
import { getIRPOrgItems } from '@core/helpers/org-structure.helper';
import { BreakpointObserverService } from '@core/services';
import { Select, Store } from '@ngxs/store';
import { OrientationColumnDef, OrientationHistoricalDataColumnDef } from '@organization-management/orientation/constants/orientation.constant';
import { OrientationTab, OrientationTypeDataSource } from '@organization-management/orientation/enums/orientation-type.enum';
import { clearFormControl, setDataSourceValue } from '@organization-management/orientation/helpers/orientation-dialog.helper';
import { OrientationConfiguration, OrientationConfigurationFilters, OrientationConfigurationPage } from '@organization-management/orientation/models/orientation.model';
import { OrientationService } from '@organization-management/orientation/services/orientation.service';
import { GetFilteringAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { mapperSelectedItems } from '@shared/components/tiers-dialog/helper';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { SystemType } from '@shared/enums/system-type.enum';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { FilterColumnsModel, FilteredItem } from '@shared/models/filter.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { SkillCategory } from '@shared/models/skill-category.model';
import { Skill } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, takeUntil } from 'rxjs';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-orientation-grid',
  templateUrl: './orientation-grid.component.html',
  styleUrls: ['./orientation-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class OrientationGridComponent extends AbstractPermissionGrid implements OnInit {
  @Input() public isActive: boolean;
  @Input() public isFilter: boolean;
  @Input() public gridTitle: string;
  @Input() public dataSource: OrientationConfigurationPage;
  @Input() public orientationTab: OrientationTab;
  @Input() public allowBulkSelection: boolean = true;
  @Input() public rowSelection: 'single' | 'multiple' = 'multiple';
  @Input() public bulkActionConfig: BulkActionConfig;
  @Input('disableControls') set disableControls(value: boolean) {
    this.gridActionsParams.disableControls = value;
    this.gridDefHandler();
  };
  @Input('skillCategories') set skillCategories(value: SkillCategory[] | undefined) {
    if (value) {
      setDataSourceValue(this.filterColumns, 'skillCategoryIds', value);
    }
  };
  @Input('regions') set regions(value: OrganizationRegion[] | undefined) {
    if (value) {
      this.allRegions = value;
      setDataSourceValue(this.filterColumns, 'regionIds', this.allRegions);
    }
  };
  @Output() public pageChange = new EventEmitter();
  @Output() public openDialog = new EventEmitter();
  @Output() public onEdit = new EventEmitter();
  @Output() public onDelete = new EventEmitter();
  @Output() public multiSelectionChanged: EventEmitter<RowNode[]> = new EventEmitter<RowNode[]>();
  @Output() readonly orientationRowSelected: EventEmitter<any> =
    new EventEmitter<any>();
  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');
  public readonly orientationTabEnum = OrientationTab;
  public orientationTypeDataSource = OrientationTypeDataSource;
  public fields: FieldSettingsModel = { text: 'text', value: 'id' };
  public columnDef: ColumnDefinitionModel[];
  public allRegions: OrganizationRegion[];
  public locations: OrganizationLocation[];
  public isMobile = false;
  public isTablet = false;
  public isSmallDesktop = false;
  public isDesktop = false;
  public gridDomLayout: 'normal' | 'autoHeight' | 'print' | undefined;
  public filtersForm: FormGroup = this.orientationService.generateConfigurationFilterForm();
  public filterColumns: FilterColumnsModel = this.orientationService.filterColumns;
  public filters: OrientationConfigurationFilters = {
    pageNumber: 1, pageSize: this.pageSize
  };
  public optionFields = {
    text: 'name',
    value: 'id',
  };

  public optionField = {
    text: 'text',
    value: 'id',
  };
  public gridActionsParams = {
    disableControls: false
  }

  private skills: Skill[] = [];

  protected componentDestroy: () => Observable<unknown>;

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;

  @Select(OrganizationManagementState.filteringAssignedSkillsByOrganization)
  public readonly skills$: Observable<Skill[]>;

  constructor(
    private cd: ChangeDetectorRef,
    protected override store: Store,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private breakpointService: BreakpointObserverService,
    private orientationService: OrientationService,
  ) {
    super(store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.watchForOrgChange();
    this.watchForOrientation();
    this.watchForSkills();
    this.watchForRegions();
    this.watchForLocation();
    this.watchForDepartments();
    this.watchForSkillCategory();
    this.watchForSkillSelection();
    this.getDeviceScreen();
    this.gridDefHandler();
  }

  private watchForOrgChange(): void {
    this.organizationId$
      .pipe(
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.getSkills();
        this.clearFilters();
      });
  }

  private watchForSkills(): void {
    this.skills$.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((skills: Skill[]) => {
      this.skills = skills;
      setDataSourceValue(this.filterColumns, 'skillIds', this.skills);
    });
  }

  private watchForRegions(): void {
    this.filtersForm?.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((value: number[]) => {
        const selectedRegions: OrganizationRegion[] = value?.length ? findSelectedItems(value, this.allRegions) : [];
        const selectedLocation: OrganizationLocation[] = mapperSelectedItems(selectedRegions, 'locations');
        this.locations = sortByField(selectedLocation, 'name');
        setDataSourceValue(this.filterColumns, 'locationIds', getIRPOrgItems(this.locations));
        clearFormControl(value, this.filtersForm, 'locationIds');
        this.generateFilteredChips();
        this.cd.markForCheck();
      });
  }

  private watchForOrientation(): void {
    this.filtersForm?.get('orientationIDs')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((value: number[]) => {
        setDataSourceValue(this.filterColumns, 'orientationIDs', this.orientationTypeDataSource);
        this.generateFilteredChips();
        this.cd.markForCheck();
       });
  }


  private watchForLocation(): void {
    this.filtersForm?.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((value: number[]) => {
        const selectedLocation: OrganizationLocation[] = value?.length ? findSelectedItems(value, this.locations) : [];
        const selectedDepartment: OrganizationDepartment[] = mapperSelectedItems(selectedLocation, 'departments');
        setDataSourceValue(this.filterColumns, 'departmentsIds', sortByField(getIRPOrgItems(selectedDepartment), 'name'));
        clearFormControl(value, this.filtersForm, 'departmentsIds');
        this.generateFilteredChips();
        this.cd.markForCheck();
      });
  }

  private watchForDepartments(): void {
    this.filtersForm
      ?.get('departmentsIds')
      ?.valueChanges.pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.generateFilteredChips();
        this.cd.markForCheck();
      });
  }

  private watchForSkillCategory(): void {
    this.filtersForm
      ?.get('skillCategoryIds')
      ?.valueChanges.pipe(takeUntil(this.componentDestroy()))
      .subscribe((value: number[]) => {
        const skills = value?.length
          ? value.flatMap((categoryId: number) => this.skills.filter((skill: Skill) => skill.categoryId === categoryId))
          : this.skills;
        setDataSourceValue(this.filterColumns, 'skillIds', sortByField(skills, 'name'));
        this.generateFilteredChips();
        this.cd.markForCheck();
      });
  }

  private watchForSkillSelection(): void {
    this.filtersForm
      ?.get('skillIds')
      ?.valueChanges.pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.generateFilteredChips();
        this.cd.markForCheck();
      });
  }
  public selectedRow(event: any): void {
    this.orientationRowSelected.emit(event);
  }
  private gridDefHandler(): void {
    if (this.orientationTab === OrientationTab.Setup) {
      this.columnDef = OrientationColumnDef(this.edit.bind(this), this.delete.bind(this), this.gridActionsParams);
    }
    if (this.orientationTab === OrientationTab.HistoricalData) {
      this.columnDef = OrientationHistoricalDataColumnDef(this.edit.bind(this), this.gridActionsParams);
    }
    this.cd.markForCheck();
  }

  private getSkills(): void {
    this.store.dispatch([new GetFilteringAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } })]);
  }

  private dispatchNewPage(): void {
    this.pageChange.emit(this.filters);
  }

  private getDeviceScreen(): void {
    this.breakpointService.getBreakpointMediaRanges().pipe(takeUntil(this.componentDestroy())).subscribe((screen) => {
      this.isMobile = screen.isMobile;
      this.isTablet = screen.isTablet;
      this.isSmallDesktop = screen.isDesktopSmall;
      this.isDesktop = screen.isDesktopLarge;
      this.gridDomLayout = this.isMobile ? 'autoHeight' : 'normal';
      this.cd.markForCheck();
     });
  }

  private clearFilters(): void {
    this.filtersForm.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = { pageNumber: 1, pageSize: this.filters.pageSize };
  }

  private generateFilteredChips(): void {
    this.filteredItems = this.filterService.generateChips(this.filtersForm, this.filterColumns);
  }

  public handleBulkEvent(event: BulkActionDataModel): void {
    this.onEdit.emit({
      isBulk: true,
      data: event
    });
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.filtersForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    this.filters = { pageNumber: this.filters.pageNumber, pageSize: this.filters.pageSize, ...this.filtersForm.getRawValue()} ;
    this.generateFilteredChips();
    this.dispatchNewPage();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterClose() {
    this.orientationService.refreshFilterForm(this.filtersForm, this.filters);
    this.generateFilteredChips();
  }

  public handleChangePage(pageNumber: number): void {
    if (pageNumber && this.filters.pageNumber !== pageNumber) {
      this.filters.pageNumber = pageNumber;
      this.dispatchNewPage();
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if (pageSize) {
      this.filters.pageSize = pageSize;
      this.dispatchNewPage();
    }
  }

  public addRecord(): void {
    this.openDialog.emit();
  }

  public edit(data: OrientationConfiguration): void {
    this.onEdit.emit({
      isBulk: false,
      data: data
    });
  }

  public delete(data: OrientationConfiguration): void {
    this.confirmService
    .confirm(DELETE_RECORD_TEXT, {
      title: DELETE_RECORD_TITLE,
      okButtonLabel: 'Delete',
      okButtonClass: 'delete-button',
    }).pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.onDelete.emit(data);
    });
  }
}
