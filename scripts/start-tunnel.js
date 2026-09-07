#!/usr/bin/env node

/**
 * Tunnel runner for Expo CLI inside VMs / isolated networks.
 * Uses Cloudflare Quick Tunnels (trycloudflare.com) to provide an instant,
 * public HTTPS tunnel for Metro without requiring any account, token,
 * or router port-forwarding permissions.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const cloudflaredPath = path.join(__dirname, '..', 'node_modules', '.bin', 'cloudflared');

if (!fs.existsSync(cloudflaredPath)) {
  console.error('Error: cloudflared binary not found at ' + cloudflaredPath);
  process.exit(1);
}

console.log('\n🚀 Starting Cloudflare quick tunnel for Metro bundler (port 8081)...');

const cf = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:8081'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let tunnelUrl = null;
let expoProcess = null;

function cleanup() {
  if (expoProcess) expoProcess.kill();
  if (cf) cf.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

const urlRegex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/;

function startExpo(url) {
  console.log(`\n✅ Tunnel active: ${url}`);
  console.log('📱 Starting Expo with public proxy URL...\n');

  const env = {
    ...process.env,
    EXPO_PACKAGER_PROXY_URL: url,
  };

  expoProcess = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit',
    env,
  });

  expoProcess.on('exit', (code) => {
    cleanup();
  });
}

function handleOutput(data) {
  const text = data.toString();
  if (!tunnelUrl) {
    const match = text.match(urlRegex);
    if (match) {
      tunnelUrl = match[0];
      startExpo(tunnelUrl);
    }
  }
}

cf.stdout.on('data', handleOutput);
cf.stderr.on('data', handleOutput);

cf.on('error', (err) => {
  console.error('Failed to start cloudflared:', err);
  cleanup();
});

cf.on('close', (code) => {
  if (!tunnelUrl) {
    console.error(`cloudflared exited early with code ${code}`);
  }
});
