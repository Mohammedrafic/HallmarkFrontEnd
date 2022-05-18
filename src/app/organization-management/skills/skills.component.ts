import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject } from 'rxjs';
import { GetAllSkillsCategories, GetAssignedSkillsByPage, RemoveAssignedSkill, RemoveAssignedSkillSucceeded, SaveAssignedSkill, SaveAssignedSkillSucceeded, SetDirtyState, SetImportFileDialogState } from '../store/organization-management.actions';
import { OrganizationManagementState } from '../store/organization-management.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { Skill } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  providers: [SortService, FreezeService, MaskedDateTimeService]
})
export class SkillsComponent extends AbstractGridConfigurationComponent implements OnInit {
  private pageSubject = new Subject<number>();
  public optionFields = {
    text: 'name', value: 'id'
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

  public SkillFormGroup: FormGroup;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService) {
    super();
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
  }

  ngOnInit() {
    this.store.dispatch(new GetAllSkillsCategories());
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(SaveAssignedSkillSucceeded)).subscribe(() => {
      this.SkillFormGroup.reset();
      this.closeDialog();
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
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
    this.title = 'Add';
    this.SkillFormGroup.controls['id'].setValue(0);
    this.SkillFormGroup.controls['isDefault'].setValue(false);
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
    this.skillFieldsHandler(data.id === -1);
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
      .confirm(CANCEL_COFIRM_TEXT, {
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
        this.SkillFormGroup.getRawValue()
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
