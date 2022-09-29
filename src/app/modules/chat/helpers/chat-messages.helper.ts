import { ChangeDetectorRef, Directive } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { ChatThreadClient } from '@azure/communication-chat';
import { Actions, ofActionDispatched, Store, ofActionCompleted } from '@ngxs/store';
import { filter, Subject, takeUntil, tap } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { Chat } from '../store/actions';

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
  ) {
    super();
  }

  protected watchForUpdate(): void {
    this.actions$
    .pipe(
      ofActionCompleted(Chat.UpdateMessages),
      filter(() => {
        const threadToUpdate = this.store.snapshot().chat.threadIdToUpdate as string;
        return !!threadToUpdate && !!this.threadId && threadToUpdate === this.threadId
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.updateMessages();
    });
  }

  protected updateMessages(): void {}

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
}
