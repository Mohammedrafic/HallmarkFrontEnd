import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { MasterOrientationExportColumn } from "./orientation-grid.interface";

export const MasterOrientationExportCols: MasterOrientationExportColumn[] = [
  { text: 'Orientation Type', column: 'OrientationTypes' },
{ text: 'Start Date', column: 'Startdate' },
{ text: 'End Date', column: 'EndDate' },
{text: 'Region',column:'RegionName'},
{text: 'Location',column:'LocationName'},
{ text: 'Department', column: 'DepartmentName' },
{ text: 'Skill Category', column: 'SkillCategoriesName' },
{ text: 'Skills', column: 'SkillsName' },
{ text: 'COMPLETE ORIENT.IN(DAYS)', column: 'CompletedOrientation' },
{ text: 'REMOVE ORIENT.(DAYS)', column: 'RemoveOrientation' },
];

