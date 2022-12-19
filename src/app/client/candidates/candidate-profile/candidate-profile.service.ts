import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, mergeMap, Observable, Subject, tap } from 'rxjs';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileStatusesEnum } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { Store } from '@ngxs/store';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';

@Injectable({
  providedIn: 'root'
})
export class CandidateProfileService {
  public readonly candidateForm: FormGroup = this.createForm();
  public saveEvent$: Subject<void> = new Subject<void>();

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    protected store: Store,
    private generalNotesService: GeneralNotesService) {
  }

  public saveCandidateProfile(): Observable<CandidateModel> {
    const candidate = this.candidateForm.value;
    const payload = { ...candidate, generalNotes: this.generalNotesService.notes$.getValue() };

    return this.http.post<CandidateModel>('/api/employee/create', payload).pipe(
      tap(() => {
        if (candidate.id) {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public saveCandidate(file: Blob): Observable<void | CandidateModel> {
    if (file) {
      return this.saveCandidateProfile()
        .pipe(
          mergeMap((candidate) => (this.saveCandidatePhoto(file, candidate.id)))
        );
    } else {
      return this.saveCandidateProfile();
    }
  }

  public resetCandidateForm(): void {
    this.candidateForm.reset({
      profileStatus: ProfileStatusesEnum.Active
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      employeeId: [null, [Validators.required, Validators.maxLength(50)]],
      firstName: [null, [Validators.required, Validators.maxLength(50)]],
      middleName: [null, [Validators.maxLength(10)]],
      lastName: [null, [Validators.required, Validators.maxLength(50)]],
      dob: [null],
      primarySkillId: [null, [Validators.required]],
      secondarySkills: [null],
      classification: [null],
      hireDate: [null, [Validators.required]],
      fte: [null, [Validators.required, Validators.min(0.0), Validators.max(1)]],
      profileStatus: [ProfileStatusesEnum.Active],
      hrCompanyCodeId: [null],
      internalTransferId: [null],
      orientationConfigurationId: [null],
      organizationOrientationDate: [null],
      isContract: [false],
      contractStartDate: [null],
      contractEndDate: [null],
      address1: [null],
      country: [null, [Validators.required]],
      state: [null, [Validators.required]],
      city: [null, [Validators.required]],
      zipCode: [null],
      personalEmail: [null, [Validators.required, Validators.email, Validators.maxLength(200), Validators.pattern(/\S+@\S+\.com/)]],
      workEmail: [null, [Validators.email, Validators.maxLength(200), Validators.pattern(/\S+@\S+\.com/)]],
      phone1: [null, [Validators.required]],
      phone2: [null],
      professionalSummary: [null]
    });
  }


  public saveCandidatePhoto(file: Blob, id: number): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`/api/Employee/photo?candidateProfileId=${id}`, formData);
  }

  public markCandidateFormAsTouched(): void {
    this.candidateForm.markAllAsTouched();
  }
}
