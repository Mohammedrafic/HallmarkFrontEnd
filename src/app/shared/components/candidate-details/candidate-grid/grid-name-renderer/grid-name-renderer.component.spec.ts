import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridNameRendererComponent } from './grid-name-renderer.component';

describe('GridNameRendererComponent', () => {
  let component: GridNameRendererComponent;
  let fixture: ComponentFixture<GridNameRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridNameRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridNameRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
