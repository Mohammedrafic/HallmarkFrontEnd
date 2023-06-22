import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, Observable, Subject, takeUntil } from 'rxjs';

import { UserPermissions } from '@core/enums';
import { CustomFormGroup, Permission } from '@core/interface';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { SkillCategoriesPage } from '@shared/models/skill-category.model';
import { FilterService } from '@shared/services/filter.service';
import {
  ExportSkills, GetMasterSkillDataSources, GetMasterSkillsByPage, RemoveMasterSkill,
  RemoveMasterSkillSucceeded, SaveMasterSkill, SaveMasterSkillSucceeded,
  SetDirtyState,
} from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import {
  AbstractGridConfigurationComponent,
} from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT, DELETE_RECORD_TITLE,
} from 'src/app/shared/constants/messages';
import { MasterSkillDataSources, MasterSkillFilters, Skill, SkillsPage } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { AbbrExportColumn, MasterSkillExportCols, SkillsFilterConfig } from './skills-grid.constant';
import { MasterSkillsService } from './skills-grid.service';
import { MasterSkillsFilterForm, MasterSkillsForm } from './skills-grid.interface';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-skills-grid',
  templateUrl: './skills-grid.component.html',
  styleUrls: ['./skills-grid.component.scss'],
  providers: [SortService],
})
export class SkillsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  public optionFields = {
    text: 'name', value: 'id',
  };

  @Input() isActive = false;
  @Input() export$: Subject<ExportedFileType>;
  @Input() filteredItems$: Subject<number>;
  @Input() userPermission: Permission;

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(AdminState.masterSkills)
  masterSkills$: Observable<SkillsPage>;

  @Select(AdminState.allSkillsCategories)
  allSkillsCategories$: Observable<SkillCategoriesPage>;

  @Select(AdminState.masterSkillDataSources)
  masterSkillDataSources$: Observable<MasterSkillDataSources>;

  public skillFormGroup: CustomFormGroup<MasterSkillsForm>;
  public skillFilterFormGroup: CustomFormGroup<MasterSkillsFilterForm>;

  public columnsToExport: ExportColumn[] = MasterSkillExportCols;
  public fileName: string;
  public defaultFileName: string;
  public readonly userPermissions = UserPermissions;
  public filters: MasterSkillFilters = {
    searchTerm: '',
    skillAbbreviations: [],
    skillCategoryIds: [],
    skillDescriptions: [],
   };
  public filterColumns = SkillsFilterConfig;

  public isFeatureIrpEnabled = false;

  constructor(private store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private filterService: FilterService,
              private skillsService: MasterSkillsService) {
    super();
    this.skillFormGroup = this.skillsService.createMasterSkillsForm();
    this.skillFilterFormGroup = this.skillsService.createMasterSkillsFilterForm();
    this.setIrpFeatureFlag();
  }

  ngOnInit() {
    this.getFilterSources();
    this.getMasterSkills();
    this.watchForPaging();
    this.watchForSaveAction();
    this.watchForExportDialog();
    this.watchForDeleteSkillAction();
    this.watchForDefaultExport();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.filters.orderBy = this.orderBy;
    this.getMasterSkills();
  }

  public onFilterClose() {
    this.skillFilterFormGroup.setValue({
      searchTerm: this.filters.searchTerm || '',
      skillCategoryIds: this.filters.skillCategoryIds || [],
      skillAbbreviations: this.filters.skillAbbreviations || [],
      skillDescriptions: this.filters.skillDescriptions || [],
    });
    this.filteredItems = this.filterService.generateChips(this.skillFilterFormGroup, this.filterColumns, this.datePipe);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.skillFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.skillFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.getMasterSkills();
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterApply(): void {
    this.filters = this.skillFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.skillFilterFormGroup, this.filterColumns);
    this.getMasterSkills();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
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
    this.store.dispatch(new ExportSkills(new ExportPayload(
      fileType,
      { ...this.filters },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public editSkill(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.skillFormGroup.setValue({
      id: data.id,
      isDefault: data.isDefault,
      skillAbbr: data.skillAbbr,
      skillCategoryId: data.skillCategory.id,
      skillDescription: data.skillDescription,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteSkill(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
         title: DELETE_RECORD_TITLE,
         okButtonLabel: 'Delete',
         okButtonClass: 'delete-button'
      }).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveMasterSkill(data));
        }
        this.removeActiveCssClass();
      });
  }

  public closeDialog(): void {
    if (this.skillFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(
        filter(confirm => !!confirm),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500),takeUntil(this.unsubscribe$)).subscribe(() => {
          this.skillFormGroup.reset();
          this.skillFormGroup.get('id')?.setValue(0);
        });
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500),takeUntil(this.unsubscribe$)).subscribe(() => {
        this.skillFormGroup.reset();
        this.skillFormGroup.get('id')?.setValue(0);
      });
      this.removeActiveCssClass();
    }
  }

  public saveSkill(): void {
    if (this.skillFormGroup.valid) {
      this.store.dispatch(new SaveMasterSkill(new Skill(
        this.skillFormGroup.getRawValue(),
      )));
      this.store.dispatch(new SetDirtyState(false));
      this.removeActiveCssClass();
    } else {
      this.skillFormGroup.markAllAsTouched();
    }
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

  private getFilterSources(): void {
    this.masterSkillDataSources$
    .pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe((data: MasterSkillDataSources) => {
      this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
      this.filterColumns.skillAbbreviations.dataSource = data.skillAbbreviations;
      this.filterColumns.skillDescriptions.dataSource = data.skillDescriptions;

      if (this.isFeatureIrpEnabled) {
        this.columnsToExport = MasterSkillExportCols;
        this.grid.getColumnByField('skillAbbr').visible = !this.isFeatureIrpEnabled;
        this.grid.refreshColumns();
      } else {
        this.columnsToExport = this.columnsToExport.concat([AbbrExportColumn]);
      }
    });
  }

  private watchForPaging(): void {
    this.pageSubject
    .pipe(
      debounceTime(1),
      takeUntil(this.unsubscribe$),
    ).subscribe((page) => {
      this.currentPage = page;
      this.getMasterSkills();
    });
  }

  private watchForSaveAction(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveMasterSkillSucceeded),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.skillFormGroup.reset();
      this.closeDialog();
      this.getMasterSkills();
    });
  }

  private watchForExportDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowExportDialog),
      filter((value) => value.isDialogShown),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.defaultFileName = 'Skills/Master Skills ' + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
    });
  }

  private watchForDeleteSkillAction(): void {
    this.actions$.pipe(
      ofActionSuccessful(RemoveMasterSkillSucceeded),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.getMasterSkills();
    });
  }

  private watchForDefaultExport(): void {
    this.export$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Skills/Master Skills ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }

  private getMasterSkills(): void {
    this.store.dispatch([new GetMasterSkillsByPage(this.currentPage, this.pageSize, this.filters),
      new GetMasterSkillDataSources()]);
  }

  private setIrpFeatureFlag(): void {
    this.isFeatureIrpEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }
}
