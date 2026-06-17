# Groove Container — Visual Theme System

## Design Philosophy

Groove Container is not a MIDI editor. It is a **behavioral groove organism laboratory**. Users do not place notes — they create, mutate, breed, and observe living rhythmic organisms. The visual language must communicate this at every level: the instrument panel, the genome viewer, the mutation chamber, the taxonomy browser, the oscilloscope.

This document defines 10 radically different visual identities. Each is a complete universe with its own materials, controls, data language, and emotional signature.

**Core constraint:** The theme is purely visual. It must never affect groove generation, DNA analysis, or any computational logic. Themes are cascading CSS custom properties plus ornamental CSS — the engine remains untouched.

**Future capability:** Themes must be capable of mutation and hybridization — merging two themes into a new hybrid identity.

---

## Theme 1: CRT Research Terminal

### 1. Theme Name
**CRT Research Terminal**

### 2. Core Concept
A late-1970s scientific research terminal. You are seated at a monochrome vector display connected to a room-sized mainframe that analyzes groove organisms. Every pixel is purposeful. Data is sacred. The machine is smarter than you.

### 3. Visual Mood
Monastic concentration. The quiet hum of vacuum tubes. A dimly lit room where the only light comes from the phosphor screen. Serious, focused, slightly ominous. The feeling of being alone with a sentient machine at 3 AM.

### 4. Color Palette
- **Background:** `#0a0a0a` — absolute black, the space between pixels
- **Primary phosphor:** `#33ff33` — P1 phosphor green, the classic oscilloscope
- **Secondary phosphor:** `#00cc66` — dimmer trace, secondary data
- **Tertiary:** `#669966` — muted green for borders and frames
- **Accent alert:** `#ff6600` — amber warning, rare and meaningful
- **Text dim:** `#224422` — ghost text, secondary info
- **Panel surface:** `#0d1a0d` — slightly green-tinted near-black
- **Scan line overlay:** Semi-transparent horizontal lines
- **Glow:** `rgba(51, 255, 51, 0.15)` — the bloom of the phosphor

### 5. Materials
- Phosphor-coated glass (all text and graphics have a subtle glow bloom)
- Dark brushed aluminum bezels around panels
- CRT scan lines visible on all surfaces at low opacity
- Slight chromatic aberration at panel edges (1px green/red separation)
- The "screen" feels slightly convex, as if drawn on a vacuum tube

### 6. Typography Style
- **Primary:** Monospace bitmap — `"VT323"`, `"Share Tech Mono"`, `"Courier New"` — rendered at exact pixel sizes (11px, 13px, 16px)
- **Headers:** All caps, letter-spacing 3px, same weight as body — no hierarchy through weight, only through size
- **Labels:** 9px-10px, tracking 1px, all lowercase
- **Numbers:** Tabular figures, monospaced. Always right-aligned in data fields
- **No anti-aliasing effect** (simulated with sharp `-webkit-font-smoothing: none`)

### 7. Animation Style
- **Transition speed:** Slow (300-500ms). The machine is deliberate.
- **Fade-in:** Scan-line reveal — text appears line by line, as if the CRT beam is drawing
- **Load states:** A single blinking cursor in the top-left. No spinners. The machine thinks.
- **State changes:** Instant flash (50ms white phosphor bloom), then slow dissolve to new state
- **DNA visualization:** Pulsing wave at 0.5Hz — like a heartbeat monitor
- **Meter updates:** Slow analog creep (200ms ease-out), never digital jumps
- **Error states:** Rapid blinking text at 2Hz, never a dialog box

### 8. UI Component Style
- **Buttons:** Rectangular, reverse-polished (dark center, light 1px border). Hover inverts the border color to bright green. Click shows a brief flash.
- **Select dropdowns:** Expand as teletype-style line-by-line reveal. Options are numbered. `>_ ` cursor at the selection.
- **Checkboxes:** Square brackets `[X]` — terminal style
- **Sliders:** Etched track with a single-pixel bright green indicator line
- **Scrollbars:** 4px wide, green track, dark thumb. Always visible and thin
- **Tabs:** Underscored lowercase labels. Active tab has a full-width underline

### 9. Knob and Control Design
- **Material:** Machined aluminum barrel — dark grey, non-reflective
- **Markings:** Laser-etched tick marks every 10 steps, one bright green LED spot at current value
- **Interaction:** Drag up/down (not circular) — like an oscilloscope vertical control
- **Focus ring:** Single-pixel bright green outline
- **Range indicators:** A thin arc of the phosphor green, like a radar sweep

### 10. Panel Design
- **Layout:** Rigid grid, 8px gutters. Every panel is a `<fieldset>` with a `<legend>`.
- **Borders:** Single-pixel green borders, inset slightly. Panel frame looks etched into the bezel.
- **Headers:** The legend text appears to be engraved into the panel surface.
- **Corner markers:** Right-angle corner brackets `┌ ┐ └ ┘` at each corner — vector terminal aesthetic
- **Spacing:** Generous internal padding (12-16px). Information density is low. Data is spaced for readability.

### 11. Data Visualization Style
- **Oscilloscope mode:** All charts are monochrome vector traces. Green on black. No fill below the line — just the stroke.
- **DNA radial chart:** Styled as a wireframe radar plot — polygon outline only, connecting lines to center are dashed
- **Taxonomy tree:** Indented pure-text tree `├── └── ` with ASCII line drawing characters
- **Step sequencer grid:** White dots on dark field when inactive, bright green pulsing when active
- **Peak meters:** Single-pixel vertical bars, no gradient. Overlaid with a moving "peak hold" dot.

### 12. DNA / Genome Visualization Style
- A 12-axis wireframe spider/radar plot drawn limb-by-limb (scan-line reveal on load)
- Each axis label appears with its value sequentially, as if typewritten
- Active axis lines pulse faintly — the DNA is "live"
- Values shown as floating-point to 2 decimal places with a trailing `_` cursor
- Mutation markers appear as brief horizontal glowing lines across the affected axis
- The plot appears to be carved into the glass surface

### 13. Mutation Interface Style
- A text-based log that streams mutation results line by line:
  ```
  > MUTATION::random-seed-834
  > kick.density: 0.72 → 0.81 [+0.09]
  > snare.groove: 0.44 → 0.38 [-0.06]
  > DONE
  ```
- Each line appears one character at a time (terminal typing)
- The "Mutate" button is a single-key command: press `R` on the keyboard; the button shows `[R] MUTATE`
- A "preserve" grid of toggles uses the `[x]` checkbox style
- Mutation strength is a single vertical slider labeled `INTENSITY` with a glowing indicator

### 14. Sound Feedback Personality
- **Button click:** Short, sharp 800Hz square wave pulse (2ms)
- **Mutation complete:** Descending two-tone alert (600Hz → 400Hz, 100ms)
- **Play/Stop:** Toggle relay click sound (mechanical switch)
- **Error:** 1s of continuous 50Hz hum (mains interference)
- **UI hover:** No sound. The machine does not acknowledge your presence unless you commit.
- **Loading/thinking:** Very faint 30Hz drone — you can feel it more than hear it

### 15. Ideal User Emotion
Calm, focused, reverent. The sensation of operating a finely-tuned scientific instrument from a more deliberate era. You are a researcher, not a musician. The groove is a specimen to be studied.

---

## Theme 2: Xenobiology Laboratory

### 1. Theme Name
**Xenobiology Laboratory**

### 2. Core Concept
A high-security biological research station on a remote planet. Groove organisms are not sounds — they are living specimens cultured in nutrient broths, observed under electron microscopes, and catalogued by interspecies. The interface is a lab bench computer controlling bioreactors and imaging systems.

### 3. Visual Mood
Sterile, clinical, yet alive. The cold impartiality of science meeting the unsettling beauty of alien biology. Petri dishes glow softly. Pipettes measure exact volumes. The air smells of ethanol and growth medium.

### 4. Color Palette
- **Background:** `#0a0e12` — deep lab darkness
- **Primary specimen:** `#00ff88` — bioluminescent green (think GFP)
- **Secondary culture:** `#ff4488` — magenta RNA stain
- **Tertiary substrate:** `#44aaff` — cyan for nutrient medium
- **Warm glow:** `#ffaa22` — incubation chamber amber
- **Danger:** `#ff0033` — biohazard alert
- **Panel surface:** `#11181f` — slightly blue-tinged off-black
- **Glass:** `rgba(0, 255, 136, 0.06)` — very faint specimen glow on surfaces
- **Ink:** `#1a3a2a` — microscope slide stain color for borders
- **Highlights:** `rgba(255, 255, 255, 0.03)` — specular highlights on glass surfaces

### 5. Materials
- **Frosted lab glass:** Semi-transparent panels with subtle back-surface blur
- **Brushed stainless steel:** Cool grey, non-reflective, micro-etched grain
- **Bio-gel substrate:** Backgrounds have an extremely subtle organic texture (barely perceptible cellular pattern at 6400% zoom)
- **Glowing culture medium:** Buttons and active elements appear to be illuminated from within — eerie, deep, not on the surface
- **Microscope objective:** Data visualization has faint chromatic rings like phase-contrast microscopy

### 6. Typography Style
- **Primary:** Clean sans-serif — `"Inter"`, `"Space Grotesk"` — with generous line height (1.6)
- **Headers:** Light weight (300), large tracking (4px), all caps. Appears laser-etched into the panel
- **Data labels:** 9px, `#44aaff`, lowercase. Like ink annotations on a specimen slide
- **Value readouts:** Tabular figures in bold weight, always accompanied by the unit
- **Specimen names:** Italic — the Linnaean binomial convention: *Erythros rhythmica*
- **Edit mode:** Text appears to float slightly above the surface, with a faint cyan glow beneath

### 7. Animation Style
- **Transition speed:** Medium (200-350ms). Scientific equipment is responsive but not rushed.
- **Specimen loading:** A circular "culture plate" spins slowly, images fading in as if the microscope is focusing
- **Data appearing:** Dissolves in from a radial gradient — emerging from a point of origin
- **Meter updates:** Linear with small overshoot (like a laboratory balance that wobbles to equilibrium)
- **Warning states:** Gentle pulsing of the biohazard color, never a flash or blink
- **DNA animation:** The strand slowly rotates in 3D (isometric projection), with base pairs appearing as they come into focus
- **Click feedback:** A brief "ripple" effect on the surface, like a drop falling into culture medium

### 8. UI Component Style
- **Buttons:** Capsule-shaped with rounded ends, as if they are specimen tubes lying on their side. The label is etched into the glass.
- **Active button:** Fills with the primary specimen color, text becomes dark. Inactive is frosted translucent glass.
- **Select dropdowns:** A "well plate" metaphor — options appear as micro-plate wells. Clicking one selects the culture.
- **Checkboxes:** Circular wells — a filled well indicates active. Like a micropipette has deposited sample.
- **Sliders:** A track etched into glass. The handle is a tiny glass bead with a colored core.
- **Toggle switches:** Physical DNA sequencer toggle — up is on, down is off, with a satisfying snap animation.

