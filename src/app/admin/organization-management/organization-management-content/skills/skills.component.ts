import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FreezeService, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject } from 'rxjs';
import { GetAllSkillsCategories, GetAssignedSkillsByPage, RemoveAssignedSkill, RemoveAssignedSkillSucceeded, SaveAssignedSkill, SaveAssignedSkillSucceeded, SetDirtyState, SetImportFileDialogState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { Skill } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  providers: [SortService, FreezeService]
})
export class SkillsComponent extends AbstractGridConfigurationComponent implements OnInit {
  private pageSubject = new Subject<number>();
  public optionFields = {
    text: 'name', value: 'id'
  };
  public format = { 
    type:'date', format: 'MM/dd/yyyy'
  };

  @Select(AdminState.skills)
  skills$: Observable<any>;

  @Select(AdminState.allSkillsCategories)
  allSkillsCategories$: Observable<any>;

  public SkillFormGroup: FormGroup;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.SkillFormGroup = this.fb.group({
      id: new FormControl(0),
      skillCategoryId: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
      skillAbbr: new FormControl(''),
      skillDescription: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
      glNumber: new FormControl('', [ Validators.minLength(3) ]),
      allowOnboard: new FormControl(false),
      inactiveDate: new FormControl('')
    });
  }

  ngOnInit() {
    this.store.dispatch(new GetAllSkillsCategories());
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(SaveAssignedSkillSucceeded)).subscribe(() => {
      this.closeDialog();
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
      this.SkillFormGroup.reset();
    });
    this.actions$.pipe(ofActionSuccessful(RemoveAssignedSkillSucceeded)).subscribe(() => {
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
    });
  }

  public onImportDataClick(): void {
    this.store.dispatch(new SetImportFileDialogState(true));
    // TODO: implement data parse after BE implementation
  }

  public addSkill(): void {
    this.SkillFormGroup.controls['id'].setValue(0);
    this.skillFieldsHandler(false);
    this.store.dispatch(new ShowSideDialog(true));
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

  public editSkill(data: any): void {
    this.SkillFormGroup.setValue({
      id: data.id,
      skillAbbr: data.masterSkill.skillAbbr,
      skillCategoryId: data.skillCategory.id,
      skillDescription: data.masterSkill.skillDescription,
      glNumber: data.glNumber,
      allowOnboard: data.allowOnboard,
      inactiveDate: data.inactiveDate
    });
    this.store.dispatch(new ShowSideDialog(true));
    this.skillFieldsHandler(data.id === -1);
  }

  public deleteSkill(data: any): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new RemoveAssignedSkill(data));
      });
  }

  public closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.SkillFormGroup.reset();
  }

  public saveSkill(): void {
    if (this.SkillFormGroup.valid) {
      this.store.dispatch(new SaveAssignedSkill(new Skill(
        this.SkillFormGroup.getRawValue(), 2 // TODO: remove after org selection implementation
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.SkillFormGroup.markAllAsTouched();
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
