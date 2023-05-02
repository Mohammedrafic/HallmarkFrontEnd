import { Observable, tap } from "rxjs";
import { saveSpreadSheetDocument } from "@shared/utils/file.utils";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { VendorscorecardService } from "./vendorscorecard.service"; 
import { Filtervendorscorecard } from "./vendorscorecard.action";
import { VendorScorePayload, VendorScorecardresponse, VendorScorecardresponsepayload } from "@shared/models/vendorscorecard.model";

export interface VendorSCorecardStateModel {
    VendorScorecardresponsepayload: VendorScorecardresponsepayload | null;  
    VendorScorecardEntity: VendorScorecardresponse | null; 
  }
   @State<VendorSCorecardStateModel>({
     name: "VendorScoreCard",
     defaults: {VendorScorecardresponsepayload:null,VendorScorecardEntity:null }
    
   })
@Injectable()
export class VendorSCorecardState {

    @Selector()
    static VendorScorecardresponsepayload(state: VendorSCorecardStateModel): VendorScorecardresponsepayload | null
    {
      return state.VendorScorecardresponsepayload;
    }
    @Selector()
    static VendorScorecardEntity (state: VendorSCorecardStateModel): VendorScorecardresponse | null {
      return state.VendorScorecardEntity;
    }

    constructor(private VendorscorecardService : VendorscorecardService) {
    }
    
    @Action(Filtervendorscorecard)
    ExportOrientations({patchState}: StateContext<VendorSCorecardStateModel>, { payload }: 
        Filtervendorscorecard): Observable<VendorScorecardresponse> {
        return this.VendorscorecardService.VendorscorecardFilter(payload).pipe
        (
            tap((payloads) => {
              patchState({VendorScorecardEntity:payloads});
              return payloads;
            })
          );
    };
}
