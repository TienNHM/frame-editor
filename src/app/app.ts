import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Header } from './components/header/header';
import { ImageUpload } from './components/image-upload/image-upload';
import { FrameGallery } from './components/frame-gallery/frame-gallery';
import { ImageEditor } from './components/image-editor/image-editor';
import { Frame } from './models/frame.model';

type AppStep = 'welcome' | 'upload' | 'frames' | 'editor';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonModule,
    Header,
    ImageUpload,
    FrameGallery,
    ImageEditor
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  currentStep: AppStep = 'welcome';
  selectedImage: string | null = null;
  selectedFrame: Frame | null = null;

  onCreateNew(): void {
    this.startCreating();
  }

  startCreating(): void {
    this.currentStep = 'upload';
  }

  viewFrames(): void {
    this.currentStep = 'frames';
  }

  onImageSelected(imageUrl: string): void {
    this.selectedImage = imageUrl;
    this.currentStep = 'frames';
  }

  onFrameSelected(frame: Frame): void {
    this.selectedFrame = frame;
    this.currentStep = 'editor';
  }

  skipFrameSelection(): void {
    this.currentStep = 'editor';
  }

  goBack(): void {
    switch (this.currentStep) {
      case 'upload':
        this.currentStep = 'welcome';
        break;
      case 'frames':
        this.currentStep = 'upload';
        break;
      case 'editor':
        this.currentStep = 'frames';
        break;
      default:
        this.currentStep = 'welcome';
    }
  }

  restart(): void {
    this.currentStep = 'welcome';
    this.selectedImage = null;
    this.selectedFrame = null;
  }
}