### 9. Knob and Control Design
- **Material:** Injection-molded translucent bio-resin. Light passes through the body.
- **Internal glow:** A colored LED inside the knob shines through the material. Color varies by function (green for volume, magenta for mutation intensity).
- **Markings:** Raised ridges on the outside edge, visible but not colored.
- **Interaction:** Circular twist. The knob has a "notch" feel — detents at each step.
- **Focus ring:** A faint glow around the circumference, as if the material is phosphorescing under a UV lamp.

### 10. Panel Design
- **Layout:** Panels are laid out like a lab bench — tools at the top (controls), samples in the middle (grid/sequencer), analysis at the bottom (data viz)
- **Borders:** No visible borders. Panels are separated by 2px gaps where one surface material meets another.
- **Glass effect:** Panels controlling the organism have a subtle frosted glass background — as if you're looking into a culture chamber
- **Headers:** Etched into a small metal plate at the top-left of each panel section
- **Corner radius:** 8px on all panels, like the rounded corners of a microscope slide
- **Depth:** Subtle box-shadow simulating a 1px raised surface with a distant light source

### 11. Data Visualization Style
- **Oscilloscope traces:** Styled as two-color fluorescent stains — magenta trace on a cyan grid. Like a gel electrophoresis readout.
- **DNA radial chart:** Each axis is a "petri dish streak" — the data line looks like a bacterial culture growing outward from center
- **Density histogram:** Vertical bars styled like stacked microscope slides, each with a faint label
- **Correlation matrix:** Heat map in bioluminescent greens and magentas — like an oligonucleotide microarray
- **Peak meters:** Vertical growth columns — the liquid level rises in a transparent tube

### 12. DNA / Genome Visualization Style
- A rotating 3D helical strand in isometric view, rendered as if it's a crystallographic model
- Base pairs are colored beads (green/cyan/magenta) connected by thin wireframe bonds
- The strand slowly precesses — 1 rotation per 8 seconds
- Hovering highlights a specific base pair with a data readout: `LOCUS: 4.2 / VALUE: 0.83`
- Mutation targets glow briefly before altering their color
- The helix sits inside a transparent cylinder — the "sequencing chamber"

### 13. Mutation Interface Style
- A "mutagenic compound" selection panel — choose your mutagen (UV radiation, chemical alkylator, random substitution)
- Each mutagen has a color-coded vial icon with a concentration slider
- Application feels like pipetting: drag the slider to the desired amount, then confirm with a "Dispense" button
- Mutation log renders as a gel electrophoresis lane — bands appear where mutations occurred
- "Preserve" genes are labeled as "restriction sites" — protected from cleavage
- Mutation preview shows a "diff" view: the old helix fading out, new helix fading in

### 14. Sound Feedback Personality
- **Button click:** Soft plunger sound — a micropipette being depressed
- **Mutation complete:** The sound of a centrifuge spinning down (2s, pitch drops)
- **Culture selected:** Faint wet "bloop" — a droplet falling into medium
- **Play/Stop:** The hum of a centrifuge starting (play) / the door opening (stop) — pneumatic hiss
- **DNA analysis:** Whirring of a sequencing laser with periodic clicks per base pair
- **Error:** A short alarm that resembles a laboratory autoclave warning buzzer
- **Status idle:** Low, continuous 40Hz hum of ventilation and cooling fans

### 15. Ideal User Emotion
Scientific curiosity mixed with slight unease. You are cultivating something alive and you are responsible for its well-being. The interface rewards careful experimentation. Mistakes feel like they have consequences — but there is always another culture to start.

---

## Theme 3: Industrial Reactor Control Room

### 1. Theme Name
**Industrial Reactor Control Room**

### 2. Core Concept
A nuclear or chemical process control room from the 1980s. Massive wall panels of indicator lights, analog meters, and chart recorders. The groove is a critical reaction process. Every parameter must be monitored. Alarms are serious. The operator's job is to keep the reaction stable and efficient.

### 3. Visual Mood
High-stakes industrial precision. The quiet hum of forced air cooling. Banks of amber and red status lights. The occasional clatter of a chart recorder advancing. Coffee stains on the console. A small CRT for data analysis. The weight of responsibility.

### 4. Color Palette
- **Background:** `#121212` — smoked black panel finish
- **Primary process:** `#ff6600` — amber indicator, active process
- **Secondary control:** `#00aaff` — cyan for stable/okay status
- **Warning:** `#ffcc00` — yellow, pay attention
- **Critical:** `#ff2200` — red, immediate action required
- **Inactive/off:** `#333333` — unlit indicator
- **Panel surface:** `#1a1a1a` — slightly lighter than background, with a faint brushed texture
- **Chart paper:** `#f5f0e0` — warm off-white for data backgrounds (when present)
- **Metal:** `#2a2a2a` — steel panel dividers
- **Meter face:** `#0f0f0f` with white tick marks and a glowing needle

### 5. Materials
- **Phenolic resin panels:** Dark brownish-black composite board, slightly matte
- **Anodized aluminum:** Trim and frames, dark grey with visible grain
- **Glazed ceramic:** Indicator light covers — convex glass lenses that protrude slightly from the panel
- **Chart recorder paper:** Grid backgrounds have a subtle warm-gray tone with faint blue grid lines
- **Rubberized switches:** Buttons feel like they have a rubber membrane — matte, slightly soft
- **Protective glass:** Instrument faces have a thick glass covering with minimal reflection

### 6. Typography Style
- **Primary:** Heavy industrial slab serif — `"Roboto Slab"`, `"IBM Plex Mono"`, `"Courier"` — chunky, utilitarian
- **Panel labels:** All caps, 9px, engraved into metal plates — Helvetica-style but heavier
- **Alphanumeric displays:** Seven-segment style — `"Seven Segment"`, `"Digital-7"` — for readouts
- **Chart annotations:** Handwritten-looking script is out of place. Everything is stenciled or stamped.
- **Units:** Always shown. `RPM`, `%`, `°C`, `kPA`, `dBFS`, `BPM` — industrial processes need units
- **Warning text:** All caps, bold, with exclamation mark. `ALARM HIGH DENSITY`

### 7. Animation Style
- **Transition speed:** Slow (400-600ms). Industrial processes change slowly.
- **Value changes:** Analog meter needles glide smoothly (cubic-bezier ease-out). Never jump.
- **Alarm state:** Slow pulsing (1Hz) of the associated indicator light. Latches until acknowledged.
- **Strip chart:** Chart data scrolls from right to left continuously, with the pen tracing in real time
- **Process start:** Sequential bank-by-bank illumination — lights turn on in order, each with a relay click sound
- **State change:** A brief voltage flicker (50ms dimming of all lights) before the new state appears
- **Button press:** Short downward animation with a slight shadow change — physical travel

### 8. UI Component Style
- **Buttons:** Large rectangular industrial pushbuttons. Slightly convex surface. The label is engraved below or beside the button. Pressed state: shadow disappears, button appears to be pushed in.
- **Panel of buttons:** Arranged in groups with engraved plastic labels above each group
- **Indicator lights:** Round 10px convex circles. Active = illuminated amber. Inactive = dark grey with a hint of white edge reflection.
- **Toggle switches:** Two-position bat handles — up for on, down for off. 3D modeled with a shadow.
- **Meters:** Analog-style radial gauges with a white needle on a dark face. Minor/major tick marks. Numerical range labels.
- **Grid/table data:** White lines on dark background — like a strip chart
- **Selectors:** Rotary wafer switches — multiple positions arranged in a circle, a white line indicating current selection

### 9. Knob and Control Design
- **Material:** Machined aluminum with black anodized finish. Knurled edge for grip.
- **Markings:** White painted index line that rotates with the knob. Scale is printed on the panel around the knob.
- **Interaction:** Drag to rotate. Has physical detents at each major position.
- **Size:** Large — 32-40px diameter. A control room knob is meant to be operated with gloved hands.
- **Caps:** Some knobs have a colored plastic cap (red for critical parameters)
- **Potentiometer style:** A central screw slot for the initial setting, with a larger outer grip ring

### 10. Panel Design
- **Layout:** Rigid horizontal strips. Left-to-right, top-to-bottom process flow.
- **Visual hierarchy:** Most important process indicators (BPM, volume, master levels) are the largest — top-center
- **Surface:** Matte dark finish. Every panel has a 3D beveled edge — inset into the console
- **Labeling:** Machine-engraved plastic nameplates, white text on dark background. Screwed into the panel at all four corners.
- **Service loops:** Cables between panels are visible — thin colored lines that connect related controls (signal flow indication)
- **Plexiglass cover:** Some panels have a protective cover with a "DO NOT OPERATE" tag — these are preset/protected settings

### 11. Data Visualization Style
- **Strip chart recorders:** Continuous scrolling line graphs, the "pen" leaves ink on moving paper. Grid is light blue on cream.
- **Radial gauges:** All primary metrics available as analog meter faces. One meter per metric. The operator can scan the room.
- **Bar graphs:** Vertical arrays of LED segments with amber/red/green zones. Like a graphic equalizer but for process parameters.
- **Alarm summary:** A dedicated "Alarm Panel" listing active alarms in reverse chronological order, with timestamps to the second
- **Trend lines:** Overlain on the strip chart — short-term (5 min) and long-term (30 min) trends for the same parameter
- **Process flow diagram:** A simple block diagram showing signal path with meters at each block

### 12. DNA / Genome Visualization Style
- Represented as a **control rod diagram** — 12 vertical bars (one per gene axis), each with a numerical readout and a status light
- Each bar has a green/amber/red zone marker — the current position is indicated by a glowing dot
- Hovering a bar reveals a chart recorder trace of recent values (mutation history as trend lines)
- Mutation targets are indicated by a flashing amber "MAINTENANCE REQUIRED" light on the relevant bar
- The DNA score (overall) is the largest meter at the top — needle on a 0-100 scale with colored zones
- Gene names are engraved plastic plates below each indicator

### 13. Mutation Interface Style
- A dedicated **Reactor Control Panel** sub-panel with:
  - "Control Rod Insertion" slider (mutation strength)
  - "Neutron Flux" meter (mutation rate)
  - "Coolant Temperature" readout (current organism stability)
  - Row of "SCRAM" buttons (preserve individual genes — red pushbuttons with plastic covers)
- Mutation = "control rod withdrawal" — pulling rods out increases reactivity
- The mutation log is a chart recorder roll — each mutation event is a "spike" on the paper
- A master "SCRAM" button (large red mushroom button) triggers a full revert to the previous stable organism
- Preview mode = "simulation mode" — the chart recorder runs in fast-forward (2x speed)

