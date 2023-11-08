import { Injectable } from "@angular/core";
import { MspService } from "../../services/msp.services";
import { Observable, catchError, of, tap } from "rxjs";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GetMSPByIdSucceeded, GetMspById, GetMspLogo, GetMspLogoSucceeded, GetMsps, RemoveMspLogo, SaveMSP, SaveMSPSucceeded, UploadMspLogo, GetMSPAssociateListPage, GetMspAssociateAgency, DeleteMspAssociateOrganizationsAgencyById, AssociateAgencyToMsp, AssociateAgencyToMspSucceeded } from "../actions/msp.actions";
import { MSP, MSPAssociateOrganizationsAgency, MSPAssociateOrganizationsAgencyPage, MspListPage } from "../model/msp.model";
import { AdminStateModel } from "@admin/store/admin.state";
import { RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED, RECORD_SAVED } from "@shared/constants";
import { MessageTypes } from "@shared/enums/message-types";
import { ShowToast } from "src/app/store/app.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { UserMspsChanged } from "../../../store/user.actions";
import { getAllErrors } from "../../../shared/utils/error.utils";

export interface MspStateModel {
  mspList: MspListPage | null;
  mspAssociateListPage: MSPAssociateOrganizationsAgencyPage | { items: MSPAssociateOrganizationsAgencyPage['items'] };
  mspAssociateAgency: { id: number, name: string }[];
}

@State<MspStateModel>({
    name: 'msp',
    defaults: {
      mspList: null,
      mspAssociateListPage: { items: [] },
      mspAssociateAgency: [],
    }
  })

@Injectable()
export class MspState {
  constructor(private mspService: MspService) { }

  @Selector()
  static getMspList(state: MspStateModel): MspListPage | null {  
    return state.mspList;
  }

  @Selector()
  static mspAssociateListPage(
    state: MspStateModel
  ): MSPAssociateOrganizationsAgencyPage | { items: MSPAssociateOrganizationsAgencyPage['items'] } {
    debugger
    return state.mspAssociateListPage;
  }

  @Selector()
  static mspAssociateAgency(state: MspStateModel): { id: number, name: string }[] {
    return state.mspAssociateAgency;
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
      dispatch([new SaveMSPSucceeded(payloadResponse), new UserMspsChanged()]);
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

  @Action(GetMSPAssociateListPage)
  GetMSPAssociateListPage(
    { patchState }: StateContext<MspStateModel>,
    { pageNumber, pageSize }: GetMSPAssociateListPage
  ): Observable<MSPAssociateOrganizationsAgencyPage> {
    debugger
    patchState({ mspAssociateListPage: { items: [] } })
    return this.mspService.getMSPAssociateListByPage(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ mspAssociateListPage: payload });
        return payload;
      })
    );
  }

  @Action(DeleteMspAssociateOrganizationsAgencyById)
  DeleteAssociateOrganizationsAgencyById(
    { dispatch, patchState, getState }: StateContext<MspStateModel>,
    { id }: DeleteMspAssociateOrganizationsAgencyById
  ): Observable<never> {
    const state = getState();
    const mspAssociateListPage = {
      ...state.mspAssociateListPage,
      items: state.mspAssociateListPage?.items.filter((item: MSPAssociateOrganizationsAgency) => item.id !== id),
    };

    return this.mspService.deleteMspAssociateOrganizationsAgencyById(id).pipe(
      tap(() => {
        patchState({ mspAssociateListPage });
        dispatch([
          new GetMspAssociateAgency(),
          new ShowToast(MessageTypes.Success, RECORD_DELETE),
        ]);
      })
    );
  }

  @Action(GetMspAssociateAgency)
  GetMspAssociateAgency(
    { patchState, dispatch }: StateContext<MspStateModel>
  ): Observable<void | { id: number, name: string }[]> {
    debugger
    return this.mspService.getMspAssociateAgency().pipe(
      tap((payload: { id: number, name: string }[]) => {
        patchState({ mspAssociateAgency: payload });
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(AssociateAgencyToMsp)
  AssociateAgencyToMsp(
    { patchState, dispatch, getState }: StateContext<MspStateModel>,
    { agencyIds }: AssociateAgencyToMsp
  ): Observable<MSPAssociateOrganizationsAgency[]> {
    const state = getState();

    return this.mspService.associateMsptoAgency(agencyIds).pipe(
      tap((payload) => {
        const mspAssociateListPage = {
          ...state.mspAssociateListPage,
          items: [...state.mspAssociateListPage.items, ...payload],
        };

        patchState({ mspAssociateListPage });
        dispatch([
          new GetMspAssociateAgency(),
          new ShowToast(MessageTypes.Success, RECORD_SAVED),
          new AssociateAgencyToMspSucceeded(payload)
        ]);
      })
    );
  }
}
