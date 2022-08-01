export interface AllOrganizationsSkill {
  id: number
  businessUnitId: number
  skillCategory: SkillCategory
  skillAbbr: string
  skillDescription: string
  isDefault: boolean
}

export interface SkillCategory {
  id: number
  name: string
}
