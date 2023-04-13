export interface GeneralNotesModel {
  id: number,
  categoryId: number,
  date: Date,
  note: string
  createdByName:string
}

export interface EditGeneralNoteModel {
  data: GeneralNotesModel,
  index: number
}

export class GeneralNoteExportFilters {
  candidateId:number;
  pageNumber: number;
  pageSize: number
}

export interface GeneralNoteExportColumn {
  text: string;
  column: string;
}
