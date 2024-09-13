const verifyCommand = require('../commands/verify');
const helpCommand = require('../commands/help');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.commandName;
    if (command === verifyCommand.name) {
      await verifyCommand.execute(interaction);
    } else if (command === helpCommand.name) {
      await helpCommand.execute(interaction);
    }
  },
};