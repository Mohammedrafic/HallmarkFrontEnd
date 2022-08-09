export class Comment {
  id: number;
  text: string;
  isExternal: boolean;
  creationDate: Date;
  new?: boolean;
  unread?: boolean;
}
  