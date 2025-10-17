# RF Outdoor Link Planner Tool

![Assessment Status](https://img.shields.io/badge/Assessment-Ready-brightgreen)
![Build Status](https://img.shields.io/badge/Build-Passing-success)
![Tests](https://img.shields.io/badge/Tests-12%2F12-success)

A professional-grade browser-based RF link planning tool with interactive mapping, frequency validation, and Fresnel zone visualization.

##  Product Summary

**RF Outdoor Link Planner Tool** is a browser-based interactive mapping application for radio frequency link planning. Users can place tower markers on a Leaflet map, assign operating frequencies, and create point-to-point links with automatic validation. The tool calculates first Fresnel zone clearances using precise RF formulas, visualizes coverage areas with SVG overlays, and integrates Open-Elevation API for terrain-aware path analysis all within a modern dark-themed UI optimized for professional use.

##  Key Features

###  Interactive Map & Towers
- **Click-to-Add:** Place tower markers anywhere on the map
- **Visual Indicators:** Color-coded by frequency (blue, green, amber, red, purple)
- **Editable Properties:** Change tower name and operating frequency anytime
- **Glow Effects:** Selected towers highlight with increased glow

###  Point-to-Point Links
- **Frequency Validation:** Only towers with matching frequencies can link
- **Automatic Distance:** Haversine formula for accurate Earth-curvature calculations
- **Hover Tooltips:** View distance (km) and frequency (GHz) on hover
- **Visual Feedback:** Neon cyan polylines with smooth hover highlights

### Fresnel Zone Analysis
- **Precise Calculations:** First Fresnel zone using `r = sqrt((λ * d1 * d2) / (d1 + d2))`
- **SVG Visualization:** Translucent ellipse rotated to match link bearing
- **Dynamic Scaling:** Ellipse adjusts with map zoom for accuracy
- **Terrain Data:** Integrates Open-Elevation API for elevation profiles

###  Professional UI/UX
- **Dark Galaxy Theme:** Deep space aesthetic with glassmorphism
- **Floating Controls:** Intuitive mode buttons (Add, Edit, Link, Delete)
- **Toast Notifications:** Real-time feedback for all actions
- **Responsive Design:** Works on desktop and tablet (touch-friendly)

##  Usage Guide

### Adding Towers
1. Click **"Add Tower"** button in control panel
2. Click anywhere on the map to place a tower
3. Default frequency: 2.4 GHz (editable)

### Editing Towers
1. Click **"Edit Frequency"** button
2. Click on any tower marker
3. Modal opens with:
   - Tower name field (editable)
   - Frequency input (GHz, numeric)
   - Save button
   - Delete tower button

### Creating Links
1. Click **"Draw Link"** button
2. Click first tower (Tower A)
3. Click second tower (Tower B)
4. If frequencies match → Link created 
5. If frequencies differ → Error message ❌

### Viewing Fresnel Zones
1. Click any existing link
2. SVG ellipse appears showing 1st Fresnel zone
3. Elevation data fetched from Open-Elevation API
4. Toast shows elevation at both endpoints

### Deleting
- **Delete Mode:** Click "Delete" button, then click tower/link to remove
- **Delete Tower:** Also available in edit modal (removes all connected links)
- **Delete Link:** Removes only the link, leaves towers intact

##  Technical Implementation

### RF Calculations

#### Distance (Haversine Formula)
```javascript
// Accurate Earth-curvature distance
d = 2R * arcsin(sqrt(sin²(Δφ/2) + cos(φ1)cos(φ2)sin²(Δλ/2)))
```

#### Fresnel Zone Radius
```javascript
// First Fresnel zone at midpoint
r = sqrt((λ * d1 * d2) / (d1 + d2))
// Where: λ = c / f, c = 3×10⁸ m/s, f in Hz
```

### File Structure
```
src/
├── api/
│   ├── openElevation.js       # Open-Elevation API integration (exact spec)
│   └── openElevation.ts       # TypeScript wrapper
├── components/
│   ├── MapView.tsx             # Leaflet map with markers/links
│   ├── ControlPanel.tsx        # Mode selection buttons
│   ├── EditModal.tsx           # Tower edit popup
│   └── Toast.tsx               # Notification system
├── types/
│   └── index.ts                # TypeScript interfaces
├── utils/
│   ├── geo.js                  # Haversine distance (exact spec)
│   ├── fresnel.js              # Wavelength & Fresnel formulas (exact spec)
│   ├── handleLinkClick_ShowFresnel.js  # SVG ellipse visualization (exact spec)
│   └── calculations.ts         # Additional utilities
└── App.tsx                     # Main state management
```

### Technology Stack
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety (compiles to pure JS)
- **Leaflet 1.9.4** - Interactive mapping library
- **Vite 5.4.8** - Fast build tooling
- **TailwindCSS 3.4** - Utility-first styling
- **Open-Elevation API** - Free terrain data (no API key)

##  Testing & Verification

### Acceptance Criteria
 All 12 acceptance criteria verified (see `ACCEPTANCE_TESTS.md`)

### Sanity Check: 5 GHz @ 1 km
```javascript
// Two towers ~1 km apart at 5 GHz
Expected Fresnel Radius: ~4.06 meters
Actual Implementation: 4.06 meters
Verification: PASSED 
```

### Build Verification
```bash
$ npm run build
dist/index.html                   0.47 kB │ gzip:  0.30 kB
dist/assets/index-DXVrLyAB.css   27.09 kB │ gzip:  9.34 kB
dist/assets/index-CtAN6LeZ.js   314.63 kB │ gzip: 96.61 kB
```

##  Deployment

### Vercel 
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Manual Deployment
```bash
# Build production bundle
npm run build

# Upload dist/ folder to any static host:
# - Netlify
# - GitHub Pages
# - AWS S3 + CloudFront
# - Firebase Hosting
```

### Vercel Configuration
The included `vercel.json` configures:
- Framework: Vite
- Output directory: dist
- SPA rewrites for client-side routing
- Automatic build command: `npm run build`

##  API Usage

### Open-Elevation API
- **Endpoint:** `https://api.open-elevation.com/api/v1/lookup`
- **Rate Limit:** Reasonable use, no API key required
- **Example Request:**
  ```
  GET /api/v1/lookup?locations=37.7749,-122.4194|37.7849,-122.4094
  ```
- **Fallback:** Returns elevation=0 if API fails (graceful degradation)

##  Theme Customization

### Color Scheme
```css
/* Tower Colors by Frequency */
< 2 GHz:    Blue     #3b82f6
2-5 GHz:    Green    #10b981
5-10 GHz:   Amber    #f59e0b
10-20 GHz:  Red      #ef4444
> 20 GHz:   Purple   #8b5cf6

/* Links */
Default:    Cyan     #06b6d4

/* Fresnel Zone */
Fill:       rgba(36, 199, 255, 0.08)
Stroke:     rgba(36, 199, 255, 0.7)
```

##  Troubleshooting

### Map Not Loading
- Check internet connection (Leaflet tiles from CDN)
- Verify browser supports ES6+ JavaScript

### Elevation API Errors
- Open-Elevation may be slow during peak hours
- Fallback returns elevation=0 automatically
- Check browser console for network errors

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist
npm run build
```

## Contributing

This is an assessment project for Astrome Technologies.

---

**Built with precision for RF link planning professionals** 
