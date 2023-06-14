import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-eligibility-message',
  templateUrl: './eligibility-message.component.html',
  styleUrls: ['./eligibility-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EligibilityMessageComponent {
  @Input() message: string | null | undefined = null;
}
