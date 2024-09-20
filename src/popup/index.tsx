import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <Popup />
    </MantineProvider>
  </React.StrictMode>
);
