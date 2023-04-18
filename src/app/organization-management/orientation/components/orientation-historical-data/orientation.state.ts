import { Observable, tap } from "rxjs";
import { saveSpreadSheetDocument } from "@shared/utils/file.utils";
import { Action, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { ExportOrientation } from "./orientation.action";
import { OrientationService } from "@organization-management/orientation/services/orientation.service";
export class OrientationStateModel {
   id:number;
  }
  
  @State<OrientationStateModel>({
    name: "orientation",
   
  })
@Injectable()
export class OrientationState {

    constructor(
        private orientationService : OrientationService
    ) {
    }

    @Action(ExportOrientation)
    ExportOrientations({}: StateContext<OrientationStateModel>, { payload }: ExportOrientation): Observable<any> {
      return this.orientationService.getExport(payload).pipe(tap(file => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      }));
    };
}