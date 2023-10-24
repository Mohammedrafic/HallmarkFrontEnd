import { Injectable } from "@angular/core";
import { MspService } from "../../services/msp.services";
import { Observable, catchError, tap } from "rxjs";
import { MspListDto } from "../../constant/msp.constant";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GetMsps } from "../actions/msp.actions";
import { MspListPage } from "../model/msp.model";

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

}