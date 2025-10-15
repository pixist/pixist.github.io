# Planning Guide

A collaborative vocal training platform that enables remote music instruction through room-based sessions where instructors and students can switch roles freely, with multi-language support and visual range indicators for effective vocal training over video calls.

**Experience Qualities**:
1. **Focused** - Interface prioritizes the essential controls needed for efficient vocal training sessions without clutter or distraction
2. **Responsive** - Touch-optimized for mobile devices with immediate audio feedback and clear visual state changes
3. **Intuitive** - Role-based interfaces that reveal only relevant controls, making the workflow instantly understandable
4. **Collaborative** - Room-based sessions allow multiple users to join and switch roles dynamically

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused tool with real-time audio synthesis, room management, role management, multi-language support, sequence programming, and state persistence, but doesn't require accounts or complex data structures.

## Essential Features

### Room Creation and Joining
- **Functionality**: Users can create a new room or join an existing room by entering a room ID, with language selection at entry
- **Purpose**: Establishes a shared training session context where instructor and student can collaborate
- **Trigger**: App load
- **Progression**: Landing screen → Language selection → Room ID input or create → Join room → Role selection
- **Success criteria**: Room ID is generated/validated, users can share room codes, language preference is saved

### Multi-Language Support
- **Functionality**: Interface supports English, German (Deutsch), and Turkish (Türkçe) with expandable architecture
- **Purpose**: Makes the tool accessible to international users and supports language learning contexts
- **Trigger**: Language selector on room join screen
- **Progression**: Select language → All UI updates to selected language → Preference persists
- **Success criteria**: All text, labels, buttons, and messages display correctly in selected language; new languages can be added easily

### Role Selection and Switching
- **Functionality**: Users choose between Instructor or Student mode within a room and can switch roles freely
- **Purpose**: Allows flexible session dynamics where roles can reverse (student becomes instructor for demonstration)
- **Trigger**: After joining room, or via role switch button in any view
- **Progression**: Join room → Role selection → Role-specific interface → Switch role button → Back to role selection
- **Success criteria**: Correct interface displays with appropriate controls; role can be changed without leaving room; room ID remains visible

### Visual Range Indicators
- **Functionality**: Min and max notes are displayed with color-coded visual indicators showing the vocal range
- **Purpose**: Provides clear visual feedback on the exercise's vocal range boundaries
- **Trigger**: Whenever min/max notes are displayed
- **Progression**: Instructor sets range → Visual indicators show min (red/down arrow) and max (blue/up arrow) → Student sees same indicators
- **Success criteria**: Min note displayed with downward arrow in red tones, max note with upward arrow in blue tones, clear visual hierarchy

### Room Presence and Activity Monitoring
- **Functionality**: Real-time display of active users in room (instructors and students) with live activity status
- **Purpose**: Provides awareness of who's in the session and what they're currently doing for better coordination
- **Trigger**: Automatic when user enters room, updates every 5 seconds
- **Progression**: Join room → Presence appears in room → Status updates (recording, playing, idle) → Shows on both sides → Auto-cleanup after 15s
- **Success criteria**: Both instructor and student can see each other's presence, activity states sync in real-time, stale presence auto-removed

### Interactive Sequence Creation
- **Functionality**: Instructor hears notes immediately when clicking sequencer cells or pressing piano keys during creation
- **Purpose**: Provides instant audio feedback while composing, making sequence creation more musical and intuitive
- **Trigger**: Any note input action (sequencer click, piano key press)
- **Progression**: Click sequencer cell → Hear note immediately → Visual feedback → Continue composing
- **Success criteria**: Notes play instantly (<100ms), audio matches selected instrument, disabled during preview playback

### Instrument Selection
- **Functionality**: Choose from different waveform types (Pure Tone, Soft, Bright, Rich) that change the character of the synthesized sound
- **Purpose**: Allows vocal exercises to use different timbres, helping students match different voice qualities
- **Trigger**: Instrument selector in sequence configuration
- **Progression**: Select instrument → Preview plays with new sound → Student receives sequence with instrument → Plays with correct timbre
- **Success criteria**: Instrument changes apply to both preview and transmitted sequence, each waveform has distinct character

### BPM (Tempo) Control
- **Functionality**: Slider control to adjust sequence playback speed from 40-200 BPM
- **Purpose**: Allows exercises to be performed at different tempos for practice progression (slow → fast)
- **Trigger**: BPM slider adjustment
- **Progression**: Set BPM → Preview reflects tempo → Transmit → Student receives at correct tempo
- **Success criteria**: BPM displayed as numeric value, slider responsive, tempo accurate in playback, affects step sequencer timing

### Rest Duration Between Sequences
- **Functionality**: Configurable pause duration (0-10 seconds) between sequence repetitions when looping
- **Purpose**: Gives students breathing time between repetitions, essential for vocal exercises
- **Trigger**: Rest duration slider in sequence configuration
- **Progression**: Set rest duration → Enable loop → Sequence plays → Rest pause → Sequence repeats
- **Success criteria**: Rest duration displayed, pause timer accurate, applies only when looping, student sees rest time indicator

