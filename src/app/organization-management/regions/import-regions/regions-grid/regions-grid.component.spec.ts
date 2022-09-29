import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionsGridComponent } from './regions-grid.component';

describe('RegionsGridComponent', () => {
  let component: RegionsGridComponent;
  let fixture: ComponentFixture<RegionsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
