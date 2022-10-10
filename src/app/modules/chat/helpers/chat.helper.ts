import { ReceivedChatMessage } from '../interfaces';
import { ChatThread } from '../interfaces/chat-api.interface';

export class ChatHelper {
  static findThreads(threads: ChatThread[], textToSearch: string): ChatThread[] {
    return threads.filter((thread) => thread.displayName.toLowerCase()
    .includes(textToSearch.toLowerCase())
    || thread.businessUnitName.toLowerCase().includes(textToSearch.toLowerCase()));
  }

  static setReadIndicator(messages: ReceivedChatMessage[], receipts: string[]): void {
    if (messages && messages.length) {
      messages.forEach((message) => {
        if (message.isCurrentUser && receipts.includes(message.id)) {
          message.readIndicator = true;
        } else if (message.isCurrentUser) {
          message.readIndicator = false;
        }
      });
    }
  }

  static removeEmptyLines(inputHtml: string): string {
    return inputHtml.replace(/<p><br><\/p>/gi, '');
  }
}