### Student Playback Controls
- **Functionality**: Students can play, pause, resume, skip, and stop sequences with full control
- **Purpose**: Gives students autonomy to practice at their own pace, repeat difficult sections, or move forward
- **Trigger**: Control buttons in student view
- **Progression**: Play → Pause (holds position) → Resume (continues from pause) → Skip (restart sequence) → Stop (reset to beginning)
- **Success criteria**: All controls work reliably, pause preserves position, progress indicator accurate, loop mode respected

### Real-Time State Synchronization
- **Functionality**: Instructor sees student's playback state (playing/paused/stopped/progress), student sees instructor's recording/preview state
- **Purpose**: Creates awareness and connection in remote sessions, helps instructor guide student's practice
- **Trigger**: State changes on either side
- **Progression**: Student plays sequence → Instructor sees "Playing - 45%" → Student pauses → Instructor sees "Paused"
- **Success criteria**: States sync within 1 second, progress percentage accurate, activity indicators clear and color-coded
### Sequence Programming (Instructor Only)
- **Functionality**: Two input modes - Step sequencer grid for precise note placement, or real-time recording that captures keyboard timing. Creates the base sequence (one cycle) that will be transposed across the full range.
- **Purpose**: Allows flexible creation of melodic patterns for vocal exercises. The base sequence is one cycle, which gets transposed at every semitone within the range to create the complete set.
- **Trigger**: Instructor taps sequencer or record mode
- **Progression**: Select mode → Input base sequence (grid clicks or keyboard presses) → Hear notes as played → Visual feedback shows pattern → Preview → Transmit entire transposed set
- **Success criteria**: Base sequence displays visually, notes audible during creation, can be edited, previewed locally, and transmitted as full transposed set to student

### Transposition and Range Configuration
- **Functionality**: Set root note, start/end range boundaries (e.g., E3 to E5), and direction (one-way or both-ways). The system transposes the base sequence at every semitone step within the range.
- **Purpose**: Creates a complete vocal exercise set where the student practices the same pattern at progressively higher (and optionally lower) pitches.
- **Trigger**: Range controls in sequence configuration
- **Progression**: Program base sequence → Set root note → Define min/max range → Choose direction → System generates transposed set → Transmit to student
- **Success criteria**: One cycle = base sequence. One complete set = all transpositions. Both-ways doubles back down. Student receives entire set.

### Student Playback Modes
- **Functionality**: Two playback modes - Cycle-by-Cycle (plays the set once, pausing between each transposition) or Continuous (plays the entire set without stopping, optionally looping the whole set)
- **Purpose**: Cycle-by-Cycle allows practice of each transposition with control between each. Continuous mode flows through the entire range for fluidity practice.
- **Trigger**: Mode buttons in student view
- **Progression**: Cycle-by-Cycle: Play set → First transposition plays → Pause → Choose (Previous/Repeat/Next) → Complete set once. Continuous: Play set → Entire set plays through → Optional loop repeats entire set with rest duration
- **Success criteria**: Cycle-by-Cycle completes one full set with pauses. Continuous plays through entire set, loop setting makes it repeat indefinitely with rest breaks.

### Audio Playback Control
- **Functionality**: Student has two playback modes - Cycle-by-Cycle (one complete set with pauses) or Continuous (entire set, optionally looping); instructor can preview locally
- **Purpose**: Enables student to practice with accompaniment at their own pace while instructor listens via video call. Different modes support different practice styles.
- **Trigger**: Play mode buttons, then playback controls
- **Progression**: Receive sequence → Choose mode (Cycle-by-Cycle or Continuous) → Play → Audio synthesis → Visual timing indicator → Mode-specific controls → Optional loop in Continuous mode
- **Success criteria**: Audio plays accurately timed, uses Web Audio API, mode buttons clear, Cycle-by-Cycle pauses between transpositions with Previous/Repeat/Next options, Continuous plays through with optional looping, instructor device remains silent during student playback

### Virtual Keyboard
- **Functionality**: Touch-responsive piano keyboard for note input and testing
- **Purpose**: Primary input method for sequence creation and audio preview
- **Trigger**: Touch/click on keys
- **Progression**: Touch key → Visual press state → Audio plays → Release
- **Success criteria**: Keys respond within 100ms, visual feedback clear, works on touch devices, proper note mapping

## Edge Case Handling

