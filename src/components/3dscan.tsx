'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import debounce from 'lodash.debounce';

interface Photo {
  file: File;
  preview: string;
}

interface ScanSettings {
  pointSize: number;
  pointDensity: number;
  colorIntensity: number;
  depthEffect: number;
  backgroundColor: string;
}

const defaultSettings: ScanSettings = {
  pointSize: 0.02,
  pointDensity: 0.1,
  colorIntensity: 1.0,
  depthEffect: 1.0,
  backgroundColor: '#ffffff'
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '30px',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    padding: '20px 0'
  },
  dropZone: {
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    backgroundColor: '#f8f9fa'
  },
  dragging: {
    borderColor: '#007bff',
    backgroundColor: '#e9ecef'
  },
  fileInput: {
    display: 'none'
  },
  dropZoneContent: {
    color: '#666',
    marginBottom: '10px'
  },
  uploadIcon: {
    width: '24px',
    height: '24px',
    margin: '0 auto'
  },
  dropZoneHint: {
    fontSize: '14px'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '20px'
  },
  photoContainer: {
    position: 'relative' as const,
    aspectRatio: '1',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  deleteButton: {
    position: 'absolute' as const,
    top: '5px',
    right: '5px',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    color: 'white',
    borderWidth: '0',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  canvas3d: {
    width: '100%',
    height: '500px',
    backgroundColor: '#000',
    borderRadius: '4px'
  },
  generateButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    borderWidth: '0',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
    width: '100%'
  },
  settingsPanel: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'none'
  },
  settingItem: {
    marginBottom: '20px'
  },
  settingDescription: {
    color: '#666',
    fontSize: '14px',
    marginTop: '4px',
    marginBottom: '8px'
  },
  toggleButton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px'
  }
};

