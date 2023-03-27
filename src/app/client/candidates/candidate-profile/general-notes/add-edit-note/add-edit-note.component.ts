import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Observable, takeUntil } from 'rxjs';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../../store/app.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { EditGeneralNoteModel, GeneralNotesModel } from '../general-notes.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DateTimeHelper } from '@core/helpers';

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
    private store: Store
  ) {
    super();
  }

  public ngOnInit(): void {
    this.listenEditMode();
  }

  public initNoteForm(note: GeneralNotesModel | undefined): void {
    this.categories$ = this.generalNotesService.getCategories();
    this.noteForm = this.formBuilder.group({
      date: [note?.date ?? null, [Validators.required]],
      categoryId: [note?.categoryId ?? null, [Validators.required]],
      note: [note?.note ?? null, [Validators.maxLength(250)]],
    });
  }

  public saveNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
    } else {
      const value = this.noteForm.value;
      value.date = value.date ? DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(value.date)) : value.date;
      this.generalNotesService.addNote(value);
      this.toggleSideDialog(false);
    }
  }

  private listenEditMode(): void {
    this.generalNotesService.editMode$.pipe(takeUntil(this.destroy$)).subscribe((note: EditGeneralNoteModel | null) => {
      this.initNoteForm(note?.data);
    });
  }

  private toggleSideDialog(state: boolean): void {
    this.store.dispatch(new ShowSideDialog(state));
  }
}
