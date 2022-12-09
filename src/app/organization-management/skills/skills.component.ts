import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, Observable, Subject, takeUntil } from 'rxjs';

import { TakeUntilDestroy } from '@core/decorators';
import { SaveAssignedSkillValue } from '@organization-management/store/skills.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Organization } from '@shared/models/organization.model';
import { SkillCategoriesPage } from '@shared/models/skill-category.model';
import { FilterService } from '@shared/services/filter.service';
import {
  CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE,
} from 'src/app/shared/constants/messages';
import { Skill, SkillDataSource, SkillFilters, SkillsPage } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  ExportSkills, GetAllSkillsCategories, GetAssignedSkillsByPage, GetSkillDataSources,
  RemoveAssignedSkill, RemoveAssignedSkillSucceeded, SaveAssignedSkill, SaveAssignedSkillSucceeded,
  SetDirtyState } from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';
import { InactivateColFormat, SkillsFilterConfig, VmsSkillsColsExport } from './skills.constant';
import { SkillsService } from './skills.service';
import { SkillGridEventData } from './skills.interface';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-buttons';
import { OrginazationModuleSettings, PagerChangeEvent } from '@core/interface';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  providers: [SortService, MaskedDateTimeService],
})
@TakeUntilDestroy
export class SkillsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Select(OrganizationManagementState.skills)
  skills$: Observable<SkillsPage | null>;

  @Select(OrganizationManagementState.allSkillsCategories)
  allSkillsCategories$: Observable<SkillCategoriesPage | null>;

  @Select(OrganizationManagementState.skillDataSource)
  skillDataSource$: Observable<SkillDataSource>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;

  optionFields = {
    text: 'name', value: 'id',
  };

  filterOptionFields = {
    text: 'name', value: 'name',
  };

  inactivateColformat = InactivateColFormat;

  title: 'Add' | 'Edit' = 'Add';

  skillForm: FormGroup;

  skillFilterForm: FormGroup;

  columnsToExport: ExportColumn[] = VmsSkillsColsExport;

  filterColumns = SkillsFilterConfig;

  fileName: string;

  defaultFileName: string;

  filters: SkillFilters = {};
  
  openAssignSidebarSubject = new Subject<boolean>();

  orgModuleSettings: OrginazationModuleSettings = {
    isFeatureIrpEnabled: false,
    isOrgIrpEnabled: false,
    isOrgVMSEnabled: true,
  };

  private pageSubject = new Subject<number>();
  
  private componentDestroy: () => Observable<unknown>;

  constructor(
    protected override store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private skillsService: SkillsService,
    ) {
    super(store);
    this.idFieldName = 'foreignKey';

    this.skillForm = this.skillsService.createSkillsForm();
    this.skillFilterForm = this.skillsService.createFilterForm();
    this.setIrpFeatureFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getOrganizagionData();
    this.watchForOrgId();
    this.watchForPagination();
    this.watchForSaveDeleteAction();
    this.getSkillsCategories();
    this.getSkillfilterData();
  }

  /**
   * Needed for TakeUntilDestroy decorator 
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngOnDestroy(): void {}

  override updatePage(): void {
    this.filters.orderBy = this.orderBy;
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
  }

  override customExport(): void {
    this.defaultFileName = 'Organization Skills ' + formatDate(Date.now(), 'MM/dd/yyyy hh:mm a', 'en-US');
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = 'Organization Skills ' + formatDate(Date.now(), 'MM/dd/yyyy hh:mm a', 'en-US');

    this.store.dispatch(new ExportSkills(new ExportPayload(
      fileType,
      { ...this.filters, offset: Math.abs(new Date().getTimezoneOffset()) },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => {
        return { aId: val.id, mId: val.masterSkill.id };
      }) : null,
      options?.fileName || this.defaultFileName,
      Math.abs(new Date().getTimezoneOffset()),
  )));
    this.clearSelection(this.grid);
  }

  closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  closeFilter() {
    this.skillFilterForm.setValue({
      skillCategories: this.filters.skillCategories || [],
      skillAbbrs: this.filters.skillAbbrs || [],
      skillDescriptions: this.filters.skillDescriptions || [],
      glNumbers: this.filters.glNumbers || [],
      allowOnboard: this.filters.allowOnboard || null,
    });
    this.filteredItems = this.filterService.generateChips(this.skillFilterForm, this.filterColumns);
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.skillFilterForm, this.filterColumns);
  }

  filterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
  }

  applyFilter(): void {
    this.filters = this.skillFilterForm.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.skillFilterForm, this.filterColumns);
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  addSkill(): void {
    this.title = 'Add';
    this.skillForm.controls['id'].patchValue(0);
    this.skillForm.controls['isDefault'].patchValue(false);
    this.changeControlsAvaliability(false);
    this.store.dispatch(new ShowSideDialog(true));
  }

  assignSkill(): void {
    this.openAssignSidebarSubject.next(true);
  }

  allowOnBoardChange(data: SkillGridEventData, event: ChangeEventArgs): void {
    data.allowOnboard = event.checked;
    this.store.dispatch(new SaveAssignedSkill(new Skill(
      {
        id: data.id,
        isDefault: data.masterSkill?.isDefault || false,
        masterSkillId: data.masterSkill?.id as number,
        skillAbbr: data.masterSkill?.skillAbbr || '',
        skillCategoryId: data.skillCategory?.id as number,
        skillDescription: data.masterSkill?.skillDescription as string,
        glNumber: data.glNumber,
        allowOnboard: data.allowOnboard,
        inactiveDate: data.inactiveDate,
      }, true
    )));
  }

  editSkill(data: SkillGridEventData, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.title = 'Edit';

    this.skillForm.setValue({
      id: data.id,
      isDefault: data.masterSkill?.isDefault || false,
      masterSkillId: data.masterSkill?.id || null,
      skillAbbr: data.masterSkill?.skillAbbr,
      skillCategoryId: data.skillCategory?.id,
      skillDescription: data.masterSkill?.skillDescription,
      glNumber: data.glNumber,
      allowOnboard: data.allowOnboard,
      inactiveDate: data.inactiveDate,
    });
    this.store.dispatch(new ShowSideDialog(true));
    this.changeControlsAvaliability(data.masterSkill?.isDefault as boolean);
  }

  deleteSkill(data: SkillGridEventData, event: MouseEvent): void {
    this.addActiveCssClass(event);

    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveAssignedSkill(data));
        }
        this.removeActiveCssClass();
      });
  }

  closeAsignDialog(): void {
    if (this.skillForm.dirty) {
      this.confirmService
      .confirm(CANCEL_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button',
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.skillForm.reset();
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.skillForm.reset();
      this.removeActiveCssClass();
    }
  }

  saveSkill(): void {
    if (this.skillForm.valid) {
      this.store.dispatch(new SaveAssignedSkill(new Skill(
        this.skillForm.getRawValue(), true
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.skillForm.markAllAsTouched();
    }
    this.removeActiveCssClass();
  }

  changeRowsPerPage(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  changePage(event: ChangeEventArgs & { value: number }): void {
    if (event.value) {
      this.pageSubject.next(event.value);
    }
  }

  switchPage(event: PagerChangeEvent): void {
    if (event.currentPage) {
      this.pageSubject.next(event.currentPage);
    }
  }

  private getSkills(): void {
    this.store.dispatch([new GetAllSkillsCategories(), new GetSkillDataSources()]);
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
  }

  private clearFilters(): void {
    this.skillFilterForm.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {
      orderBy: this.orderBy,
    };
  }

  private changeControlsAvaliability(disable: boolean): void {
    if (disable) {
      this.skillForm.controls['skillAbbr'].disable();
      this.skillForm.controls['skillCategoryId'].disable();
      this.skillForm.controls['skillDescription'].disable();
    } else {
      this.skillForm.controls['skillAbbr'].enable();
      this.skillForm.controls['skillCategoryId'].enable();
      this.skillForm.controls['skillDescription'].enable();
    }
  }

  private watchForOrgId(): void {
    this.organizationId$
    .pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.currentPage = 1;
      this.clearFilters();
      this.getSkills();
    });
  }

  private watchForPagination(): void {
    this.pageSubject
    .pipe(
      takeUntil(this.componentDestroy()),
      debounceTime(1)
    )
    .subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
    });
  }

  private watchForSaveDeleteAction(): void {
    this.actions$
    .pipe(
      takeUntil(this.componentDestroy()),
      ofActionSuccessful(SaveAssignedSkillSucceeded)
    ).subscribe(() => {
      this.skillForm.reset();
      this.closeAsignDialog();
      this.getSkills();
    });

    this.actions$
    .pipe(
      takeUntil(this.componentDestroy()),
      ofActionSuccessful(RemoveAssignedSkillSucceeded)
    ).subscribe(() => {
      this.getSkills();
    });

    this.actions$
    .pipe(
      ofActionSuccessful(SaveAssignedSkillValue),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.getSkills();
    });
  }

  private getSkillsCategories(): void {
    this.allSkillsCategories$
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((dataSource) => {
      this.filterColumns.skillCategories.dataSource = dataSource.items;
    });
  }

  private getSkillfilterData(): void {
    this.skillDataSource$
    .pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((dataSource) => {
      this.filterColumns.skillAbbrs.dataSource = dataSource.skillABBRs.filter(item => item);
      this.filterColumns.skillDescriptions.dataSource = dataSource.skillDescriptions;
      this.filterColumns.glNumbers.dataSource = ['blank', ...dataSource.glNumbers.filter(item => item)];
    });
  }

  private getOrganizagionData(): void {
    this.organization$
    .pipe(
      filter(Boolean),
      filter(() => this.orgModuleSettings.isFeatureIrpEnabled),
      delay(100),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((organization) => {
      this.orgModuleSettings.isOrgVMSEnabled = !!organization.preferences.isVMCEnabled;
      this.orgModuleSettings.isOrgIrpEnabled = !!organization.preferences.isIRPEnabled;
    });
  }

  private setIrpFeatureFlag(): void {
    this.orgModuleSettings.isFeatureIrpEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }
}
