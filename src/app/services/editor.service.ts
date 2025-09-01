import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Canvas, Image, FabricObject } from 'fabric';
import { EditorState, ImageTransform, ExportOptions } from '../models/editor.model';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private canvas: Canvas | null = null;
  private editorStateSubject = new BehaviorSubject<EditorState>({
    canvasWidth: 800,
    canvasHeight: 800,
    zoom: 1,
    rotation: 0,
    isEditing: false,
    isDirty: false
  });

  editorState$ = this.editorStateSubject.asObservable();

  constructor() {}

  initializeCanvas(canvasElement: HTMLCanvasElement): void {
    this.canvas = new Canvas(canvasElement, {
      width: 800,
      height: 800,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true
    });

    // Lắng nghe sự kiện thay đổi
    this.canvas.on('object:modified', () => {
      this.updateEditorState({ isDirty: true });
    });

    this.canvas.on('selection:created', () => {
      this.updateEditorState({ isEditing: true });
    });

    this.canvas.on('selection:cleared', () => {
      this.updateEditorState({ isEditing: false });
    });
  }

  getCanvas(): Canvas | null {
    return this.canvas;
  }

  addImageToCanvas(imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.canvas) {
        reject(new Error('Canvas chưa được khởi tạo'));
        return;
      }

      Image.fromURL(imageUrl).then((img) => {
        if (!this.canvas) return;

        // Tính toán kích thước để fit vào canvas
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;

        const scale = Math.min(
          (canvasWidth * 0.8) / imgWidth,
          (canvasHeight * 0.8) / imgHeight
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          selectable: true,
          moveable: true
        });

        this.canvas.add(img);
        this.canvas.setActiveObject(img);
        this.canvas.renderAll();

        this.updateEditorState({ 
          uploadedImage: imageUrl, 
          isDirty: true 
        });

        resolve();
      }).catch(reject);
    });
  }

  addFrameToCanvas(frameUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.canvas) {
        reject(new Error('Canvas chưa được khởi tạo'));
        return;
      }

      Image.fromURL(frameUrl).then((frame) => {
        if (!this.canvas) return;

        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();

        frame.set({
          left: 0,
          top: 0,
          scaleX: canvasWidth / (frame.width || 1),
          scaleY: canvasHeight / (frame.height || 1),
          selectable: false,
          evented: false
        });

        // Đưa frame lên trên cùng
        this.canvas.add(frame);
        this.canvas.bringObjectToFront(frame);
        this.canvas.renderAll();

        this.updateEditorState({ 
          selectedFrame: frameUrl, 
          isDirty: true 
        });

        resolve();
      }).catch(reject);
    });
  }

  rotateSelectedObject(angle: number): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.rotate(currentAngle + angle);
      this.canvas.renderAll();
      this.updateEditorState({ isDirty: true });
    }
  }

  flipSelectedObject(direction: 'horizontal' | 'vertical'): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (direction === 'horizontal') {
        activeObject.set('flipX', !activeObject.flipX);
      } else {
        activeObject.set('flipY', !activeObject.flipY);
      }
      this.canvas.renderAll();
      this.updateEditorState({ isDirty: true });
    }
  }

  zoomCanvas(zoomLevel: number): void {
    if (!this.canvas) return;

    this.canvas.setZoom(zoomLevel);
    this.canvas.renderAll();
    this.updateEditorState({ zoom: zoomLevel });
  }

  resetCanvas(): void {
    if (!this.canvas) return;

    this.canvas.clear();
    this.canvas.backgroundColor = '#ffffff';
    this.canvas.renderAll();

    this.updateEditorState({
      selectedFrame: undefined,
      uploadedImage: undefined,
      zoom: 1,
      rotation: 0,
      isEditing: false,
      isDirty: false
    });
  }

  exportCanvas(options: ExportOptions = { format: 'png', quality: 1 }): string {
    if (!this.canvas) return '';

    const dataURL = this.canvas.toDataURL({
      format: options.format,
      quality: options.quality,
      multiplier: 1,
      width: options.width,
      height: options.height
    });

    return dataURL;
  }

  downloadCanvas(filename: string = 'frame-avatar', options: ExportOptions = { format: 'png', quality: 1 }): void {
    const dataURL = this.exportCanvas(options);
    
    const link = document.createElement('a');
    link.download = `${filename}.${options.format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private updateEditorState(updates: Partial<EditorState>): void {
    const currentState = this.editorStateSubject.value;
    this.editorStateSubject.next({ ...currentState, ...updates });
  }

  getCurrentState(): EditorState {
    return this.editorStateSubject.value;
  }
}

