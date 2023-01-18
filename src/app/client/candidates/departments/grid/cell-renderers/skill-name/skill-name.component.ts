import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';
import { DepartmentAssigned } from '@client/candidates/departments/departments.model';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-skill-name',
  templateUrl: './skill-name.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillNameComponent extends GridCellRenderer<DepartmentAssigned & ICellRendererParams> implements OnInit {
  public skills: string[] = [];

  public constructor() {
    super();
  }

  public ngOnInit(): void {
    this.skills = this.params.data.skills.map(({ name }: { name: string }) => name);
  }
}
