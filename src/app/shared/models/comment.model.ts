export class Comment {
  id: number;
  text: string;
  isExternal: boolean;
  commentContainerId: number;
  creationDate: Date;
  new?: boolean;
  isRead?: boolean;
}
  