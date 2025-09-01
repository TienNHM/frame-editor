import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FrameService } from '../../services/frame.service';
import { Frame, FrameCategory } from '../../models/frame.model';

interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-frame-gallery',
  imports: [CommonModule, FormsModule, ButtonModule, Select, InputTextModule, TooltipModule],
  templateUrl: './frame-gallery.html',
  styleUrl: './frame-gallery.scss'
})
export class FrameGallery implements OnInit {
  @Output() frameSelected = new EventEmitter<Frame>();
  @ViewChild('frameUploadInput') frameUploadInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  selectedCategory = '';
  isLoading = false;
  
  categories: FrameCategory[] = [];
  filteredCategories: FrameCategory[] = [];
  popularFrames: Frame[] = [];
  categoryOptions: CategoryOption[] = [];
  customFrames: Frame[] = [];

  constructor(private frameService: FrameService) {}

  ngOnInit(): void {
    this.loadFrames();
    this.loadCustomFramesFromStorage();
  }

  private loadFrames(): void {
    this.isLoading = true;
    
    this.frameService.categories$.subscribe(categories => {
      this.categories = categories;
      this.filteredCategories = [...categories];
      this.updateCategoryOptions();
      this.isLoading = false;
    });

    this.frameService.frames$.subscribe(() => {
      this.popularFrames = this.frameService.getPopularFrames();
    });
  }

  private updateCategoryOptions(): void {
    this.categoryOptions = [
      { label: 'Tất cả danh mục', value: '' },
      ...this.categories.map(cat => ({
        label: cat.name,
        value: cat.id
      }))
    ];
  }

  onSearch(): void {
    this.filterFrames();
  }

  onCategoryChange(): void {
    this.filterFrames();
  }

  private filterFrames(): void {
    let filtered = [...this.categories];

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(cat => cat.id === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.map(category => ({
        ...category,
        frames: category.frames.filter(frame =>
          frame.name.toLowerCase().includes(query) ||
          frame.description?.toLowerCase().includes(query) ||
          frame.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      })).filter(category => category.frames.length > 0);
    }

    this.filteredCategories = filtered;
  }

  selectFrame(frame: Frame): void {
    this.frameSelected.emit(frame);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filteredCategories = [...this.categories];
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Fallback to a placeholder image
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDEyMCAxMTAuNDU3IDEyMCAxMDBDMTIwIDg5LjU0MyAxMTAuNDU3IDgwIDEwMCA4MEM4OS41NDMgODAgODAgODkuNTQzIDgwIDEwMEM4MCAxMTAuNDU3IDg5LjU0MyAxMjAgMTAwIDEyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTcwIDEzMEw5MCA5MEwxMTAgMTEwTDEzMCA3MEwxNzAgMTMwSDcwWiIgZmlsbD0iIzlDQTRBRiIvPgo8L3N2Zz4K';
  }

  triggerFrameUpload(): void {
    this.frameUploadInput.nativeElement.click();
  }

  onFrameUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (PNG, JPG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Create custom frame object
      const customFrame: Frame = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        category: 'custom',
        imageUrl: dataUrl,
        thumbnailUrl: dataUrl,
        width: 800,
        height: 800,
        description: 'Khung ảnh tự tải lên',
        tags: ['custom', 'upload'],
        isPopular: false
      };

      // Add to custom frames
      this.customFrames.push(customFrame);
      
      // Save to localStorage for persistence
      this.saveCustomFramesToStorage();
      
      // Clear input
      input.value = '';
      
      // Show success message
      alert('Đã tải lên khung ảnh thành công!');
    };

    reader.readAsDataURL(file);
  }

  deleteCustomFrame(frame: Frame, event: Event): void {
    event.stopPropagation(); // Prevent frame selection
    
    if (confirm(`Bạn có chắc muốn xóa khung "${frame.name}"?`)) {
      this.customFrames = this.customFrames.filter(f => f.id !== frame.id);
      this.saveCustomFramesToStorage();
    }
  }

  private saveCustomFramesToStorage(): void {
    try {
      localStorage.setItem('customFrames', JSON.stringify(this.customFrames));
    } catch (error) {
      console.error('Error saving custom frames to localStorage:', error);
    }
  }

  private loadCustomFramesFromStorage(): void {
    try {
      const saved = localStorage.getItem('customFrames');
      if (saved) {
        this.customFrames = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading custom frames from localStorage:', error);
      this.customFrames = [];
    }
  }
}
