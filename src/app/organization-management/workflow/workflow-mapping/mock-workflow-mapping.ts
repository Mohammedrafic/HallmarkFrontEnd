import { StepMapping, WorkflowMappingGet, WorkflowMappingPage, WorkflowSkill } from '@shared/models/workflow-mapping.model';

export const MockSkills: WorkflowSkill = {
  skillId: 0,
  skillDescription: 'Test Skill desc'
}

export const MockStepMapping: StepMapping[] = [
  {
    workflowStepId: 107,
    workflowType: 1,
    userId: "877401f2-121a-4de3-8047-0871fbde8c6c"
  },
  {
    workflowStepId: 108,
    workflowType: 1,
    roleId: 14
  },
  {
    workflowStepId: 121,
    workflowType: 1,
    userId: "877401f2-121a-4de3-8047-0871fbde8c6c"
  },
  {
    workflowStepId: 109,
    workflowType: 2,
    roleId: 3
  },
  {
    workflowStepId: 110,
    workflowType: 2,
    roleId: 14,
  }
]

export const MockWorkflowMapping: WorkflowMappingGet = {
  mappingId: 1,
  workflowName: "Brand New",
  workflowGroupId: 1,
  regionId: 10,
  regionName: "Re g1",
  locationId: 20,
  locationName: "Location 1",
  departmentId: 21,
  departmentName: "name",
  hasUnassignedSteps: true,
  skills: [MockSkills],
  stepMappings: MockStepMapping
}

export const MockWorkflowMappingPages: WorkflowMappingPage = {
  items: [MockWorkflowMapping],
  totalPages: 1,
  pageNumber: 1,
  totalCount: 1,
  hasPreviousPage: false,
  hasNextPage: false
}
