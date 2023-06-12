import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { filter, Observable, Subject, takeUntil, throttleTime } from 'rxjs';

import { MessageTypes } from '@shared/enums/message-types';
import { Region, regionFilter, regionsPage } from '@shared/models/region.model';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import {
  ClearLocationList, DeleteRegionById, ExportRegions, GetMasterRegions, GetOrganizationById,
  GetRegions, GetRegionsPage, SaveRegion, SetGeneralStatesByCountry, UpdateRegion,
} from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';

import { DatePipe } from '@angular/common';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_SAVED,
} from '@shared/constants';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Organization, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { FilterService } from '@shared/services/filter.service';
import { UserState } from '../../store/user.state';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';

export const MESSAGE_REGIONS_NOT_SELECTED = 'Region was not selected';


@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.scss'],
})
export class RegionsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;
  @ViewChild('addRegionDialog') addRegionDialog: DialogComponent;

  @Select(OrganizationManagementState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(OrganizationManagementState.phoneTypes)
  phoneTypes$: Observable<FieldSettingsModel[]>;

  defaultValue: any;

  @Select(OrganizationManagementState.regionsPage)
  regionsPageList$: Observable<regionsPage>;

  @Select(OrganizationManagementState.regions)
  allRegions$: Observable<Region[]>;

  @Select(OrganizationManagementState.GetMasterRegions)
  masterRegions$: Observable<Region[]>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  public regionFormGroup: FormGroup;
  public regionFilterFormGroup:FormGroup;
  formBuilder: FormBuilder;

  @Select(OrganizationManagementState.organization)
  organization$: Observable<Organization>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.regionFilterOptions)
  regionFilterOptions$: Observable<regionFilter>;

  public regions: OrganizationRegion[] = [];
  isEdit: boolean;
  editedRegionId?: number;
  public masterRegion: Region[] = [];
  defaultMasterRegionValue: any;

  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

  selectedRegion: any;
  submited = false;
  public customAttributes: object;
  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  public columnsToExport: ExportColumn[] = [
    { text:'Region', column: 'Name'},
  ];
  public fileName: string;
  public defaultFileName: string;
  private businessUnitId: number;

  public filters: regionFilter = {
    pageNumber: this.currentPage,
    pageSize: this.pageSizePager,
  };
  public filterColumns: any;
  public optionFields = {
    text: 'name', value: 'id',
  };

  public importDialogEvent: Subject<boolean> = new Subject<boolean>();
  public orgStructure: OrganizationStructure;
  constructor(
    protected override store: Store,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(store);
    this.formBuilder = builder;
    this.createLocationForm();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getRegions();

    });
    this.getMasterRegionData();
    this.filterColumns = {
      names: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
    };
    this.regionFilterOptions$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(options => {
      this.filterColumns.id.dataSource = options.ids;
      this.filterColumns.name.dataSource = options.name;

    });
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.businessUnitId = id;
      this.getOrganization();
      this.clearFilters();
    });
    this.organization$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe(organization => {
      this.store.dispatch(new SetGeneralStatesByCountry(organization?.generalInformation?.country));
      this.store.dispatch(new GetRegionsPage(this.filters));
    });

    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.regions = structure.regions;
      });
    this.customAttributes = {class: 'grideditcolumn'};
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new ClearLocationList());
  }

  private getOrganization() {
    if (this.businessUnitId) {
      this.store.dispatch(new GetOrganizationById(this.businessUnitId));
    } else {
      this.store.dispatch(new GetOrganizationById(this.store.selectSnapshot(UserState.user)?.businessUnitId as number));
    }
  }

  public getMasterRegionData() {
    this.store.dispatch(new GetMasterRegions());
    this.store.dispatch(new GetRegions());
    this.masterRegions$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.masterRegion = data;
      this.allRegions$.pipe(takeUntil(this.unsubscribe$))
        .subscribe((regionsData) => {
          let filterMasterData: Region[] = [];
          if (regionsData && regionsData.length > 0) {
            const regionNameData = regionsData.map(x => x.name);
            const masterData = data;
            filterMasterData = masterData.filter((item) => {
              return !regionNameData.includes(item.name);
            });
            this.masterRegion = filterMasterData;
          }
          this.changeDetectorRef.detectChanges();
        });
    });
  }

  public override updatePage(): void {
    this.getRegions();
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization Regions ' + this.generateDateTime(this.datePipe);
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
    this.defaultFileName = 'Organization Regions ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportRegions(new ExportPayload(
      fileType,
      { ...this.filters },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val.id) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterClose() {
    this.regionFilterFormGroup.setValue({
      ids: this.filters?.ids || [],
    });
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.regionFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.regionFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {
      pageNumber: this.currentPage,
      pageSize: this.pageSizePager,
    };
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.getRegions();
  }

  public onFilterApply(): void {
    this.filters = this.regionFilterFormGroup.getRawValue();


    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSizePager;

    this.getRegions();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  private getRegions() {
    this.filters.orderBy = this.orderBy;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.filters.getAll = false;
    this.store.dispatch([new GetRegionsPage(this.filters)]);
  }

  onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion?.id) {
      this.onFilterClearAll();
    } else {
      this.store.dispatch(new ClearLocationList());
    }
  }

  onAddRegionClick(): void {
    this.regionFormGroup.controls["region"].setValue([]);
    this.store.dispatch(new ShowSideDialog(true));
  }

  hideDialog(): void {
    this.addRegionDialog.hide();
  }

  onImportDataClick(): void {
    this.importDialogEvent.next(true);
  }

  onAddDepartmentClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  onEditButtonClick(region: Region, event: any): void {
    this.addActiveCssClass(event);
    this.regionFormGroup.controls["region"].setValue([this.masterRegion.filter(i => i.name == region?.name)[0]?.id])
    this.editedRegionId = region?.id;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveButtonClick(region: Region, event: any): void {
    this.addActiveCssClass(event);

    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm && region.id ) {
          this.store.dispatch(new DeleteRegionById(region.id)).subscribe(() => {
            this.getRegions();
            this.getMasterRegionData();
          });
          this.regionFormGroup.reset();
        }
        this.removeActiveCssClass();
      });
  }

  onFormCancelClick(): void {
    if (this.regionFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.isEdit = false;
          this.editedRegionId = undefined;
          this.regionFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedRegionId = undefined;
      this.regionFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  onFormSaveClick(): void {
    this.submited = true;
    this.regionFormGroup.markAllAsTouched()
    if (this.regionFormGroup.invalid) {
      return;
    }
    const selectedRegions = this.regionFormGroup.controls['region'].value;
    if (selectedRegions.length > 0) {
      selectedRegions.forEach((regionId: number, index: number) => {
        const Region: Region = {
          id: this.editedRegionId,
          name: this.masterRegion.filter(i=>i.id== regionId)[0].name
        };
        this.saveOrUpdateRegion(Region, index, selectedRegions.length);
      });
      this.store.dispatch(new ShowSideDialog(false));
      this.regionFormGroup.reset();
      this.removeActiveCssClass();
    }
  }


  private saveOrUpdateRegion(Region: Region, selectedIndex: number, selectedRegionsLength: number): void {
    if (this.isEdit) {
      this.store.dispatch(new UpdateRegion(Region));
      this.isEdit = false;
      this.editedRegionId = undefined;
      return;
    }
    this.store.dispatch(new SaveRegion(Region)).subscribe((res) => {
      if (selectedIndex == (selectedRegionsLength - 1)) {
        this.store.dispatch(new GetRegionsPage(this.filters));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
      }
    });
  }

  private createLocationForm(): void {
    this.regionFormGroup = this.formBuilder.group({
      id: [''],
      region: ['', [Validators.required]],

    });

    this.regionFilterFormGroup = this.formBuilder.group({
      ids:[[]],
    });
  }
}
