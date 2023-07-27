import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, catchError, of, tap } from 'rxjs';

import { MessageTypes } from '@shared/enums/message-types';
import { ListOfSkills } from '@shared/models/skill.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { ShowToast } from 'src/app/store/app.actions';
import { CandidateListService } from '../services/candidate-list.service';
import { CandidateList, CandidateListStateModel, IRPCandidateList } from '../types/candidate-list.model';
import * as CandidateListActions from './candidate-list.actions';
import { CredentialType } from '@shared/models/credential-type.model';
import { ImportResult } from '@shared/models/import.model';
import { EmployeeImportService } from '@client/candidates/services/employee-import.service';
import { CommonHelper } from '@shared/helpers/common.helper';

@State<CandidateListStateModel>({
  name: 'candidateList',
  defaults: {
    isCandidateLoading: false,
    candidateList: null,
    IRPCandidateList: null,
    listOfSkills: null,
    listOfRegions: null,
    tableState: null,
    listOfCredentialTypes : null
  },
})
@Injectable()
export class CandidateListState {
  @Selector()
  static candidates(state: CandidateListStateModel): CandidateList | null {
    return state.candidateList;
  }

  @Selector()
  static IRPCandidates(state: CandidateListStateModel): IRPCandidateList | null {
    return state.IRPCandidateList;
  }

  @Selector()
  static listOfSkills(state: CandidateListStateModel): ListOfSkills[] | null {
    return state.listOfSkills;
  }

  @Selector()
  static listOfRegions(state: CandidateListStateModel): string[] | null {
    return state.listOfRegions;
  }
  @Selector()
  static listOfCredentialTypes(state: CandidateListStateModel): CredentialType[] | null {
    return state.listOfCredentialTypes;
  }

 
  constructor(private candidateListService: CandidateListService) {}
  constructor(private candidateListService: CandidateListService,private employeeService :EmployeeImportService) {}

