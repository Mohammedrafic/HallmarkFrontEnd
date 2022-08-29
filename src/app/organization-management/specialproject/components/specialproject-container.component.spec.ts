import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialProjectContainerComponent } from './specialproject-container.component';

describe('SpecialProjectContainerComponent', () => {
  let component: SpecialProjectContainerComponent;
  let fixture: ComponentFixture<SpecialProjectContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecialProjectContainerComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialProjectContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
