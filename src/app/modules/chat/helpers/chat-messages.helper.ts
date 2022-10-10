import { ChangeDetectorRef, Directive } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ChatMessageReceivedEvent, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { ChatThreadClient } from '@azure/communication-chat';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { filter, Subject, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { Chat } from '../store/actions';
import { ChatMediatorService } from '../services';

@Directive()
export class ChatMessagesHelper extends Destroyable {
  public typingEvent: TypingIndicatorReceivedEvent | null = null;

  protected userIdentity: string;

  protected threadId: string;

  protected readonly receiptStream$: Subject<void> = new Subject();

  protected readonly checkReceiptsStream$: Subject<void> = new Subject();

  constructor(
    protected actions$: Actions,
    protected store: Store,
    protected cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer,
    private mediatorSevice: ChatMediatorService,
  ) {
    super();
  }

  protected watchForUpdate(): void {
    this.mediatorSevice.getMessageMediatorStream()
    .pipe(
      filter((event) => !!event && !!this.threadId && event.threadId === this.threadId),
      takeUntil(this.componentDestroy()),
    ).subscribe((event) => {
      this.setLastMessage(event);
    });
  }

  protected async getReceiptIds(chatClient: ChatThreadClient): Promise<string[]> {
    const asyncReceipts = chatClient.listReadReceipts();
    const receiptsId: string[] = [];

    for await (const receipt of asyncReceipts) {
      receiptsId.push(receipt.chatMessageId);
    }

    return receiptsId;
  }

  protected watchForReceiptsUpdate(): void {
    this.actions$.pipe(
      ofActionDispatched(Chat.UpdateReceipts),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.receiptStream$.next();
    });
  }

  protected updateReadReceipts(): void {}

  protected setLastMessage(messageEvent: ChatMessageReceivedEvent): void {}
}
