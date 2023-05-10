import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';
import { SkillTypeEnum } from '@client/candidates/departments/grid/cell-renderers/skill-match/skill-type.enum';
import { DepartmentAssigned } from '@client/candidates/departments/departments.model';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-skill-match',
  templateUrl: './skill-match.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillMatchComponent extends GridCellRenderer<DepartmentAssigned & ICellRendererParams> {
  public readonly skillTypeEnum: typeof SkillTypeEnum = SkillTypeEnum;

  public constructor() {
    super();
  }

  public get getTooltipMessage(): string {
    const messages: { [key: number]: string } = {
      [SkillTypeEnum.PrimarySkill]: 'Primary Skill',
      [SkillTypeEnum.SecondarySkill]: 'Secondary Skill',
      [SkillTypeEnum.PrimarySecondarySkill]: 'Primary and Secondary Skills'
    };
    return messages[this.params.data?.skillType] ?? '';
  }
}
