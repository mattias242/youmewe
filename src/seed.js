'use strict';

/**
 * Seed the database with real chat apps and their features.
 * Idempotent — safe to call multiple times.
 */
function seed(db) {
  // ── Features ─────────────────────────────────────────────────────────────
  const featureDefs = [
    { name: 'E2E Encryption',         category: 'privacy',  description: 'End-to-end encryption by default' },
    { name: 'Open Source',            category: 'privacy',  description: 'Source code is publicly auditable' },
    { name: 'No Phone Required',      category: 'privacy',  description: 'Sign up without a phone number' },
    { name: 'Voice Calls',            category: 'comms',    description: 'One-to-one and group voice calls' },
    { name: 'Video Calls',            category: 'comms',    description: 'One-to-one and group video calls' },
    { name: 'File Sharing',           category: 'comms',    description: 'Send files and documents' },
    { name: 'Bots & Integrations',    category: 'features', description: 'Programmable bots and third-party integrations' },
    { name: 'Channels',               category: 'features', description: 'Broadcast channels or public groups' },
    { name: 'Threaded Replies',       category: 'features', description: 'Reply threads within channels' },
    { name: 'Disappearing Messages',  category: 'privacy',  description: 'Messages auto-delete after a set time' },
    { name: 'Reactions',              category: 'features', description: 'Emoji reactions to messages' },
    { name: 'Polls',                  category: 'features', description: 'Create polls within chats' },
    { name: 'Linux Support',          category: 'platform', description: 'Native Linux desktop app available' },
    { name: 'Web App',                category: 'platform', description: 'Works in a browser' },
  ];

  const insertFeature = db.prepare(
    'INSERT OR IGNORE INTO features (name, category, description) VALUES (?, ?, ?)'
  );
  for (const f of featureDefs) {
    insertFeature.run(f.name, f.category, f.description);
  }

  // Helper: look up feature id by name
  const fid = name => db.prepare('SELECT id FROM features WHERE name = ?').get(name).id;

  // ── Apps + their features ─────────────────────────────────────────────────
  const appDefs = [
    {
      name: 'Signal',
      description: 'Privacy-focused messenger with best-in-class E2E encryption.',
      website_url: 'https://signal.org',
      features: ['E2E Encryption', 'Voice Calls', 'Video Calls', 'File Sharing',
                 'Disappearing Messages', 'Reactions', 'Linux Support'],
    },
    {
      name: 'Telegram',
      description: 'Feature-rich messenger with large groups, bots, and channels.',
      website_url: 'https://telegram.org',
      features: ['Voice Calls', 'Video Calls', 'File Sharing', 'Bots & Integrations',
                 'Channels', 'Threaded Replies', 'Disappearing Messages', 'Reactions',
                 'Polls', 'No Phone Required', 'Linux Support', 'Web App'],
    },
    {
      name: 'WhatsApp',
      description: 'Ubiquitous messenger with E2E encryption owned by Meta.',
      website_url: 'https://whatsapp.com',
      features: ['E2E Encryption', 'Voice Calls', 'Video Calls', 'File Sharing',
                 'Channels', 'Disappearing Messages', 'Reactions', 'Polls', 'Web App'],
    },
    {
      name: 'Discord',
      description: 'Community platform with servers, voice rooms, and rich integrations.',
      website_url: 'https://discord.com',
      features: ['No Phone Required', 'Voice Calls', 'Video Calls', 'File Sharing',
                 'Bots & Integrations', 'Channels', 'Threaded Replies', 'Reactions',
                 'Polls', 'Linux Support', 'Web App'],
    },
    {
      name: 'Slack',
      description: 'Professional team messaging with deep third-party integrations.',
      website_url: 'https://slack.com',
      features: ['No Phone Required', 'Voice Calls', 'Video Calls', 'File Sharing',
                 'Bots & Integrations', 'Channels', 'Threaded Replies', 'Reactions',
                 'Polls', 'Linux Support', 'Web App'],
    },
    {
      name: 'Microsoft Teams',
      description: "Microsoft's workplace platform with Office 365 integration.",
      website_url: 'https://teams.microsoft.com',
      features: ['No Phone Required', 'Voice Calls', 'Video Calls', 'File Sharing',
                 'Bots & Integrations', 'Channels', 'Threaded Replies', 'Reactions',
                 'Polls', 'Web App'],
    },
    {
      name: 'Element',
      description: 'Decentralised, open-source messenger on the Matrix protocol.',
      website_url: 'https://element.io',
      features: ['E2E Encryption', 'Open Source', 'No Phone Required', 'Voice Calls',
                 'Video Calls', 'File Sharing', 'Bots & Integrations', 'Channels',
                 'Threaded Replies', 'Reactions', 'Linux Support', 'Web App'],
    },
  ];

  const insertApp = db.prepare(
    'INSERT OR IGNORE INTO apps (name, description, website_url) VALUES (?, ?, ?)'
  );
  const insertAppFeature = db.prepare(
    'INSERT OR IGNORE INTO app_features (app_id, feature_id) VALUES (?, ?)'
  );

  for (const appDef of appDefs) {
    insertApp.run(appDef.name, appDef.description, appDef.website_url);
    const app = db.prepare('SELECT id FROM apps WHERE name = ?').get(appDef.name);
    for (const featureName of appDef.features) {
      insertAppFeature.run(app.id, fid(featureName));
    }
  }
}

module.exports = { seed };
