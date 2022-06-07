import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, Observable, Subject, takeUntil } from 'rxjs';
import { ExportSkillCategories, GetSkillsCategoriesByPage, RemoveSkillsCategory, RemoveSkillsCategorySucceeded, SaveSkillsCategory, SaveSkillsCategorySucceeded, SetDirtyState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-skill-categories-grid',
  templateUrl: './skill-categories-grid.component.html',
  styleUrls: ['./skill-categories-grid.component.scss'],
  providers: [SortService, FreezeService]
})
export class SkillCategoriesGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  @Input() isActive: boolean = false;
  @Input() export$: Subject<ExportedFileType>;

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(AdminState.skillsCategories)
  skillsCategories$: Observable<SkillCategoriesPage>;

  public CategoryFormGroup: FormGroup;
  public columnsToExport: ExportColumn[] = [
    { text:'Category Name', column: 'Name'}
  ];
  public fileName: string;
  public defaultFileName: string;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super();
    this.CategoryFormGroup = this.fb.group({
      id: new FormControl(0),
      name: new FormControl('', [ Validators.required, Validators.minLength(3) ])
    });
  }

  ngOnInit() {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveSkillsCategorySucceeded)).subscribe(() => {
      this.CategoryFormGroup.reset();
      this.closeDialog();
      this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(RemoveSkillsCategorySucceeded)).subscribe(() => {
      this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(ShowExportDialog)).subscribe((val) => {
      if (val.isDialogShown) {
        this.defaultFileName = 'Skills/Skill Categories ' + this.generateDateTime(this.datePipe);
        this.fileName = this.defaultFileName;
      }
    });
    this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    });
    this.export$.pipe(takeUntil(this.unsubscribe$)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Skills/Skill Categories ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.store.dispatch(new ExportSkillCategories(new ExportPayload(
      fileType, 
      {  }, 
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public editCategory(data: SkillCategory, event: any): void {
    this.addActiveCssClass(event);
    this.CategoryFormGroup.setValue({
      id: data.id,
      name: data.name
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteCategory(data: SkillCategory, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
    .confirm(DELETE_RECORD_TEXT, {
       title: DELETE_RECORD_TITLE,
       okButtonLabel: 'Delete',
       okButtonClass: 'delete-button'
    })
    .subscribe((confirm) => {
      if (confirm) {
        this.store.dispatch(new RemoveSkillsCategory(data));
      }
      this.removeActiveCssClass();
    });
  }

  public closeDialog(): void {
    if (this.CategoryFormGroup.dirty) {
      this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
          this.CategoryFormGroup.reset();
          this.CategoryFormGroup.get('id')?.setValue(0);
        });
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
        this.CategoryFormGroup.reset();
        this.CategoryFormGroup.get('id')?.setValue(0);
      });
      this.removeActiveCssClass();
    }
  }

  public saveCategory(): void {
    if (this.CategoryFormGroup.valid) {
      this.store.dispatch(new SaveSkillsCategory(new SkillCategory(
        this.CategoryFormGroup.getRawValue(),
      )));
      this.store.dispatch(new SetDirtyState(false));
      this.removeActiveCssClass();
    } else {
      this.CategoryFormGroup.markAllAsTouched();
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
