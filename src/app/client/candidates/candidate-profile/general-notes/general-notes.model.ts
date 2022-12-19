export interface GeneralNotesModel {
  id: number,
  categoryId: number,
  date: Date,
  note: string
}

export interface EditGeneralNoteModel {
  data: GeneralNotesModel,
  index: number
}
