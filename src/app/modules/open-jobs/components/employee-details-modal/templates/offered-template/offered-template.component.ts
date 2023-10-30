import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { OpenJob } from '@shared/models';

@Component({
  selector: 'app-offered-template',
  templateUrl: './offered-template.component.html',
  styleUrls: ['./offered-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferedTemplateComponent {
  @Input() selectedEmployeeDetails: OpenJob | null;
}
