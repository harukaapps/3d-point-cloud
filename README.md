# 3D Point Cloud Generator

A web application that generates interactive 3D point cloud visualizations from uploaded images. Built with Next.js, React, TypeScript, and Three.js.

![3D Point Cloud Generator](public/screenshot.png)

## Features

- 📸 Upload multiple images through drag-and-drop or file selection
- 🎨 Generate detailed point cloud visualizations
- 🔧 Customize point cloud appearance with interactive controls:
  - Point size adjustment
  - Point density control
  - Color intensity modification
  - Depth effect customization
  - Background color selection
- 🖱️ Interactive 3D navigation with OrbitControls
- ⚡ Real-time updates for all settings
- 💻 Client-side processing for data privacy

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) 19.0.0-rc (Canary) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Three.js](https://threejs.org/) - 3D graphics library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

## Prerequisites

- Node.js 18.17 or later
- npm 9.6.7 or later

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/haruka_apps/3d-point-cloud.git
cd 3d-point-cloud
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Important Notes

- This project uses React 19.0.0-rc (Canary version) which may have compatibility issues with some testing libraries
- When installing dependencies, use `--legacy-peer-deps` flag due to React 19 compatibility
- The application is optimized for modern browsers

## Usage

1. Click the "Upload Images" button or drag and drop images into the designated area
2. Adjust the point cloud settings using the control panel:
   - Point Size: Controls the size of individual points
   - Point Density: Adjusts the number of points displayed
   - Color Intensity: Modifies the vibrancy of colors
   - Depth Effect: Controls the 3D depth perception
3. Navigate the 3D view:
   - Left click and drag to rotate
   - Right click and drag to pan
   - Scroll to zoom

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js community for excellent documentation and examples
- Next.js team for the amazing framework
- All contributors and users of this project

## Future Improvements

- [ ] Add model export functionality
- [ ] Implement server-side processing for larger images
- [ ] Add more advanced point cloud generation algorithms
- [ ] Create comprehensive unit and integration tests
- [ ] Enhance cross-browser compatibility
- [ ] Optimize for mobile devices
- Implement comprehensive test suite
- Add advanced error handling
- Explore server-side rendering options
- Optimize for mobile devices
- Implement advanced point cloud algorithms
