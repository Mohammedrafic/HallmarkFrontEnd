import { SpecialProject } from "src/app/shared/models/special-project.model";

export class GetSpecialProjects {
  static readonly type = '[SpecialProject] Get SpecialProjects';
  constructor() { }
}

export class SaveSpecialProject {
  static readonly type = '[SpecialProject] Save Special Project';
  constructor(public specialProject: SpecialProject) {}
}

export class SaveSpecialProjectSucceeded {
  static readonly type = '[SpecialProject] Save Special Project Succeeded';
  constructor() {}
}

export class SetIsDirtySpecialProjectForm {
  static readonly type = '[SpecialProject] Set Is Dirty Special Project Form';
  constructor(public isDirtySpecialProjectForm: boolean) {}
}

export class DeletSpecialProject {
  static readonly type = '[SpecialProject] Delete SpecialProject';
  constructor(public id: number) {}
}

export class DeletSpecialProjectSucceeded {
  static readonly type = '[SpecialProject] Delete SpecialProject Succeeded';
  constructor() {}
}

export class GetProjectTypes {
  static readonly type = '[SpecialProject] Get Project Types';
  constructor() { }
}

export class GetSpecialProjectById {
  static readonly type = '[SpecialProject] Get SpecialProject by Id';
  constructor(public id: number) { }
}

