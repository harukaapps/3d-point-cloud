import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThreeDScan } from '@/components/3dscan';

describe('ThreeDScan Component', () => {
  it('renders without crashing', () => {
    render(<ThreeDScan />);
    expect(screen.getByText('3D Point Cloud')).toBeInTheDocument();
  });

  it('shows settings panel when button is clicked', () => {
    render(<ThreeDScan />);
    const settingsButton = screen.getByText('Show Settings');
    settingsButton.click();
    expect(screen.getByText('Point Size')).toBeInTheDocument();
  });
});
