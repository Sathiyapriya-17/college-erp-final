import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule],
  template: `
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'college-erp-web';
}
