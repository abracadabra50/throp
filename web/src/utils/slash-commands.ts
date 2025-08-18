/**
 * Slash Commands for Throp
 * Provides quick actions and functionality through / commands
 */

export interface SlashCommand {
  command: string;
  description: string;
  aliases?: string[];
  action: (args?: string) => CommandResult;
}

export interface CommandResult {
  type: 'message' | 'action' | 'clear' | 'redirect' | 'help';
  content?: string;
  action?: () => void;
  url?: string;
}

// Available slash commands - kept minimal for future expansion
export const slashCommands: SlashCommand[] = [
  {
    command: '/clear',
    description: 'Clear the chat history',
    aliases: ['/c'],
    action: () => ({
      type: 'clear',
    }),
  },
  {
    command: '/help',
    description: 'Show available commands',
    aliases: ['/h', '/?'],
    action: () => ({
      type: 'message',
      content: `commands:
• /clear - wipe the chat
• /about - learn about me
• /help - this message

thats it for now. more coming soon 👀`,
    }),
  },
  {
    command: '/about',
    description: 'Learn about throp',
    aliases: ['/info'],
    action: () => ({
      type: 'redirect',
      url: '/about',
    }),
  },
];

/**
 * Parse and execute a slash command
 */
export function executeSlashCommand(input: string): CommandResult | null {
  if (!input.startsWith('/')) return null;
  
  const parts = input.slice(1).split(' ');
  const commandName = '/' + parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  
  // Find matching command
  const command = slashCommands.find(
    cmd => cmd.command === commandName || cmd.aliases?.includes(commandName)
  );
  
  if (!command) {
    return {
      type: 'message',
      content: `idk what "${commandName}" is. type /help to see what i can do`,
    };
  }
  
  return command.action(args);
}

/**
 * Get command suggestions for autocomplete
 */
export function getCommandSuggestions(input: string): SlashCommand[] {
  if (!input.startsWith('/')) return [];
  
  const search = input.toLowerCase();
  return slashCommands.filter(
    cmd => cmd.command.startsWith(search) || 
           cmd.aliases?.some(alias => alias.startsWith(search))
  );
}
