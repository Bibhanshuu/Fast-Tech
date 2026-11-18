/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FastTechProvider } from './context/FastTechContext';
import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <FastTechProvider>
      <AppShell />
    </FastTechProvider>
  );
}
