import 'dotenv/config';
import OpenAI from 'openai';
import path from 'node:path';
import { createChatHandler, createProfileLoader } from '../server/insight-chat.mjs';

// Cached per function process/cold start, never across the deployed fleet.
const loadProfile = createProfileLoader(path.join(process.cwd(), 'profile.json'));
let client;
let clientKey;

export default createChatHandler({
  env: () => process.env,
  loadProfile,
  makeClient(apiKey) {
    if (!client || clientKey !== apiKey) {
      client = new OpenAI({ apiKey, maxRetries: 0, timeout: 10000, logLevel: 'off' });
      clientKey = apiKey;
    }
    return client;
  },
});
