import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';
import {
  ExportSkills,
  GetAllSkillsCategories,
  GetAssignedSkillsByPage,
  GetSkillDataSources,
  RemoveAssignedSkill,
  RemoveAssignedSkillSucceeded,
  SaveAssignedSkill,
  SaveAssignedSkillSucceeded,
  SetDirtyState
} from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { Skill, SkillDataSource, SkillFilters } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { DatePipe } from '@angular/common';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { UserState } from 'src/app/store/user.state';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilterService } from '@shared/services/filter.service';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { SaveAssignedSkillValue } from '@organization-management/store/skills.actions';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  providers: [SortService, MaskedDateTimeService]
})
export class SkillsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  public optionFields = {
    text: 'name', value: 'id'
  };
  public filterOptionFields = {
    text: 'name', value: 'name'
  };
  public format = {
    type:'date', format: 'MM/dd/yyyy'
  };
  public title = '';

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(OrganizationManagementState.skills)
  skills$: Observable<any>;

  @Select(OrganizationManagementState.allSkillsCategories)
  allSkillsCategories$: Observable<any>;

  @Select(OrganizationManagementState.skillDataSource)
  skillDataSource$: Observable<SkillDataSource>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public SkillFormGroup: FormGroup;
  public SkillFilterFormGroup: FormGroup;
  public columnsToExport: ExportColumn[] = [
    { text:'Skill Category', column: 'SkillCategory_Name'},
    { text:'Skill ABBR', column: 'SkillAbbr'},
    { text:'Skill Description', column: 'SkillDescription'},
    { text:'GL Number', column: 'GLNumber'},
    { text:'Allow Onboard', column: 'AllowOnboard'},
    { text:'Inactivate Date', column: 'InactiveDate'}
  ];
  public filterColumns: any;
  public fileName: string;
  public defaultFileName: string;
  public filters: SkillFilters = {};
  public openAssignSidebarSubject = new Subject<boolean>();


  constructor(protected override store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private filterService: FilterService,
              private datePipe: DatePipe) {
    super(store);
    this.idFieldName = 'foreignKey';
    this.SkillFormGroup = this.fb.group({
      id: new FormControl(0),
      isDefault: new FormControl(false),
      masterSkillId: new FormControl(null),
      skillCategoryId: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
      skillAbbr: new FormControl('', [ Validators.minLength(3) ]),
      skillDescription: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
      glNumber: new FormControl('', [ Validators.minLength(3) ]),
      allowOnboard: new FormControl(false),
      inactiveDate: new FormControl('')
    });
    this.SkillFilterFormGroup = this.fb.group({
      skillCategories: new FormControl([]),
      skillAbbrs: new FormControl([]),
      skillDescriptions: new FormControl([]),
      glNumbers: new FormControl([]),
      allowOnboard: new FormControl(null),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.filterColumns = {
      skillCategories: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [], valueField: 'name' },
      skillAbbrs: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      skillDescriptions: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      glNumbers: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      allowOnboard: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'Allow Onboard'},
    }
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.currentPage = 1;
      this.clearFilters();
      this.getSkills();
    });
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveAssignedSkillSucceeded)).subscribe(() => {
      this.SkillFormGroup.reset();
      this.closeDialog();
      this.getSkills();
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(RemoveAssignedSkillSucceeded)).subscribe(() => {
      this.getSkills();
    });
    this.allSkillsCategories$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe((dataSource) => {
      this.filterColumns.skillCategories.dataSource = dataSource.items;
    });
    this.skillDataSource$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe((dataSource) => {
      this.filterColumns.skillAbbrs.dataSource = dataSource.skillABBRs.filter(item => item);
      this.filterColumns.skillDescriptions.dataSource = dataSource.skillDescriptions;
      this.filterColumns.glNumbers.dataSource = ['blank', ...dataSource.glNumbers.filter(item => item)];
    });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveAssignedSkillValue)).subscribe(() => {
      this.getSkills();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getSkills(): void {
    this.store.dispatch([new GetAllSkillsCategories(), new GetSkillDataSources()]);
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
  }

  public override updatePage(): void {
    this.filters.orderBy = this.orderBy;
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization Skills ' + this.generateDateTime(this.datePipe);
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
    this.defaultFileName = 'Organization Skills ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportSkills(new ExportPayload(
      fileType,
      { ...this.filters, offset: Math.abs(new Date().getTimezoneOffset()) },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => {
        return { aId: val.id, mId: val.masterSkill.id }
      }) : null,
      options?.fileName || this.defaultFileName,
      Math.abs(new Date().getTimezoneOffset()),
  )));
    this.clearSelection(this.grid);
  }

  public onFilterClose() {
    this.SkillFilterFormGroup.setValue({
      skillCategories: this.filters.skillCategories || [],
      skillAbbrs: this.filters.skillAbbrs || [],
      skillDescriptions: this.filters.skillDescriptions || [],
      glNumbers: this.filters.glNumbers || [],
      allowOnboard: this.filters.allowOnboard || null,
    });
    this.filteredItems = this.filterService.generateChips(this.SkillFilterFormGroup, this.filterColumns);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.SkillFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.SkillFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {
      orderBy: this.orderBy
    };
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
  }

  public onFilterApply(): void {
    this.filters = this.SkillFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.SkillFilterFormGroup, this.filterColumns);
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, this.filters));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public addSkill(): void {
    this.title = 'Add';
    this.SkillFormGroup.controls['id'].setValue(0);
    this.SkillFormGroup.controls['isDefault'].setValue(false);
    this.skillFieldsHandler(false);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public assignSkill(): void {
    this.openAssignSidebarSubject.next(true)
  }

  public allowOnBoardChange(data: Skill, event: any): void {
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
        inactiveDate: data.inactiveDate
      }, true
    )));
  }

  private skillFieldsHandler(disable: boolean): void {
    if (disable) {
      this.SkillFormGroup.controls['skillAbbr'].disable();
      this.SkillFormGroup.controls['skillCategoryId'].disable();
      this.SkillFormGroup.controls['skillDescription'].disable();
    } else {
      this.SkillFormGroup.controls['skillAbbr'].enable();
      this.SkillFormGroup.controls['skillCategoryId'].enable();
      this.SkillFormGroup.controls['skillDescription'].enable();
    }
  }

  public editSkill(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.title = 'Edit';
    this.SkillFormGroup.setValue({
      id: data.id,
      isDefault: data.masterSkill?.isDefault || false,
      masterSkillId: data.masterSkill?.id || null,
      skillAbbr: data.masterSkill.skillAbbr,
      skillCategoryId: data.skillCategory.id,
      skillDescription: data.masterSkill.skillDescription,
      glNumber: data.glNumber,
      allowOnboard: data.allowOnboard,
      inactiveDate: data.inactiveDate
    });
    this.store.dispatch(new ShowSideDialog(true));
    this.skillFieldsHandler(data.masterSkill?.isDefault);
  }

  public deleteSkill(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveAssignedSkill(data));
        }
        this.removeActiveCssClass();
      });
  }

  public closeDialog(): void {
    if (this.SkillFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.SkillFormGroup.reset();
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.SkillFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  public saveSkill(): void {
    if (this.SkillFormGroup.valid) {
      this.store.dispatch(new SaveAssignedSkill(new Skill(
        this.SkillFormGroup.getRawValue(), true
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.SkillFormGroup.markAllAsTouched();
    }
    this.removeActiveCssClass();
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
}
