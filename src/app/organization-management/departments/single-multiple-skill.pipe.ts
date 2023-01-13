import { Pipe, PipeTransform } from '@angular/core';
import { Department } from '@shared/models/department.model';

type IdsModel = 'primarySkills' | 'secondarySkills';
type NamesModel = 'primarySkillNames' | 'secondarySkillNames';

@Pipe({
  name: 'singleMultipleSkill',
})
export class SingleMultipleSkillPipe implements PipeTransform {
  public transform(value: Department, ids: IdsModel, names: NamesModel): string | undefined {
    switch (value[ids]?.length) {
      case 0:
        return '';
      case 1:
        return value[names];
      default:
        return 'Multiple';
    }
  }
}
