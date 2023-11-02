import { Injectable } from "@angular/core";
import { MspService } from "../../services/msp.services";
import { Observable, catchError, of, tap } from "rxjs";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GetMSPByIdSucceeded, GetMspById, GetMspLogo, GetMspLogoSucceeded, GetMsps, RemoveMspLogo, SaveMSP, SaveMSPSucceeded, UploadMspLogo } from "../actions/msp.actions";
import { MSP, MspListPage } from "../model/msp.model";
import { AdminStateModel } from "@admin/store/admin.state";
import { RECORD_ADDED, RECORD_MODIFIED } from "@shared/constants";
import { MessageTypes } from "@shared/enums/message-types";
import { ShowToast } from "src/app/store/app.actions";
import { HttpErrorResponse } from "@angular/common/http";

export interface MspStateModel {
    mspList:MspListPage | null;
}

@State<MspStateModel>({
    name: 'msp',
    defaults: {
      mspList: null
    }
  })

@Injectable()
export class MspState {
  constructor(private mspService: MspService) { }

  @Selector()
  static getMspList(state: MspStateModel): MspListPage | null {  
    return state.mspList;
  }  

  @Action(GetMsps)
  GetMsps({ patchState }: StateContext<MspStateModel>,{}: GetMsps): Observable<MspListPage> {    
    return this.mspService.GetMspList().pipe(
      tap((payload) => {
        patchState({ mspList: payload });
        return payload;
      })
    );
  }  

  @Action(SaveMSP)
  SaveOrganization({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: SaveMSP): Observable<MSP | void> {
    patchState({ isOrganizationLoading: true });
    return this.mspService.saveOrganization(payload).pipe(tap((payloadResponse) => {
      patchState({ isOrganizationLoading: false });
      dispatch([new SaveMSPSucceeded(payloadResponse)]);
        if (payload.mspId) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
      return payloadResponse;
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.error.errors.Organization) {
        const message = error.error.errors.Organization[0] || 'Such prefix already exists';

        return dispatch(new ShowToast(MessageTypes.Error, message));
      }
      return dispatch(new ShowToast(MessageTypes.Error, 'Changes were not saved. Please try again'));
    }));
  }

  @Action(GetMspById)
  GetOrganizationById({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: GetMspById): Observable<MSP> {
    patchState({ isOrganizationLoading: true });
    return this.mspService.getOrganizationById(payload).pipe(tap((payload) => {
       patchState({ isOrganizationLoading: false, });
      dispatch(new GetMSPByIdSucceeded(payload));
      return payload;
    }));
  }

  @Action(GetMspLogo)
  GetOrganizationLogo({ dispatch }: StateContext<AdminStateModel>, { payload }: GetMspLogo): Observable<any> {
    return this.mspService.getMspLogo(payload).pipe(tap((payload) => {
      dispatch(new GetMspLogoSucceeded(payload));
      return payload;
    }));
  }

  @Action(UploadMspLogo)
  UploadOrganizationLogo({ patchState }: StateContext<AdminStateModel>, { file, businessUnitId }: UploadMspLogo): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.mspService.saveMspLogo(file, businessUnitId).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      return payload;
    }));
  }

  
  @Action(RemoveMspLogo)
  RemoveOrganizationLogo({ dispatch }: StateContext<AdminStateModel>, { payload }: RemoveMspLogo): Observable<any> {
    return this.mspService.removeMspLogo(payload).pipe(
      tap((payload) => payload),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Logo cannot be deleted'))))
    );
  }
}