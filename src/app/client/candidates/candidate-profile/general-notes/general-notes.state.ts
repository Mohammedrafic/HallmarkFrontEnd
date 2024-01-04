import { Injectable } from "@angular/core";
import { GeneralNotesService } from "./general-notes.service";
import { ExportGeneralNote, GetEmployeeGeneralNoteImportErrors, GetEmployeeGeneralNoteImportErrorsSucceeded, GetEmployeeGeneralNoteImportTemplate, GetEmployeeGeneralNoteImportTemplateSucceeded, SaveEmployeeGeneralNoteImportLogResult, SaveEmployeeGeneralNoteImportResultFailAndSucceeded, SaveEmployeeGeneralNoteImportResultSucceeded, UploadEmployeeGeneralNoteFile, UploadEmployeeGeneralNoteFileSucceeded } from "./general-notes.action";
import { Observable, catchError, of, tap } from "rxjs";
import { saveSpreadSheetDocument } from "@shared/utils/file.utils";
import { Action, State, StateContext } from "@ngxs/store";
import { ShowToast } from "src/app/store/app.actions";
import { MessageTypes } from "@shared/enums/message-types";
import { ImportResult } from "@shared/models/import.model";
import { getAllErrors } from "@shared/utils/error.utils";
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

    @Action(GetEmployeeGeneralNoteImportTemplate)
  GetEmployeeImportTemplate(
    { dispatch }: StateContext<GeneralNoteStateModel>,
    { payload }: GetEmployeeGeneralNoteImportTemplate): Observable<any> {
    return this.generalNotesService.getImportEmployeeGeneralNoteTemplate().pipe(
      tap((payload) => {
        dispatch(new GetEmployeeGeneralNoteImportTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(GetEmployeeGeneralNoteImportErrors)
  GetEmployeeImportErrors(
    { dispatch }: StateContext<GeneralNoteStateModel>,
    { errorpayload }: GetEmployeeGeneralNoteImportErrors
  ): Observable<any> {
    if(errorpayload.length > 0){          
      errorpayload.forEach((data:any)=>{
        if(data.ssn != undefined && data.ssn != ''){
          data.ssn = data.ssn.replace(/\d/g, "X");
        }
      })
    }
    return this.generalNotesService.getImportEmployeeGeneralNoteErrors(errorpayload).pipe(
      tap((payload) => {
        dispatch(new GetEmployeeGeneralNoteImportErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadEmployeeGeneralNoteFile)
  UploadEmployeesFile(
    { dispatch }: StateContext<GeneralNoteStateModel>,
    { payload }: UploadEmployeeGeneralNoteFile
  ): Observable<ImportResult<any> | Observable<void>> {
    return this.generalNotesService.uploadImportEmployeeGeneralNoteFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadEmployeeGeneralNoteFileSucceeded(payload));
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

  @Action(SaveEmployeeGeneralNoteImportLogResult)
  SaveEmployeesImportResult(
    { dispatch }: StateContext<GeneralNoteStateModel>,
    { payload}: SaveEmployeeGeneralNoteImportLogResult
  ): Observable<ImportResult<any> | Observable<void>> {
    return this.generalNotesService.saveImportEmployeeGeneralNoteResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveEmployeeGeneralNoteImportResultFailAndSucceeded(payload));  
        return payload;
      }),
      catchError((error:any) => of( dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)))))
    );
  }

}