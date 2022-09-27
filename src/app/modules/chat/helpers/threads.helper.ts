import { ChatThreadItem } from '@azure/communication-chat';

import { ChatThread } from '../interfaces/chat-api.interface';

export class ThreadsHelper {
  static sortThreadsByLastMessage(threads: ChatThread[]): void {
    threads.sort((a, b) => {
      const aTime = a.lasMessageOn;
      const bTime = b.lasMessageOn;

      if (aTime < bTime) {
        return 1;
      }

      if (aTime > bTime) {
        return -1;
      }
      return 0;
    });
  }

  static addLastMessageDate(threads: ChatThread[], threadItems: ChatThreadItem[]): void {
    threads.forEach((thread) => {
      const threadItem = threadItems.find((item) => item.id === thread.threadId);
      thread.lasMessageOn = threadItem?.lastMessageReceivedOn as Date;
    });
  }
}