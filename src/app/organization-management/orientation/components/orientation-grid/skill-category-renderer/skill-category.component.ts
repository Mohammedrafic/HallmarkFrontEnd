import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';
import { ICellRendererParams } from '@ag-grid-community/core';
import { SkillCategory } from '@shared/models/skill-category.model';

@Component({
  selector: 'app-skill-category',
  templateUrl: './skill-category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillCategoryRendererComponent extends GridCellRenderer<SkillCategory & ICellRendererParams> implements OnInit {
  public skillCategories: string[] = [];

  public constructor() {
    super();
  }

  public ngOnInit(): void {
    this.skillCategories = this.params.data.skillCategories.map(({ name }: { name: string }) => name);
  }
}
