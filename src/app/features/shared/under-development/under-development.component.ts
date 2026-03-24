import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-under-development',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterLink],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen p-4 surface-ground">
      <p-card class="w-full md:w-30rem text-center shadow-4 border-round-xl">
        <div class="flex flex-column align-items-center gap-4 py-5">
          <div class="surface-100 border-circle p-4 flex align-items-center justify-content-center">
            <i class="pi pi-cog pi-spin text-6xl text-primary"></i>
          </div>
          <div class="flex flex-column gap-2">
            <h1 class="text-4xl font-bold text-900 m-0">Under Construction</h1>
            <p class="text-600 text-xl font-medium px-4">
              We're currently building the <span class="text-primary font-bold">{{ moduleName }}</span> module. 
              Stay tuned for amazing features coming soon!
            </p>
          </div>
          <button pButton label="Back to Dashboard" icon="pi pi-home" routerLink="/dashboard" class="p-button-outlined p-button-raised border-round-lg mt-2"></button>
        </div>
      </p-card>
    </div>
  `
})
export class UnderDevelopmentComponent {
  @Input() moduleName: string = 'this feature';
}
