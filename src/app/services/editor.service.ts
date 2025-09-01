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

      Image.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
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

        // Nếu đã có frame, điều chỉnh ảnh để fit
        const hasFrame = this.canvas.getObjects().some(obj => obj.get('isFrame'));
        if (hasFrame) {
          this.adjustImageToFitFrame();
        }

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

      Image.fromURL(frameUrl, { crossOrigin: 'anonymous' }).then((frame) => {
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

        // Xóa frame cũ nếu có
        const existingFrames = this.canvas.getObjects().filter(obj => obj.get('isFrame'));
        existingFrames.forEach(frame => this.canvas!.remove(frame));

        // Đánh dấu object này là frame
        frame.set('isFrame', true);

        // Thêm frame và đưa lên trên cùng (trên ảnh)
        this.canvas.add(frame);
        this.canvas.bringObjectToFront(frame);

        // Điều chỉnh ảnh user để nằm trong vùng trống của frame
        this.adjustImageToFitFrame();

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

  resetImagePosition(): void {
    if (!this.canvas) return;

    const userImage = this.canvas.getObjects().find(obj => !obj.get('isFrame'));
    if (!userImage) return;

    const hasFrame = this.canvas.getObjects().some(obj => obj.get('isFrame'));
    
    if (hasFrame) {
      // Nếu có frame, fit ảnh vào vùng an toàn
      this.adjustImageToFitFrame();
    } else {
      // Nếu không có frame, reset về center với scale phù hợp
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();
      const imageWidth = userImage.width || 1;
      const imageHeight = userImage.height || 1;

      const scaleX = canvasWidth / imageWidth;
      const scaleY = canvasHeight / imageHeight;
      const scale = Math.min(scaleX, scaleY);

      userImage.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center'
      });
    }

    this.canvas.renderAll();
    this.updateEditorState({ isDirty: true });
  }

  private adjustImageToFitFrame(): void {
    if (!this.canvas) return;

    // Tìm ảnh user (không phải frame)
    const userImage = this.canvas.getObjects().find(obj => !obj.get('isFrame'));
    if (!userImage) return;

    // Định nghĩa vùng an toàn cho ảnh (tránh frame border)
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    
    // Giả sử frame có border khoảng 15% từ mỗi cạnh
    const borderPercent = 0.15;
    const safeAreaWidth = canvasWidth * (1 - borderPercent * 2);
    const safeAreaHeight = canvasHeight * (1 - borderPercent * 2);
    const safeAreaLeft = canvasWidth * borderPercent;
    const safeAreaTop = canvasHeight * borderPercent;

    // Tính toán scale để ảnh vừa với vùng an toàn
    const imageWidth = userImage.width || 1;
    const imageHeight = userImage.height || 1;
    
    const scaleX = safeAreaWidth / imageWidth;
    const scaleY = safeAreaHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY); // Giữ tỷ lệ ảnh

    // Áp dụng scale và vị trí
    userImage.set({
      scaleX: scale,
      scaleY: scale,
      left: safeAreaLeft + (safeAreaWidth - imageWidth * scale) / 2,
      top: safeAreaTop + (safeAreaHeight - imageHeight * scale) / 2
    });

    // Đảm bảo ảnh ở dưới frame
    this.canvas.sendObjectToBack(userImage);
  }

  exportCanvas(options: ExportOptions = { format: 'png', quality: 1 }): string {
    if (!this.canvas) return '';

    try {
      const dataURL = this.canvas.toDataURL({
        format: options.format,
        quality: options.quality,
        multiplier: 1,
        width: options.width,
        height: options.height
      });

      return dataURL;
    } catch (error) {
      console.error('Canvas export error:', error);
      throw new Error('Không thể xuất ảnh do giới hạn bảo mật CORS. Vui lòng sử dụng ảnh từ cùng domain.');
    }
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

