import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-buttons';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, map, Observable, Subject, take, takeUntil } from 'rxjs';

import { TakeUntilDestroy } from '@core/decorators';
import { FieldType } from '@core/enums';
import { CustomFormGroup, OrginazationModuleSettings, PagerChangeEvent } from '@core/interface';
import { SaveAssignedSkillValue } from '@organization-management/store/skills.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { Organization } from '@shared/models/organization.model';
import { SkillCategoriesPage } from '@shared/models/skill-category.model';
import { FilterService } from '@shared/services/filter.service';
import {
  CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE,Bulk_Update_Skills,Bulk_Delete_Skills
} from 'src/app/shared/constants/messages';
import { Skill, SkillDataSource, SkillFilters, SkillsPage,BulkSkillsAction } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast,ShowBulkSkillActionDialog } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import {
  ExportSkills, GetAllSkillsCategories, GetAssignedSkillsByPage, GetSkillDataSources,
  RemoveAssignedSkill, RemoveAssignedSkillSucceeded, SaveAssignedSkill, BulkUpdateAssignedSkill,
  SaveAssignedSkillSucceeded,
  BulkUpdateAssignedSkillSucceeded,
  BulkUpdateAssignedSkillFailed,
  BulkDleteAssignedSkillSucceeded,
  BulkUDeleteassignedSkillFailed,
  SetDirtyState,
  BulkDeleteAssignedSkill,
} from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';
import { InactivateColFormat, IrpSkillsColsExport, IrpSkillsDialogConfig,
  SkillsFilterConfig, VmsSkillsColsExport, VmsSkillsDialogConfig } from './skills.constant';
import { SkillCheckBoxGroup, SkillGridEventData, SkillsForm, SkillsFormConfig, SkillSources } from './skills.interface';
import { SkillsService } from './skills.service';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { MessageTypes } from '@shared/enums/message-types';
import { BulkActionConfig } from '@shared/models/bulk-action-data.model';

