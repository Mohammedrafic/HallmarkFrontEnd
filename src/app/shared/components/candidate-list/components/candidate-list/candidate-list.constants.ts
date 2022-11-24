import { ControlTypes, ValueType } from '../../../../enums/control-types.enum';
import { CandidateStatusOptions } from '../../../../enums/status';
import { CandidateListFiltersColumn } from '../../types/candidate-list.model';

export const filterColumns: CandidateListFiltersColumn = {
  regionsNames: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'name',
  },
  skillsIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'masterSkillId',
  },
  profileStatuses: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: CandidateStatusOptions,
    valueField: 'name',
    valueId: 'id',
  },
  candidateName: { type: ControlTypes.Text, valueType: ValueType.Text },
};