export function ThreeDScan() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState<ScanSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const pointCloudRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  const originalDataRef = useRef<{
    vertices: number[];
    colors: number[];
    imageData: ImageData[];
  }>({ vertices: [], colors: [], imageData: [] });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.backgroundColor);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear previous canvas if it exists
    while (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }
    canvasRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.update();

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Start animation loop
    animate();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, [settings.backgroundColor]);

  const generatePointCloud = async () => {
    try {
      if (!sceneRef.current) return;

      // Remove existing point cloud
      if (pointCloudRef.current) {
        sceneRef.current.remove(pointCloudRef.current);
        pointCloudRef.current.geometry.dispose();
        if (pointCloudRef.current.material) {
          pointCloudRef.current.material.dispose();
        }
      }

      let vertices: number[] = [];
      let colors: number[] = [];

      // Generate new point cloud data only if photos changed
      if (originalDataRef.current.imageData.length !== photos.length) {
        originalDataRef.current = { vertices: [], colors: [], imageData: [] };

        for (const photo of photos) {
          const img = await createImageBitmap(photo.file);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          originalDataRef.current.imageData.push(imageData);

          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const x = ((i / 4) % canvas.width) / canvas.width - 0.5;
            const y = Math.floor((i / 4) / canvas.width) / canvas.height - 0.5;
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / (3 * 255);

            originalDataRef.current.vertices.push(x, -y, brightness);
            originalDataRef.current.colors.push(
              data[i] / 255,
              data[i + 1] / 255,
              data[i + 2] / 255
            );
          }
        }
      }

      // Apply settings to stored data
      const totalPoints = originalDataRef.current.vertices.length / 3;
      const pointsToUse = Math.floor(totalPoints * settings.pointDensity);
      const stride = Math.max(1, Math.floor(totalPoints / pointsToUse));

      for (let i = 0; i < totalPoints; i += stride) {
        const baseIndex = i * 3;
        const x = originalDataRef.current.vertices[baseIndex] * 5;
        const y = originalDataRef.current.vertices[baseIndex + 1] * 5;
        const brightness = originalDataRef.current.vertices[baseIndex + 2];
        const z = brightness * 2 * settings.depthEffect - settings.depthEffect;

        vertices.push(x, y, z);
        colors.push(
          originalDataRef.current.colors[baseIndex] * settings.colorIntensity,
          originalDataRef.current.colors[baseIndex + 1] * settings.colorIntensity,
          originalDataRef.current.colors[baseIndex + 2] * settings.colorIntensity
        );
      }

      // Create geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      // Create material
      const material = new THREE.PointsMaterial({
        size: settings.pointSize,
        vertexColors: true,
        sizeAttenuation: true
      });

      // Create point cloud
      const pointCloud = new THREE.Points(geometry, material);
      sceneRef.current.add(pointCloud);
      pointCloudRef.current = pointCloud;

      // Reset camera and controls
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 0, 5);
        cameraRef.current.lookAt(0, 0, 0);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      // Ensure scene is rendered
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    } catch (error) {
      console.error('Error generating point cloud:', error);
    }
  };

  const debouncedGeneratePointCloud = useCallback(
    debounce(() => {
      if (photos.length > 0) {
        generatePointCloud();
      }
    }, 100),
    [photos]
  );

  useEffect(() => {
    debouncedGeneratePointCloud();
  }, [settings.pointSize, settings.pointDensity, settings.colorIntensity, settings.depthEffect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.match(/^image\/(jpeg|jpg|png)$/i)
    );

    const newPhotos = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        return { file, preview };
      })
    );

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const deletePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>3D Point Cloud</h1>
      
      <button 
        style={styles.toggleButton}
        onClick={() => setShowSettings(!showSettings)}
      >
        {showSettings ? 'Hide Settings' : 'Show Settings'}
      </button>

      <div style={{...styles.settingsPanel, display: showSettings ? 'block' : 'none'}}>
        <div style={styles.settingItem}>
          <label>Point Size:</label>
          <p style={styles.settingDescription}>
            Adjusts the size of individual points in the 3D point cloud. Larger values create more visible points.
          </p>
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.01"
            value={settings.pointSize}
            onChange={(e) => {
              setSettings(prev => ({
                ...prev,
                pointSize: parseFloat(e.target.value)
              }));
              debouncedGeneratePointCloud();
            }}
          />
        </div>
        <div style={styles.settingItem}>
          <label>Point Density:</label>
          <p style={styles.settingDescription}>
            Controls how many points are generated from the source images. Higher density creates more detailed but potentially slower rendering.
          </p>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={settings.pointDensity}
            onChange={(e) => {
              setSettings(prev => ({
                ...prev,
                pointDensity: parseFloat(e.target.value)
              }));
              debouncedGeneratePointCloud();
            }}
          />
        </div>
        <div style={styles.settingItem}>
          <label>Color Intensity:</label>
          <p style={styles.settingDescription}>
            Adjusts the vibrancy of colors in the point cloud. Higher values create more saturated colors.
          </p>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={settings.colorIntensity}
            onChange={(e) => {
              setSettings(prev => ({
                ...prev,
                colorIntensity: parseFloat(e.target.value)
              }));
              debouncedGeneratePointCloud();
            }}
          />
        </div>
        <div style={styles.settingItem}>
          <label>Depth Effect:</label>
          <p style={styles.settingDescription}>
            Controls the 3D depth perception of the point cloud. Higher values create more pronounced depth effects.
          </p>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={settings.depthEffect}
            onChange={(e) => {
              setSettings(prev => ({
                ...prev,
                depthEffect: parseFloat(e.target.value)
              }));
              debouncedGeneratePointCloud();
            }}
          />
        </div>
        <div style={styles.settingItem}>
          <label>Background:</label>
          <p style={styles.settingDescription}>
            Choose the background color for the 3D viewer. Select a color that provides good contrast with your point cloud.
          </p>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => {
              setSettings(prev => ({
                ...prev,
                backgroundColor: e.target.value
              }));
            }}
          />
        </div>
      </div>

      <div 
        style={{...styles.dropZone, ...(dragActive ? styles.dragging : {})}}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={styles.dropZoneContent}>
          <svg
            style={styles.uploadIcon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p style={styles.dropZoneHint}>
            Drag and drop images here, or click to select files
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        onChange={handleFileSelect}
        style={styles.fileInput}
      />

      {photos.length > 0 && (
        <div style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <div key={photo.preview} style={styles.photoContainer}>
              <img
                src={photo.preview}
                alt={`Uploaded ${index + 1}`}
                style={styles.thumbnail}
              />
              <button
                style={styles.deleteButton}
                onClick={() => deletePhoto(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        style={styles.generateButton}
        onClick={generatePointCloud}
        disabled={photos.length === 0}
      >
        Generate Point Cloud
      </button>

      <div ref={canvasRef} style={styles.canvas3d} />
    </div>
  );
}
