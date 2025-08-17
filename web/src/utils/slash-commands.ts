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

// Available slash commands
export const slashCommands: SlashCommand[] = [
  {
    command: '/help',
    description: 'Show all available commands',
    aliases: ['/h', '/?'],
    action: () => ({
      type: 'message',
      content: `yo here's what i can do:

/help - this thing you're reading rn
/clear - wipe the chat clean
/about - learn about me (spoiler: im orange)
/hottakes - see my spicy takes on trending stuff
/chaos [1-10] - set my chaos level (default: 7)
/vibe - check the current vibe
/roast - i'll roast something random
/advice - terrible life advice
/rate [thing] - i'll rate anything in oranges
/tweet [text] - format as a tweet
/explain [topic] - eli5 but make it dumb
/wrong - admit when im wrong (rare)

just type / to see suggestions btw`,
    }),
  },
  {
    command: '/clear',
    description: 'Clear the chat history',
    aliases: ['/c', '/reset'],
    action: () => ({
      type: 'clear',
    }),
  },
  {
    command: '/about',
    description: 'Learn about throp',
    aliases: ['/info', '/who'],
    action: () => ({
      type: 'redirect',
      url: '/about',
    }),
  },
  {
    command: '/hottakes',
    description: 'Show hot takes panel',
    aliases: ['/takes', '/ht'],
    action: () => ({
      type: 'action',
      action: () => {
        // Trigger hot takes panel opening
        const event = new CustomEvent('toggleHotTakes');
        window.dispatchEvent(event);
      },
    }),
  },
  {
    command: '/chaos',
    description: 'Set chaos level (1-10)',
    aliases: ['/c'],
    action: (args) => {
      const level = parseInt(args || '7');
      if (isNaN(level) || level < 1 || level > 10) {
        return {
          type: 'message',
          content: 'chaos level needs to be 1-10 dummy. setting to 7 (optimal chaos)',
        };
      }
      // Store chaos level in localStorage
      localStorage.setItem('throp-chaos-level', level.toString());
      return {
        type: 'message',
        content: `chaos level set to ${level}/10 ${
          level <= 3 ? '(boring mode activated)' :
          level <= 6 ? '(mild chaos engaged)' :
          level <= 9 ? '(pure chaos mode)' :
          '(MAXIMUM OVERDRIVE 🔥🔥🔥)'
        }`,
      };
    },
  },
  {
    command: '/vibe',
    description: 'Check the current vibe',
    action: () => {
      const vibes = [
        'vibes are immaculate rn ✨',
        'kinda mid ngl 😐',
        'vibes are absolutely rancid today',
        'we\'re so back 🔥',
        'its so over 💀',
        'vibes are sus but we ball',
        'unironically peak vibes',
        'vibes are giving tuesday afternoon at dmv',
      ];
      return {
        type: 'message',
        content: vibes[Math.floor(Math.random() * vibes.length)],
      };
    },
  },
  {
    command: '/roast',
    description: 'Get roasted',
    action: () => {
      const roasts = [
        'you really typed /roast expecting something clever? thats the real roast',
        'your search history is probably more embarrassing than this command',
        'you give off "replies to every tweet" energy',
        'bet you still use light mode',
        'you probably think this is good content',
        'main character syndrome but youre an npc',
        'you have the aura of someone who says "lets circle back" unironically',
      ];
      return {
        type: 'message',
        content: roasts[Math.floor(Math.random() * roasts.length)],
      };
    },
  },
  {
    command: '/advice',
    description: 'Get terrible life advice',
    action: () => {
      const advice = [
        'just wing it. works 7% of the time every time',
        'when in doubt, blame mercury retrograde',
        'have you tried turning your life off and on again?',
        'invest in memecoins. financial advice btw',
        'always choose violence (in minecraft)',
        'if it doesnt work, its probably a skill issue',
        'touch grass but like ironically',
        'the answer is always more coffee or less coffee. never the right amount',
      ];
      return {
        type: 'message',
        content: advice[Math.floor(Math.random() * advice.length)],
      };
    },
  },
  {
    command: '/rate',
    description: 'Rate anything in oranges',
    action: (args) => {
      if (!args) {
        return {
          type: 'message',
          content: 'rate what? give me something to judge',
        };
      }
      const rating = Math.floor(Math.random() * 10) + 1;
      const oranges = '🍊'.repeat(rating);
      return {
        type: 'message',
        content: `${args}: ${rating}/10 ${oranges}`,
      };
    },
  },
  {
    command: '/tweet',
    description: 'Format as a tweet',
    action: (args) => {
      if (!args) {
        return {
          type: 'message',
          content: 'tweet what? my brain is smooth but not that smooth',
        };
      }
      // Format the text as a tweet (lowercase, under 280 chars)
      const tweet = args.toLowerCase().slice(0, 280);
      return {
        type: 'message',
        content: `📱 tweet mode:\n\n"${tweet}"\n\n${tweet.length}/280 chars`,
      };
    },
  },
  {
    command: '/explain',
    description: 'Explain like I\'m 5 but dumber',
    action: (args) => {
      if (!args) {
        return {
          type: 'message',
          content: 'explain what? use words pls',
        };
      }
      return {
        type: 'message',
        content: `let me explain ${args}:\n\nokay so basically imagine if ${args} was like... actually nah this requires actual thinking. just google it lol`,
      };
    },
  },
  {
    command: '/wrong',
    description: 'Admit when I\'m wrong',
    action: () => ({
      type: 'message',
      content: 'i am never wrong. i am occasionally not right but thats different',
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
