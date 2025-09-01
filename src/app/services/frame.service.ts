import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Frame, FrameCategory } from '../models/frame.model';

@Injectable({
  providedIn: 'root'
})
export class FrameService {
  private framesSubject = new BehaviorSubject<Frame[]>([]);
  private categoriesSubject = new BehaviorSubject<FrameCategory[]>([]);

  frames$ = this.framesSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.initializeFrames();
  }

  private initializeFrames(): void {
    // Dữ liệu mẫu cho frames
    const sampleFrames: Frame[] = [
      {
        id: 'frame-1',
        name: 'Khung Quốc Khánh',
        category: 'quoc-khanh',
        imageUrl: '/assets/frames/frame1.svg',
        thumbnailUrl: '/assets/frames/frame1.svg',
        width: 800,
        height: 800,
        description: 'Khung ảnh chào mừng Quốc Khánh 2/9',
        tags: ['quốc khánh', 'lễ hội', 'việt nam'],
        isPopular: true
      },
      {
        id: 'frame-2',
        name: 'Khung Tết Nguyên Đán',
        category: 'tet',
        imageUrl: '/assets/frames/frame2.svg',
        thumbnailUrl: '/assets/frames/frame2.svg',
        width: 800,
        height: 800,
        description: 'Khung ảnh chúc mừng năm mới',
        tags: ['tết', 'năm mới', 'truyền thống'],
        isPopular: true
      },
      {
        id: 'frame-3',
        name: 'Khung Sinh Nhật',
        category: 'sinh-nhat',
        imageUrl: '/assets/frames/frame3.svg',
        thumbnailUrl: '/assets/frames/frame3.svg',
        width: 800,
        height: 800,
        description: 'Khung ảnh chúc mừng sinh nhật',
        tags: ['sinh nhật', 'tiệc tụng', 'vui vẻ']
      }
    ];

    const categories: FrameCategory[] = [
      {
        id: 'quoc-khanh',
        name: 'Quốc Khánh',
        description: 'Khung ảnh chào mừng Quốc Khánh Việt Nam',
        frames: sampleFrames.filter(f => f.category === 'quoc-khanh')
      },
      {
        id: 'tet',
        name: 'Tết Nguyên Đán',
        description: 'Khung ảnh chúc mừng năm mới',
        frames: sampleFrames.filter(f => f.category === 'tet')
      },
      {
        id: 'sinh-nhat',
        name: 'Sinh Nhật',
        description: 'Khung ảnh sinh nhật vui vẻ',
        frames: sampleFrames.filter(f => f.category === 'sinh-nhat')
      }
    ];

    this.framesSubject.next(sampleFrames);
    this.categoriesSubject.next(categories);
  }

  getFrameById(id: string): Frame | undefined {
    return this.framesSubject.value.find(frame => frame.id === id);
  }

  getFramesByCategory(categoryId: string): Frame[] {
    return this.framesSubject.value.filter(frame => frame.category === categoryId);
  }

  getPopularFrames(): Frame[] {
    return this.framesSubject.value.filter(frame => frame.isPopular);
  }

  searchFrames(query: string): Frame[] {
    const lowercaseQuery = query.toLowerCase();
    return this.framesSubject.value.filter(frame => 
      frame.name.toLowerCase().includes(lowercaseQuery) ||
      frame.description?.toLowerCase().includes(lowercaseQuery) ||
      frame.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}
