import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Skill } from '@shared/models/skill.model';

@Component({
  selector: 'app-skill-name',
  templateUrl: './skill-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillNameRendererComponent extends GridCellRenderer<Skill & ICellRendererParams> implements OnInit {
  public skills: string[] = [];

  public constructor() {
    super();
  }

  public ngOnInit(): void {
    const configurationSkills = this.params.data.orientationConfigurationSkills || this.params.data.historicalOrientationConfigurationSkills;
    this.skills = configurationSkills.map(({ skillName }: { skillName: string }) => skillName);
  }
}
