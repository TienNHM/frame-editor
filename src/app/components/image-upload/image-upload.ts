import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule, ButtonModule, MessageModule, TooltipModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss'
})
export class ImageUpload {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() imageSelected = new EventEmitter<string>();

  isDragOver = false;
  isUploading = false;
  previewUrl: string | null = null;
  fileName = '';
  fileSize = '';
  errorMessage = '';
  selectedFile: File | null = null;

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = 'Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, PNG hoặc WebP.';
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.fileSize = this.formatFileSize(file.size);
    this.createPreview(file);
  }

  private createPreview(file: File): void {
    this.isUploading = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
      this.isUploading = false;
    };
    reader.onerror = () => {
      this.errorMessage = 'Không thể đọc file. Vui lòng thử lại.';
      this.isUploading = false;
    };
    reader.readAsDataURL(file);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  useImage(): void {
    if (this.previewUrl) {
      this.imageSelected.emit(this.previewUrl);
    }
  }

  selectNewImage(): void {
    this.fileInput.nativeElement.click();
  }

  clearPreview(): void {
    this.previewUrl = null;
    this.selectedFile = null;
    this.fileName = '';
    this.fileSize = '';
    this.errorMessage = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
