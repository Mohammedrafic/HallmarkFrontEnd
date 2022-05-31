import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ExportColumn } from '@shared/models/export.model';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, delay, filter, Observable, Subject } from 'rxjs';
import { GetMasterSkillsByPage, RemoveMasterSkill, RemoveMasterSkillSucceeded, SaveMasterSkill, SaveMasterSkillSucceeded, SetDirtyState } from 'src/app/admin/store/admin.actions';
import { AdminState } from 'src/app/admin/store/admin.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { Skill } from 'src/app/shared/models/skill.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-skills-grid',
  templateUrl: './skills-grid.component.html',
  styleUrls: ['./skills-grid.component.scss'],
  providers: [SortService, FreezeService]
})
export class SkillsGridComponent extends AbstractGridConfigurationComponent implements OnInit {
  private pageSubject = new Subject<number>();
  public optionFields = {
    text: 'name', value: 'id'
  };

  @Input() isActive: boolean = false;

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(AdminState.masterSkills)
  masterSkills$: Observable<any>;

  @Select(AdminState.allSkillsCategories)
  allSkillsCategories$: Observable<any>;

  public SkillFormGroup: FormGroup;
  public columnsToExport: ExportColumn[] = [
    { text:'Skill Category', column: 'skillCategory.name'},
    { text:'Skill ABBR', column: 'skillAbbr'},
    { text:'Skill Description', column: 'skillDescription'}
  ];
  public fileName: string;

  constructor(private store: Store,
              private actions$: Actions,
              private fb: FormBuilder,
              private confirmService: ConfirmService,
              private datePipe: DatePipe) {
    super();
    this.fileName = 'Master Skills ' + datePipe.transform(Date.now(),'MM/dd/yyyy');
    this.SkillFormGroup = this.fb.group({
      id: new FormControl(0),
      isDefault: new FormControl(true),
      skillCategoryId: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
      skillAbbr: new FormControl('', [ Validators.minLength(3) ]),
      skillDescription: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
    });
  }

  ngOnInit() {
    this.store.dispatch(new GetMasterSkillsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetMasterSkillsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(SaveMasterSkillSucceeded)).subscribe(() => {
      this.SkillFormGroup.reset();
      this.closeDialog();
      this.store.dispatch(new GetMasterSkillsByPage(this.currentPage, this.pageSize));
    });
    this.actions$.pipe(ofActionSuccessful(RemoveMasterSkillSucceeded)).subscribe(() => {
      this.store.dispatch(new GetMasterSkillsByPage(this.currentPage, this.pageSize));
    });
  }

  public closeExport() {
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: any): void {
    console.log(event);
    this.store.dispatch(new ShowExportDialog(false));
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
