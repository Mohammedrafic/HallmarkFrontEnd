import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Store } from '@ngxs/store';

import { ChatThread, EnterChatEvent } from '../../interfaces';
import { ChatState } from '../../store/state/chat.state';

@Component({
  selector: 'app-chat-contact',
  templateUrl: './chat-contact.component.html',
  styleUrls: ['./chat-contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContactComponent {
  @Input() participant: ChatThread;

  @Output() contactSelected: EventEmitter<ChatThread> = new EventEmitter();

  @Output() existingThreadSelected: EventEmitter<EnterChatEvent> = new EventEmitter();

  constructor(
    private store: Store,
  ) {}

  public selectContact(): void {
    const threads = this.store.selectSnapshot(ChatState.activeThreads);
    const threadExist = threads.find((thread) => thread.userId === this.participant.userId);

    if (threadExist) {
      this.existingThreadSelected.emit({
        id: threadExist.threadId as string,
        displayName: threadExist.displayName,
        businessUnitName: threadExist.businessUnitName,
      });
    } else {
      this.contactSelected.emit(this.participant);
    }
  }
}
