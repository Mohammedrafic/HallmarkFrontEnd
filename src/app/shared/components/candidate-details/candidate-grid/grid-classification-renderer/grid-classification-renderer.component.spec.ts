import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridClassificationRendererComponent } from './grid-classification-renderer.component';

describe('GridClassificationRendererComponent', () => {
  let component: GridClassificationRendererComponent;
  let fixture: ComponentFixture<GridClassificationRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridClassificationRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridClassificationRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
