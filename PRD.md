# Planning Guide

A collaborative vocal training platform that enables remote music instruction by allowing instructors to program melodic sequences that play exclusively on the student's device, facilitating real-time vocal assessment over video calls.

**Experience Qualities**:
1. **Focused** - Interface prioritizes the essential controls needed for efficient vocal training sessions without clutter or distraction
2. **Responsive** - Touch-optimized for mobile devices with immediate audio feedback and clear visual state changes
3. **Intuitive** - Role-based interfaces that reveal only relevant controls, making the workflow instantly understandable

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused tool with real-time audio synthesis, role management, sequence programming, and state persistence, but doesn't require accounts or complex data structures.

## Essential Features

### Role Selection
- **Functionality**: User chooses between Instructor or Student mode
- **Purpose**: Determines which interface and controls are available, ensuring clean separation of responsibilities
- **Trigger**: Initial app load or role switch button
- **Progression**: Landing screen → Role selection cards → Role-specific interface
- **Success criteria**: Correct interface displays with appropriate controls; role persists across sessions

### Sequence Programming (Instructor Only)
- **Functionality**: Two input modes - Step sequencer grid for precise note placement, or real-time recording that captures keyboard timing
- **Purpose**: Allows flexible creation of melodic patterns for vocal exercises
- **Trigger**: Instructor taps sequencer or record mode
- **Progression**: Select mode → Input sequence (grid clicks or keyboard presses) → Visual feedback shows pattern → Save/preview
- **Success criteria**: Sequence displays visually, can be edited, previewed locally, and transmitted to student

### Range Configuration (Instructor Only)
- **Functionality**: Set starting note and range boundaries (e.g., E3 to E5) for sequence playback
- **Purpose**: Transposes exercises to match student's vocal range
- **Trigger**: Dropdown or slider controls after sequence creation
- **Progression**: Program sequence → Set root note → Define min/max range → Transmit to student
- **Success criteria**: Sequence plays in specified range, validates that range is musically sensible

### Audio Playback Control
- **Functionality**: Student hears and can control playback of transmitted sequences; instructor can preview locally
- **Purpose**: Enables student to practice with accompaniment while instructor listens via video call
- **Trigger**: Play button (student receives automatic playback, instructor can preview)
- **Progression**: Receive sequence → Play button → Audio synthesis → Visual timing indicator → Loop/stop controls
- **Success criteria**: Audio plays accurately timed, uses Web Audio API, no latency issues, instructor device remains silent during student playback

### Virtual Keyboard
- **Functionality**: Touch-responsive piano keyboard for note input and testing
- **Purpose**: Primary input method for sequence creation and audio preview
- **Trigger**: Touch/click on keys
- **Progression**: Touch key → Visual press state → Audio plays → Release
- **Success criteria**: Keys respond within 100ms, visual feedback clear, works on touch devices, proper note mapping

## Edge Case Handling

- **No Audio Permission**: Graceful prompt explaining microphone isn't needed, only speakers
- **Rapid Role Switching**: Prevent state conflicts by clearing sequence data on role change
- **Invalid Range Selection**: Validate that min < max and prevent sequences outside practical singing range
- **Network Loss During Session**: Persist last transmitted sequence so student can continue practicing
- **Sequence Too Long**: Limit to 32 steps or 30 seconds to prevent memory issues
- **Multiple Tabs Open**: Warn user if they try to be both roles simultaneously

## Design Direction

The design should feel professional and focused like a music production tool - clean, high-contrast interface with purposeful color coding to distinguish instructor controls from playback states. Minimal interface serves the core purpose: efficient vocal instruction with zero distractions during performance.

## Color Selection

Triadic color scheme with musical context - leveraging distinct hues to separate instructor actions, student playback, and neutral UI chrome.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 250)) - Professional, focused, represents instructor authority and control
- **Secondary Colors**: 
  - Warm Amber (oklch(0.65 0.15 70)) - Active recording and real-time input states
  - Soft Purple (oklch(0.55 0.12 290)) - Student mode and playback indicators
