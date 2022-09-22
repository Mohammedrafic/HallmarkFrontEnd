import { ChangeDetectorRef, Directive, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { Chat } from '../store/actions';

@Directive()
export class ChatMessagesHelper extends Destroyable {
  public typingEvent: TypingIndicatorReceivedEvent | null = null;

  constructor(
    protected actions$: Actions,
    protected store: Store,
    protected cd: ChangeDetectorRef,
    protected fb: FormBuilder,
    protected renderer: Renderer2,
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
}
