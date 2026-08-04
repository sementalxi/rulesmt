# Semental Premium Rules Bot

A professional bilingual Discord rules system with private English and Spanish rule popups.

## Features

- Premium red-and-black Semental styling
- English and Spanish buttons
- Private ephemeral rules messages
- No verification button
- No roles
- No acceptance step
- Optional logo and banner
- Easy rule editing through `config.json`
- `/rules-preview` for private testing
- `/rules-panel` to publish the panel
- Only members with Manage Server permission can publish or preview

## Setup

### 1. Install Node.js

Install Node.js 18 or newer.

### 2. Configure the bot

Rename:

```text
.env.example
```

to:

```text
.env
```

Then add:

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_APPLICATION_ID
GUILD_ID=YOUR_SERVER_ID
```

### 3. Install packages

Open Command Prompt inside this folder and run:

```bash
npm install
```

### 4. Start the bot

```bash
npm start
```

You should see:

```text
Registered /rules-panel and /rules-preview.
Premium Semental Rules Bot is online.
```

### 5. Preview before publishing

In Discord, run:

```text
/rules-preview
```

Only you will see the preview.

### 6. Publish

In the rules channel, run:

```text
/rules-panel
```

## Add your logo or banner

Open `config.json`.

Paste a direct HTTPS image URL into:

```json
"logoUrl": ""
```

or:

```json
"bannerUrl": ""
```

Example:

```json
"logoUrl": "https://example.com/logo.png",
"bannerUrl": "https://example.com/banner.png"
```

Restart the bot after editing.

## Edit the rules

Open `config.json`.

Edit the items inside:

- `englishRules`
- `spanishRules`

Restart the bot after saving.

## Important

Never share your `.env` file or Discord bot token.
If the token is exposed, reset it immediately in the Discord Developer Portal.