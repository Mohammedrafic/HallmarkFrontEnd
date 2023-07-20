import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import { SystemFlags, WorkflowTabName, WorkflowTypeList } from '@organization-management/workflow/interfaces';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

export const WorkflowTabNames: WorkflowTabName = {
  vmsWorkflow: 'VMS Order Workflow',
  irpWorkflow: 'IRP Order Workflow',
  mapping: 'Workflow Mapping',
};

export const IrpWorkflowType: WorkflowTypeList = {
  id: WorkflowGroupType.IRPOrderWorkflow,
  text: WorkflowTabNames.irpWorkflow,
};

export const VmsWorkflowType: WorkflowTypeList = {
  id: WorkflowGroupType.VMSOrderWorkflow,
  text: WorkflowTabNames.vmsWorkflow,
};

export const CreateWorkflowTypeList = (irpFlag: boolean, systemFlags: SystemFlags): WorkflowTypeList[] => {
  const workflowType = [];

  if (irpFlag && systemFlags.isIRPEnabled) {
    workflowType.push(IrpWorkflowType);
  }

  if (systemFlags.isVMCEnabled) {
    workflowType.push(VmsWorkflowType);
  }

  return workflowType;
};

export const FiltersColumnsConfig = {
  regionIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  locationIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  departmentsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  skillIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'skillDescription',
    valueId: 'id',
  },
  types: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  names: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [], valueField: 'name' },
};
