import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FrameService } from '../../services/frame.service';
import { Frame, FrameCategory } from '../../models/frame.model';

interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-frame-gallery',
  imports: [CommonModule, FormsModule, ButtonModule, Select, InputTextModule],
  templateUrl: './frame-gallery.html',
  styleUrl: './frame-gallery.scss'
})
export class FrameGallery implements OnInit {
  @Output() frameSelected = new EventEmitter<Frame>();

  searchQuery = '';
  selectedCategory = '';
  isLoading = false;
  
  categories: FrameCategory[] = [];
  filteredCategories: FrameCategory[] = [];
  popularFrames: Frame[] = [];
  categoryOptions: CategoryOption[] = [];

  constructor(private frameService: FrameService) {}

  ngOnInit(): void {
    this.loadFrames();
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
}
