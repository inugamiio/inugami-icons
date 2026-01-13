import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InugamiIcon } from './inugami-icons';

describe('InugamiIcon', () => {
  let component: InugamiNg;
  let fixture: ComponentFixture<InugamiNg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InugamiIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InugamiIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
