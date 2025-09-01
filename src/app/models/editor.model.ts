export interface EditorState {
  selectedFrame?: string;
  uploadedImage?: string;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  rotation: number;
  cropArea?: CropArea;
  isEditing: boolean;
  isDirty: boolean;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

