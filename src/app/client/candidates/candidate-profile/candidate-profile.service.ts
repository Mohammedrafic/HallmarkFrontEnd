import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, distinctUntilChanged, EMPTY, mergeMap, Observable, of, tap } from 'rxjs';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { Store } from '@ngxs/store';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { DateTimeHelper } from '@core/helpers';
import pick from 'lodash/fp/pick';
import { CandidatesService } from '../services/candidates.service';
import { candidateDateFields } from '../constants';

@Injectable()
export class CandidateProfileService {
  constructor(
    private http: HttpClient,
    private store: Store,
    private candidateProfileForm: CandidateProfileFormService,
    private candidateService: CandidatesService,
    private generalNotesService: GeneralNotesService
  ) {}

  public saveCandidateProfile(
    candidateId: number, createReplacement?: boolean, removeSchedules?: boolean
  ): Observable<CandidateModel> {
    let { value } = this.candidateProfileForm.candidateForm;
    // Employee ID may be disabled (during sourcing), which prevents passing the value.
    // We still need the value, so spread the raw value
    if (!value.employeeId) {
      value = { ...value, employeeId: this.candidateProfileForm.candidateForm.getRawValue().employeeId };
    }

    const isOnHoldSetManually = this.candidateProfileForm.isOnHoldDateSetManually();
    const candidate = candidateId ? { id: candidateId, ...value, isOnHoldSetManually } : value;
    const candidateDateInUTC = { ...candidate, ...this.convertDatesToUTC(candidate) } as CandidateModel;
    const payload = { ...candidateDateInUTC, generalNotes: this.generalNotesService.notes$.getValue() };
    const endpoint = `/api/employee/${candidateId ? 'update' : 'create'}`;

    if (createReplacement) {
      payload.createReplacement = true;
    }

    if (removeSchedules) {
      payload.removeSchedules = true;
    }

    return this.http[candidateId ? 'put' : 'post']<CandidateModel>(endpoint, payload).pipe(
      distinctUntilChanged(),
      tap((profileData) => {
        if (candidateId) {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        this.candidateService.setProfileData(profileData);
        this.candidateService.setCandidateName(`${candidate.lastName}, ${candidate.firstName}`);
      }),
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public saveCandidate(
      file: Blob | null, candidateId: number, createReplacement?: boolean, removeSchedules?: boolean
    ): Observable<void | CandidateModel> {
      return this.saveCandidateProfile(candidateId, createReplacement, removeSchedules).pipe(
        mergeMap((candidate) => {
          this.candidateProfileForm.populateHoldEndDate(candidate);
          this.candidateProfileForm.tabUpdate$.next(candidate.id);
          if (file) {
            return this.saveCandidatePhoto(file, candidate.id);
          }
          return file === null ? this.removeCandidatePhoto(candidate.id) : of(null);
        })
      );
  }

  public saveCandidatePhoto(file: Blob, id: number): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`/api/Employee/photo?candidateProfileId=${id}`, formData).pipe(
      distinctUntilChanged(),
      catchError(() => EMPTY)
    );
  }

  public removeCandidatePhoto(id: number): Observable<any> {
    return this.http.delete(`/api/Employee/${id}/photo`).pipe(
      distinctUntilChanged(),
      catchError(() => EMPTY)
    );
  }

  public getCandidateById(id: number): Observable<CandidateModel> {
    return this.http.get<CandidateModel>(`/api/employee/${id}`).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public getCandidatePhotoById(id: number): Observable<Blob> {
    const salt = (new Date).getTime();
    return this.http.get(`/api/employee/${id}/photo`, { params: { salt }, responseType: 'blob' }).pipe(
      catchError(() => EMPTY)
    );
  }

  private convertDatesToUTC(candidate: CandidateModel): Partial<CandidateModel> {
    const dates = pick(candidateDateFields, candidate);

    return Object.fromEntries(
      Object.entries(dates).map(([key, value]: [string, any]) => {
        return [key, value ? DateTimeHelper.setUtcTimeZone(DateTimeHelper.setInitDateHours(value)) : value];
      })
    );
  }
}
