import {
  AfterViewChecked, ChangeDetectionStrategy, Component,
  ElementRef, OnInit, ViewChild
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { ChatClient, ChatMessageReadReceipt, ChatThreadClient } from '@azure/communication-chat';
import { CommunicationUserKind, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { Select } from '@ngxs/store';
import { Observable, debounceTime } from 'rxjs';
import { filter, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { ChatMessagesHelper } from '../../helpers';
import { ChatThread, MessageRequestMeta, ReceivedChatMessage } from '../../interfaces';
import { ChatModel } from '../../store';
import { Chat } from '../../store/actions';
import { ChatState } from '../../store/state/chat.state';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatRoomComponent extends ChatMessagesHelper implements OnInit, AfterViewChecked {
  @ViewChild('chatArea') chatArea: ElementRef;

  public currentThread: ChatThread | null;

  public messages: ReceivedChatMessage[];

  public chatform: FormGroup;

  private chatThreadClient: ChatThreadClient | null;

  private userDisplayName: string;

  private userIdentity: string;

  @Select(ChatState.typingIndicator)
  private readonly typing$: Observable<TypingIndicatorReceivedEvent>;

  ngOnInit(): void {
    // TODO: move form creation to service
    this.chatform = this.fb.group({
      chatMessage: [null, [Validators.maxLength(1500)]],
    });

    this.userDisplayName = this.store.snapshot().user.user.fullName;
    this.userIdentity = this.store.snapshot().chat.currentUserIdentity;

    this.initMessages();
    this.watchForUpdate();
    this.watchForInputTyping();
    this.watchForTypingIndicator();
  }

  ngAfterViewChecked(): void {
    this.scrollBottom();
  }

  sendByButton(): void {
    this.sendMessage();
  }

  sendBykeyPress(event: Event): void {
    if ((event as KeyboardEvent).ctrlKey) {
      this.sendMessage();
    }
  }

  override async updateMessages(): Promise<void> {
    const newMessages: ReceivedChatMessage[] = [];
    const iterableAsync = (this.chatThreadClient as ChatThreadClient).listMessages();
    
    for await (const message of iterableAsync) {
      if (message.type === 'text') {
        const msg: ReceivedChatMessage = {
          id: message.id,
          sender: message.senderDisplayName as string,
          message: message.content?.message as string,
          timestamp: message.createdOn,
          isCurrentUser: (message.sender as CommunicationUserKind)?.communicationUserId === this.userIdentity,
        };
        newMessages.push(msg);
      }
    }
    this.typingEvent = null;
    this.messages = newMessages.map((item) => ({ ...item })).reverse();

    // this.checkReadReceipts();
    this.cd.markForCheck();

    if (this.chatArea) {
      this.scrollBottom();
    }
  }

  trackById(idx: number, item: ReceivedChatMessage): string {
    return item.id;
  }

  private initMessages(): void {
    this.setupChatClient();

    if (this.chatThreadClient) {
      this.updateMessages();
    }
  }

  private async checkReadReceipts(): Promise<void> {
    const asyncReceipts = (this.chatThreadClient as ChatThreadClient).listReadReceipts();
    const receipts: ChatMessageReadReceipt[] = [];

    const messageIds = this.messages.filter((message) => !message.isCurrentUser)
    .map((message) => {
      return message.id;
    });

    for await (const receipt of asyncReceipts) {
      console.log(receipt)
      receipts.push(receipt);
    }

    const idsToSend: string[] = [];
    
    messageIds.forEach((id) => {
      if (!receipts.some((receipt) => receipt.chatMessageId === id)) {
        idsToSend.push(id);
      }
    });

    // if (idsToSend.length) {
    //   for (const id of idsToSend) {
    //     await (this.chatThreadClient as ChatThreadClient).sendReadReceipt({ chatMessageId: id});
    //   }
    // }

    const receiptIds = receipts.map((receipt) => receipt.chatMessageId);

    this.messages = this.messages.map((message) => {
      if (receiptIds.includes(message.id)) {
        return {
          ...message,
          isRead: true,
        }
      }
      return {
        ...message,
        isRead: false,
      }
    });
  }

  private scrollBottom(): void {
    this.chatArea.nativeElement.scrollTop = this.chatArea.nativeElement.scrollHeight;
  }

  private async sendMessage(): Promise<void> {
    const message = this.chatform.get('chatMessage')?.value;

    if (message && this.chatThreadClient) {
      const meta = this.createMessageRequest();
  
      this.chatThreadClient.sendMessage(meta.req, meta.options);
      this.chatform.get('chatMessage')?.reset();
    } else if (message) {
      this.createThreadAndSend();
    }
  }

  private watchForInputTyping(): void {
    this.chatform.get('chatMessage')?.valueChanges
    .pipe(
      filter(() => !!this.chatThreadClient),
      throttleTime(4000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      (this.chatThreadClient as ChatThreadClient).sendTypingNotification({ senderDisplayName: this.userDisplayName });
    });
  }

  private watchForTypingIndicator(): void {
    this.typing$
    .pipe(
      filter(Boolean),
      filter((event) => event.threadId === this.currentThread?.threadId),
      filter((event) => event.senderDisplayName !== this.userDisplayName),
      tap((event) => {
        this.typingEvent = event;
        this.cd.markForCheck();
      }),
      debounceTime(10000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.typingEvent = null;
      this.cd.markForCheck();
    });
  }

  private setupChatClient(): void {
    const client = (this.store.snapshot().chat as ChatModel).chatClient as ChatClient;
    this.currentThread = (this.store.snapshot().chat as ChatModel).currentChatRoomData;

    

    this.chatThreadClient = this.currentThread ? client.getChatThreadClient(this.currentThread?.threadId as string)
    : null;
  }

  private createMessageRequest(): MessageRequestMeta {
    return {
      options: {
        senderDisplayName: this.userDisplayName,
        type: 'text',
      },
      req: {
        content: this.chatform.get('chatMessage')?.value,
      },
    };
  }

  private createThreadAndSend(): void {
    const userId = this.store.selectSnapshot(ChatState.userToStart) as string;

    this.store.dispatch(new Chat.CreateChatThread(userId))
    .pipe(
      tap(() => { this.setupChatClient(); }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      const meta = this.createMessageRequest();
      (this.chatThreadClient as ChatThreadClient).sendMessage(meta.req, meta.options);
      this.chatform.get('chatMessage')?.reset();
    });
  }
}
