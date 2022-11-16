import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { FilterColumnsModel } from "@shared/models/filter.model";

export const OPRION_FIELDS = {
  text: 'text',
  value: 'id',
};


export const DISABLED_GROUP = [BusinessUnitType.Agency, BusinessUnitType.Organization];

export const BUSINESS_DATA_FIELDS = {
  text: 'name',
  value: 'id',
};
export const User_DATA_FIELDS = {
  text: 'fullName',
  value: 'id',
};
export const alertsFilterColumns: FilterColumnsModel = {

};
export const toolsRichTextEditor: object = {
  items: [
      'Bold', 'Italic', 'Underline', '|',
      'FontName', 'FontSize',  '|','LowerCase', 'UpperCase', '|', 'Undo', 'Redo', '|',
      'Formats', 'Alignments', '|', 'CreateLink',
      'Image', '|']
};