export interface PagerChangeEventModel {
  currentPage: number;
  newProp: PagerState;
  oldProp: PagerState;
  cancel: boolean;
  name: 'click';
}

interface PagerState {
  currentPage: number;
  totalRecordsCount?: number;
}
