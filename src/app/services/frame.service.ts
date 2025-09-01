import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Frame, FrameCategory } from '../models/frame.model';

@Injectable({
  providedIn: 'root'
})
export class FrameService {
  private framesSubject = new BehaviorSubject<Frame[]>([]);
  private categoriesSubject = new BehaviorSubject<FrameCategory[]>([]);

  frames$ = this.framesSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeFrames();
  }

  private initializeFrames(): void {
    // Chỉ load frames khi ở browser (không phải SSR)
    if (isPlatformBrowser(this.platformId)) {
              // Load frames từ JSON file
        this.http.get<{frames: Frame[]}>('./assets/frames/sample-frames.json').subscribe({
        next: (data) => {
          const frames = data.frames;
          this.framesSubject.next(frames);
          
          // Tạo categories từ frames
          const categoryMap = new Map<string, FrameCategory>();
          
          frames.forEach(frame => {
            if (!categoryMap.has(frame.category)) {
              categoryMap.set(frame.category, {
                id: frame.category,
                name: this.getCategoryDisplayName(frame.category),
                description: this.getCategoryDescription(frame.category),
                frames: []
              });
            }
            categoryMap.get(frame.category)!.frames.push(frame);
          });
          
          const categories = Array.from(categoryMap.values());
          this.categoriesSubject.next(categories);
        },
        error: (error) => {
          console.error('Error loading frames:', error);
          // Fallback to empty data
          this.framesSubject.next([]);
          this.categoriesSubject.next([]);
        }
      });
    } else {
      // Trên server, khởi tạo với dữ liệu trống
      this.framesSubject.next([]);
      this.categoriesSubject.next([]);
    }
  }

  private getCategoryDisplayName(categoryId: string): string {
    const names: {[key: string]: string} = {
      'quoc-khanh': 'Quốc Khánh',
      'tet': 'Tết Nguyên Đán',
      'sinh-nhat': 'Sinh Nhật'
    };
    return names[categoryId] || categoryId;
  }

  private getCategoryDescription(categoryId: string): string {
    const descriptions: {[key: string]: string} = {
      'quoc-khanh': 'Khung ảnh chào mừng Quốc Khánh Việt Nam',
      'tet': 'Khung ảnh chúc mừng năm mới',
      'sinh-nhat': 'Khung ảnh sinh nhật vui vẻ'
    };
    return descriptions[categoryId] || '';
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
