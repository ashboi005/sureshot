# Admin Components Structure

This folder contains all admin-related components organized by functionality.

## Folder Structure

```
admin/components/
├── charts/           # Chart and visualization components
│   ├── drive-progress-chart.tsx
│   ├── vaccination-chart.tsx
│   ├── worker-performance.tsx
│   └── index.tsx
├── dashboard/        # Dashboard-specific components
│   ├── coverage-stats.tsx
│   ├── dashboard-header.tsx
│   ├── dashboard-stats.tsx
│   ├── recent-drives.tsx
│   ├── drive-workers-list.tsx
│   └── index.tsx
├── maps/            # Map and location components
│   ├── coverage-map.tsx
│   ├── drive-map.tsx
│   └── index.ts
├── navigation/      # Navigation and sidebar components
│   ├── admin-sidebar.tsx
│   ├── mobile-nav.tsx
│   └── index.ts
├── theme/           # Theme and styling components
│   ├── mode-toggle.tsx
│   ├── theme-provider.tsx
│   └── index.ts
├── ui/              # Reusable UI components organized by type
│   ├── core/        # Basic components (Button, Input, etc.)
│   ├── data/        # Data display components (Table, List, etc.)
│   ├── display/     # Display components (Avatar, Badge, etc.)
│   ├── feedback/    # Feedback components (Toast, Alert, etc.)
│   ├── forms/       # Form components (Select, Checkbox, etc.)
│   ├── layout/      # Layout components (Card, Container, etc.)
│   ├── navigation/  # Navigation UI components
│   ├── overlays/    # Overlay components (Modal, Dropdown, etc.)
│   ├── specialized/ # Specialized/complex components
│   └── index.tsx
└── index.ts         # Main export file for all components
```

## Usage

### Import from organized structure:
```tsx
// Import specific component categories
import { AdminSidebar, MobileNav } from '@/app/admin/components/navigation'
import { DashboardStats, RecentDrives } from '@/app/admin/components/dashboard'
import { VaccinationChart, WorkerPerformance } from '@/app/admin/components/charts'
import { CoverageMap, DriveMap } from '@/app/admin/components/maps'
import { ModeToggle, ThemeProvider } from '@/app/admin/components/theme'

// Or import everything from main index
import { 
  AdminSidebar, 
  DashboardStats, 
  VaccinationChart,
  CoverageMap,
  ModeToggle 
} from '@/app/admin/components'
```

## Benefits

1. **Better Organization**: Components are grouped by functionality
2. **Easier Navigation**: Clear folder structure makes finding components simple
3. **Cleaner Imports**: Logical import paths that reflect component purpose
4. **Maintainability**: Easy to add new components in the right category
5. **Reduced Complexity**: Fewer files in the root components folder
