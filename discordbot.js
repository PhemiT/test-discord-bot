const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');
const { createCanvas } = require('canvas');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const captchas = new Map();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const commands = [
    new SlashCommandBuilder()
      .setName('verify')
      .setDescription('Start the verification process'),
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  console.log(
    'Interaction received:',
    interaction.type,
    interaction.commandName
  );

  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'verify') {
    console.log('Verify command received from', interaction.user.tag);

    try {
      const verifyChannel = interaction.guild.channels.cache.find(
        (channel) => channel.name === 'verify'
      );
      if (!verifyChannel) {
        console.log('Verify channel not found');
        return interaction.reply({
          content:
            'Verification channel not found. Please contact an administrator.',
          ephemeral: true,
        });
      }

      if (interaction.channel.id !== verifyChannel.id) {
        console.log('Command used in wrong channel');
        return interaction.reply({
          content: 'Please use this command in the verification channel.',
          ephemeral: true,
        });
      }

      const captcha = await generateCaptcha();
      captchas.set(interaction.user.id, captcha);

      const embed = new EmbedBuilder()
        .setTitle('Verification Required')
        .setDescription(
          `Please solve this captcha to gain access to the server.`
        )
        .setImage('attachment://captcha.png')
        .setColor('#00ff00');

      await interaction.reply({
        embeds: [embed],
        files: [{ attachment: captcha.image, name: 'captcha.png' }],
        ephemeral: true,
      });
      console.log('Captcha sent to', interaction.user.tag);
    } catch (error) {
      console.error('Error handling verify command:', error);
      await interaction.reply({
        content:
          'An error occurred while processing your verification. Please try again later or contact an administrator.',
        ephemeral: true,
      });
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.channel.name !== 'verify' || message.author.bot) return;

  const captcha = captchas.get(message.author.id);
  if (!captcha) return;

  console.log(
    'Captcha attempt from',
    message.author.tag,
    '- Input:',
    message.content,
    '- Expected:',
    captcha.text
  );

  if (message.content.toLowerCase() === captcha.text.toLowerCase()) {
    captchas.delete(message.author.id);
    const generalChannel = message.guild.channels.cache.find(
      (channel) => channel.name === 'general'
    );
    if (generalChannel) {
      await generalChannel.permissionOverwrites.edit(message.author, {
        SendMessages: true,
      });
      console.log('Granted general channel access to', message.author.tag);
    } else {
      console.log('General channel not found');
    }
    await message.reply(
      'Verification successful! You now have access to the general channel.'
    );
  } else {
    await message.reply('Incorrect captcha. Please try again.');
  }
});

async function generateCaptcha() {
  const canvasInstance = createCanvas(200, 100);
  const ctx = canvasInstance.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 200, 100);
  ctx.font = '30px Arial';
  ctx.fillStyle = 'black';

  const text = Math.random().toString(36).substring(2, 8);
  ctx.fillText(text, 50, 60);

  return { text, image: canvasInstance.toBuffer() };
}

client.login(process.env.CLIENT_TOKEN);
