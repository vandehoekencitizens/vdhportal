import { createClient } from '@base44/sdk';
// We changed the '@' to '..' so it can find the file in your folders
import { appParams } from '../lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