enum BulkSkillsActionConfig {
  'Ediit',
  'Delete'
}
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

  filterOptionFields = {
    text: 'name', value: 'name',
  };

  inactivateColformat = InactivateColFormat;

  title: 'Add' | 'Edit' = 'Add';

  skillForm: CustomFormGroup<SkillsForm>;

  skillFilterForm: FormGroup;

  columnsToExport: ExportColumn[] = VmsSkillsColsExport;

  filterColumns = SkillsFilterConfig;

  fileName: string;

  defaultFileName: string;

  filters: SkillFilters = {};

  openAssignSidebarSubject = new Subject<boolean>();

  skillDialogConfig = VmsSkillsDialogConfig;

  orgModuleSettings: OrginazationModuleSettings = {
    isFeatureIrpEnabled: false,
    isIrpDisplayed: false,
  };

  formSourcesMap: SkillSources = {
    skillCategory: [],
  };

  readonly fieldTypes = FieldType;

  readonly dropDownfields = {
    text: 'text', value: 'value',
  };
  public bulkaction: BulkSkillsActionConfig = 0;
  
  private pageSubject = new Subject<number>();

  private componentDestroy: () => Observable<unknown>;
  public isbulkedit=false;
  public isbulkdelete=false;
  public bulkactionmessage:string;
  public bulkactionnotvalidskillnmaes:string[];
  public sidedialogheader='Edit Skill'
  

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
    this.watchForOrgId();
    this.watchForPagination();
    this.getSkillCategories();
    this.watchForSaveDeleteAction();
    this.getSkillsCategories();
    this.getSkillfilterData();
    this.getOrganizagionData();
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
    this.defaultFileName = 'Organization Skills ' + formatDate(Date.now(), 'MM/dd/yyyy HH:mm', 'en-US');
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = 'Organization Skills ' + formatDate(Date.now(), 'MM/dd/yyyy HH:mm', 'en-US');

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
      includeInIRP: this.filters.includeInIRP || null,
      includeInVMS: this.filters.includeInVMS || null,
      skillCode: this.filters.skillCode || null,
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
    this.filters = this.skillsService.adaptFilters(this.filters, this.skillFilterForm);
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
    this.sidedialogheader='Edit Skill';
    this.skillForm.patchValue({
      id: data.id,
      isDefault: data.masterSkill?.isDefault || false,
      masterSkillId: data.masterSkill?.id || null,
      skillCategoryId: data.skillCategory?.id,
      skillDescription: data.masterSkill?.skillDescription,
      glNumber: data.glNumber,
      allowOnboard: data.allowOnboard,
      inactiveDate: data.inactiveDate,
      includeInIRP: data.includeInIRP,
      includeInVMS: data.includeInVMS,
      skillAbbr: data.masterSkill?.skillAbbr,
      skillCode:data.skillCode
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
      }).pipe(
        take(1)
      ).subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveAssignedSkill(data));
        }
        this.removeActiveCssClass();
      });
  }
  OnBulkEdit(){
    this.isbulkedit=true;
    this.bulkaction=0;
    this.sidedialogheader='Edit Skills'
    this.store.dispatch(new ShowSideDialog(true));
  }
  OnBulkDelete(){
    this.isbulkdelete=true;
    this.bulkaction=1;
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
        take(1)
      ).subscribe((confirm) => {
        if (confirm) {
          let selectedskillstodelete = this.selectedItems.map((val) => (val.masterSkill?.id ?? 0));
          this.store.dispatch(new BulkDeleteAssignedSkill(selectedskillstodelete));
        }
        else{
          this.clearSelection(this.grid);
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
      }).pipe(
        filter(confirm => !!confirm),
        take(1)
      ).subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.skillForm.reset();
        this.removeActiveCssClass();
        this.isbulkedit=false;
        this.clearSelection(this.grid);
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isbulkedit=false;
      this.clearSelection(this.grid);
      this.skillForm.reset();
      this.removeActiveCssClass();
    }
  }

  saveSkill(): void {
    const atLeastOneSystemSelected = this.skillForm.get('includeInIRP')?.value
    || this.skillForm.get('includeInVMS')?.value;

    if (this.orgModuleSettings.isFeatureIrpEnabled && !atLeastOneSystemSelected && !this.isbulkedit) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, 'Please select system for Skill'));
      return;
    }
      if(this.isbulkedit){
       if(this.orgModuleSettings.isFeatureIrpEnabled
        && this.orgModuleSettings.isIrpDisplayed && !atLeastOneSystemSelected) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'Please select system for Skill'));
          return;
        }
        let selectedassignedskills:Skill[]=this.selectedItems.map(val => ({id: val.id,MasterSkillId: val.masterSkill?.id,
          skillCategoryId:val.masterSkill?.skillCategoryId,
          skillAbbr:val.masterSkill?.skillAbbr,
          SkillCode:this.skillForm.get('skillCode')?.value,
          skillDescription:val.masterSkill?.skillDescription ?? '',
          IsDefault:val.masterSkill?.isDefault,
          GLNumber:this.skillForm.get('glNumber')?.value,
          InactiveDate:this.skillForm.get('inactiveDate')?.value == '' ?  null :this.skillForm.get('inactiveDate')?.value,
          AllowOnboard:this.skillForm.get('allowOnboard')?.value ?? false,
          IncludeInIRP:this.skillForm.get('includeInIRP')?.value ?? false,
          IncludeInVMS:this.skillForm.get('includeInVMS')?.value ?? false}));

         this.store.dispatch(new BulkUpdateAssignedSkill(selectedassignedskills));
      }
      else
      {
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
}

  changeRowsPerPage(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  changePage(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  trackByField(index: number, item: SkillsFormConfig | SkillCheckBoxGroup): string {
    return item.field;
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
    ).subscribe((payload) => {
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

    this.actions$
    .pipe(
      ofActionSuccessful(BulkUpdateAssignedSkillSucceeded),
      takeUntil(this.componentDestroy())
    ).subscribe((payload) => {
      this.skillForm.reset();
      this.closeAsignDialog();
      this.clearSelection(this.grid);
      this.getSkills();
      let skillnames=payload.payload.skillNames;
      if(skillnames && skillnames.length > 0){
        this.bulkaction=0;
        this.bulkactionnotvalidskillnmaes=skillnames;
        this.bulkactionmessage = payload.payload.message;
        this.store.dispatch(new ShowBulkSkillActionDialog(true,this.bulkactionmessage));
      }
      else{
        this.store.dispatch(new ShowToast(MessageTypes.Success, Bulk_Update_Skills));
      }
      
    });
    this.actions$
    .pipe(
      ofActionSuccessful(BulkUpdateAssignedSkillFailed),
      takeUntil(this.componentDestroy())
    ).subscribe((payload) => {
        this.bulkactionmessage = payload.payload.message;
        this.bulkactionnotvalidskillnmaes=[];
        this.bulkaction=0;
        this.skillForm.reset();
        this.closeAsignDialog();
        this.clearSelection(this.grid);
        this.store.dispatch(new ShowBulkSkillActionDialog(true,this.bulkactionmessage));
        
    });
    this.actions$
    .pipe(
      takeUntil(this.componentDestroy()),
      ofActionSuccessful(BulkDleteAssignedSkillSucceeded)
    ).subscribe((payload) => {
      this.clearSelection(this.grid);
      this.isbulkdelete=false;
      this.bulkaction=1;
      this.getSkills();
      let skillnames=payload.payload.skillNames;
      if(skillnames && skillnames.length > 0){
        this.bulkactionnotvalidskillnmaes=skillnames;
        this.bulkactionmessage = payload.payload.message;
        this.store.dispatch(new ShowBulkSkillActionDialog(true,this.bulkactionmessage));
      }
      else{
        this.store.dispatch(new ShowToast(MessageTypes.Success, Bulk_Delete_Skills));
      }
    });
    this.actions$
    .pipe(
      ofActionSuccessful(BulkUDeleteassignedSkillFailed),
      takeUntil(this.componentDestroy())
    ).subscribe((payload) => {
      this.clearSelection(this.grid);
      this.isbulkdelete=false;
      this.getSkills();
      this.bulkactionmessage = payload.payload.message;
      this.bulkactionnotvalidskillnmaes=[];
      this.store.dispatch(new ShowBulkSkillActionDialog(true,this.bulkactionmessage));
        
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
      this.filterColumns.skillDescriptions.dataSource = dataSource.skillDescriptions;
      this.filterColumns.glNumbers.dataSource = ['blank', ...dataSource.glNumbers.filter(item => item)];
    });
  }

  private getOrganizagionData(): void {
    this.organization$
    .pipe(
      filter(Boolean),
      delay(100),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((organization) => {
      const isMspUser = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.MSP;
      this.orgModuleSettings.isIrpDisplayed = !!organization.preferences.isVMCEnabled
      && !!organization.preferences.isIRPEnabled && !isMspUser;

      if (this.orgModuleSettings.isIrpDisplayed && this.orgModuleSettings.isFeatureIrpEnabled) {
        this.skillDialogConfig = IrpSkillsDialogConfig;
        this.columnsToExport = IrpSkillsColsExport;
      } else {
        this.skillDialogConfig = VmsSkillsDialogConfig;
        this.columnsToExport = VmsSkillsColsExport;
      }

      this.grid.getColumnByField('system').visible = this.orgModuleSettings.isFeatureIrpEnabled
      && this.orgModuleSettings.isIrpDisplayed;
      this.grid.refreshColumns();
    });
  }

  private setIrpFeatureFlag(): void {
    this.orgModuleSettings.isFeatureIrpEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }

  private getSkillCategories(): void {
    this.allSkillsCategories$
    .pipe(
      filter(Boolean),
      map((categoriesPage) => categoriesPage.items.map((item) => ({
        text: item.name,
        value: item.id,
      }))),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((categories) => {
      this.formSourcesMap.skillCategory = categories;
    });
  }

}