- **Accent Color**: Vibrant Cyan (oklch(0.75 0.15 200)) - Call-to-action buttons, active sequencer steps, key presses
- **Foreground/Background Pairings**:
  - Background (White oklch(0.99 0 0)): Dark text oklch(0.2 0 0) - Ratio 16.1:1 ✓
  - Card (Light Gray oklch(0.97 0 0)): Dark text oklch(0.2 0 0) - Ratio 15.2:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text oklch(0.99 0 0) - Ratio 8.2:1 ✓
  - Secondary (Warm Amber oklch(0.65 0.15 70)): Dark text oklch(0.2 0 0) - Ratio 5.8:1 ✓
  - Accent (Vibrant Cyan oklch(0.75 0.15 200)): Dark text oklch(0.2 0 0) - Ratio 7.1:1 ✓
  - Muted (Light Gray oklch(0.95 0 0)): Medium Gray oklch(0.5 0 0) - Ratio 6.8:1 ✓

## Font Selection

Typography should convey precision and clarity - a geometric sans-serif that feels technical yet approachable, appropriate for both musical notation context and mobile touch targets.

- **Typographic Hierarchy**:
  - H1 (Role Headers): Inter Bold/32px/tight (-0.02em) - Clear role identification
  - H2 (Section Labels): Inter Semibold/20px/normal - "Sequence Editor", "Range Control"
  - H3 (Control Labels): Inter Medium/16px/normal - Button labels, input labels
  - Body (Instructions): Inter Regular/15px/relaxed (1.6) - Help text and descriptions
  - Caption (Note Names): Inter Medium/13px/wide (0.05em) - Piano key labels, step numbers

## Animations

Animations should reinforce musical timing and rhythm - emphasizing beat synchronization and immediate tactile feedback for music performance contexts where timing precision matters.

- **Purposeful Meaning**: Bounce effects on key presses mirror piano hammer action; pulsing indicators during playback sync with musical beats
- **Hierarchy of Movement**: 
  - Critical: Sequencer step highlighting during playback (synced to audio)
  - Important: Piano key press/release animations (immediate feedback)
  - Secondary: Role card selection, modal transitions
  - Subtle: Hover states on controls

## Component Selection

- **Components**: 
  - Card - Role selection cards with clear visual hierarchy
  - Button - Primary actions (Play, Record, Stop) with distinct variants for instructor vs student
  - Select - Range selector for root note and octave boundaries
  - Tabs - Switch between Step Sequencer and Real-time Recording modes
  - Switch/Toggle - Enable/disable loop playback
  - Dialog - Settings and help modal
  - Badge - Display current role and sequence status
  - Separator - Visual dividers between control sections
  
- **Customizations**: 
  - Custom piano keyboard component (not in shadcn) with touch-optimized keys spanning mobile width
  - Custom step sequencer grid with note rows and time columns
  - Custom waveform visualization for real-time recording mode
  - Audio engine wrapper using Web Audio API for synthesis
  
- **States**: 
  - Buttons: Distinct visual states for recording (pulsing red), playing (animated), stopped (neutral)
  - Sequencer steps: Empty (muted), filled (accent color), currently playing (animated highlight)
  - Piano keys: Default, hover, active/pressed (elevated), disabled (when not in correct mode)
  
- **Icon Selection**: 
  - Play (phosphor-icons: Play) - Start sequence playback
  - Pause (phosphor-icons: Pause) - Pause playback
  - Stop (phosphor-icons: Stop) - Stop and reset
  - Record (phosphor-icons: Record) - Real-time recording mode
  - MusicNote (phosphor-icons: MusicNote) - Sequence programming
  - User (phosphor-icons: User) - Role selection
  - SpeakerHigh (phosphor-icons: SpeakerHigh) - Audio controls
  - Repeat (phosphor-icons: Repeat) - Loop toggle
  
- **Spacing**: 
  - Keyboard keys: gap-0.5 for visual separation
  - Sequencer grid: gap-1 between cells
  - Control sections: p-4 on cards, mb-6 between major sections
  - Button groups: gap-2 for related actions
  
- **Mobile**: 
  - Keyboard spans full width with scrollable octaves if needed
  - Sequencer grid scrolls horizontally for longer sequences
  - Role selection stacks vertically
  - Controls use larger touch targets (min 44px)
  - Collapsible sections for advanced controls
  - Fixed bottom bar for primary play/stop controls on student view
