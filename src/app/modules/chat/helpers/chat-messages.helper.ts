import { ChangeDetectorRef, Directive } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { Chat } from '../store/actions';
import { ChatThreadClient } from '@azure/communication-chat';

@Directive()
export class ChatMessagesHelper extends Destroyable {
  public typingEvent: TypingIndicatorReceivedEvent | null = null;

  protected userIdentity: string;

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
      ofActionDispatched(Chat.UpdateMessages),
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
      this.updateReadReceipts();
    });
  }

  protected updateReadReceipts(): void {}
}
