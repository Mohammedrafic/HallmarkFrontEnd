import { SaveSpecialProjectMappingDto, SpecialProjectMapping, SpecialProjectMappingFilters } from "src/app/shared/models/special-project-mapping.model";

export class GetSpecialProjectMappings {
  static readonly type = '[SpecialProjectMappings] Get special project mappings';
  constructor(public filter: SpecialProjectMappingFilters) { }
}

export class SaveSpecialProjectMapping {
  static readonly type = '[SpecialProjectMappings] Save special project mapping';
  constructor(public specialProjectMapping: SaveSpecialProjectMappingDto) { }
}

export class SaveSpecialProjectMappingSucceeded {
  static readonly type = '[SpecialProjectMappings] Save special project mapping succeeded';
  constructor() { }
}

export class SetIsDirtySpecialProjectMappingForm {
  static readonly type = '[SpecialProjectMappings] Set is dirty special project mapping Form';
  constructor(public isDirtySpecialProjectMappingForm: boolean) { }
}

export class DeletSpecialProjectMapping {
  static readonly type = '[SpecialProjectMappings] Delete special project mapping';
  constructor(public id: number) { }
}

export class DeletSpecialProjectMappingSucceeded {
  static readonly type = '[SpecialProjectMappings] delete special project mapping succeeded';
  constructor() { }
}

export class GetProjectNamesByTypeId {
  static readonly type = '[SpecialProjectMappings] Get project names by type id';
  constructor(public typeId: number) { }
}

export class GetSpecialProjectMappingById {
  static readonly type = '[SpecialProjectMappings] Get special project mapping by id';
  constructor(public id: number) { }
}

export class ShowConfirmationPopUp {
  static readonly type = '[SpecialProjectMappings] Save/Update special project mapping Failed';
  constructor() { }
}

