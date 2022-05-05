import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FreezeService, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, Observable, Subject } from 'rxjs';
import { GetSkillsCategoriesByPage, RemoveSkillsCategory, RemoveSkillsCategorySucceeded, SaveSkillsCategory, SaveSkillsCategorySucceeded, SetDirtyState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-skill-categories-grid',
  templateUrl: './skill-categories-grid.component.html',
  styleUrls: ['./skill-categories-grid.component.scss'],
  providers: [SortService, FreezeService]
})
export class SkillCategoriesGridComponent extends AbstractGridConfigurationComponent implements OnInit {
  private pageSubject = new Subject<number>();

  @Input() isActive: boolean = false;

  @Select(AdminState.skillsCategories)
  skillsCategories$: Observable<SkillCategoriesPage>;

  public CategoryFormGroup: FormGroup;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.CategoryFormGroup = this.fb.group({
      id: new FormControl(0),
      name: new FormControl('', [ Validators.required, Validators.minLength(3) ])
    });
  }

  ngOnInit() {
    this.actions$.pipe(ofActionSuccessful(SaveSkillsCategorySucceeded)).subscribe(() => {
      this.closeDialog();
      this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
      this.CategoryFormGroup.reset();
    });
    this.actions$.pipe(ofActionSuccessful(RemoveSkillsCategorySucceeded)).subscribe(() => {
      this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    });
    this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetSkillsCategoriesByPage(this.currentPage, this.pageSize));
    });
  }

  public editCategory(data: SkillCategory): void {
    this.CategoryFormGroup.setValue({
      id: data.id,
      name: data.name
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public deleteCategory(data: SkillCategory): void {
    this.confirmService
    .confirm(DELETE_RECORD_TEXT, {
       title: DELETE_RECORD_TITLE,
       okButtonLabel: 'Delete',
       okButtonClass: 'delete-button'
    })
    .pipe(filter((confirm) => !!confirm))
    .subscribe(() => {
      this.store.dispatch(new RemoveSkillsCategory(data));
    });
  }

  public closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(delay(500)).subscribe(() => {
      this.CategoryFormGroup.reset();
      this.CategoryFormGroup.get('id')?.setValue(0);
    });;
  }

  public saveCategory(): void {
    if (this.CategoryFormGroup.valid) {
      this.store.dispatch(new SaveSkillsCategory(new SkillCategory(
        this.CategoryFormGroup.getRawValue(),
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.CategoryFormGroup.markAllAsTouched();
    }
  }
  
  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

}