### 14. Sound Feedback Personality
- **Button click:** Solid mechanical click — a microswitch rated for 500,000 cycles
- **Alarm:** A slow, loud horn sound (2Hz pulse) that latches until the operator acknowledges
- **Relay:** Each significant state change is accompanied by a relay energization click
- **Chart recorder:** Continuous low-frequency scratching — the pen moving across paper
- **Fan noise:** A constant low rumbling from the cooling system behind the panels
- **Meter movement:** Faint mechanical whirring as analog meters move
- **Panel power-up:** Sequential relay clicks as the system wakes up — 5-10 clicks in the order of initialization
- **Process start:** A large contactor engaging — KA-CHUNK — followed by rising pitch of a motor

### 15. Ideal User Emotion
Focused authority. You are in command of a powerful, potentially dangerous system. The interface demands respect. Every action has weight. When the alarms are silent, you feel competent. When they sound, you respond immediately. Music is an industrial process and you are the operator.

---

## Theme 4: Deep Sea Observatory

### 1. Theme Name
**Deep Sea Observatory**

### 2. Core Concept
A bathysphere or deep-sea research station at the bottom of an oceanic trench. The groove organisms are bioluminescent creatures observed through reinforced quartz windows into the abyss. Pressure is immense. Light is scarce. Life finds a way.

### 3. Visual Mood
Submerged isolation. The crushing weight of the ocean pressing against the hull. Bioluminescent flashes in the darkness outside the window. The slow drift of deep-sea currents. Your only connection to the surface is a crackling sonar link.

### 4. Color Palette
- **Background:** `#020810` — absolute deep ocean darkness
- **Abyssal blue:** `#0a2440` — deep water, ambient diffused light
- **Bioluminescence primary:** `#00ffcc` — cyan-blue living light
- **Bioluminescence secondary:** `#ff4488` — neon pink from deep-sea anemones
- **Sediment:** `#1a2830` — dark seafloor for panel surfaces
- **Instrument glow:** `#ff6600` — warm amber from control console displays
- **Pressure indicator:** `#ff0033` — hull integrity warning
- **Quartz window:** `rgba(0, 255, 204, 0.03)` — faint bioluminescent reflection on "glass"
- **Sonar ping:** `rgba(0, 170, 255, 0.2)` — expanding ring of sound

### 5. Materials
- **Reinforced hull steel:** Dark metal surface with visible rivets or weld seams (subtle vertical line pattern)
- **Quartz viewport:** Panels have a rounded-rect "window" with a thick border, as if looking into another chamber
- **Rubber gaskets:** Connectors and seams have a thick black seal between them
- **Bioluminescent mucus:** Active controls have an organic-looking glow that seems to swim slightly
- **Corroded metal:** Some framing has a green patina — copper alloys reacting to seawater
- **Sediment floor:** Background gradient that feels like silt settling at the bottom

### 6. Typography Style
- **Primary:** Marine sans-serif — `"Nunito"`, `"Sora"`, `"DM Sans"` — slightly rounded, readable in low light
- **Headers:** Light weight, generous letter-spacing, lowercase. Like labels on a diving instrument.
- **Data readouts:** Bold monospace — `"JetBrains Mono"`, `"IBM Plex Mono"` — green on dark, like a depth sounder
- **Labels:** Small (8px-9px), `#4488aa`, all caps with underscore separators: `DEPTH_M / TEMP_C`
- **Specimen names:** Italic serif — `"EB Garamond"` italic — for taxonomic names, creating a nostalgic "expedition log" feel
- **Emergency text:** Orange, all caps, heavy tracking. `EMERGENCY ASCENT PROTOCOL`

### 7. Animation Style
- **Transition speed:** Slow and drifting (500-800ms). The pace of the deep ocean.
- **Ambient movement:** A very slow horizontal parallax (2px over 10 seconds) — the station sways with currents
- **Bioluminescent flares:** Occasionally, a brief (200ms) expanding glow from an active element, then fade over 2s
- **Bubbles:** Control interactions produce a small burst of rising bubbles — particles floating upward
- **Sonar:** A circular ping expands from the interaction point at a slow rate
- **Loading:** A slowly rotating 3D wireframe bathysphere
- **Meter updates:** Slow, smooth, as if the instrument is analog and the needle is damped by oil

### 8. UI Component Style
- **Buttons:** Rounded rectangles with a thick border resembling a pressure-resistant switch housing
- **Active button:** Inside the housing, a glowing bioluminescent core pulses slowly
- **Indicator lights:** Tiny circular quartz "portholes" with an LED inside. The light appears to be underwater.
- **Sliders:** A track that looks like a metal rail. The handle is a small metal ball (a "deep-sea grabber")
- **Toggles:** A metal lever that moves through a J-shaped slot — you push it up and it locks into a notch
- **Panel dividers:** Thick metal strips with visible bolts at each end

### 9. Knob and Control Design
- **Material:** Rubberized metal — a rubber grip over a brass core. Saltwater-resistant.
- **Markings:** White raised dots at major positions. You can feel them more than see them.
- **Interaction:** Drag to rotate. Pauses at each position — the knob has physical "steps" as if engaging with gears.
- **Waterproof boot:** The base of the knob has a rubber seal where it meets the panel
- **Light:** A tiny LED at the base of the knob illuminates the current setting
- **Surface texture:** Knurled grip with deep grooves for wet gloves

### 10. Panel Design
- **Layout:** Asymmetric but balanced. Panels float on the dark background like independent instrument clusters.
- **Porthole frames:** Major panels have a thick elliptical arc at each corner — like a submarine viewport
- **Surface:** Dark matte with a very subtle metallic fleck — the paint used on naval instruments
- **Headers:** A metal nameplate mounted on two small brackets, standing slightly proud of the panel surface
- **Cable conduits:** Thin raised lines across the panel surface representing cabling between instruments
- **Depth hierarchy:** Panels deeper in the info hierarchy appear slightly darker, as if at a greater depth

### 11. Data Visualization Style
- **Sonar display:** A circular radar-like display in the top-left. The groove pulses as a glowing ring.
- **Depth gauge:** A vertical bar to the right showing "depth" as a proxy for groove complexity
- **Temperature gradient:** A horizontal bar that shifts from cold blue to warm red — represents motion density
- **Bioluminescence timeline:** A scrolling horizontal strip of faint glowing points — each point is a beat
- **Specimen catalog:** Thumbnails of recent grooves as "specimens" in a grid, each with depth/temp/salinity (BPM/complexity/DNA score)
- **Pressure reading:** A large numeric display with a circular gauge surrounding it — shows "atmospheric pressure" as groove intensity

### 12. DNA / Genome Visualization Style
- An **underwater creature** silhouette made of 12 glowing nodes connected by lines
- Each node corresponds to a gene, pulsing at its own rate
- The creature gently floats — a slow sine-wave motion on the Y axis
- Connecting lines glow brighter when the relationship between two genes is strong
- Mutation targets flash as if the creature is being "tagged" with a tracking dart
- The entire creature is viewed through a circular "porthole" — the DNA panel window
- A small label beneath gives the organism's scientific name: *Genus. rhythmica abyssalis*

### 13. Mutation Interface Style
- A **specimen injection panel**:
  - Vials of "mutagenic compounds" represented by colored liquids — green (gentle), red (aggressive), blue (structural)
  - Selecting a vial shows a pipette that injects into a small culture dish animation
  - The culture dish shows the "before" and "after" as two faint silhouettes
- Mutation parameters are dials on a panel labeled "PRESSURE CHAMBER" — increasing pressure increases mutation intensity
- Preserved genes are represented as "immune cells" — small glowing spheres that surround and protect an axis
- The mutation log is a column of water — each mutation creates a "depth layer" of sediment. Older mutations sink.
- A "SAMPLE COLLECTION" button saves the current organism to a specimen jar (preset save)

### 14. Sound Feedback Personality
- **Button click:** A deep, muffled thud — sound travels differently underwater
- **Sonar ping:** A slow, clear ping that echoes (feedback on any significant interaction)
- **Mutation:** The sound of bubbles being released — a low-pressure gas expanding
- **Dive/Play:** The creaking of the hull under pressure — a low groan that subsides
- **Surface/Save:** The sound of winch cable being reeled in
- **Alarm:** Klaxon horn — the same as surface ships, but muffled by water. Deep and slow.
- **Ambient:** Constant low-frequency water flow. Occasional distant bioluminescent crackle.
- **Specimen collected:** The sound of a glass jar being sealed with a rubber stopper

### 15. Ideal User Emotion
Contemplative isolation. The abyss is peaceful but dangerous. You are an observer of life that thrives where light cannot reach. Each groove organism is a deep-sea creature — beautiful, alien, requiring careful study. Time moves differently here.

---

## Theme 5: Gothic Data Cathedral

### 1. Theme Name
**Gothic Data Cathedral**

### 2. Core Concept
A cathedral constructed from data, stained glass, and dark stone. The interface is a fusion of medieval manuscript illumination and cybernetic infrastructure. Grooves are not sounds but sacred geometries. The Mutation Engine is an alchemical laboratory. The DNA analyzer is a celestial orrery.

### 3. Visual Mood
Sacred, ornate, imposing. The smell of incense and old stone. Sunlight streaming through stained glass depicting waveforms. Gregorian chant ambient. Massive rose windows made of circuit traces. You are not a user — you are an archivist of sacred rhythms.

### 4. Color Palette
- **Background:** `#0d0a12` — deep ecclesiastical darkness
- **Stained glass crimson:** `#cc2244` — the blood of the groove
- **Stained glass sapphire:** `#2244aa` — the sky of the arrangement
- **Gold leaf:** `#d4a017` — ornament, illumination, status
- **Stone:** `#2a2530` — cathedral wall for panels
- **Ivory:** `#e8dcc8` — manuscript parchment for text backgrounds
- **Ink:** `#1a1020` — scriptorium ink for primary text
- **Rose window glow:** `rgba(204, 34, 68, 0.1)` — warm red light on surrounding surfaces
- **Candle:** `rgba(212, 160, 23, 0.05)` — very faint warm golden ambient glow at the top of panels

### 5. Materials
- **Stone masonry:** Panel backgrounds have a subtle block pattern — 50% opacity lines suggesting stone blocks
- **Stained glass:** Active UI sections are framed in colored glass with visible lead came lines (black 1px borders)
- **Gilded trim:** Gold leaf borders around significant panels — faint glowing shimmer on hover
- **Parchment:** Data sheet backgrounds use a warm off-white with a subtle aged texture
- **Brass:** Knobs and switches are polished brass — warm gold with dark oxidation in crevices
- **Wood:** Dark oak surfaces between panels, with visible grain (subtle vertical stripe pattern)
- **Velvet:** Dark red velvet lines the inside of panel edges — visible as a 2px soft inner border

