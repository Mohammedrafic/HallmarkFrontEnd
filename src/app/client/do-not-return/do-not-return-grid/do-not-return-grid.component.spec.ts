import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoNotReturnGridComponent } from './do-not-return-grid.component';

describe('DoNotReturnGridComponent', () => {
  let component: DoNotReturnGridComponent;
  let fixture: ComponentFixture<DoNotReturnGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoNotReturnGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoNotReturnGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
