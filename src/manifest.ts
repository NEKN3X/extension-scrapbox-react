import { defineManifest } from '@crxjs/vite-plugin';
import { version } from '../package.json';

// NOTE: do not include src/ in paths,
// vite root folder: src, public folder: public (based on the project root)
// @see ../vite.config.ts#L16

const manifest = defineManifest(async (env) => ({
  manifest_version: 3,
  name: `${env.mode === 'development' ? '[Dev] ' : ''}Save to Cosense`,
  description: 'Save web page to your Cosense',
  version,
  host_permissions: ['<all_urls>'],
  web_accessible_resources: [
    {
      resources: [
        // this file is web accessible; it supports HMR b/c it's declared in `rollupOptions.input`
        'welcome/welcome.html',
      ],
      matches: ['<all_urls>'],
    },
  ],
  action: {
    default_popup: 'popup/popup.html',
    default_icon: {
      '16': 'images/extension_16.png',
      '32': 'images/extension_32.png',
      '48': 'images/extension_48.png',
      '128': 'images/extension_128.png',
    },
  },
  icons: {
    '16': 'images/extension_16.png',
    '32': 'images/extension_32.png',
    '48': 'images/extension_48.png',
    '128': 'images/extension_128.png',
  },
  permissions: ['storage', 'tabs'],
}));

export default manifest;
