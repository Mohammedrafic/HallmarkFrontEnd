import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ChatThread } from '../../interfaces';

@Component({
  selector: 'app-chat-contact',
  templateUrl: './chat-contact.component.html',
  styleUrls: ['./chat-contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContactComponent {
  @Input() participant: ChatThread;

  @Output() contactSelected: EventEmitter<string> = new EventEmitter();

  public selectContact(): void {
    this.contactSelected.emit(this.participant.userId);
  }
}
