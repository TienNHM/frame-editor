export interface Frame {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  description?: string;
  tags?: string[];
  isPopular?: boolean;
  createdAt?: Date;
}

export interface FrameCategory {
  id: string;
  name: string;
  description?: string;
  frames: Frame[];
}

export interface FramePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

