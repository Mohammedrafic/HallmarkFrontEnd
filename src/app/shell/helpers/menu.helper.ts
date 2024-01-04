import { ChildMenuItem, MenuItem } from '@shared/models/menu.model';

const getItemRoute = (route: string): string => {
  return route.startsWith('/') ? route : '/' + route;
};

const getCurrentRoute = (route: string): string => {
  const routeSegments = route.split('/');
  if (routeSegments.length > 3) {
    routeSegments.pop();
    return routeSegments.join('/');
  }
  return route;
};

const isCurrentRoute = (term: string, route = ''): boolean => {
  return getItemRoute(route) === getCurrentRoute(term);
};

export const findItemInArrayTree = (
  arr: MenuItem[] | ChildMenuItem[], term: string
): MenuItem | ChildMenuItem | undefined => {
  return arr.find((item) => {
    if (!item.children?.length) {
      return isCurrentRoute(term, item.route);
    } else {
      return findItemInArrayTree(item.children, term);
    }
  });
};
