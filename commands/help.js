module.exports = {
    name: 'help',
    description: 'List all available commands',
    async execute(interaction) {
      const commandsList = [
        '/verify - Start the verification process',
        '/help - List all available commands',
      ].join('\n');
  
      await interaction.reply({ content: `Available commands:\n${commandsList}`, ephemeral: true });
    },
  };