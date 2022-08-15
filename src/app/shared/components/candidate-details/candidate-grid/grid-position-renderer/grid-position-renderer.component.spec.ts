import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridPositionRendererComponent } from './grid-position-renderer.component';

describe('GridPositionRendererComponent', () => {
  let component: GridPositionRendererComponent;
  let fixture: ComponentFixture<GridPositionRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridPositionRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridPositionRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
