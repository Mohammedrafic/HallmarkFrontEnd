import { FieldType } from '@core/enums';
import { ORDER_DURATION_LIST } from '@shared/constants/order-duration-list';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { JobClassifications } from '@client/order-management/constants';
import { ORDER_CONTACT_DETAIL_TITLES } from '@shared/constants';
import { ButtonType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import {
  IrpJobDistribution,
} from '@client/order-management/components/irp-tabs/order-details/constants/order-details.constant';
import { OrderFormInput, OrderFormsArrayConfig, OrderFormsConfig, StateList } from '@client/order-management/interfaces';
import { AssociateAgency } from '@shared/models/associate-agency.model';

export const GeneralInformationConfigLTA: OrderFormsConfig  = {
  title: 'General Information',
  formName: 'generalInformationForm',
  cssClass: 'general-information-wrapper',
  fields: [
    {
      field: 'regionId',
      title: 'Region',
      cssClass: 'item1',
      required: true,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'locationId',
      title: 'Location',
      cssClass: 'item2',
      required: true,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'departmentId',
      title: 'Department',
      cssClass: 'item3',
      required: true,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'skillId',
      title: 'Skill',
      cssClass: 'item4',
      required: true,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'openPositions',
      title: '# Open Positions',
      cssClass: 'item5',
      required: true,
      type: FieldType.Input,
    },
    {
      field: 'duration',
      title: 'Duration',
      cssClass: 'item6',
      required: true,
      type: FieldType.Dropdown,
      dataSource: ORDER_DURATION_LIST,
    },
    {
      field: 'jobStartDate',
      title: 'Job Start Date',
      cssClass: 'item7',
      required: true,
      type: FieldType.Date,
    },
    {
      field: 'jobEndDate',
      title: 'Job End Date',
      cssClass: 'item8',
      required: true,
      type: FieldType.Date,
    },
    {
      field: 'shift',
      title: 'Shift Name',
      cssClass: 'item9',
      required: true,
      type: FieldType.Dropdown,
      dataSource: ORDER_MASTER_SHIFT_NAME_LIST,
    },
    {
      field: 'shiftStartTime',
      title: 'Shift Start Time',
      cssClass: 'item10',
      required: true,
      type: FieldType.Time,
    },
    {
      field: 'shiftEndTime',
      title: 'Shift End Time',
      cssClass: 'item11',
      required: true,
      type: FieldType.Time,
    },
  ],
};

export const GeneralInformationConfigPO: OrderFormsConfig  = {
  title: 'General Information',
  formName: 'generalInformationForm',
  cssClass: 'general-information-po-wrapper',
  fields: [
    {
      field: 'regionId',
      title: 'Region',
      required: true,
      cssClass: 'item1',
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'locationId',
      title: 'Location',
      required: true,
      cssClass: 'item2',
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'departmentId',
      title: 'Department',
      required: true,
      cssClass: 'item3',
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'skillId',
      title: 'Skill',
      required: true,
      cssClass: 'item4',
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'openPositions',
      title: '# Open Positions',
      required: true,
      cssClass: 'item5',
      type: FieldType.Input,
    },
    {
      field: 'jobDates',
      title: 'Job Date',
      required: true,
      cssClass: 'item6',
      type: FieldType.Calendar,
    },
    {
      field: 'shift',
      title: 'Shift Name',
      cssClass: 'item7',
      required: true,
      type: FieldType.Dropdown,
      dataSource: ORDER_MASTER_SHIFT_NAME_LIST,
    },
    {
      field: 'shiftStartTime',
      title: 'Shift Start Time',
      cssClass: 'item8',
      required: false,
      type: FieldType.Time,
    },
    {
      field: 'shiftEndTime',
      title: 'Shift End Time',
      cssClass: 'item9',
      required: false,
      type: FieldType.Time,
    },
  ],
};

export const JobDistributionConfigLTA: OrderFormsConfig  = {
  title: 'Job Distribution',
  formName: 'jobDistributionForm',
  cssClass: 'job-distribution-wrapper',
  fields: [
    {
      field: 'jobDistribution',
      title: 'Job Distribution',
      required: true,
      type: FieldType.MultiSelectDropdown,
      dataSource: IrpJobDistribution,
    },
    {
      field: 'agencyId',
      title: 'Agency',
      required: false,
      enabled: false,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'minYrsRequired',
      title: 'Min Years of Exp',
      required: true,
      type: FieldType.Input,
    },
    {
      field: 'hourlyRate',
      title: 'Hourly Rate',
      required: false,
      type: FieldType.Number,
    },
  ],
};

export const JobDistributionConfigPO: OrderFormsConfig = {
  title: 'Job Distribution',
  formName: 'jobDistributionForm',
  cssClass: 'job-distribution-wrapper',
  fields: [
    {
      field: 'jobDistribution',
      title: 'Job Distribution',
      required: true,
      type: FieldType.MultiSelectDropdown,
      dataSource: IrpJobDistribution,
    },
    {
      field: 'agencyId',
      title: 'Agency',
      required: false,
      enabled: false,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'billRate',
      title: 'Bill Rate',
      required: false,
      type: FieldType.Input,
    },
  ],
};

export const JobDescriptionConfig: OrderFormsConfig = {
  title: 'Job Description',
  formName: 'jobDescriptionForm',
  cssClass: 'job-description-wrapper',
  fields: [
    {
      field: 'orderRequisitionReasonId',
      title: 'Reason for Requisition',
      cssClass: 'itm1',
      required: true,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'classifications',
      title: 'Classification',
      cssClass: 'itm2',
      required: false,
      type: FieldType.MultiSelectDropdown,
      dataSource: JobClassifications,
    },
    {
      field: 'onCallRequired',
      title: 'On-Call',
      cssClass: 'itm3',
      required: false,
      type: FieldType.CheckBox,
    },
    {
      field: 'asapStart',
      title: 'ASAP Start',
      cssClass: 'itm3 order-box',
      required: false,
      type: FieldType.CheckBox,
    },
    {
      field: 'criticalOrder',
      title: 'Critical Order',
      cssClass: 'itm3 order-box1',
      required: false,
      type: FieldType.CheckBox,
    },
    {
      field: 'weekend',
      title: 'Weekend',
      cssClass: 'itm3 order-box2',
      required: false,
      type: FieldType.CheckBox,
    },
    {
      field: 'holiday',
      title: 'Holiday',
      cssClass: 'itm3 order-box3',
      required: false,
      type: FieldType.CheckBox,
    },
    {
      field: 'jobDescription',
      title: 'Job Description',
      cssClass: 'itm4',
      required: false,
      type: FieldType.TextArea,
    },
    {
      field: 'unitDescription',
      title: 'Unit Description',
      cssClass: 'itm5',
      required: false,
      type: FieldType.TextArea,
    },
  ],
};

export const SpecialConfigProject: OrderFormsConfig = {
  title: 'Special Project',
  formName: 'specialProjectForm',
  cssClass: 'special-project-wrapper',
  fields: [
    {
      field: 'projectTypeId',
      title: 'Special Project Category',
      required: false,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'projectNameId',
      title: 'Project Name',
      required: false,
      type: FieldType.Dropdown,
      dataSource: [],
    },
    {
      field: 'poNumberId',
      title: 'PO#',
      required: false,
      type: FieldType.Dropdown,
      dataSource: [],
    },
  ],
};

export const ContactDetailsForm = (): OrderFormInput[] => [
  {
    field: 'title',
    title: 'Title',
    required: true,
    type: FieldType.Dropdown,
    dataSource: ORDER_CONTACT_DETAIL_TITLES,
  },
  {
    field: 'editContact',
    cssClass: 'edit-button-container',
    icon: 'edit3',
    show: true,
    required: false,
    buttonType: ButtonType.Edit,
    type: FieldType.Button,
  },
  {
    field: 'name',
    title: 'Contact Person',
    required: true,
    type: FieldType.Input,
  },
  {
    field: 'mobilePhone',
    title: 'Mobile Phone',
    required: false,
    type: FieldType.Phone,
  },
  {
    field: 'email',
    title: 'Email',
    required: true,
    type: FieldType.Input,
  },
  {
    field: 'isPrimaryContact',
    title: 'Primary',
    show: false,
    required: false,
    type: FieldType.RadioButton,
  },
  {
    field: 'removeContact',
    cssClass: 'remove-button-container',
    icon: 'trash2',
    required: false,
    show: false,
    buttonType: ButtonType.RemoveContact,
    type: FieldType.Button,
  },
];

export const WorkLocationFrom = (stateSource?: AssociateAgency[]): OrderFormInput[] => [
  {
    field: 'address',
    title: 'Address',
    required: true,
    type: FieldType.Input,
  },
  {
    field: 'state',
    title: 'State',
    required: true,
    type: FieldType.Dropdown,
    dataSource: stateSource ?? [],
  },
  {
    field: 'city',
    title: 'City',
    required: true,
    type: FieldType.Input,
  },
  {
    field: 'zipCode',
    title: 'Zip Code',
    required: true,
    type: FieldType.Input,
  },
  {
    field: 'removeWork',
    cssClass: 'remove-button-container',
    icon: 'trash2',
    required: false,
    show: false,
    buttonType: ButtonType.RemoveWorkLocation,
    type: FieldType.Button,
  },
];

export const ContactDetailsConfig = (): OrderFormsArrayConfig[] => [
  {
    title: 'Contact Details',
    buttonText: 'Add Contact',
    formList: 'contactDetailsList',
    buttonType: ButtonType.addContact,
    forms: [
      ContactDetailsForm(),
    ],
  },
];

export const WorkLocationConfig = (): OrderFormsArrayConfig[] => [
  {
    title: 'Work Location',
    buttonText: 'Add More',
    formList: 'workLocationList',
    buttonType: ButtonType.addMore,
    forms: [
      WorkLocationFrom(),
    ],
  },
];

export const LongTermAssignmentConfig: OrderFormsConfig[] = [
  GeneralInformationConfigLTA,
  JobDistributionConfigLTA,
  JobDescriptionConfig,
];

export const perDiemConfig: OrderFormsConfig[] = [
  GeneralInformationConfigPO,
  JobDistributionConfigPO,
  JobDescriptionConfig,
  SpecialConfigProject,
];

