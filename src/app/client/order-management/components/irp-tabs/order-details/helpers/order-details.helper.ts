import { RejectReason } from '@shared/models/reject-reason.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { Department } from '@shared/models/department.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import {
  DataSourceContainer, JobDistribution,
  OrderFormInput,
  SpecialProjectStructure,
  StateList,
} from '@client/order-management/interfaces';
import { IrpJobDistribution, IrpTiersLogic } from '@client/order-management/components/irp-tabs/order-details/constants';
import { Order } from '@shared/models/order-management.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { FieldType } from '@core/enums';

export const setDataSource = (fields: OrderFormInput[], fieldName: string, source: DataSourceContainer): void => {
  fields.forEach((fields: OrderFormInput) => {
    if( fields.field === fieldName) {
      fields.dataSource = source;
    }
  });
};

export const changeTypeField = (config: OrderFormInput[], field: string, fieldType: FieldType) => {
  config.forEach((item: OrderFormInput) => {
    if(item.field === field) {
      item.type = fieldType;
    }
  });
};

export const mapDepartmentStructure = (departments: Department[]): Department[] => {
  return departments.map((department: Department) => ({
    ...department,
    id: department.departmentId,
    name: department.departmentName,
  }));
};


export const mapReasonsStructure = (reasons: RejectReason[]): RejectReason[] => {
  return reasons.map((reason: RejectReason) => ({
    ...reason,
    name: reason.reason,
  }));
};

export const mapStatesStructure = (states: StateList[]): StateList[] => {
  return states.map((state: StateList) => ({
    id: state.keyCode,
    name: state.title,
  }) as StateList);
};

export const mapAssociateAgencyStructure = (associateAgency: AssociateAgency[]): AssociateAgency[] => {
  return associateAgency.map((associate: AssociateAgency) => ({
    ...associate,
    id: associate.agencyId,
    name: associate.agencyName,
  }));
};

export const mapSpecialProjectStructure = (data: ProjectSpecialData): SpecialProjectStructure => {
  return {
    poNumbers: mapSpecialProjectDataToCorrectFormat(data.poNumbers, 'poNumber'),
    projectNames: mapSpecialProjectDataToCorrectFormat(data.projectNames, 'projectName'),
    specialProjectCategories: mapSpecialProjectDataToCorrectFormat(data.specialProjectCategories, 'projectType'),
  };
};

const mapSpecialProjectDataToCorrectFormat =
  <T extends { id: number}, U extends keyof T>(list: T[], key: U) => {
  return list.map((itm: T) => ({
    id: itm.id,
    name: itm[key],
  }));
};

export const getDistributionSource = (isSelect: boolean) => {
  return isSelect ? [...IrpJobDistribution,...IrpTiersLogic] : IrpJobDistribution;
};

export const mapStructureToEditedOrder = (selectedOrder: Order) => {
  return {
    ...selectedOrder,
    ...modifyJobDistribution(selectedOrder),
    ...selectedOrder.irpOrderMetadata,
  };
};


export const modifyJobDistribution = (selectedOrder: Order) => {
  return selectedOrder.jobDistributions.reduce((acc: JobDistribution, distribution: JobDistributionModel) => {
    return {
      jobDistributionValue: [...acc.jobDistributionValue, distribution.jobDistributionOption],
      agencyId: distribution.agencyId,
    };
  }, { jobDistributionValue: [], agencyId: null });
};
