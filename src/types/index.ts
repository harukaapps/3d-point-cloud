export interface Photo {
  file: File;
  preview: string;
}

export interface ScanSettings {
  pointSize: number;
  pointDensity: number;
  colorIntensity: number;
  depthEffect: number;
  backgroundColor: string;
}

export const defaultSettings: ScanSettings = {
  pointSize: 0.02,
  pointDensity: 0.1,
  colorIntensity: 1.0,
  depthEffect: 1.0,
  backgroundColor: '#ffffff'
};
