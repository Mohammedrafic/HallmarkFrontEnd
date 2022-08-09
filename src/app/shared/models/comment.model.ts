export class Comment {
  id: number;
  text: string;
  isExternal: boolean;
  commentContainerId?: number; // TODO: make required
  creationDate: Date;
  new?: boolean;
  unread?: boolean;
}
  