// Pterodactyl Panel Auto-Provisioning Service
// Demo mode: simulates server creation

import type { Product } from '../store/useStore';

const PANEL_DOMAIN = import.meta.env.VITE_PTERODACTYL_DOMAIN || 'https://panel.nexuscloud.id';
const API_KEY = import.meta.env.VITE_PTERODACTYL_API_KEY || 'demo_key';

export interface PanelCredentials {
  username: string;
  password: string;
  panelUrl: string;
  serverId: string;
}

function generateUsername(telegramId: string): string {
  const suffix = telegramId.slice(-4);
  const random = Math.random().toString(36).substring(2, 6);
  return `nx${suffix}${random}`;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 14 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function generateServerId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Demo simulation of Pterodactyl provisioning
export async function createPanelUser(
  telegramId: string,
  username: string,
  product: Product
): Promise<PanelCredentials> {
  await delay(2500);

  if (API_KEY !== 'demo_key') {
    return await realCreatePanel(telegramId, username, product);
  }

  // DEMO mode
  return {
    username: generateUsername(telegramId),
    password: generatePassword(),
    panelUrl: PANEL_DOMAIN,
    serverId: generateServerId(),
  };
}

async function realCreatePanel(
  telegramId: string,
  _username: string,
  product: Product
): Promise<PanelCredentials> {
  const generatedUsername = generateUsername(telegramId);
  const password = generatePassword();
  const email = `${generatedUsername}@nexuscloud.id`;

  // Create user on panel
  const userRes = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'Application/vnd.pterodactyl.v1+json',
    },
    body: JSON.stringify({
      email,
      username: generatedUsername,
      first_name: 'Nexus',
      last_name: 'User',
      password,
    }),
  });

  const userData = await userRes.json() as { attributes?: { id: number } };
  const userId = userData.attributes?.id;

  const ram = product.ram === 0 ? 0 : product.ram * 1024;
  const cpu = product.cpu === 0 ? 0 : product.cpu;
  const disk = product.disk === 0 ? 0 : product.disk * 1024;

  const serverRes = await fetch(`${PANEL_DOMAIN}/api/application/servers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'Application/vnd.pterodactyl.v1+json',
    },
    body: JSON.stringify({
      name: `nexus-${generatedUsername}`,
      user: userId,
      egg: 1,
      docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar',
      environment: { SERVER_JARFILE: 'server.jar' },
      limits: { memory: ram, swap: 0, disk, io: 500, cpu },
      feature_limits: { databases: 1, allocations: 1, backups: 1 },
      deploy: { locations: [1], dedicated_ip: false, port_range: [] },
    }),
  });

  const serverData = await serverRes.json() as { attributes?: { identifier: string } };
  const serverId = serverData.attributes?.identifier || generateServerId();

  return {
    username: generatedUsername,
    password,
    panelUrl: PANEL_DOMAIN,
    serverId,
  };
}
