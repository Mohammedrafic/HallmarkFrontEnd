import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';

@Component({
  selector: 'app-deploy-candidate-message',
  templateUrl: './deploy-candidate-message.component.html',
  styleUrls: ['./deploy-candidate-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeployCandidateMessageComponent {
  @Input() isAgency: boolean;
  @Input() candidateBasicInfo: DeployedCandidateOrderInfo[];
}
