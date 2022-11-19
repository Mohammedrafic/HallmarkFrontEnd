
export class GetAssignedSkillTree {
  static readonly type = '[skills] Get Assigned Skill Tree';
  constructor() { }
}

export class SaveAssignedSkillValue {
  static readonly type = '[skills] Save Assigned Skill Value';
  constructor(public payload: string[]) { }
}
