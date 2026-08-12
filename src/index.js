require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");

const envNames = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"];
const missing = envNames.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const configPath = path.join(__dirname, "..", "config.json");

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    console.error("Could not read config.json:", error.message);
    process.exit(1);
  }
}

function validUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function makeBaseEmbed(config, color) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp();

  if (validUrl(config.brand.logoUrl)) {
    embed.setThumbnail(config.brand.logoUrl);
  }

  return embed;
}

function buildPanel(config) {
  const embed = makeBaseEmbed(config, config.brand.primaryColor)
    .setAuthor({ name: `${config.brand.serverName} • OFFICIAL COMMUNITY` })
    .setTitle(`📜 ${config.panel.title}`)
    .setDescription(
      [
        `Welcome to **${config.brand.serverName}**.`,
        "",
        config.panel.englishDescription,
        config.panel.spanishDescription,
        "",
        config.panel.privateNoticeSpanish,
      ].join("\n")
    )
    .addFields(
      {
        name: "🇺🇸 ENGLISH",
        value: "Open the official rules privately.",
        inline: true,
      },
      {
        name: "🇲🇽 ESPAÑOL",
        value: "Abre las reglas oficiales en privado.",
        inline: true,
      }
    )
    .setFooter({ text: `${config.brand.serverName} • ${config.brand.tagline}` });

  if (validUrl(config.brand.bannerUrl)) {
    embed.setImage(config.brand.bannerUrl);
  }

  return embed;
}

function buildRules(config, language) {
  const isEnglish = language === "english";
  const rules = isEnglish ? config.englishRules : config.spanishRules;
  const color = isEnglish
    ? config.brand.primaryColor
    : config.brand.secondaryColor;

  const ruleText = rules
    .map(
      (rule, index) =>
        `### ${index + 1}️⃣ ${rule.title}\n${rule.text}`
    )
    .join("\n\n");

  return makeBaseEmbed(config, color)
    .setAuthor({
      name: `${config.brand.serverName} • ${
        isEnglish ? "OFFICIAL RULES" : "REGLAS OFICIALES"
      }`,
    })
    .setTitle(
      isEnglish ? "🇺🇸 ENGLISH SERVER RULES" : "🇲🇽 REGLAS DEL SERVIDOR"
    )
    .setDescription(
      [
        isEnglish
          ? `Welcome to **${config.brand.serverName}**. Every member is expected to follow these rules.`
          : `Bienvenido a **${config.brand.serverName}**. Todos los miembros deben cumplir estas reglas.`,
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "",
        ruleText,
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "",
        isEnglish
          ? `🏆 **${config.brand.tagline}**`
          : "🏆 **RESPETA LA COMUNIDAD • COMPITE CON PASIÓN • JUEGA PARA GANAR**",
      ].join("\n")
    )
    .setFooter({
      text: isEnglish
        ? "Private message • Only you can see this"
        : "Mensaje privado • Solo tú puedes verlo",
    });
}

function buildButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("semental_rules_english")
      .setLabel("View Rules • English")
      .setEmoji("🇺🇸")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("semental_rules_spanish")
      .setLabel("Ver Reglas • Español")
      .setEmoji("🇲🇽")
      .setStyle(ButtonStyle.Danger)
  );
}

const commands = [
  new SlashCommandBuilder()
    .setName("rules-panel")
    .setDescription("Post the premium bilingual Semental rules panel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("rules-preview")
    .setDescription("Preview the rules panel privately before posting it.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
].map((command) => command.toJSON());

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("Registered /rules-panel and /rules-preview.");
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log("Premium Semental Rules Bot is online.");
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    const config = loadConfig();

    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "rules-panel") {
        await interaction.reply({
          embeds: [buildPanel(config)],
          components: [buildButtons()],
        });
        return;
      }

      if (interaction.commandName === "rules-preview") {
        await interaction.reply({
          embeds: [buildPanel(config)],
          components: [buildButtons()],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === "semental_rules_english") {
      await interaction.reply({
        embeds: [buildRules(config, "english")],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (interaction.customId === "semental_rules_spanish") {
      await interaction.reply({
        embeds: [buildRules(config, "spanish")],
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error(error);

    const response = {
      content:
        "⚠️ Something went wrong. Please contact a Semental administrator.",
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(() => {});
    } else {
      await interaction.reply(response).catch(() => {});
    }
  }
});

(async () => {
  try {
    await registerCommands();
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error("Bot startup failed:", error);
    process.exit(1);
  }
})();