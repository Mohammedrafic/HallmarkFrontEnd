import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FilteredItem } from '@shared/models/filter.model';
import { SkillCategoriesPage } from '@shared/models/skill-category.model';
import { FilterService } from '@shared/services/filter.service';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, Observable, Subject, takeUntil } from 'rxjs';
import { ExportSkills, GetMasterSkillDataSources, GetMasterSkillsByPage, RemoveMasterSkill, RemoveMasterSkillSucceeded, SaveMasterSkill, SaveMasterSkillSucceeded, SetDirtyState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { MasterSkillDataSources, MasterSkillFilters, Skill, SkillsPage } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-skills-grid',
  templateUrl: './skills-grid.component.html',
  styleUrls: ['./skills-grid.component.scss'],
  providers: [SortService, FreezeService]
})
export class SkillsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  public optionFields = {
    text: 'name', value: 'id'
  };

  @Input() isActive: boolean = false;
  @Input() export$: Subject<ExportedFileType>;
  @Input() filteredItems$: Subject<number>;

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(AdminState.masterSkills)
  masterSkills$: Observable<SkillsPage>;

  @Select(AdminState.allSkillsCategories)
  allSkillsCategories$: Observable<SkillCategoriesPage>;

  @Select(AdminState.masterSkillDataSources)
  masterSkillDataSources$: Observable<MasterSkillDataSources>;

  public SkillFormGroup: FormGroup;
  public columnsToExport: ExportColumn[] = [
    { text:'Skill Category', column: 'SkillCategoryName'},
    { text:'Skill ABBR', column: 'SkillAbbr'},
    { text:'Skill Description', column: 'SkillDescription'}
  ];
  public fileName: string;
  public defaultFileName: string;
  public SkillFilterFormGroup: FormGroup;
  public filters: MasterSkillFilters = { 
    searchTerm: '',
    skillAbbreviations: [],
    skillCategoryIds: [],
    skillDescriptions: [],
   };
  public filterColumns: any;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe,
              private filterService: FilterService) {
    super();
    this.SkillFormGroup = this.fb.group({
      id: new FormControl(0),
      isDefault: new FormControl(true),
      skillCategoryId: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
      skillAbbr: new FormControl('', [ Validators.minLength(3) ]),
      skillDescription: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
    });
    this.SkillFilterFormGroup = this.fb.group({
      searchTerm: new FormControl(''),
      skillCategoryIds: new FormControl([]),
      skillAbbreviations: new FormControl([]),
      skillDescriptions: new FormControl([]),
    });
  }

  ngOnInit() {
    this.filterColumns = {
      searchTerm: { type: ControlTypes.Text, valueType: ValueType.Text },
      skillCategoryIds: { type: ControlTypes.Multiselect, valueType: ValueType.Id, dataSource: [], valueField: 'name', valueId: 'id' },
      skillAbbreviations: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      skillDescriptions: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
    }
    this.masterSkillDataSources$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((data: MasterSkillDataSources) => {
      this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
      this.filterColumns.skillAbbreviations.dataSource = data.skillAbbreviations;
      this.filterColumns.skillDescriptions.dataSource = data.skillDescriptions;
    });
    this.getMasterSkills();
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.getMasterSkills();
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveMasterSkillSucceeded)).subscribe(() => {
      this.SkillFormGroup.reset();
      this.closeDialog();
      this.getMasterSkills();
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Skills/Master Skills ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(RemoveMasterSkillSucceeded)).subscribe(() => {
      this.getMasterSkills();
    });
    this.export$.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Skills/Master Skills ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.filters.orderBy = this.orderBy;
    this.getMasterSkills();
  }

  private getMasterSkills(): void {
    this.store.dispatch([new GetMasterSkillsByPage(this.currentPage, this.pageSize, this.filters), new GetMasterSkillDataSources()]);
  }

  public onFilterClose() {
    this.SkillFilterFormGroup.setValue({
      searchTerm: this.filters.searchTerm || '',
      skillCategoryIds: this.filters.skillCategoryIds || [],
      skillAbbreviations: this.filters.skillAbbreviations || [],
      skillDescriptions: this.filters.skillDescriptions || [],
    });
    this.filteredItems = this.filterService.generateChips(this.SkillFilterFormGroup, this.filterColumns, this.datePipe);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.SkillFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.SkillFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.getMasterSkills();
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterApply(): void {
    this.filters = this.SkillFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.SkillFilterFormGroup, this.filterColumns);
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
    this.SkillFormGroup.setValue({
      id: data.id,
      isDefault: data.isDefault,
      skillAbbr: data.skillAbbr,
      skillCategoryId: data.skillCategory.id,
      skillDescription: data.skillDescription
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
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveMasterSkill(data));
        }
        this.removeActiveCssClass();
      });
  }

  public closeDialog(): void {
    if (this.SkillFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
          this.SkillFormGroup.reset();
          this.SkillFormGroup.get('id')?.setValue(0);
        });
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
        this.SkillFormGroup.reset();
        this.SkillFormGroup.get('id')?.setValue(0);
      });
      this.removeActiveCssClass();
    }
  }

  public saveSkill(): void {
    if (this.SkillFormGroup.valid) {
      this.store.dispatch(new SaveMasterSkill(new Skill(
        this.SkillFormGroup.getRawValue(),
      )));
      this.store.dispatch(new SetDirtyState(false));
      this.removeActiveCssClass();
    } else {
      this.SkillFormGroup.markAllAsTouched();
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

}
