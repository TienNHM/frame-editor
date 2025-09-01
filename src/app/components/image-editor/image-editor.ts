import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Tabs, TabPanel } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { Slider } from 'primeng/slider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { EditorService } from '../../services/editor.service';
import { EditorState, ExportOptions } from '../../models/editor.model';
import { Frame } from '../../models/frame.model';

interface FormatOption {
  label: string;
  value: 'png' | 'jpg' | 'webp';
}

@Component({
  selector: 'app-image-editor',
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    Tabs, 
    TabPanel,
    Select, 
    Slider, 
    RadioButtonModule, 
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './image-editor.html',
  styleUrl: './image-editor.scss'
})
export class ImageEditor implements AfterViewInit, OnDestroy {
  @ViewChild('editorCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() uploadedImage: string | null = null;
  @Input() selectedFrame: Frame | null = null;

  editorState: EditorState = {
    canvasWidth: 800,
    canvasHeight: 800,
    zoom: 1,
    rotation: 0,
    isEditing: false,
    isDirty: false
  };

  isProcessing = false;
  canvasWidth = 800;
  canvasHeight = 800;

  // Export options
  exportOptions: ExportOptions = {
    format: 'png',
    quality: 0.9
  };

  sizeOption = 'original';
  customWidth = 800;
  customHeight = 800;

  formatOptions: FormatOption[] = [
    { label: 'PNG (Nền trong suốt)', value: 'png' },
    { label: 'JPG (Nền trắng)', value: 'jpg' },
    { label: 'WebP (Tối ưu)', value: 'webp' }
  ];

  constructor(private editorService: EditorService) {}

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeEditor(): void {
    if (this.canvasRef?.nativeElement) {
      this.editorService.initializeCanvas(this.canvasRef.nativeElement);
      
      // Subscribe to editor state changes
      this.editorService.editorState$.subscribe(state => {
        this.editorState = state;
      });

      // Load initial image and frame if provided
      this.loadInitialContent();
    }
  }

  private async loadInitialContent(): Promise<void> {
    try {
      this.isProcessing = true;

      // Load uploaded image first
      if (this.uploadedImage) {
        await this.editorService.addImageToCanvas(this.uploadedImage);
      }

      // Then load frame on top
      if (this.selectedFrame) {
        await this.editorService.addFrameToCanvas(this.selectedFrame.imageUrl);
      }
    } catch (error) {
      console.error('Error loading initial content:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async addImage(imageUrl: string): Promise<void> {
    try {
      this.isProcessing = true;
      await this.editorService.addImageToCanvas(imageUrl);
    } catch (error) {
      console.error('Error adding image:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async addFrame(frame: Frame): Promise<void> {
    try {
      this.isProcessing = true;
      await this.editorService.addFrameToCanvas(frame.imageUrl);
    } catch (error) {
      console.error('Error adding frame:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Transform operations
  rotateImage(angle: number): void {
    this.editorService.rotateSelectedObject(angle);
  }

  flipImage(direction: 'horizontal' | 'vertical'): void {
    this.editorService.flipSelectedObject(direction);
  }

  moveObject(deltaX: number, deltaY: number): void {
    const canvas = this.editorService.getCanvas();
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        left: (activeObject.left || 0) + deltaX,
        top: (activeObject.top || 0) + deltaY
      });
      canvas.renderAll();
    }
  }

  centerObject(): void {
    const canvas = this.editorService.getCanvas();
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2
      });
      canvas.renderAll();
    }
  }

  // Zoom operations
  zoomIn(): void {
    const newZoom = Math.min(this.editorState.zoom + 0.1, 3);
    this.editorService.zoomCanvas(newZoom);
  }

  zoomOut(): void {
    const newZoom = Math.max(this.editorState.zoom - 0.1, 0.1);
    this.editorService.zoomCanvas(newZoom);
  }

  // Editor operations
  resetEditor(): void {
    this.editorService.resetCanvas();
    this.loadInitialContent();
  }

  canDownload(): boolean {
    return this.editorState.uploadedImage !== undefined || this.editorState.selectedFrame !== undefined;
  }

  downloadImage(): void {
    if (!this.canDownload()) return;

    const options: ExportOptions = {
      format: this.exportOptions.format,
      quality: this.exportOptions.quality
    };

    if (this.sizeOption === 'custom') {
      options.width = this.customWidth;
      options.height = this.customHeight;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `frame-avatar-${timestamp}`;
    
    this.editorService.downloadCanvas(filename, options);
  }
}
