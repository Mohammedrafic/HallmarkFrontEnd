import { RegionMapping } from '@shared/models/region.model';
import { LocationMapping } from '@shared/models/location.model';
import { DepartmentMapping } from '@shared/models/department.model';
import { CredentialSkillGroupMapping } from '@shared/models/skill-group.model';

// TODO: can be changed after BE implementation
export class CredentialGroupMapping {
  id?: number;
  region: RegionMapping;
  location: LocationMapping;
  department: DepartmentMapping;
  skillGroup: CredentialSkillGroupMapping;
}
