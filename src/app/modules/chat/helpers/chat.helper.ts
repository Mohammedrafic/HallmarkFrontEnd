import { ChatThread } from '../interfaces/chat-api.interface';

export class ChatHelper {
  static findThreads(threads: ChatThread[], textToSearch: string): ChatThread[] {
    return threads.filter((thread) => thread.displayName.toLowerCase()
    .includes(textToSearch.toLowerCase())
    || thread.businessUnitName.toLowerCase().includes(textToSearch.toLowerCase()));
  }
}
