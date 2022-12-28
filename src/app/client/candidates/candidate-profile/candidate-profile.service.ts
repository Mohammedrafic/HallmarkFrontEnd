import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, distinctUntilChanged, EMPTY, mergeMap, Observable, tap } from 'rxjs';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { FormBuilder } from '@angular/forms';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { Store } from '@ngxs/store';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { DateTimeHelper } from '@core/helpers';
import pick from 'lodash/fp/pick';

@Injectable()
export class CandidateProfileService {
  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private store: Store,
    private candidateProfileForm: CandidateProfileFormService,
    private generalNotesService: GeneralNotesService
  ) {}

  public saveCandidateProfile(): Observable<CandidateModel> {
    const candidate = this.candidateProfileForm.candidateForm.value;
    const candidateDateInUTC = { ...candidate, ...this.convertDatesToUTC(candidate) };
    const payload = { ...candidateDateInUTC, generalNotes: this.generalNotesService.notes$.getValue() };

    return this.http.post<CandidateModel>('/api/employee/create', payload).pipe(
      distinctUntilChanged(),
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
      return this.saveCandidateProfile().pipe(mergeMap((candidate) => this.saveCandidatePhoto(file, candidate.id)));
    } else {
      return this.saveCandidateProfile();
    }
  }

  public saveCandidatePhoto(file: Blob, id: number): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`/api/Employee/photo?candidateProfileId=${id}`, formData).pipe(distinctUntilChanged());
  }

  private convertDatesToUTC(candidate: CandidateModel): Partial<CandidateModel> {
    const props = [
      'dob',
      'hireDate',
      'contractStartDate',
      'contractEndDate',
      'holdStartDate',
      'holdEndDate',
      'terminationDate',
      'organizationOrientationDate',
    ];
    const dates = pick(props, candidate);

    return Object.fromEntries(
      Object.entries(dates).map(([key, value]: [string, any]) => {
        return [key, value ? DateTimeHelper.toUtcFormat(value) : value];
      })
    );
  }
}
