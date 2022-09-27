import {
  AfterViewChecked, ChangeDetectionStrategy, Component,
  ElementRef, OnInit, ViewChild
} from '@angular/core';

import { ChatClient, ChatThreadClient } from '@azure/communication-chat';
import { CommunicationUserKind, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { Select } from '@ngxs/store';
import {
  HtmlEditorService, ImageService, LinkService,
  RichTextEditorComponent
} from '@syncfusion/ej2-angular-richtexteditor';
import { debounceTime, Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { ChatMessagesHelper } from '../../helpers';
import { ChatThread, MessageRequestMeta, ReceivedChatMessage, SyncFusionActionBeginEvent } from '../../interfaces';
import { ChatModel } from '../../store';
import { Chat } from '../../store/actions';
import { ChatState } from '../../store/state/chat.state';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LinkService, ImageService, HtmlEditorService],
})
export class ChatRoomComponent extends ChatMessagesHelper implements OnInit, AfterViewChecked {
  @ViewChild('chatArea') chatArea: ElementRef;

  @ViewChild('textEditor') textEditor: RichTextEditorComponent;

  public currentThread: ChatThread | null;

  public messages: ReceivedChatMessage[];

  private userDisplayName: string;

  private chatThreadClient: ChatThreadClient | null;

  private readonly typingStream: Subject<void> = new Subject();

  @Select(ChatState.typingIndicator)
  private readonly typing$: Observable<TypingIndicatorReceivedEvent>;

  ngOnInit(): void {
    this.userDisplayName = this.store.snapshot().user.user.fullName;
    this.userIdentity = this.store.snapshot().chat.currentUserIdentity;

    this.initMessages();
    this.watchForUpdate();
    this.watchForInputTyping();
    this.watchForTypingIndicator();
    this.watchForReceiptsUpdate();
  }

  ngAfterViewChecked(): void {
    this.scrollBottom();
  }

  sendByCtrlEnterKeys(event: SyncFusionActionBeginEvent) {
    if (
      event && event.originalEvent instanceof KeyboardEvent
      && event.requestType === 'EnterAction' && event.originalEvent.ctrlKey
      ) {
        event.cancel = true;
        this.sendMessage();
    }

  }

  sendByButton(): void {
    this.sendMessage();
  }

  trackKeyPress(): void {
    this.typingStream.next();
  }

  trackById(idx: number, item: ReceivedChatMessage): string {
    return item.id;
  }

  protected override async updateMessages(): Promise<void> {
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
          readIndicator: false,
        };
        newMessages.push(msg);
      }
    }
    this.typingEvent = null;
    this.messages = newMessages.map((item) => ({ ...item })).reverse();

    this.checkForReceipt();
    this.updateReadReceipts();
    this.cd.markForCheck();

    if (this.chatArea) {
      this.scrollBottom();
    }
  }

  private initMessages(): void {
    this.setupChatClient();

    if (this.chatThreadClient) {
      this.updateMessages();
    }
  }

  private scrollBottom(): void {
    this.chatArea.nativeElement.scrollTop = this.chatArea.nativeElement.scrollHeight;
  }

  private async sendMessage(): Promise<void> {
    const textContent = this.textEditor.getText();
    
    if (!!textContent && this.chatThreadClient) {
      const meta = this.createMessageRequest();
  
      this.chatThreadClient.sendMessage(meta.req, meta.options);
      this.textEditor.value = '';
    } else if (!!textContent) {
      this.createThreadAndSend();
    }
  }

  private watchForInputTyping(): void {
    this.typingStream.asObservable()
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
      filter((event) => event.threadId === this.currentThread?.threadId
      && event.senderDisplayName !== this.userDisplayName),
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
        content: this.textEditor.getHtml(),
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
      const reqMeta = this.createMessageRequest();
      (this.chatThreadClient as ChatThreadClient).sendMessage(reqMeta.req, reqMeta.options);
      this.textEditor.value = '';
    });
  }

  /**
   * Update receipts after readReceiptReceived event was held in state or on messages init.
   */
  protected override async updateReadReceipts(): Promise<void> {
    const receiptsId = await this.getReceiptIds(this.chatThreadClient as ChatThreadClient);

    this.messages.forEach((message) => {
      if (message.isCurrentUser && receiptsId.includes(message.id)) {
        message.readIndicator = true;
      } else if (message.isCurrentUser) {
        message.readIndicator = false;
      }
    });
    this.cd.markForCheck();
  }

  /**
   * Check If read recipt should be sent. Receipt sent only if last message from was not found in receipts
   */
  private async checkForReceipt(): Promise<void> {
    const messagesFrom = this.messages.filter((message) => !message.isCurrentUser);
    const lastMessage = messagesFrom[messagesFrom.length - 1];
    const receiptsId = await this.getReceiptIds(this.chatThreadClient as ChatThreadClient);

    if (!receiptsId.includes(lastMessage.id)) {
      this.sendReceipt(lastMessage.id);
    }
  }

  private async sendReceipt(id: string): Promise<void> {
    await (this.chatThreadClient as ChatThreadClient).sendReadReceipt({ chatMessageId: id});
  }
}
