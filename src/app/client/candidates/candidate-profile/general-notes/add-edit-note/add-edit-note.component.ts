import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Observable } from 'rxjs';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../../store/app.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';

@Component({
  selector: 'app-add-edit-note',
  templateUrl: './add-edit-note.component.html',
  styleUrls: ['./add-edit-note.component.scss']
})
export class AddEditNoteComponent implements OnInit {
  public noteForm: FormGroup;
  public categories$: Observable<CategoryModel[]>;

  public readonly categoryFields: FieldSettingsModel = { text: 'categoryName', value: 'id' };

  constructor(
    private formBuilder: FormBuilder,
    private generalNotesService: GeneralNotesService,
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.listenEditMode();
  }

  public initNoteForm(note?: any): void {
    this.categories$ = this.generalNotesService.getCategories();
    this.noteForm = this.formBuilder.group({
      date: [note?.date ?? null, [Validators.required]],
      categoryId: [note?.category ?? null],
      note: [note?.note ?? null, [Validators.maxLength(250)]]
    });
  }

  public saveNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
    } else {
      this.generalNotesService.addNote(this.noteForm.value);
      this.store.dispatch(new ShowSideDialog(false));
    }

  }

  private listenEditMode(): void {
    this.generalNotesService.editMode$.subscribe((note: any) => {
      this.initNoteForm(note?.data);
    });
  }


}
