import { Injectable } from "@angular/core";
import { GeneralNotesService } from "./general-notes.service";
import { ExportGeneralNote } from "./general-notes.action";
import { Observable, tap } from "rxjs";
import { saveSpreadSheetDocument } from "@shared/utils/file.utils";
import { Action, State } from "@ngxs/store";
export class GeneralNoteStateModel {
   id:number;
  }
  
  @State<GeneralNoteStateModel>({
    name: "GeneralNote",
   
  })
@Injectable()
export class GeneralNoteState {

    constructor(
        private generalNotesService: GeneralNotesService
    ) {
    }

    @Action(ExportGeneralNote)
    ExportGeneralNotes({ }, { payload }: ExportGeneralNote): Observable<any> {
        return this.generalNotesService.getExport(payload).pipe(tap(file => {
            const url = window.URL.createObjectURL(file);
            saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
        }));
    };
}