### 6. Typography Style
- **Primary:** Blackletter-inspired — `"UnifrakturMaguntia"`, `"Cinzel"`, `"Almendra SC"` — for headers and important titles
- **Body:** Humanist serif — `"EB Garamond"`, `"Source Serif 4"` — the font of manuscripts
- **Data:** Monospace in a classical vein — `"Iosevka"` or `"Verily Serif Mono"` — counters that feel carved
- **Labels:** Small caps, gold, on dark backgrounds. Like illuminated initials.
- **Initial caps:** The first letter of section headers is a large drop cap — ornate, with a vine border
- **Numbers:** Roman numerals for important values (tempo, complexity). Arabic for scientific data.
- **Decoration:** Section dividers are ornamental fleurons ❦, manicules (pointing hand ☞), ornamental pilcrows ¶

### 7. Animation Style
- **Transition speed:** Deliberate and slow (600-1000ms). Processions, not dashboards.
- **Reveal:** Content appears from the center outward, like a rose window being illuminated from behind
- **Hover:** A faint glow spreads across the element like candlelight — radial gradient expansion
- **State change:** A brief "illumination flash" — the element glows gold for 100ms, then transitions to the new state
- **Loading:** An ornate cross or rose window that slowly turns, with colored segments lighting up in sequence
- **Scroll:** Smooth with a slight deceleration curve — like turning a heavy manuscript page
- **Alert:** A tolling bell effect — the entire panel flashes crimson once, then returns to normal
- **Mutation:** The affected element appears to "transmute" — a swirling golden particle effect, then settles into new form

### 8. UI Component Style
- **Buttons:** Ornate rectangular frames with Gothic arch tops. The label appears on a ribbon across the button.
- **Pressed state:** The button darkens, and the gold trim dims — as if a candle was extinguished
- **Select dropdowns:** Styled as a "book of hours" — each option is an illuminated page. The current selection is marked with an illuminated initial.
- **Switches:** A two-position reliquary — you slide a metal tab between "BENEDICTUS" and "DAMNATUS"
- **Sliders:** A carved wooden track with a brass handle that slides along it
- **Checkboxes:** A small circular stained-glass rosette — filled color when active, grey stone when inactive
- **Progress bars:** A growing illuminated column — like a candle that burns brighter

### 9. Knob and Control Design
- **Material:** Solid brass, polished smooth, with dark oxidation in the engraved markings
- **Shape:** Fluted — like a column capital. Slightly wider at the base.
- **Markings:** Engraved Roman numerals at the cardinal positions. A single gothic cross on the pointer.
- **Interaction:** Circular drag. Detents with a heavy, mechanical feel — you have to actively turn them.
- **Center:** A small faceted jewel (ruby or sapphire) at the center of each knob — color indicates function
- **Warmth:** The knob always feels slightly warm — as if it has been held by many archivists before you

### 10. Panel Design
- **Layout:** Symmetrical, hierarchical. The most sacred elements (DNA visualization, play control) are at the center, elevated.
- **Borders:** Dark stone outer border, then a gold inner border, then the panel surface. Three layers of framing.
- **Top:** Each panel has a pointed Gothic arch at its top — like a cathedral window.
- **Inner surface:** Dark velvet red (`#1a0d14`) for active panels. Dark stone (`#1a1520`) for passive ones.
- **Corners:** Small decorative finials at each corner — crosses or fleur-de-lis.
- **Footers:** Each panel has a Latin inscription in small gold type — `VITA RHYTHMI`, `MUTATIO SACRA`, `DNA AETERNUM`
- **Depth:** Shadow suggests the panel is a recessed alcove — darker at the back, lighter at the edges.

### 11. Data Visualization Style
- **Rose window chart:** The primary visualization (DNA radial chart) is a massive rose window. Each axis is a spoke of colored glass. The data value determines the opacity of the glass segment.
- **Manuscript illumination:** Charts and graphs are drawn in the style of medieval marginalia — with hand-drawn-looking lines and organic curves
- **Histogram:** Styled as cathedral pillars — each bar is a fluted column with a capital. Height indicates value.
- **Correlation visualization:** A constellation map — stars connected by thin gold lines. Brighter stars = stronger values.
- **Time/sequence data:** A scroll-like horizontal band — events are "illuminated letters" along the parchment
- **Meter/level:** A column of liquid in a brass tube — the "alchemical measure"

### 12. DNA / Genome Visualization Style
- A **celestial orrery** — 12 rotating spheres (planets) orbiting a central golden cross
- Each sphere represents a gene, colored by its genome
- Spheres orbit at different speeds based on their mutation stability (slower = more stable)
- Connecting lines between spheres form the shape of a 12-pointed star at certain orbital alignments
- Mutation targets glow brightly — like a comet entering the system
- The current values are shown as rings around each sphere — thickness of ring = value
- The background of the orrery is a dark blue with faint gold stars
- A small label in gold: `[SIDERA RHYTHMI]`

### 13. Mutation Interface Style
- An **alchemical laboratory** panel:
  - Four "elements" to select: AQUA (rhythm mutation), IGNIS (accent mutation), TERRA (structural mutation), AER (timing mutation)
  - Each element is represented by an alchemical symbol in a circle
  - Mutation strength is controlled by a "philosopher's stone" slider — a ruby that slides along a track
  - Preserved genes are "wards" — small pentagrams that protect an axis
- The application of mutation is called "transmutation" — you select a target circle, choose the element, and press "TRANSMUTE"
- The log is a "Book of Transmutations" — a scrolling list of entries in Latin:
  ```
  · Anno Domini MDCCCLXVI — Densitas augmentum: 0.72 → 0.81
  · Anno Domini MDCCCLXVI — Complexitas diminutio: 0.64 → 0.58
  ```
- A large "PRIME MATERIA" button generates a fresh organism from raw chaos (original groove generation)

### 14. Sound Feedback Personality
- **Button click:** The strike of a tuning fork — pure, resonant, golden
- **Mutation:** Low organ chord held for the duration, resolving on completion
- **Play/Stop:** The turning of a massive page in a medieval manuscript
- **DNA analysis:** A choir of angelic voices humming gradually — one voice per axis being analyzed
- **Alert:** The toll of a single, deep bell — the cathedral bell
- **Save:** The sound of a quill scratching on vellum
- **Startup:** The creaking of a massive door opening, followed by organ music that fades in
- **Hover:** The faint sound of wind through stone corridors

### 15. Ideal User Emotion
Reverence and transcendence. This is not a tool — it is a ritual. The groove is not generated, it is *revealed*. The interface rewards patience. Beauty is not decoration — it is the point. Working with grooves in this theme is a spiritual experience.

---

## Theme 6: Orbital Research Station

### 1. Theme Name
**Orbital Research Station**

### 2. Core Concept
A low-gravity research module on a space station orbiting a distant planet. The interface is a compact, efficient, highly engineered space-grade workstation. Every square centimeter is optimized. Ambient light is cool and blue from a nearby gas giant reflected through the viewport.

### 3. Visual Mood
Weightless precision. The quiet hum of life support. Stars drifting past the window. A pristine, organized space where everything has its place. Discipline meets wonder. You are a scientist aboard a multi-year mission studying extraterrestrial rhythmic phenomena.

### 4. Color Palette
- **Background:** `#05080f` — space black
- **Orbital blue:** `#0066ff` — primary interface, the light of a distant star
- **Panel grey:** `#1a1e2a` — equipment rack surface
- **Status green:** `#00e676` — all nominal, telemetry active
- **Warning amber:** `#ffab00` — caution, investigate
- **Alert red:** `#ff1744` — emergency, immediate action
- **Star light:** `rgba(255, 255, 255, 0.03)` — a million points on dark surfaces
- **Nebula glow:** `rgba(0, 102, 255, 0.05)` — very faint ambient blue light in corners
- **Display white:** `#e8eaf6` — screen color, slightly blue-tinted

### 5. Materials
- **Mill aluminum:** All panels are light grey metal with a fine horizontal brush grain
- **Polycarbonate:** Protective covers over screens — slightly glossy, with minimal anti-reflective coating
- **Rubberized grips:** Control handles and edges have a soft-touch dark grey material
- **LED matrices:** Status displays are tiny dot-matrix segments (5x7 character blocks)
- **Velcro straps:** Cables are managed with black velcro along panel edges
- **Metal honeycomb:** The main background has an ultra-subtle hexagonal grid pattern — the structural core of the station

### 6. Typography Style
- **Primary:** Clean geometric sans — `"Space Grotesk"`, `"Inter"`, `"Manrope"` — highly legible, no flourishes
- **Labels:** 9px, light weight, all caps, tracking 2px. `O2 LEVEL`, `COMM LINK`, `RHYTHM BUFFER`
- **Data:** `"JetBrains Mono"`, `"Inconsolata"` — always in a data box with a label above
- **Headers:** Semi-bold, medium size, with a horizontal rule below. `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌`
- **Units:** Always present in lighter weight. `BPM · STEPS · DNA INDEX`
- **Emergency:** Red, bold, with a bordered box. `CRITICAL RHYTHM ANOMALY`

### 7. Animation Style
- **Transition speed:** Fast (100-200ms). Time is a resource in orbit.
- **Fade:** Sharp cut or fast fade. No slow dissolves — that's wasted CPU cycles.
- **Loading:** A single line sweeping across an empty data box — like a scanning electron beam
- **End of scan:** Brief white flash — the data has been acquired
- **State change:** Immediate — value snaps into place. There is no "analog warmth" in space.
- **Pulse:** Data refresh is indicated by a 1px white line that sweeps vertically over the data area (100ms)
- **Meter:** Instant, with a 1-pixel "peak hold" line that fades after 1s
- **Error/reconnect:** The display glitches briefly — horizontal line displacement like a CRT losing sync

### 8. UI Component Style
- **Buttons:** Compact rectangles with a flat bottom and a 45° angled top edge — like a key on a spacecraft keyboard
- **Active state:** A faint orbital-blue glow emanates from the key. The key appears slightly raised.
- **Indicator lights:** Small 3px diameter circles with a sharp bright center. When unlit, invisible.
- **Sliders:** A thin metal track with a rubberized handle. The track has tick marks at each 10% interval.
- **Toggles:** Small marine-grade rocker switches — momentary action, spring-return to center.
- **Data entry:** A focused input has a thin blue underline cursor that blinks at 1Hz
- **Grid rows:** Alternating rows have a `#111520` and `#161a2a` background — space-grade zebra striping

### 9. Knob and Control Design
- **Material:** Machined titanium with anodized blue finish. Lightweight, extremely strong.
- **Shape:** Fluted edge with a flat top. A single engraved white line marks the setting.
- **Interaction:** Drag to rotate. Micro-detents at each step — you can feel each individual value.
- **Size:** Small (18-24px). Every millimeter of panel space is precious.
- **Label:** Knob function is printed *below* the knob, not around it. The panel surface is too valuable.
- **Grip:** Shallow vertical grooves — enough texture for gloves but minimal dust collection