- **No Audio Permission**: Graceful prompt explaining microphone isn't needed, only speakers
- **Rapid Role Switching**: Clear sequence context when switching roles to prevent confusion, presence updates immediately
- **Room ID Conflicts**: Accept any room ID format, uppercase normalization
- **Invalid Range Selection**: Validate that min < max and prevent sequences outside practical singing range
- **Network Loss During Session**: Persist room, role, and sequence data locally so users can rejoin seamlessly
- **Sequence Too Long**: Limit to 32 steps or 30 seconds to prevent memory issues
- **Language Switching Mid-Session**: Allow language changes without losing room/role context
- **Empty Room ID**: Create random 6-character room code automatically
- **Leaving Room**: Provide clear exit path that clears all session data and presence
- **Stale Presence Data**: Auto-remove users who haven't updated presence in 15 seconds
- **Multiple Students**: Show count of additional students in room, aggregate playback state
- **Continuous Mode Stop**: Simple stop button available during continuous playback
- **Cycle-by-Cycle Navigation**: Previous/Repeat/Next buttons only appear when paused between transpositions
- **BPM Extremes**: Validate tempo stays within musical range (40-200 BPM), provide smooth slider
- **Rest Duration with No Loop**: Rest duration only applies when loop is enabled in Continuous mode
- **Mode Switching During Playback**: Switching between Cycle-by-Cycle and Continuous stops current playback and restarts in new mode

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
  - Card - Role selection cards, sequence configuration, presence display with clear visual hierarchy
  - Button - Primary actions (Play modes: Cycle-by-Cycle/Continuous, Stop, Previous/Repeat/Next in cycle mode, Record) with distinct variants for instructor vs student
  - Select - Range selector for root note, octave boundaries, and instrument selection
  - Slider - BPM tempo control and rest duration adjustment with live value display
  - Tabs - Switch between Step Sequencer and Real-time Recording modes
  - Switch/Toggle - Enable/disable loop playback in Continuous mode
  - Dialog - Settings and help modal
  - Badge - Display current role, sequence status, user count, cycle number, and activity states (recording/playing/paused)
  - Separator - Visual dividers between control sections
  - Avatar - User presence indicators with role-based icons
  
- **Customizations**: 
  - Custom piano keyboard component (not in shadcn) with touch-optimized keys and immediate audio feedback
  - Custom step sequencer grid with note rows, time columns, and interactive note input with audio
  - Custom presence component showing real-time user activity with auto-cleanup
  - Audio engine wrapper using Web Audio API for synthesis with waveform selection
  - Progress bar with percentage display for student playback tracking
  
- **States**: 
  - Buttons: Cycle-by-Cycle/Continuous mode toggles (active mode highlighted), distinct visual states for recording (pulsing red), playing (animated), waiting between cycles (outline with options), stopped (neutral)
  - Sequencer steps: Empty (muted), filled (accent color), currently playing (animated highlight), disabled during playback
  - Piano keys: Default, hover, active/pressed (elevated with audio), disabled (when playing)
  - Sliders: Active dragging state, value tooltip, responsive touch targets
  - Presence badges: Online (green dot), recording (pulsing amber), playing (animated purple), idle (neutral)
  - Cycle navigation: Previous/Repeat/Next buttons only visible when waiting between cycles in Cycle-by-Cycle mode
  
- **Icon Selection**: 
  - Play (phosphor-icons: Play) - Continuous mode playback
  - PlayCircle (phosphor-icons: PlayCircle) - Cycle-by-Cycle mode
  - Stop (phosphor-icons: Stop) - Stop and reset
  - SkipForward (phosphor-icons: SkipForward) - Next cycle in Cycle-by-Cycle mode
  - ArrowCounterClockwise (phosphor-icons: ArrowCounterClockwise) - Previous cycle
  - Record (phosphor-icons: Record) - Real-time recording mode
  - MusicNote (phosphor-icons: MusicNote) - Sequence programming
  - User (phosphor-icons: User) - Student role indicator
  - GraduationCap (phosphor-icons: GraduationCap) - Instructor role indicator
  - Repeat (phosphor-icons: Repeat) - Loop toggle and repeat cycle action
  - Circle (phosphor-icons: Circle) - Online status indicator
  - ArrowsClockwise (phosphor-icons: ArrowsClockwise) - Role switching
  
- **Spacing**: 
  - Keyboard keys: gap-0.5 for visual separation
  - Sequencer grid: gap-1 between cells
  - Control sections: p-4 on cards, mb-4 between cards, mb-6 between major sections
  - Button groups: gap-2 for related actions, flex-wrap for responsive layout
  - Presence cards: p-4 with space-y-3 for user list
  
- **Mobile**: 
  - Keyboard spans full width with scrollable octaves if needed
  - Sequencer grid scrolls horizontally for longer sequences
  - Role selection stacks vertically
  - Controls use larger touch targets (min 44px) for all buttons
  - Collapsible sections for advanced controls
  - Mode selection buttons (Cycle-by-Cycle/Continuous) stack vertically or use full width on mobile
  - Cycle navigation buttons (Previous/Repeat/Next) use equal width distribution on mobile
  - Bottom button bar for primary play/stop controls on student view
  - Sliders with large thumb targets for easy mobile adjustment
  - Presence component collapses to icon badges on very small screens
