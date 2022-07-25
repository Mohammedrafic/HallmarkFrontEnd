import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailRowCellRenderer } from './detail-cell-render.component';

describe('StatusTextCellRenderer', () => {
  let component: DetailRowCellRenderer;
  let fixture: ComponentFixture<DetailRowCellRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailRowCellRenderer ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailRowCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
