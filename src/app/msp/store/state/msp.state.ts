import { Injectable } from "@angular/core";
import { MspService } from "../../services/msp.services";
import { Observable, catchError, tap } from "rxjs";
import { MspListDto } from "../../constant/msp.constant";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GetMsps, SaveMSP, SaveMSPSucceeded } from "../actions/msp.actions";
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
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
    
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

}