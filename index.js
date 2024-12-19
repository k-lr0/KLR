const fs = require("fs");
const {Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, Partials,} = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences,],
  partials: [Partials.GuildMember],
});
client.on('ready' , async() => {
  console.log(`🟢 ${client.user.tag} is Online 🟢`)
})
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("bc") || message.author.bot) return;

  const member = message.guild.members.cache.get(message.author.id);

  if (
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
  ) {
    return message.reply({
      content: "**❌ ERROR ❌**",
      ephemeral: true,
    });
  }
  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("**VirBon Broadcast**")
    .setImage("SERVER_LINE")
    .setDescription("**\`#\` Please choose the Broadcast type for Members.**");
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("send_all")
      .setLabel("All Members")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("send_online")
      .setLabel("Online Members")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("send_offline")
      .setLabel("Offline Members")
      .setStyle(ButtonStyle.Danger),
  );
  await message.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
});
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      let customId;
      if (interaction.customId === "send_all") {
        customId = "modal_all";
      } else if (interaction.customId === "send_online") {
        customId = "modal_online";
      } else if (interaction.customId === "send_offline") {
        customId = "modal_offline";
      }
      const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle("VirBon Broadcast");
      const messageInput = new TextInputBuilder()
        .setCustomId("messageInput")
        .setLabel("Write your message here")
        .setStyle(TextInputStyle.Paragraph);
      modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
      await interaction.showModal(modal);
    }
    if (interaction.isModalSubmit()) {
      const message = interaction.fields.getTextInputValue("messageInput");
      const guild = interaction.guild;
      if (!guild) return;
      await interaction.deferReply({
        ephemeral: true,
      });
      if (interaction.customId === "modal_all") {
        const membersToSend = guild.members.cache.filter(
          (member) => !member.user.bot,
        );
        await Promise.all(
          membersToSend.map(async (member) => {
            try {
              await member.send({
                content: `${message}\n<@${member.user.id}>`,
                allowedMentions: { parse: ["users"] },
              });
            } catch (error) {
              console.error(
                `Error sending message to ${member.user.tag}:`,
                error,
              );
            }
          }),
        );
      } else if (interaction.customId === "modal_online") {
        const onlineMembersToSend = guild.members.cache.filter(
          (member) =>
            !member.user.bot &&
            member.presence &&
            member.presence.status !== "offline",
        );
        await Promise.all(
          onlineMembersToSend.map(async (member) => {
            try {
              await member.send({
                content: `${message}\n<@${member.user.id}>`,
                allowedMentions: { parse: ["users"] },
              });
            } catch (error) {
              console.error(
                `Error sending message to ${member.user.tag}:`,
                error,
              );
            }
          }),
        );
      } else if (interaction.customId === "modal_offline") {
        const offlineMembersToSend = guild.members.cache.filter(
          (member) =>
            !member.user.bot &&
            (!member.presence || member.presence.status === "offline"),
        );
        await Promise.all(
          offlineMembersToSend.map(async (member) => {
            try {
              await member.send({
                content: `${message}\n<@${member.user.id}>`,
                allowedMentions: { parse: ["users"] },
              });
            } catch (error) {
              console.error(
                `Error sending message to ${member.user.tag}:`,
                error,
              );
            }
          }),
        );
      }
      await interaction.editReply({
        content: "**✅ DONE ✅**",
      });
    }
  } catch (error) {
    console.error("Error in interactionCreate event:", error);
  }
});

client.login("BOT_TOKEN");