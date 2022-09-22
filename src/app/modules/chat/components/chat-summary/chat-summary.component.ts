import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output,
  SecurityContext } from '@angular/core';

import { ChatClient } from '@azure/communication-chat';

import { ChatMessagesHelper } from '../../helpers';
import { ChatThread, EnterChatEvent, ReceivedChatMessage } from '../../interfaces';

@Component({
  selector: 'app-chat-summary',
  templateUrl: './chat-summary.component.html',
  styleUrls: ['./chat-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSummaryComponent extends ChatMessagesHelper implements OnInit {
  @Input() thread: ChatThread;

  @Output() enterChat: EventEmitter<EnterChatEvent> = new EventEmitter();

  public lastMessage: ReceivedChatMessage | undefined;

  ngOnInit(): void {
    this.updateMessages();
    this.watchForUpdate();
  }

  enter(): void {
    this.enterChat.emit({
      id: this.thread.threadId as string,
      displayName: this.thread.displayName,
    });
  }

  override async updateMessages(): Promise<void> {
    const client = this.store.snapshot().chat.chatClient as ChatClient;
    const chatThreadClient = client.getChatThreadClient(this.thread.threadId as string);
    const Parser = new DOMParser();

    const messages: ReceivedChatMessage[] = [];
    const iterableAsync = chatThreadClient.listMessages();
    
    for await (const message of iterableAsync) {
      if (message.type === 'text') {
  
        const msg: ReceivedChatMessage = {
          id: message.id,
          sender: message.senderDisplayName as string,
          message: message.content?.message as string,
          timestamp: message.createdOn,
          isCurrentUser: false,
        };
        messages.push(msg);
      }
    }

    this.lastMessage = messages[0];
    this.thread.lastMessage = messages[0];
    const html = Parser.parseFromString(
      this.sanitizer.sanitize(SecurityContext.HTML, this.lastMessage.message) as string,
      'text/html',
    ).body;

    this.lastMessage.message = html.textContent as string;
    this.cd.markForCheck();
  }
}