  @Action(CandidateListActions.GetCandidatesByPage, { cancelUncompleted: true })
  GetCandidatesByPage(
    { patchState, dispatch }: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.GetCandidatesByPage
  ): Observable<CandidateList | unknown> {
    patchState({ isCandidateLoading: true });
    return this.candidateListService.getCandidates(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, candidateList: payload });
      }),
      catchError((error: HttpErrorResponse) => {
        patchState({ isCandidateLoading: false, candidateList: null });
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(CandidateListActions.GetIRPCandidatesByPage, { cancelUncompleted: true })
  GetIRPCandidatesByPage(
    { patchState, dispatch }: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.GetIRPCandidatesByPage
  ): Observable<IRPCandidateList | unknown> {
    patchState({ isCandidateLoading: true });
    return this.candidateListService.getIRPCandidates(payload).pipe(
      tap((payload) => {
        patchState({ isCandidateLoading: false, IRPCandidateList: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        patchState({ isCandidateLoading: false, IRPCandidateList: null });
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(CandidateListActions.ExportIRPCandidateList)
  ExportUserListIRP(
    ctx: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.ExportCandidateList): Observable<Blob> {
    return this.candidateListService.exportIrp(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(CandidateListActions.GetAllSkills)
  GetAllSkills({ patchState }: StateContext<CandidateListStateModel>): Observable<ListOfSkills[]> {
    return this.candidateListService.getAllSkills()
    .pipe(
      tap((data) => {
        patchState({ listOfSkills: data.map(({id, masterSkillId, skillDescription}) =>
        ({id, masterSkillId, name: skillDescription})) });
      }));
  }

  @Action(CandidateListActions.ChangeCandidateProfileStatus)
  ChangeCandidateProfileStatus(
    { dispatch }: StateContext<CandidateListStateModel>,
    { candidateProfileId, profileStatus }: CandidateListActions.ChangeCandidateProfileStatus
  ): Observable<void> {
    return this.candidateListService.changeCandidateStatus(candidateProfileId, profileStatus).pipe(
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(CandidateListActions.ExportCandidateList)
  ExportUserList(
    ctx: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.ExportCandidateList): Observable<Blob> {
    return this.candidateListService.export(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(CandidateListActions.GetRegionList)
  GetRegionList({patchState}: StateContext<CandidateListStateModel>): Observable<string[]> {
    return this.candidateListService.getRegions().pipe(tap((data)=> {
      patchState({
        listOfRegions: data,
      });
    }));
  }

  @Action(CandidateListActions.DeleteIRPCandidate)
  DeleteIRPCandidate(
    {dispatch}: StateContext<CandidateListStateModel>,
    { id }: CandidateListActions.DeleteIRPCandidate): Observable<void> {
    return this.candidateListService.deleteIRPCandidate(id).pipe(
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(CandidateListActions.SetTableState)
  SetTableState(
    { patchState }: StateContext<CandidateListStateModel>,
    { candidatesTableState }: CandidateListActions.SetTableState,
  ): void {
    patchState({
      tableState: candidatesTableState,
    });
  }

  @Action(CandidateListActions.ClearTableState)
  ClearTableState(
    { patchState }: StateContext<CandidateListStateModel>,
  ): void {
    patchState({
      tableState: null,
    });
  }

  
  @Action(CandidateListActions.GetEmployeeImportTemplate)
  GetEmployeeImportTemplate(
    { dispatch }: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.GetEmployeeImportTemplate): Observable<any> {
    return this.employeeService.getImportEmployeeTemplate().pipe(
      tap((payload) => {
        dispatch(new CandidateListActions.GetEmployeeImportTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(CandidateListActions.GetEmployeeImportErrors)
  GetEmployeeImportErrors(
    { dispatch }: StateContext<CandidateListStateModel>,
    { errorpayload }: CandidateListActions.GetEmployeeImportErrors
  ): Observable<any> {
    if(errorpayload.length > 0){          
      errorpayload.forEach((data:any)=>{
        if(data.ssn != undefined && data.ssn != ''){
          data.ssn = data.ssn.replace(/\d/g, "X");
        }
      })
    }
    return this.employeeService.getImportEmployeeErrors(errorpayload).pipe(
      tap((payload) => {
        dispatch(new CandidateListActions.GetEmployeeImportErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(CandidateListActions.UploadEmployeeFile)
  UploadEmployeesFile(
    { dispatch }: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.UploadEmployeeFile
  ): Observable<ImportResult<any> | Observable<void>> {
    return this.employeeService.uploadImportEmployeeFile(payload).pipe(
      tap((payload) => {
        payload = CommonHelper.formatTheSSN(payload);
        dispatch(new CandidateListActions.UploadEmployeeFileSucceeded(payload));
        return payload;
      }),
      catchError((error: any) =>
        of(
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error && error.error ? getAllErrors(error.error) : 'File was not uploaded'
            )
          )
        )
      )
    );
  }

  @Action(CandidateListActions.SaveEmployeeImportResult)
  SaveEmployeesImportResult(
    { dispatch }: StateContext<CandidateListStateModel>,
    { payload }: CandidateListActions.SaveEmployeeImportResult
  ): Observable<ImportResult<any> | Observable<void>> {
    return this.employeeService.saveImportEmployeeResult(payload).pipe(
      tap((payload) => {
        if(payload.errorRecords.length > 0){          
          dispatch(new CandidateListActions.UploadEmployeeFileSucceeded(payload));          
        }
        dispatch(new CandidateListActions.SaveEmployeeImportResultFailAndSucceeded(payload));  
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'DoNotReturn list were not imported'))))
    );
  }


  @Action(CandidateListActions.GetCredentialsTypeList)
  GetCredentialTypesList({patchState}: StateContext<CandidateListStateModel>): Observable<CredentialType[]> {
    return this.candidateListService.getCredentialTypes().pipe(tap((data)=> {
      patchState({
        listOfCredentialTypes: data,
      });
    }));
  }
}
