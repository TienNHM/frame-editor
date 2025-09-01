import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Output() createNewClicked = new EventEmitter<void>();
  
  showMobileMenu = false;

  onCreateNew(): void {
    this.createNewClicked.emit();
  }

  onLogin(): void {
    // Implement login logic
    console.log('Login clicked');
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
