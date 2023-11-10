import { Injectable } from "@angular/core";
import { MspService } from "../../services/msp.services";
import { Observable, catchError, of, tap } from "rxjs";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GetMSPByIdSucceeded, GetMspById, GetMspLogo, GetMspLogoSucceeded, GetMsps, RemoveMsp, RemoveMspLogo, RemoveMspSucceeded, SaveMSP, SaveMSPSucceeded, SetBillingStatesByCountry, SetDirtyState, SetGeneralStatesByCountry, UploadMspLogo } from "../actions/msp.actions";
import { MSP, MspListPage } from "../model/msp.model";
import { GeneralPhoneTypes, RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from "@shared/constants";
import { MessageTypes } from "@shared/enums/message-types";
import { ShowToast } from "src/app/store/app.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { getAllErrors } from "@shared/utils/error.utils";
import { BusinessUnit } from "@shared/models/business-unit.model";
import { CanadaStates, Country, UsaStates } from "@shared/enums/states";
import { COUNTRIES } from "@shared/constants/countries-list";
import { OrganizationStatus, Status } from "@shared/enums/status";

const StringIsNumber = (value: any) => isNaN(Number(value)) === true; // TODO: move to utils

interface DropdownOption {
  id: number;
  text: string;
}
export interface MspStateModel {
  mspList: MspListPage | null;
  countries: DropdownOption[];
  organizationStatuses: DropdownOption[];
  statesGeneral: string[] | null;
  statesBilling: string[] | null;
  phoneTypes: string[] | null;
  isMspLoading: boolean;
  msp: MSP | null;
  isOrganizationLoading: boolean;
  businessUnits: BusinessUnit[];
  mspId: number | null;
  netSuiteId: number | null;
  name: string;
  isDirty: boolean;

}

@State<MspStateModel>({
  name: 'msp',
  defaults: {
    mspList: null,
    countries: COUNTRIES,
    organizationStatuses: Object.keys(OrganizationStatus).filter(StringIsNumber).map((statusName, index) => ({ id: index, text: statusName })),
    statesGeneral: UsaStates,
    statesBilling: UsaStates,
    phoneTypes: GeneralPhoneTypes,
    isMspLoading: false,
    msp: null,
    isOrganizationLoading: false,
    businessUnits: [],
    mspId: null,
    netSuiteId: null,
    name: "",
    isDirty: false,

  }
})

@Injectable()
export class MspState {
  constructor(private mspService: MspService) { }

  @Action(SetGeneralStatesByCountry)
  SetGeneralStatesByCountry({ patchState }: StateContext<MspStateModel>, { payload }: SetGeneralStatesByCountry): void {
    patchState({ statesGeneral: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(SetBillingStatesByCountry)
  SetBillingStatesByCountry({ patchState }: StateContext<MspStateModel>, { payload }: SetBillingStatesByCountry): void {
    patchState({ statesBilling: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(SetDirtyState)
  SetDirtyState({ patchState }: StateContext<MspStateModel>, { payload }: SetDirtyState): void {
    patchState({ isDirty: payload });
  }

  @Selector()
  static countries(state: MspStateModel): DropdownOption[] { return state.countries; }

  @Selector()
  static statesGeneral(state: MspStateModel): string[] | null { return state.statesGeneral; }

  @Selector()
  static phoneTypes(state: MspStateModel): string[] | null { return state.phoneTypes; }
  @Selector()
  static getMspList(state: MspStateModel): MspListPage | null {
    return state.mspList;
  }
  @Selector()
  static organizationStatuses(state: MspStateModel): DropdownOption[] { return state.organizationStatuses; }
  @Selector()
  static statesBilling(state: MspStateModel): string[] | null { return state.statesBilling; }
  @Selector()
  static businessUnits(state: MspStateModel): BusinessUnit[] { return state.businessUnits; }


  @Action(GetMsps)
  GetMsps({ patchState }: StateContext<MspStateModel>, { }: GetMsps): Observable<MspListPage> {
    return this.mspService.GetMspList().pipe(
      tap((payload) => {
        patchState({ mspList: payload });
        return payload;
      })
    );
  }

  @Action(SaveMSP)
  SaveOrganization({ patchState, dispatch }: StateContext<MspStateModel>, { payload }: SaveMSP): Observable<MSP | Observable<void>> {
    patchState({ isMspLoading: true });
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
        return of(dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))));
      }));
  }

  @Action(GetMspById)
  GetOrganizationById({ patchState, dispatch }: StateContext<MspStateModel>, { payload }: GetMspById): Observable<MSP> {
    patchState({ isMspLoading: true });
    return this.mspService.getOrganizationById(payload).pipe(tap((payload) => {
      patchState({ isMspLoading: false, });
      dispatch(new GetMSPByIdSucceeded(payload));
      return payload;
    }));
  }

  @Action(GetMspLogo)
  GetOrganizationLogo({ dispatch }: StateContext<MspStateModel>, { payload }: GetMspLogo): Observable<any> {
    return this.mspService.getMspLogo(payload).pipe(tap((payload) => {
      dispatch(new GetMspLogoSucceeded(payload));
      return payload;
    }));
  }

  @Action(UploadMspLogo)
  UploadOrganizationLogo({ patchState }: StateContext<MspStateModel>, { file, businessUnitId }: UploadMspLogo): Observable<any> {
    patchState({ isMspLoading: true });
    return this.mspService.saveMspLogo(file, businessUnitId).pipe(tap((payload) => {
      patchState({ isMspLoading: false });
      return payload;
    }));
  }


  @Action(RemoveMspLogo)
  RemoveOrganizationLogo({ dispatch }: StateContext<MspStateModel>, { payload }: RemoveMspLogo): Observable<any> {
    return this.mspService.removeMspLogo(payload).pipe(
      tap((payload) => payload),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Logo cannot be deleted'))))
    );
  }


  @Action(RemoveMsp)
  deletMspid({ patchState, dispatch }: StateContext<MspStateModel>, { id }: RemoveMsp): Observable<void> {
    patchState({ isMspLoading: true });
    return this.mspService.removeMsp(id).pipe(tap((payload) => {
      patchState({ isMspLoading: false, });
      dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      dispatch(new RemoveMspSucceeded(id));
      return payload;
    }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))

    );
  }


}

