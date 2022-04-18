export class ClientSidebarMenu {
  title: string;
  route: string;
  icon: string;
  count?: number;
  children?: ClientSidebarMenu[];
  isActive?: boolean = false;
}
