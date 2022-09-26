import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicFormComponent } from './electronic-form.component';

describe('ElectronicFormComponent', () => {
  let component: ElectronicFormComponent;
  let fixture: ComponentFixture<ElectronicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectronicFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectronicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
