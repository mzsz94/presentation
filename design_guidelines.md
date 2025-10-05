# Design Guidelines for Real-Time Presentation Sync

## Design Approach
**System Selected**: Material Design with Zoom/Google Meet inspiration  
**Rationale**: Utility-focused collaboration tool requiring clear visual hierarchy, real-time feedback, and distinct mode separation. Material Design provides strong component patterns while referencing established video conferencing tools ensures familiar interaction models.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**:
- Background: 220 15% 12%
- Surface: 220 15% 18%
- Surface Elevated: 220 15% 22%
- Primary (Presenter): 142 76% 45%
- Primary (Participant): 210 90% 55%
- Accent: 280 65% 60%
- Success: 142 76% 45%
- Warning: 38 92% 50%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

**Light Mode**:
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Surface Elevated: 0 0% 100%
- Primary (Presenter): 142 70% 40%
- Primary (Participant): 210 90% 50%
- Accent: 280 60% 55%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%

### B. Typography
**Fonts**: Inter (primary), JetBrains Mono (code)  
**Weights**: 400 (body), 500 (UI elements), 600-700 (headings)

**Scale**:
- Display: text-5xl (48px) - Hero/Mode headers
- H1: text-3xl (30px) - Section titles
- H2: text-xl (20px) - Card headers
- Body: text-base (16px)
- UI Small: text-sm (14px) - Status, labels
- Caption: text-xs (12px) - Timestamps

### C. Layout System
**Spacing Units**: 2, 4, 6, 8, 12, 16  
**Container**: max-w-7xl mx-auto px-4  
**Section padding**: py-12 md:py-20  
**Card padding**: p-6 md:p-8  
**Component gaps**: gap-4 md:gap-6

### D. Component Library

**Navigation (Mobile-First)**:
- Fixed bottom nav on mobile with 3-4 primary actions
- Desktop: Top navigation with mode indicator badge
- Mode switcher: Prominent toggle (Presenter/Participant) with color-coded states

**Presentation Canvas**:
- Full-width slide container with 16:9 aspect ratio
- Slide counter overlay (top-right): backdrop-blur-md bg-black/30 text-white
- Navigation arrows: Large touch targets (min 48px) with backdrop-blur
- Current slide indicator: Progress bar or dots below canvas

**Control Panels**:
- Presenter Controls: Floating action buttons (FAB) pattern
  - Previous/Next slides: Large circular buttons with icons
  - Settings/Share: Secondary actions in toolbar
  - Participant count: Live badge with number
  
- Participant Controls: Minimal, non-intrusive
  - Sync status indicator: Small badge with pulse animation
  - Fullscreen toggle
  - Exit/Settings

**Mode Distinction**:
- Presenter Mode: Green accent throughout (buttons, borders, indicators)
- Participant Mode: Blue accent throughout
- Visual header banner with role identification

**Real-time Indicators**:
- Connection status: Dot with colors (green: connected, yellow: reconnecting, red: disconnected)
- Sync pulse: Subtle border animation when slide changes
- Participant list: Avatar grid with online status dots
- Live counter: Animated number changes

**Cards/Surfaces**:
- Elevated cards for participant grid: shadow-lg with rounded-xl
- Slide thumbnails: Bordered with hover scale-[1.02]
- Settings panels: Slide-in drawer from right (mobile) or modal (desktop)

**Buttons**:
- Primary (Presenter): Solid green background
- Primary (Participant): Solid blue background  
- Secondary: Outline with respective mode color
- FAB: Large circular (w-14 h-14) with shadow-xl
- On images: backdrop-blur-sm bg-white/10 border-white/30

**Forms/Inputs**:
- Room code input: Large text-center text-2xl font-mono tracking-wider
- Join room: Full-width primary button with loading state
- Create room: Secondary button with icon

**Status Displays**:
- Participant count badge: Rounded-full with live count, positioned top-right
- Sync status banner: Slide-down notification for sync events
- Error states: Red banner with retry action

### E. Animations
**Purposeful Motion**:
- Slide transitions: transform duration-300 ease-out
- Mode switch: Color transition duration-500
- Connection pulse: animate-pulse on status dots
- FAB hover: scale-110 duration-200
- Real-time updates: Fade-in animation for participant joins

## Images

**Hero Image**: Full-width background (max-h-[500px]) showing blurred presentation environment or collaborative workspace. Image should convey real-time collaboration with overlay gradient (from transparent to background color) for text readability. Place on landing page only.

**UI Screenshots**: Use actual UI mockups in feature showcase sections:
- Presenter view demonstration
- Participant synchronized view
- Mobile interface preview
Position in 2-column grid on desktop, stacked on mobile.

## Key Design Principles

**Mobile-First Architecture**:
- Touch-optimized controls (minimum 44px tap targets)
- Bottom sheet patterns for settings/actions
- Swipe gestures for slide navigation
- Collapsible participant list

**Mode Clarity**:
- Persistent mode indicator in header
- Color-coded UI elements per mode
- Different control sets visible per role
- Clear visual separation in all states

**Real-time Feedback**:
- Immediate visual confirmation for all actions
- Live participant presence indicators
- Sync status always visible
- Connection quality indicators

**Performance Focus**:
- Lazy-load slide thumbnails
- Optimistic UI updates
- Skeleton screens during loading
- Minimal animation overhead

**Responsive Breakpoints**:
- Mobile: Single column, bottom nav, stacked slides
- Tablet (md:): Two-column layouts, side panel for participants
- Desktop (lg:): Full control panel, multi-column participant grid