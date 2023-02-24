import { IrpTabs, OrderSystem } from '@client/order-management/enums';
import { ButtonType, IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { FieldType } from '@core/enums';
import { SystemType } from "@shared/enums/system-type.enum";
import { Region } from '@shared/models/region.model';
import { Location } from '@shared/models/location.model';
import { Department } from '@shared/models/department.model';
import { ListOfSkills } from '@shared/models/skill.model';
import { RejectReason } from '@shared/models/reject-reason.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { AbstractControl, FormGroup } from '@angular/forms';
import { OrganizationRegion } from '@shared/models/organization.model';

export interface TabsConfig {
  id: number;
  title: string;
  subTitle: string;
  required: boolean;
  content: IrpTabs;
}

export interface OrderTypes {
  id: IrpOrderType;
  name: string;
}

//TODO: add correct style adn remove any
export interface OrderFormInput {
  type: FieldType;
  required: boolean;
  field: string;
  maxLength?: string | number | null;
  title?: string;
  enabled?: boolean;
  cssClass?: string;
  icon?: string;
  show?: boolean;
  buttonType?: ButtonType;
  dataSource?: any;
}

export interface OrderFormsConfig {
  title: string
  formName: string;
  cssClass: string;
  fields: OrderFormInput[];
}

//todo: ue correct type(OrderFormInput[])
export interface OrderFormsArrayConfig {
  title: string;
  buttonText: string;
  formList: string;
  buttonType: ButtonType,
  forms: any[];
}

export interface SpecialProjectStructure {
  poNumbers: PoNumbers[],
  projectNames: ProjectNames[],
  specialProjectCategories: SpecialProjectCategories[]
}

export interface SpecialProjectCategories {
  id: number;
  projectType?: string
}

export interface ProjectNames {
  id: number;
  projectName?: string;
}

export interface PoNumbers {
  id: number;
  poNumber?: string;
}

export type DataSourceContainer =
  OrganizationRegion[] |
  Location[] |
  Department[] |
  ListOfSkills[] |
  AssociateAgency[] |
  StateList[] |
  SpecialProjectCategories[] |
  ProjectNames[] |
  PoNumbers[] |
  RejectReason[];

export interface OrderDataSourceContainer {
  regions?: Region[];
  locations?: Location[];
  departments?: Department[];
  skills?: ListOfSkills[];
  associateAgency?: AssociateAgency[];
  reasons?: RejectReason[];
  specialProjectCategories?: SpecialProjectCategories[],
  projectNames?: ProjectNames[],
  poNumbers?: PoNumbers[],
  state?: AssociateAgency[],
}

export interface ListOfKeyForms {
  generalInformationForm: FormGroup;
  jobDistributionForm: FormGroup;
  jobDescriptionForm: FormGroup;
  contactDetailsList: FormGroup[];
  workLocationList: FormGroup[];
  specialProjectForm: FormGroup;
  orderType: FormGroup;
}

export interface StateList {
  id?: number;
  name?: string;
  keyCode?: string;
  title?: string;
}

export interface JobDistributionList {
  id: number;
  jobDistributionOption: number;
  agencyId: number | null;
}

export interface ListControls {
  [key: string]: AbstractControl;
}

export interface SelectSystem {
  isIRP: boolean;
  isVMS: boolean;
  isIRPFlag: boolean;
}

export interface JobDistribution {
  jobDistributionValue: number[];
  agencyId: number[];
}

export interface ContactDetailsUser {
  name: string;
  email: string;
  mobilePhone: string;
}

export interface SkillParams {
  params: {
    SystemType: OrderSystem | SystemType;
    SkillCategoryIds?: number[];
  }
}
