import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-icon',
  templateUrl: './custom-icon.component.html',
  styleUrls: ['./custom-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomIconComponent {
  @Input() name: string;
  
}
