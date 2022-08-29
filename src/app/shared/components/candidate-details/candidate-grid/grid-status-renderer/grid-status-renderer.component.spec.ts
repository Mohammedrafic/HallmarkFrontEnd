import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridStatusRendererComponent } from './grid-status-renderer.component';

describe('GridStatusRendererComponent', () => {
  let component: GridStatusRendererComponent;
  let fixture: ComponentFixture<GridStatusRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridStatusRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridStatusRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
