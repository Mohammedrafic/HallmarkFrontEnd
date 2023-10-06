import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';

export interface CandidateField {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  cssClass: string;
  dataSource?: DropdownOption[];
  maxDate?: Date | null;
  minDate?: Date | null;
}

export interface CandidateForm {
  status: number;
  actualStartDate: string;
  actualEndDate: string;
  availableStartDate:string;
  isClosed: boolean;
  reason: number;
  closeDate: Date;
}

export interface atpStipendRate {
  mealrate : number;
  lodgingrate : number;
}

export interface ratePerhourConfig {
  payRateSettingId : number;
  amountMultiplier : number;
}

export interface atpStipend {
  zip : number;
  Actualstartdate : string;
}