const { EmbedBuilder } = require('discord.js');
const { generateCaptcha } = require('../utils/captcha');

const captchas = new Map();

module.exports = {
  name: 'verify',
  description: 'Start the verification process',
  async execute(interaction) {
    console.log('Verify command received from', interaction.user.tag);

    try {
      const verifyChannel = interaction.guild.channels.cache.find(channel => channel.name === 'verify');
      if (!verifyChannel) {
        console.log('Verify channel not found');
        return interaction.reply({ content: 'Verification channel not found. Please contact an administrator.', ephemeral: true });
      }

      if (interaction.channel.id !== verifyChannel.id) {
        console.log('Command used in wrong channel');
        return interaction.reply({ content: 'Please use this command in the verification channel.', ephemeral: true });
      }

      const captcha = await generateCaptcha();
      captchas.set(interaction.user.id, captcha);

      const embed = new EmbedBuilder()
        .setTitle('Verification Required')
        .setDescription(`Please solve this captcha to gain access to the server.`)
        .setImage('attachment://captcha.png')
        .setColor('#00ff00');

      await interaction.reply({ embeds: [embed], files: [{ attachment: captcha.image, name: 'captcha.png' }], ephemeral: true });
      console.log('Captcha sent to', interaction.user.tag);
    } catch (error) {
      console.error('Error handling verify command:', error);
      await interaction.reply({ content: 'An error occurred while processing your verification. Please try again later or contact an administrator.', ephemeral: true });
    }
  },
};