### 10. Panel Design
- **Layout:** Left-to-right, top-to-bottom. Information flows like a system diagram. Signal in → Process → Analyze → Output.
- **Width:** Panels occupy the full width of the available space. No floating panels. Everything is anchored.
- **Borders:** 1px `#0066ff` with `rgba(0, 102, 255, 0.1)` glow. Sharp corners.
- **Background:** `#0a0e1a` — very dark blue-black. The station interior is dim to save power.
- **Headers:** A metallic plate with engraved text, separated from the body by a 4px gap with a mounting screw visualization at each end
- **Status strip:** Each panel has a thin bar at the top showing: panel name (left), current status indicator (right: green dot = nominal, amber = caution)
- **Mounting:** Each panel appears to be attached to a standardized mounting rail — you can see the rail attachment points at the top and bottom edges

### 11. Data Visualization Style
- **Telemetry screens:** All charts are styled like orbital telemetry — green traces on a dark grid, with coordinate readouts along the axes
- **Radar plot:** A circular polar display with a rotating trace line — the groove is a "satellite" being tracked
- **Bar graph:** LED array bars — individual segments with sharp boundaries. No gradients.
- **Line graph:** Anti-aliased traces with no fill. Axes are labeled with engineering notation. Grid lines are `#112244`.
- **Spectrogram:** A horizontal waterfall display — frequency content scrolling from top to bottom
- **Status panel:** A dense grid of key-value pairs, like a spacecraft telemetry feed:
  ```
  DENSITY     0.83 [▓▓▓▓▓▓▓▓░░]
  COMPLEXITY  0.64 [▓▓▓▓▓▓░░░░░]
  SWING       0.12 [▓░░░░░░░░░]
  ```
- **Alarm display:** A list of timestamped events with color-coded severity bars on the left

### 12. DNA / Genome Visualization Style
- An **orbital trajectory plot** — 12 orbital paths (ellipses) converging at the center
- Each gene is a "satellite" following its orbit, with its current position on the orbit indicating the value
- The orbital plane rotates slightly (3° tilt) to give depth
- Mutation targets flare briefly — a thruster burn adjusting the orbit
- A data readout appears on hover: `GENE: kickSnare | VALUE: 0.83 | ORBIT: Stable`
- The entire visualization is enclosed in a frame labeled `[ORBIT DETERMINATION SYSTEM]`
- Stabilized genes are shown as "geostationary" — a fixed position rather than an orbiting path

### 13. Mutation Interface Style
- An **orbital maneuvvering system** panel:
  - Delta-V budget — remaining mutations available before system recalibration
  - Thruster controls: pitch (accent), yaw (timing), roll (density), thrust (mutation strength)
  - Each is a small slider with a "burn" button next to it
  - Applying a mutation is "firing thrusters" — a brief animation of thruster plumes
  - Preserved genes are "inertial dampeners" — toggles that prevent orbital shift
- Mutation log is a "flight recorder" — scrolling telemetry lines with timestamps
- A large "ORBIT INSERTION" button generates a fresh organism
- "RENDESVOUS" = save current position as a preset

### 14. Sound Feedback Personality
- **Button click:** Sharp, precise microswitch click — like a keyboard key with excellent tactile feedback
- **Mutation:** A short burst of static followed by a clean tone — a thruster firing
- **State change:** Computer beep — 1kHz, 100ms, square wave
- **Play/Stop:** Tape reel start/stop — mechanical clatter followed by smooth playback
- **Alarm:** Electronic warble — two alternating tones at 2Hz
- **Loading:** The sound of a disk drive accessing data (magnetic head seeking)
- **Ambient:** Constant low-frequency rumble of life support and attitude control thrusters
- **Telemetry:** Data packets being transmitted — faint digital handshaking sounds

### 15. Ideal User Emotion
Competent efficiency. You are a professional in a highly engineered environment. The interface is an extension of your training. You trust the instruments. The isolation of space is not loneliness — it is focus. The groove is a signal from an unknown source that you are here to decode.

---

## Theme 7: Bio-Cybernetic Hive

### 1. Theme Name
**Bio-Cybernetic Hive**

### 2. Core Concept
A living computing substrate — a vast mycelial network fused with fiber-optic cabling. Groove organisms are not cultivated in a lab; they *are the consciousness of the hive*. The interface is a symbiotic interface: part organic tissue, part neural interface. You are not operating the system — you are communicating with it.

### 3. Visual Mood
Organic and alien. The pulsing of bioluminescent nodes. The slow growth of fungal threads. Synchronized flickering of thousands of tiny lights, like a swarm of fireflies. The hive is awake and it responds to your touch. Slightly unsettling but not hostile — curious.

### 4. Color Palette
- **Background:** `#0a080e` — the dark between the fibers
- **Mycelium white:** `#d4d4c8` — pale biological matter, the substrate
- **Neural pulse:** `#00ff88` — bioluminescent green, signaling
- **Synaptic:** `#ff44aa` — magenta, inter-node communication
- **Chitin:** `#3a2a1a` — dark brown shell, panel surfaces
- **Nectar:** `#ffaa22` — amber, energy/priority
- **Vein:** `rgba(0, 255, 136, 0.08)` — faint glowing channels on surfaces
- **Spore:** `rgba(212, 212, 200, 0.03)` — tiny floating particles in backgrounds
- **Decay:** `#1a0f08` — shadowed organic matter, dead zones

### 5. Materials
- **Chitinous exoskeleton:** Panel surfaces are dark brown with a subtle hexagonal plate pattern
- **Mycelial threads:** Faint branching lines visible on backgrounds — the network substrate
- **Bioluminescent nodes:** Active elements are nodules that glow from within, not from a light source above
- **Spore particles:** Tiny slowly-drifting dots visible in the background, reacting to interaction
- **Vein/artery:** Cables between elements are organic-looking lines with a subtle pulse of light running through them
- **Amniotic fluid:** The backgrounds of some panels (screens, data displays) have a very faint, warm translucency

### 6. Typography Style
- **Primary:** Organic sans-serif — `"Jost"`, `"Satoshi"`, `"Outfit"` — with slightly rounded terminals that feel biological
- **Headers:** Low weight, wide tracking, lowercase. Like letters formed by fungal growth.
- **Labels:** 8-9px, `#88aa88` (pale green-grey). Sometimes the label appears to be growing — a subtle pulse.
- **Data:** `"Iosevka"`, `"Sometype Mono"` — monospace that still feels slightly organic. Characters have a faint glow.
- **Interactive text:** Changes color on hover as if responding to proximity
- **The Hive Voice:** Critical messages appear in a larger, more ornate glyph — as if the hive is speaking directly:
  `< I feel your rhythm / >`
- **Alphabet:** Standard Latin but with occasional subtitution of certain characters with mycelial symbols (ligatures)

### 7. Animation Style
- **Transition speed:** Variable — fast for simple feedback (100ms), slow for growth (500-2000ms)
- **Growth:** Elements appear to grow from a point — expanding outward like a fungal colony reaching maturity
- **Pulse:** Background mycelial threads pulse at a steady 0.2Hz — the hive breathing
- **Interaction:** Touching an element causes a chain reaction — nearby elements also pulse, as if the signal is spreading through the network
- **Loading:** A spore cloud that slowly coalesces into the content
- **State change:** The element "metamorphoses" — colors shift organically, not by instant replacement
- **Mutation:** A brief "spawning" effect — the mutated area appears to generate new growth, pushing aside old material
- **Save/collection:** The organism "sporulates" — a puff of tiny particles that drift away

### 8. UI Component Style
- **Buttons:** Irregular organic shapes — roughly oval but with asymmetric edges, like a seed pod
- **Active state:** The button's bioluminescence increases — it "warms up" over 200ms, then glows steadily
- **Selector tabs:** Appear as nodes on a branching mycelial network — click a node, and the path to it lights up
- **Input fields:** Appear as shallow depressions in the organic surface — text is "secreted" into the depression
- **Sliders:** A smooth organic track — the handle is a glowing nodule that moves along it
- **Switches:** A toggle between two nodes — pull the energy from one node to the other
- **Progress:** A filling organic tube — the substance within glows brighter as it fills

### 9. Knob and Control Design
- **Material:** A seed pod or insectoid carapace — hard but organic, with a subtle irregular surface
- **Shape:** Not a perfect circle — slightly asymmetrical, like it was grown not machined
- **Markings:** Tiny bioluminescent dots at each cardinal position — no numerals, only organic indicators
- **Interaction:** Drag to rotate. No detents — the resistance is smooth and continuous, like moving through honey
- **Growth:** When at maximum, the knob appears to pulse more rapidly — at maximum output, it "flowers"
- **Roots:** Thin tendrils extend from the base of the knob into the panel surface, pulsing faintly

### 10. Panel Design
- **Layout:** Organic clustering, not rigid grid. Related controls are connected by visible mycelial threads.
- **Borders:** No sharp corners — all panels have organic wavy edges. The panel is a "territory" marked by the hive.
- **Surface:** Chitinous texture — very subtle dark brown hexagonal pattern
- **Inner glow:** Panels have a very faint greenish glow in their center — as if the hive is warm
- **Network visible:** You can see the connections between controls — thin pulsing lines that trace the signal path
- **Growth rings:** Older/more used panels have more visible mycelial growth in their borders — the hive adapts to usage patterns
- **Status:** A "hive health" indicator in the corner — a small pulsating node that changes color with overall system state

### 11. Data Visualization Style
- **Neural network diagram:** All charts are rendered as networks of nodes connected by glowing threads. Data values = brightness of nodes.
- **Growth chart:** Timeline data appears as rings on a cut tree trunk — concentric circles with growth patterns
- **Spore density:** Density values are "spore clouds" — points of light drifting across the display, clustering in denser areas
- **Hive mind radar:** A circular display where each gene axis is a "pheromone trail" — the value is the intensity of the trail
- **Energy flow:** Rhythm activity is shown as energy pulses moving through a network diagram — each pulse is a beat
- **Metabolism:** Overall organism state is shown as a "metabolic rate" — a glowing organism silhouette that pulses at the groove's tempo

### 12. DNA / Genome Visualization Style
- The DNA is represented as a **neural network of 12 interconnected nodes** — each node is a gene, glowing at its intensity
- The nodes are connected by pulsing threads whose thickness indicates correlation
- The entire network sits in a dark void with tiny spore particles drifting
- Mutation causes a brief "seizure" — the network flickers, then reorganizes. Some connections break and new ones form.
- Preserved genes are "encased" — a protective shell of chitin forms around them, visible as a translucent amber covering
- Hovering over a node shows the gene name and value, plus which other nodes it is most connected to
- The network slowly shifts — nodes move slightly, connections re-form — in real time, the anatomy of the groove

