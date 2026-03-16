import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { useLocations } from './hooks/useLocations';

function App() {
  // Initialize location data on mount
  useLocations();

  return <AppShell />;
}

export default App;
