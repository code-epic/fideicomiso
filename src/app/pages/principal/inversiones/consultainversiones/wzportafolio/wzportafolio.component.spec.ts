import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WzportafolioComponent } from './wzportafolio.component';

describe('WzportafolioComponent', () => {
  let component: WzportafolioComponent;
  let fixture: ComponentFixture<WzportafolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WzportafolioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WzportafolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