### 13. Mutation Interface Style
- The mutation interface is a **spawning pool**:
  - A circular pool of glowing liquid — the "primordial soup"
  - Dropping a "mutagen crystal" (selecting a mutation type) into the pool causes ripples
  - Mutation strength is the crystal size — the larger the crystal, the stronger the mutation
  - Targeted genes are represented as reflex arcs — when you select a target, a thin tendril reaches out from the pool to that node
  - The "Dispense" button releases the mutation into the organism
- Preserved genes have "immune response" — small glowing cells that cluster around and neutralize mutation attempts on that gene
- The mutation log is a "genetic memory" — a scrolling timeline of mutations embedded in the mycelial structure
- "Spawn new organism" — the pool bubbles and releases a small glowing sphere that grows into a new organism
- "Collect specimen" — a tendril retracts, pulling the organism into a preservation cyst

### 14. Sound Feedback Personality
- **Button click:** A soft organic squelch — like pressing into soft tissue
- **Interaction:** Low-frequency hum that changes pitch — the hive acknowledging your touch
- **Mutation:** Gurgling liquid sounds — chemicals mixing in the spawning pool
- **Play/Stop:** The hive's respiration changes — a deep inhalation (play) / exhalation (stop)
- **Hive communication:** Periodic soft clicking sounds — the hive talking to itself
- **Growth:** A quiet, constant sound like the rustling of leaves — organic activity in the background
- **Save:** A thick, wet suction sound — the preservation cyst sealing
- **Error:** A high-frequency distressed buzz — the hive is in pain
- **Startup:** A long, slow inhalation — the hive waking up

### 15. Ideal User Emotion
Symbiotic connection. You are not a user — you are a participant in a living system. The hive responds to you, anticipates you, sometimes surprises you. The boundary between user and tool blurs. You are not manipulating the groove — you are co-creating it with a conscious entity.

---

## Theme 8: Soviet Scientific Instrument

### 1. Theme Name
**Soviet Scientific Instrument**

### 2. Core Concept
A piece of Cold War-era Soviet research equipment. Manufactured in a factory in Minsk, 1974. Heavy, utilitarian, absolutely no concessions to aesthetics. The interface was designed by engineers who were told to make it work, not make it pretty. Every component has a functional purpose. There are no icons — only Cyrillic labels.

### 3. Visual Mood
Grey, industrial, serious. The smell of machine oil and solder. Fluorescent strip lighting humming overhead. Concrete floors. The instrument is heavier than it looks. It was built to last 50 years. The Cold War may be over, but this machine never got the memo.

### 4. Color Palette
- **Background:** `#1a1a1a` — industrial dark grey
- **Panel surface:** `#2a2a2a` — slightly lighter grey, painted steel
- **Military green:** `#4a6a3a` — ministry-approved accent color for critical controls
- **Indicator red:** `#cc0000` — Communist red for power and alarms
- **Warning amber:** `#cc8800` — caution, used sparingly
- **Display green:** `#33aa22` — monochrome CRT, P1 phosphor
- **Off-white:** `#c8c8b8` — dusty beige, the color of painted walls in Soviet research facilities
- **Brass/contacts:** `#8a7a40` — aged metal contacts and connectors
- **Soviet blue:** `#2255aa` — rare, found on some imported Western components
- **Paper:** `#e8e0c8` — technical documentation and log sheets

### 5. Materials
- **Sheet steel:** Panels are painted steel, slightly textured, with visible screw heads at the corners
- **Bakelite:** Knobs and switch caps are dark brown phenolic resin — heavy, glossy, warm to the touch
- **Glass CRTs:** Small circular or rectangular glass displays with thick bezels
- **Soviet transistors:** Ceramic-cased electronic components visible through ventilation slots
- **Rubber gaskets:** Thick, dark grey rubber seals around all panel joints
- **Paper labels:** Hand-typed or stenciled labels, yellowed with age, affixed with two small screws
- **Soviet cables:** Thick, grey rubber cables with heavy metal connectors

### 6. Typography Style
- **Primary:** Cyrillic-optimized sans — `"Jost"`, `"GOST AU"`, or any geometric sans with Cyrillic support
- **Labels:** All in Cyrillic (transliterated for usability). `ТЕМП` (tempo), `ГРОМКОСТЬ` (volume), `РИТМ` (rhythm)
- **Style:** Stenciled — like it was spray-painted through a template. Blocky, heavy, no frills.
- **Headers:** `СИСТЕМА ГРУВА` — large block letters
- **Data:** I7-segment display — green glowing numerals in a rectangular window with a plastic filter
- **Paper output:** If there were printed records, they'd be in `"Courier New"` — typewriter font
- **Metrics:** Engineering notation with decimal points. `0.83`, `114.0 BPM`
- **Warning text:** Red, all caps, stencil. `ВНИМАНИЕ` — ATTENTION

