import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { EditGeneralNoteModel, GeneralNotesModel } from './general-notes.model';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import isEqual from 'lodash/fp/isEqual';
import { ExportPayload } from '@shared/models/export.model';

@Injectable()
export class GeneralNotesService {
  private _sideDialogTitle$: Subject<string> = new Subject<string>();
  private _editMode$: BehaviorSubject<EditGeneralNoteModel | null> = new BehaviorSubject<EditGeneralNoteModel | null>(
    null
  );
  public notes$: BehaviorSubject<GeneralNotesModel[]> = new BehaviorSubject<GeneralNotesModel[]>([]);

  public sideDialogTitle$: Observable<string> = this._sideDialogTitle$.asObservable();
  public editMode$: Observable<EditGeneralNoteModel | null> = this._editMode$.asObservable();

  constructor(
    private http: HttpClient,
    private navigationWrapperService: NavigationWrapperService,
    private candidateProfileFormService: CandidateProfileFormService
  ) {}

  public setSideDialogTitle(title: string) {
    this._sideDialogTitle$.next(title);
  }

  public addNote(note: GeneralNotesModel): void {
    const { data, index } = this._editMode$.getValue() || {};
    if (data) {
      const updatedNotes = this.notes$.getValue();
      this.notes$.next(Object.assign([], updatedNotes, { [index as number]: note }));
    } else {
      this.notes$.next([...this.notes$.getValue(), note]);
    }
    this.navigationWrapperService.areUnsavedChanges = this.hasUnsavedChanges.bind(this);
  }

  public deleteNote(index: number): void {
    const notes = this.notes$.getValue();
    this.notes$.next(notes.filter((_, i: number) => index !== i));
    this.candidateProfileFormService.triggerSaveEvent();
  }

  public editNote(note: EditGeneralNoteModel): void {
    this._editMode$.next(note);
  }

  public resetEditMode(): void {
    this._editMode$.next(null);
  }

  public resetNoteList(): void {
    this.notes$.next([]);
    this.resetEditMode();
  }

  public getCategories(): Observable<CategoryModel[]> {
    return this.http.get<CategoryModel[]>('/api/employeeGeneralNotes/categories/all').pipe(shareReplay());
  }

  public hasUnsavedChanges(): boolean {
    const newValue = this.notes$.getValue();
    const oldValue = this.candidateProfileFormService.candidateForm.get('generalNotes')?.value;
    return !isEqual(newValue, oldValue);
  }

  public getExport(filters: ExportPayload): Observable<Blob> {
   
    return this.http.post(`/api/employee/export/GeneralNote`, filters, { responseType: 'blob' });
  }
}
