import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageReportComponent } from './page-report.component';

describe('PageReportComponent', () => {
  let component: PageReportComponent;
  let fixture: ComponentFixture<PageReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