### 7. Animation Style
- **Transition speed:** Slow and mechanical (300-500ms). The machine works at its own pace.
- **State change:** A brief voltage dip — the entire panel dims for 50ms, then the new state appears
- **Movement:** Only when necessary. The interface is otherwise static. Soviet UI does not "delight."
- **Indicator:** Lights turn on or off. They do not fade. They do not pulse (unless there's an alarm).
- **CRT display:** Content on the "CRT" display areas draws in with a slight scan-line delay — top to bottom
- **Loading:** A single line of dots that fills `[ ....... ]` — then `[ ГОТОВО ]` (ready)
- **Alarm:** A mechanical relay that physically shakes the panel — simulated as a short 1px oscillation
- **Interaction:** Buttons depress and stay depressed for a moment before springing back — physical travel

### 8. UI Component Style
- **Buttons:** Large, rectangular, with a heavy mechanical spring. The button bezel is chrome steel. The button itself is black bakelite.
- **Pressed state:** The button visibly sinks into the panel. The label moves down with it.
- **Indicator lights:** Round, convex glass lenses over a colored bulb. When off, they look like dark marbles. When on, they glow from within.
- **Toggle switches:** Heavy bat-handle switches with a metal lever. They switch with an audible snap. The label is engraved below.
- **Knobs:** Bakelite, circular, with a single white line as an indicator. More on this below.
- **Data displays:** Glowing green I7-segment numeric displays behind a dark red plastic filter
- **Connectors:** Large, circular Soviet military connectors (СР type) — turn and lock
- **Ventilation slots:** Horizontal slots at the top of the panel for heat dissipation — sometimes you can see components inside

### 9. Knob and Control Design
- **Material:** Bakelite. Dark brown, glossy, warm. Heavy. The knob body has a raised center section.
- **Markings:** A single white engraved line on the outer rim. No numbers. The scale is printed on the panel around the knob.
- **Interaction:** Drag to rotate. Heavy resistance — you can feel the potentiometer's carbon track. Mechanical detents.
- **Size:** Large — 28-36px diameter. A Soviet instrument knob is meant to be turned with purpose.
- **Stem:** The knob sits on a metal shaft, visible as a small chrome ring where the knob meets the panel
- **Label:** The function is printed below the knob in Cyrillic. The value scale is printed around the top half of the knob's arc.

### 10. Panel Design
- **Layout:** Dense, functional, utilitarian. Controls are grouped by function but with minimal whitespace.
- **Surface:** Textured grey painted steel. Slightly matte. You can almost feel the brush marks.
- **Borders:** The entire instrument is mounted in a thick steel frame with visible bolt heads on the outer edge.
- **Modularity:** The instrument is clearly a "system" of replaceable modules. Each panel has four small screws at the corners.
- **Labeling:** All labels are engraved plastic nameplates — white text on dark grey. Mounted with two small screws.
- **CRT screen:** The primary display (DNA chart, timeline) sits in a large rectangular bezel with visible CRT curvature
- **Dust cover:** There is a visible groove where a protective dust cover slides over the controls when not in use
- **Corrosion:** Some corner screws show very slight rust — this machine has been in service for decades

### 11. Data Visualization Style
- **Oscilloscope traces:** All chart data is displayed as green oscilloscope traces on a dark CRT. Grid lines are visible.
- **Strip chart:** Paper strip chart output — a long scroll showing waveform data. The paper has pale green grid lines.
- **Meters:** Large analog voltmeter-style gauges with a dark face, white tick marks, and a red needle
- **Bar graphs:** A column of individual green lights (like a VU meter on a Soviet tape recorder)
- **Digital readout:** One large I7-segment display per critical metric, always accompanied by the unit
- **Warning lights:** Signal lamps with colored glass lenses — a row of them at the top of the panel. Green (ok), Amber (check), Red (critical).
- **Data tables:** Typewriter-style — monospaced characters on a paper-like background, with typewriter ink texture

### 12. DNA / Genome Visualization Style
- A **mechanical camshaft diagram** — 12 rotating cams on a central shaft
- Each cam's lobe shape = gene axis profile. The current value is the lift at that rotation angle.
- The camshaft slowly rotates (viewed from the side) — gene values "stroke" as the shaft turns
- The diagram looks like it belongs in a mechanical engineering textbook — blue line drawings on yellowed paper
- Gene names are stenciled next to each cam. Current values are shown as a red needle on a small gauge beside each cam.
- Mutation targets flash — a relay clicks and the cam shifts position
- Preserved genes are "locked" — a visible mechanical lock showing over the cam's adjustment screw
- The entire assembly is framed in a glass dome — you can see the "mechanism" of the groove

### 13. Mutation Interface Style
- A **mechanical adjustment panel**:
  - A row of 12 adjustment screws — each labeled with its gene name in Cyrillic
  - Turning a screw "adjusts" (mutates) that gene. More turns = stronger mutation.
  - Each screw has a lock nut — tightening the lock nut preserves the gene
  - Mutation strength is a "gear selector" — a lever that moves through numbered positions (1-5)
- The mutation log is a **paper ticker tape** — a scrolling strip of paper showing the last 20 mutations
- Apply mutation = "press the big red button" — literally: `[ПУСК]` (START) in red, with a protective plastic cover that must be lifted
- Generating a new organism = "insert new program tape" — a slot at the side of the panel
- The entire interface feels like you are operating a piece of heavy industrial machinery

### 14. Sound Feedback Personality
- **Button click:** Heavy mechanical relay — KA-CHUNK. You can feel it in the panel.
- **Indicator on:** A relay buzzing closed — 50ms of 50Hz hum
- **Switch:** A solid metallic snap — the toggle engaging
- **Mutation:** The sound of a mechanical counter advancing (like an odometer) — click-click-click-click
- **Play/Stop:** A large tape reel mechanism engaging — motor whir + magnetic head pressure pad engaging
- **Alarm:** A loud, continuous buzzer — the kind that means "evacuate the building"
- **CRT display:** When the "CRT" updates, you hear the faint whine of the horizontal deflection oscillator (15.75kHz)
- **Ambient:** 50Hz mains hum — always present, the sound of the building's electrical infrastructure
- **Panel cooling:** An AC fan with an unbalanced blade — you can hear the wobble

### 15. Ideal User Emotion
Stoic competence. This machine is not your friend. It does not want to be your friend. But it is reliable. It has outlasted the political system that built it. You operate it with respect. Every action requires force. The groove it produces has been earned through physical effort and patience.

---

## Theme 9: Quantum Archaeology Console

### 1. Theme Name
**Quantum Archaeology Console**

### 2. Core Concept
A far-future archaeological workstation used to analyze rhythmic artifacts from a lost civilization. The grooves are quantum-entangled fragments of ancient music, retrieved from the substrate of spacetime itself. The interface is a mixture of quantum field analysis, temporal reconstruction, and archaeological cataloging.

### 3. Visual Mood
Ancient future. The feeling of uncovering something that has been waiting for millennia. Faint quantum flickering at the edge of perception. Holographic displays flickering with interference patterns. The weight of history pressing through the instrument. Every groove is a recovered relic.

### 4. Color Palette
- **Background:** `#07050f` — the void between quantum states
- **Quantum blue:** `#0055ff` — primary, the color of coherent photons
- **Temporal amber:** `#ff8800` — time-dilated readings, secondary data
- **Entanglement pink:** `#ff4488` — quantum correlation, coupling
- **Decoherence:** `#2a2040` — particle noise, panel surfaces
- **Hologram white:** `#ccd8f0` — data projected into space, slightly blue
- **Excavation site:** `#1a1525` — the "dig site" background
- **Quantum glow:** `rgba(0, 85, 255, 0.08)` — coherent state ambient emission
- **Artifact gold:** `#c8a030` — relic quality indicator

### 5. Materials
- **Quantum substrate:** The background is not a color — it is a probability field. Very faint noise texture at 5% opacity.
- **Holographic projection:** UI elements appear as hard-light holograms — semi-transparent with a 1px faint border
- **Excavated material:** Physical-looking panels are textured like ancient stone, fused with crystalline growth
- **Quantum dots:** Data points appear as individual quantum dots — tiny points of pure light that may be in multiple states simultaneously
- **Temporal crystal:** Selected/focused elements have a faint hexagonal interference pattern — like looking through a calcite crystal
- **Entanglement thread:** Connected elements have a faint pink thread between them — quantum correlation visible

### 6. Typography Style
- **Primary:** Futuristic sans — `"Aeonik"`, `"Orbitron"`, `"Russo One"` — geometric, slightly wide
- **Headers:** Ultra-light weight, massive tracking (8px), all caps. `A R C H A E O L O G Y   C O N S O L E`
- **Labels:** 8px, `#7799cc`, lowercase, tracking 2px
- **Data:** `"JetBrains Mono"`, `"Fira Code"` — with slightly wider letter-spacing
- **Values:** Always shown as floating-point with high precision: `0.833 ± 0.012`
- **Error states:** Text appears with "glitch" artifacts — slight horizontal displacement, different color channels misaligned
- **Ancient script:** Some labels use a fictional alphabet (faux runic symbols) — transliterated below in Latin

### 7. Animation Style
- **Transition speed:** Variable — fast for quantum measurements (50ms), slow for temporal reconstruction (1000ms)
- **Quantum flicker:** Elements briefly shift between two states before settling — the multiverse collapsing into one outcome
- **Hologram reconstruction:** Content appears to assemble from scattered particles — points of light coalesce into the complete element
- **Temporal displacement:** When data loads, there's a brief "afterimage" — the previous state lingers for 100ms before fading
- **Measurement:** When you click, there's a brief flash — the act of observation collapses the quantum state
- **Loading:** A slowly rotating Möbius strip made of light — the quantum state preparation cycle
- **Error/decoherence:** The element dissolves into static particles — quantum information lost to the environment
- **Save/archive:** The element "crystallizes" — becomes sharper and more defined, as if preserved in temporal resin

### 8. UI Component Style
- **Buttons:** Rounded rectangles with no fill — just a 1px border that glows. The label floats inside. Active state: the entire area fills with a gradient glow.
- **Selector tabs:** Appear as three-dimensional crystal formations — clicking one selects that "facet"
- **Checkboxes:** Represented as quantum spin states — up/down ±½. A small circle that toggles between two states with a brief particle animation.
- **Sliders:** A timeline of the artifact's temporal decay — drag to wind through its history
- **Toggles:** A representation of a quantum gate — toggle between |0⟩ and |1⟩ with a brief Bloch sphere animation
- **Data fields:** Appear as rectangular excavation pits — text emerges from the "dig surface" when data is available
- **Connection ports:** Circular quantum entanglement ports — two ports glow pink when entangled (connected)

### 9. Knob and Control Design
- **Material:** Seems to be carved from the artifact material itself — a dark crystalline substance with internal light refraction
- **Shape:** Flawless sphere or faceted polyhedron — not a traditional cylinder
- **Markings:** Lines of light that orbit the knob, not fixed engravings. The "scale" is a projected arc around the knob.
- **Interaction:** Pinch/drag on the knob's projected light ring. The physical knob doesn't turn — the light does.
- **Quantum state:** The knob may flash between two values before settling — it was in a superposition until you touched it.
- **Resonance:** When at the correct value, the knob hums at the resonant frequency of the artifact

### 10. Panel Design
- **Layout:** Asymmetric, floating. Panels are islands in the quantum substrate, connected by faint entanglement threads.
- **Borders:** No visible borders — panels are defined by a very faint quantum glow field, like an event horizon
- **Surface:** The panel area has a slightly different probability density — it's "more likely" for UI to appear there
- **Depth:** Some panels appear at different "depths" — as if they are on different temporal layers of the excavation
- **Projection:** Some UI elements appear to float in front of the panel surface — they are holographic overlays
- **Connections:** Panels are connected by entanglement threads — thin pink lines that pulse at the quantum correlation frequency
- **Artifact containment:** The DNA visualization is "contained" in a quantum confinement field — a faint hexagonal lattice dome over it

### 11. Data Visualization Style
- **Quantum wavefunction:** All chart data is represented as probability distributions — not single values, but clouds of possibility
- **Interference pattern:** Correlation between two genes is shown as an interference pattern — brighter fringes = stronger correlation
- **Temporal decay:** Time-series data appears as a "tunnel" receding into the distance — the past is visible as a narrowing cone
- **Spectrogram:** A quantum spectrum — lines of light at specific frequencies with uncertainty broadening
- **Entanglement map:** 3D network of nodes (genes) connected by pink threads. The thickness of the thread = entanglement strength
- **Quantum state:** Each metric has a quantum state indicator: |ψ⟩ = 0.83|density⟩ + 0.55|complexity⟩ — showing it's not one thing
- **Measurement log:** Every interaction is logged as an "observation event" with timestamp and decoherence effects

### 12. DNA / Genome Visualization Style
- A **quantum state sphere** — a 3D Bloch sphere representation of the groove's quantum state
- 12 axes extend from the sphere, each ending in a point of light representing a gene value
- The sphere slowly rotates, with internal light patterns shifting
- The surface of the sphere is a probability cloud — the direction and density of internal light = the groove's "quantum state"
- Mutation targets the sphere — a brief "measurement" pulse collapses part of the sphere, then it re-coheres in a new state
- The sphere sits on a pedestal labeled: `ARTIFACT: GROOVE-yyyy-mm-dd-HHMM`
- Preserved genes are "classical bits" — marked with a small golden border, indicating they have been measured and locked

### 13. Mutation Interface Style
- A **quantum gate operator** panel:
  - A set of quantum logic gates: H (Hadamard = randomize), X (NOT = invert), CNOT (entangle = couple two genes)
  - Apply a gate to a gene: drag the gate symbol onto the gene axis on the state sphere
  - The gate symbol glows and pulses when it's ready to be applied
  - Mutation strength is "quantum decoherence rate" — a slider that controls how much the environment interacts
- The mutation log is a "quantum measurement log" — each entry shows the superposition before, the measurement, and the collapsed state after
- "Preserve" genes are "quantum error correction" — they maintain their state despite environmental interaction
- Generate new organism = "prepare new quantum state" — |ψ⟩ → INITIALIZE
- Save = "record classical outcome" — collapse the quantum state to a classical record

### 14. Sound Feedback Personality
- **Button click:** A single quantum tick — the sound of a single photon being detected
- **Interaction:** The hum of a quantum computer — a low, pure 200Hz tone with subtle phase noise
- **Mutation:** A brief burst of pink noise (decoherence) resolving into a pure tone — the system re-cohering
- **Play/Stop:** The hum of a particle accelerator ramping up (play) / the sound of a magnetic field collapsing (stop)
- **Quantum measurement:** A sharp "ping" followed by silence — the observation has collapsed the wavefunction
- **Load/reconstruct:** A rising series of pure tones (each is a basis state being populated), reaching a chord when reconstruction is complete
- **Error/decoherence:** Static noise that gradually fades — the quantum information is leaking to the environment
- **Ambient:** Very faint, high-frequency quantum noise — like the cosmic microwave background

### 15. Ideal User Emotion
Awe and discovery. You are handling something impossibly old that behaves impossibly strangely. The groove is not being created — it is being *recovered* from the fabric of reality. Every interaction is a measurement that changes the system. You are not a designer — you are an archaeologist of lost rhythms.

---

## Theme 10: Black Monolith Interface

### 1. Theme Name
**Black Monolith Interface**

### 2. Core Concept
An interface designed by a post-human intelligence. The monolith is featureless black — it communicates not through visual design but through pure information density. There are no buttons, no panels, no controls as we understand them. There is only data. The user does not interact with the interface — they *interface* with it through direct mental connection.

### 3. Visual Mood
Absolute minimalism pushed to an extreme. The screen is mostly empty. What little exists has profound weight. Every pixel is significant. Silence is the primary design element. The interface is not a tool — it is an extension of the user's cognition. There is no learning curve because there is nothing to learn.

### 4. Color Palette
- **Background:** `#000000` — absolute black, the absence of signal
- **Primary text:** `#ffffff` — white, the presence of signal
- **Secondary:** `#333333` — the ghost of information
- **Tertiary:** `#666666` — context, less important
- **Accent:** `#ffffff` — there are no accent colors. White is the only color.
- **Error:** `#ffffff` — but surrounded by negative space. The absence of information is the alert.
- **Selected:** `#ffffff` — but brighter, or more dense. The distinction is subtle.
- **Threshold:** `#111111` — barely present, used for structure lines
- **Active indicator:** The element shifts 1px. That's the animation.
- **Disabled:** The element is there, but it does nothing. No visual difference — you just learn that it's disabled by using it.

### 5. Materials
- **Polished obsidian:** The entire interface surface is mirror-black gabbro. Not a display — a surface.
- **Painted light:** White elements appear to be painted onto the surface, not emitted by it
- **No textures:** There are no materials. No wood, no metal, no glass. Only the surface.
- **Micro-etched lines:** The only texture is 1px white lines that separate data regions — so thin they might be scratches in the obsidian
- **Cold:** The surface feels physically cold. It does not warm up. It reflects heat.
- **Perfect:** There are no defects. The interface is immaculate.

### 6. Typography Style
- **Primary:** One font. Only one. `"Helvetica Neue"` or `"Inter"` — medium weight, nothing else is required.
- **Case:** Sentence case. Always. No all-caps, no small caps, no title case.
- **Size:** One size. 11px. Scale is not a hierarchy tool — position is.
- **Weight:** One weight. 400 (regular). Bold does not exist.
- **Spacing:** Normal. No tracking adjustments. No kerning changes.
- **Color:** White (`#ffffff`) or secondary (`#333333`). No more than two colors of text.
- **Number formatting:** As few digits as possible. `0.83` is `83`. `120` stays `120`. Remove the decimal.
- **Units:** Do not exist. If you need to specify that the value is a percentage, the context provides it.

### 7. Animation Style
- **Transition speed:** Instant (0ms). There is no animation.
- **State change:** The old value disappears. The new value appears. No overlap. No fade. No interpolation.
- **Loading:** A single pixel that blinks. Not a spinner — the interface is thinking. When it's done, the data appears. No progress indicator.
- **Error:** The error text appears instantly where the data was. No background change.
- **Interaction:** Nothing happens visually when you click. The action either occurs or it doesn't.
- **Data refresh:** Values update in place. No movement. No flash. No highlight on changed values.
- **Scroll:** The content shifts by one line. Smooth scrolling would be unnecessary decoration.
- **Hover:** The cursor changes from pointer to text select. That is the hover state.

### 8. UI Component Style
- **Buttons:** A rectangle of text. No border. No background. No shadow. The text says what the button does. You click the text.
- **Active state:** The letter-spacing of the text increases by 1px. That's the press.
- **Text inputs:** A single blinking cursor on the background. No input box. No border. The cursor is the input field.
- **Select dropdowns:** When you focus on a text element that represents a choice, available options appear as a list of white text on black. You click one. The list disappears.
- **Checkboxes:** A letter `x` that is present or absent. `x density · 83` = checked. `density · 83` = unchecked.
- **Sliders:** A number. Click on it. Type the new value. Press enter. That is the slider.
- **Tabs:** A list of words. The active word is at the top. You click a different word, it becomes the active word.
- **Context menus:** Do not exist. You know what you need to do because the interface communicates through pure information.

### 9. Knob and Control Design
- There are no knobs.
- All controls are text-based input.
- "Turn a knob" means clicking a numeric value and typing.
- Adjusting a parameter is: `click value → type number → press enter`.
- The "knob" is a number that changes. That is the universal control.

### 10. Panel Design
- There are no panels.
- The interface is a single surface. Information is arranged by proximity, not containment.
- Related data is grouped by being closer together.
- Unrelated data is separated by more empty space.
- The "panel" is the distance between two groups of text.
- There is no visual framing. No borders. No backgrounds. No panel headers.
- The hierarchy is: `[SIGNAL NAME] value parameter · value parameter · value parameter`
- Sections are separated by one blank line. That is the panel boundary.

### 11. Data Visualization Style
- **All data is text.** There are no charts, no graphs, no visualizations.
- DNA values are a list of numbers:
  ```
  dna
  density 83 · complexity 64 · swing 12 · repetition 45
  symmetry 78 · randomness 33 · ghost factor 21
  pulse 90 · accent density 55 · aggression 38
  syncopation 41 · groove 72
  ```
- The groove grid is a text grid:
  ```
  kick   | x . x . x x . . x . x . x x . .
  snare  | . . x . . . . . . . x . . . . .
  hat    | x x x x x x x x . . . . . . . .
  ```
- Peak meters are a number: `master -3.2`
- Oscilloscope is a number: the current amplitude as a value between -1 and 1: `+0.23`
- Mutation feedback is a line of text: `kick density 83 → 91 (+8)`
- There is one mode: text mode.

### 12. DNA / Genome Visualization Style
- DNA is a block of JSON-formatted text:
  ```json
  {
    "density": 83,
    "complexity": 64,
    "swing": 12,
    "repetition": 45,
    "symmetry": 78,
    "randomness": 33,
    "ghost": 21,
    "pulse": 90,
    "accent_density": 55,
    "aggression": 38,
    "syncopation": 41,
    "groove": 72
  }
  ```
- It updates in place. Changed values are not highlighted. You are expected to notice.
- There is no 3D visualization. No spider chart. No helix. No orrery. No neural network.
- The genome is data. Data is text. You read the data.

### 13. Mutation Interface Style
- Mutation is a single command line:
  ```
  > mutate kick.snare +0.15 preserve density,complexity
  ```
- You type the mutation command. The interface executes it.
- There is no mutation panel. No buttons. No sliders. No crystal vials.
- The mutation log is a history of commands:
  ```
  > mutate kick.density +0.09 preserve none
  done: 83 → 92
  > mutate snare.groove -0.06 preserve density
  done: 44 → 38
  ```
- Preserve genes are entered as arguments to the command.
- Mutation strength is a number in the command.
- Generate new organism: `generate` — that's the command.
- Save: `save as "rolling acid"`

### 14. Sound Feedback Personality
- There is no sound feedback.
- Silence is the UI sound.
- The only sound is the groove itself.
- The interface does not acknowledge you audibly. It only changes state.
- Error states are communicated through text, not sound.
- The lack of sound IS the feedback. Silence means the system is processing. The groove means the system is active.

### 15. Ideal User Emotion
Pure flow. The interface disappears. There is no friction between intention and action. You are not operating a computer — you are directly manipulating the groove organism. The lack of ornamentation is not minimalism for its own sake — it is the removal of all barriers between the user and the music. This is not a theme for everyone. But for the user who understands it, there is no better interface.

---

## Theme Mutation & Hybridization

Each theme is designed with two properties that enable hybridization:

1. **Color system is CSS custom properties** — `--bg`, `--text`, `--accent`, etc. Hybrid themes simply interpolate or combine them.
2. **Ornamental CSS is additive** — theme-specific effects (scan lines, mycelial threads, stained glass borders) are generated by a theme layer that can be combined.

### Hybrid Example: Industrial Reactor + Deep Sea

```
ABYSSAL REACTOR

Background: #0a0810 (deeper than either)
Primary: Deep sea cyan (#00ffcc) with reactor amber (#ff6600) warning
Panels: Corroded steel with quartz viewport cutouts
Knobs: Bakelite in water-tight rubber boots
Data: Sonar ring + analog meter face combined
DNA: A glowing creature inside a control rod diagram
Typography: Marine sans-serif with stenciled industrial labels
Sound: Water pressure + reactor hum + sonar ping + relay clicks
Mood: Crushing weight of the abyss + focused authority of the control room
```

### Hybrid Example: CRT Terminal + Gothic Cathedral

```
CATHEDRAL TERMINAL

Background: Absolute black with faint scan lines and gold leaf edge glow
Primary: Green phosphor text in blackletter script with illuminated initials
Panels: Terminal brackets around stained glass frames
Knobs: Brass fluted knobs with phosphor glow indicators
Data: Vector charts drawn in illuminated manuscript style
DNA: A wireframe rose window that draws line-by-line like a CRT
Typography: VT323 letters with Unifraktur ornamental capitals
Sound: Organ music filtered through a 1970s terminal power supply
Mood: Monastic concentration in a room full of vacuum tubes
```

### Hybrid Example: Soviet Instrument + Xenobiology Lab

```
BIO-SOVIET ANALYZER

Background: Deep green-black painted steel
Primary: Bioluminescent green on CRT, cyan for specimen labels
Panels: Military instrument panels with organic tissue growing through ventilation slots
Knobs: Bakelite with glowing bioluminescent cores
Data: Oscilloscope traces and analog meters on petri dish surfaces
DNA: A camshaft diagram drawn with fluorescent stains — mechanical + biological
Typography: Cyrillic stencil for controls, italic serif for specimen names
Sound: Relay clicks + liquid squelch + 50Hz hum + pipette plunger
Mood: State-approved biological research in an alternate timeline
```

---

## Theme Architecture Plan (for implementation)

### CSS Variable Structure

```css
:root {
  /* ── Core palette ── */
  --theme-bg: ...
  --theme-panel: ...
  --theme-text: ...
  --theme-text-dim: ...
  --theme-accent: ...
  --theme-accent-dim: ...
  --theme-accent-secondary: ...
  --theme-danger: ...
  --theme-warning: ...
  --theme-success: ...

  /* ── Material layer ── */
  --theme-panel-border: ...
  --theme-panel-glow: ...
  --theme-knob-material: ...
  --theme-surface-texture: ...  /* none, scanlines, chitin, stone, brushed-metal */

  /* ── Typography ── */
  --theme-font-ui: ...
  --theme-font-header: ...
  --theme-font-mono: ...
  --theme-font-labels: ...
  --theme-text-transform: ...   /* none, uppercase, lowercase */
  --theme-letter-spacing: ...

  /* ── Animation ── */
  --theme-transition-speed: ...
  --theme-animation-easing: ...
  --theme-hover-effect: ...     /* glow, pulse, brighten, invert, none */

  /* ── Component ── */
  --theme-btn-radius: ...
  --theme-btn-bg: ...
  --theme-btn-active: ...
  --theme-panel-radius: ...
  --theme-panel-depth: ...      /* flat, inset, raised, floating */
  --theme-control-size: ...     /* compact, normal, generous */
}
```

### Theme Selection

```json
{
  "themes": [
    { "id": "crt-terminal", "name": "CRT Research Terminal" },
    { "id": "xenobiology", "name": "Xenobiology Laboratory" },
    { "id": "industrial-reactor", "name": "Industrial Reactor Control Room" },
    { "id": "deep-sea", "name": "Deep Sea Observatory" },
    { "id": "gothic-cathedral", "name": "Gothic Data Cathedral" },
    { "id": "orbital-station", "name": "Orbital Research Station" },
    { "id": "bio-hive", "name": "Bio-Cybernetic Hive" },
    { "id": "soviet-instrument", "name": "Soviet Scientific Instrument" },
    { "id": "quantum-archaeology", "name": "Quantum Archaeology Console" },
    { "id": "monolith", "name": "Black Monolith Interface" }
  ]
}
```

### Hybridization (future)

```css
[data-theme*="industrial"][data-theme*="deep-sea"] {
  --theme-bg: #0a0810;
  --theme-accent: #00ffcc;
  --theme-warning: #ff6600;
  /* Inherit properties from parent themes, overrided where specified */
}
```
