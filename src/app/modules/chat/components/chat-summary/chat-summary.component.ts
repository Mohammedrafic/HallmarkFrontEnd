import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output,
  SecurityContext } from '@angular/core';

import { ChatClient, ChatMessage, ChatThreadClient } from '@azure/communication-chat';
import { CommunicationUserKind } from '@azure/communication-signaling';

import { ChatMessagesHelper } from '../../helpers';
import { ChatThread, EnterChatEvent, ReceivedChatMessage } from '../../interfaces';

@Component({
  selector: 'app-chat-summary',
  templateUrl: './chat-summary.component.html',
  styleUrls: ['./chat-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSummaryComponent extends ChatMessagesHelper implements OnInit, OnChanges {
  @Input() thread: ChatThread;

  @Output() enterChat: EventEmitter<EnterChatEvent> = new EventEmitter();

  public lastMessage: ReceivedChatMessage | undefined;

  private chatThreadClient: ChatThreadClient;

  ngOnInit(): void {
    this.userIdentity = this.store.snapshot().chat.currentUserIdentity;

    this.setLastMessage();
    this.watchForUpdate();
  }

  ngOnChanges(): void {
    if (this.thread) {
      this.threadId = this.thread.threadId as string;
    }
  }

  enter(): void {
    this.enterChat.emit({
      id: this.thread.threadId as string,
      displayName: this.thread.displayName,
      businessUnitName: this.thread.businessUnitName,
    });
  }

  override async setLastMessage(): Promise<void> {
    const client = this.store.snapshot().chat.chatClient as ChatClient;
    this.chatThreadClient = client.getChatThreadClient(this.thread.threadId as string);
    const Parser = new DOMParser();

    const messages: ReceivedChatMessage[] = [];
    const iterableAsync = this.chatThreadClient.listMessages({ maxPageSize: 2 });
    
    iterableAsync.byPage().next()
    .then((iteratorResult) => {
      const result = (iteratorResult.value as ChatMessage[]).filter((message) => message.type === 'text');

      result.forEach((message) => {
        const msg: ReceivedChatMessage = {
          id: message.id,
          sender: message.senderDisplayName as string,
          message: message.content?.message as string,
          timestamp: message.createdOn,
          isCurrentUser: (message.sender as CommunicationUserKind)?.communicationUserId === this.userIdentity,
        };
        
        messages.push(msg);
      });

      if (messages.length) {
        this.lastMessage = messages[0];
        this.thread.lastMessage = messages[0];
        this.updateReadReceipts();
      }
    });
  }

  protected override async updateReadReceipts(): Promise<void> {
    if (this.lastMessage && !this.lastMessage?.isCurrentUser) {
      const receiptsId = await this.getReceiptIds(this.chatThreadClient);
      if (!receiptsId.includes(this.lastMessage?.id)) {
        this.lastMessage.readIndicator = true;
      }
    }

    this.cd.markForCheck();
  }
}
