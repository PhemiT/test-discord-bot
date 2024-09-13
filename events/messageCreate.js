const captchas = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.channel.name !== 'verify' || message.author.bot) return;

    const captcha = captchas.get(message.author.id);
    if (!captcha) return;

    console.log('Captcha attempt from', message.author.tag, '- Input:', message.content, '- Expected:', captcha.text);

    if (message.content.toLowerCase() === captcha.text.toLowerCase()) {
      captchas.delete(message.author.id);
      const generalChannel = message.guild.channels.cache.find(channel => channel.name === 'general');
      if (generalChannel) {
        await generalChannel.permissionOverwrites.edit(message.author, { SendMessages: true });
        console.log('Granted general channel access to', message.author.tag);
      } else {
        console.log('General channel not found');
      }
      await message.reply('Verification successful! You now have access to the general channel.');
    } else {
      await message.reply('Incorrect captcha. Please try again.');
    }
  },
};