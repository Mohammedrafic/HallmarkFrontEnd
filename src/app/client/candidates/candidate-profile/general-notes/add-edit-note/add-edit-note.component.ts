import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Observable, skip, takeUntil } from 'rxjs';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../../store/app.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { EditGeneralNoteModel, GeneralNotesModel } from '../general-notes.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DateTimeHelper } from '@core/helpers';
import { UserState } from 'src/app/store/user.state';
import { ActivatedRoute } from '@angular/router';
import { CandidatesService } from '@client/candidates/services/candidates.service';

@Component({
  selector: 'app-add-edit-note',
  templateUrl: './add-edit-note.component.html',
  styleUrls: ['./add-edit-note.component.scss'],
})
export class AddEditNoteComponent extends DestroyableDirective implements OnInit {
  public noteForm: FormGroup;
  public categories$: Observable<CategoryModel[]>;

  public readonly categoryFields: FieldSettingsModel = { text: 'categoryName', value: 'id' };

  constructor(
    private formBuilder: FormBuilder,
    private generalNotesService: GeneralNotesService,
    private store: Store,
    private route: ActivatedRoute,
    private candidatesService: CandidatesService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.listenEditMode();
    this.createForm();
  }

  public initNoteForm(note?: GeneralNotesModel): void {
    this.categories$ = this.generalNotesService.getCategories();
    this.createForm(note);
  }

  public saveNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
    } else {
      const user= this.store.selectSnapshot(UserState.user);
      if(!this.route.snapshot.paramMap.get('id')||this.candidatesService.employeeId||0){
        this.noteForm.get("createdByName")?.setValue(user?.lastName+", "+user?.firstName);
      }
      const value = this.noteForm.value;
      value.date = value.date ? DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(value.date)) : value.date;
      this.generalNotesService.addNote(value);
      this.toggleSideDialog(false);
    }
  }

  private createForm(note?: GeneralNotesModel): void {
    this.noteForm = this.formBuilder.group({
      date: [note?.date ?? null, [Validators.required]],
      categoryId: [note?.categoryId ?? null, [Validators.required]],
      note: [note?.note ?? null, [Validators.required]],
      createdByName:[],
    });
  }

  private listenEditMode(): void {
    this.generalNotesService.editMode$.pipe(
      skip(1),
      takeUntil(this.destroy$),
    ).subscribe((note: EditGeneralNoteModel | null) => {
      this.initNoteForm(note?.data);
    });
  }

  private toggleSideDialog(state: boolean): void {
    this.store.dispatch(new ShowSideDialog(state));
  }
}
