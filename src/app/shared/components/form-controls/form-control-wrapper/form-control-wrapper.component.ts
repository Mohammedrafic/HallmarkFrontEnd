import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-control-wrapper',
  templateUrl: './form-control-wrapper.component.html',
  styleUrls: ['./form-control-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlWrapperComponent {
  @Input() public id: string;
  @Input() public label: string;
  @Input() public required: boolean;
}
