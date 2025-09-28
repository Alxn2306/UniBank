import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenteLayout } from './gerente-layout';

describe('GerenteLayout', () => {
  let component: GerenteLayout;
  let fixture: ComponentFixture<GerenteLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenteLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenteLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
