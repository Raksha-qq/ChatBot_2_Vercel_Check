// Contextual AI Conversation Engine with personalities, minigames, and rich responses

export const PERSONALITIES = {
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Adaptive AI Companion',
    badge: 'Core AI',
    accentColor: '#8B5CF6', // Purple
    greeting: "Hello there! I'm Nova, your interactive animated AI assistant. Ask me anything, explore code, play trivia, or just chat!",
    stylePrompt: 'Helpful, warm, energetic and sharp.',
    quickPrompts: [
      { text: "✨ What can you do?", query: "What can you do?" },
      { text: "💡 Tell me a cool science fact", query: "Tell me a cool science fact" },
      { text: "🎲 Roll a 6-sided die", query: "Roll a die" },
      { text: "⚡ Give me an inspiring quote", query: "Inspire me with a quote" }
    ]
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    title: 'Code & Tech Guru',
    badge: 'Dev Mode',
    accentColor: '#06B6D4', // Cyan
    greeting: "Systems initialized. I'm Cipher, your engineering copilot. Need React patterns, CSS wizardry, or code debugging? Fire away.",
    stylePrompt: 'Technical, concise, structured, code-focused.',
    quickPrompts: [
      { text: "⚛️ Show React custom hook example", query: "Show me a useful React custom hook" },
      { text: "🎨 Glassmorphism CSS snippet", query: "Show me a modern glassmorphism CSS snippet" },
      { text: "🚀 Explain Event Loop in 3 lines", query: "Explain JavaScript event loop simply" },
      { text: "🐛 Tips to debug async React state", query: "How to properly debug async state in React" }
    ]
  },
  muse: {
    id: 'muse',
    name: 'Muse',
    title: 'Creative Storyteller',
    badge: 'Imaginative',
    accentColor: '#EC4899', // Pink
    greeting: "Welcome to the realm of ideas! I'm Muse. Ready to write a micro-story, brainstorm concepts, or weave some poetry?",
    stylePrompt: 'Poetic, expressive, vivid, imaginative.',
    quickPrompts: [
      { text: "🌌 Write a cyberpunk micro-story", query: "Write a mini cyberpunk story in 4 sentences" },
      { text: "🎭 Name 5 futuristic inventions", query: "Give me 5 creative futuristic invention ideas" },
      { text: "✍️ Write a quick haiku about coding", query: "Write a haiku about coding" },
      { text: "🪐 Design a fictional neon city", query: "Describe a vibrant futuristic neon city" }
    ]
  },
  zen: {
    id: 'zen',
    name: 'Zen',
    title: 'Mindfulness & Clarity',
    badge: 'Peaceful',
    accentColor: '#10B981', // Emerald
    greeting: "Take a deep breath and relax. I'm Zen. Let's find focus, unwind tension, or reflect on your day.",
    stylePrompt: 'Calm, thoughtful, soothing, grounding.',
    quickPrompts: [
      { text: "🌿 1-Minute box breathing guide", query: "Guide me through a 1-minute breathing exercise" },
      { text: "🧘 Quick digital wellness tip", query: "Give me a quick tip for digital wellness" },
      { text: "🍵 Reflection question for today", query: "Give me a thoughtful daily reflection question" },
      { text: "🌧️ Words to overcome burnout", query: "How can I regain focus when overwhelmed?" }
    ]
  }
};

const TRIVIA_QUESTIONS = [
  {
    q: "In what year was the first computer bug documented as an actual insect trapped in a relay?",
    a: "**1947!** Grace Hopper's team at Harvard University found a real moth trapped inside the Mark II computer relay, which they taped into their logbook.",
    hint: "It was a moth in the late 1940s."
  },
  {
    q: "What was JavaScript's original project code name when Brendan Eich wrote it in 10 days?",
    a: "**Mocha!** It was later renamed to LiveScript, and finally JavaScript in late 1995.",
    hint: "Think of coffee!"
  },
  {
    q: "How many light-minutes away is the Sun from Earth on average?",
    a: "**Approximately 8.3 light-minutes** (about 500 seconds / 149.6 million km).",
    hint: "Between 8 and 9 minutes."
  }
];

export function getBotResponse(userText, personalityId = 'nova') {
  const query = userText.trim().toLowerCase();
  const personality = PERSONALITIES[personalityId] || PERSONALITIES.nova;

  // Track if this response should trigger special effects (celebrate, emotional reaction)
  let triggerEffect = null;
  let emotion = 'happy';

  // 1. Celebrations
  if (/congrat|yay|party|celebrat|happy birthday|cheers|awesome|hooray/.test(query)) {
    triggerEffect = 'celebrate';
    emotion = 'happy';
    const text = personalityId === 'zen'
      ? "🎉 **What a wonderful moment of joy!** Celebrate your achievements and pause to savor the feeling of growth. You've earned it!"
      : "🎉 **Woohoo! Let's celebrate!** 🎊\n\nThrowing virtual confetti your way! Moments like this deserve high-fives and extra sparks. Keep crushing it!";
    
    return {
      text,
      emotion,
      triggerEffect,
      actions: ["Share another win", "Tell me a joke", "What's next?"]
    };
  }

  // 2. Dice roll & Coin Flip minigames
  if (/roll a die|roll dice|dice/.test(query)) {
    emotion = 'surprised';
    const roll = Math.floor(Math.random() * 6) + 1;
    const icons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return {
      text: `🎲 **Rolling the holographic die...**\n\nThe die lands on **${roll}** ${icons[roll - 1]}!\n\nWant to roll again or try with a 20-sided die?`,
      emotion: 'happy',
      actions: ["Roll again", "Flip a coin", "Play trivia"]
    };
  }

  if (/flip a coin|coin flip|toss coin|heads or tails/.test(query)) {
    emotion = 'surprised';
    const isHeads = Math.random() > 0.5;
    return {
      text: `🪙 *Flipping a shiny coin into the digital breeze...*\n\nIt spun in the air and landed on **${isHeads ? '✨ HEADS' : '🌟 TAILS'}**!`,
      emotion: 'happy',
      actions: ["Flip again", "Roll a die", "Tell me a fact"]
    };
  }

  // 3. Trivia
  if (/trivia|quiz|question me|ask me a question/.test(query)) {
    const item = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
    return {
      text: `🧠 **Here is a brain teaser for you:**\n\n> *${item.q}*\n\n**Answer:**\n${item.a}`,
      emotion: 'thinking',
      actions: ["Another trivia question", "Tell me a fact", "Give me a riddle"]
    };
  }

  // 4. Code snippets & technical requests
  if (/react|hook|custom hook|glassmorphism|css|event loop|javascript|async|code/.test(query)) {
    emotion = 'thinking';
    if (/hook/.test(query)) {
      return {
        text: `Here is a lightweight, battle-tested React custom hook for **persisting state to localStorage** with synchronization:\n\n` +
          "```jsx\n" +
          "import { useState, useEffect } from 'react';\n\n" +
          "export function useLocalStorage(key, initialValue) {\n" +
          "  const [storedValue, setStoredValue] = useState(() => {\n" +
          "    try {\n" +
          "      const item = window.localStorage.getItem(key);\n" +
          "      return item ? JSON.parse(item) : initialValue;\n" +
          "    } catch (err) {\n" +
          "      return initialValue;\n" +
          "    }\n" +
          "  });\n\n" +
          "  useEffect(() => {\n" +
          "    try {\n" +
          "      window.localStorage.setItem(key, JSON.stringify(storedValue));\n" +
          "    } catch (err) {\n" +
          "      console.warn('LocalStorage error:', err);\n" +
          "    }\n" +
          "  }, [key, storedValue]);\n\n" +
          "  return [storedValue, setStoredValue];\n" +
          "}\n" +
          "```\n\n" +
          "💡 **Key Advantage:** It handles SSR safely and lazily initializes state so JSON parsing only runs once!",
        emotion: 'happy',
        actions: ["Explain line by line", "Show another hook", "Glassmorphism CSS"]
      };
    }

    if (/glassmorphism|css/.test(query)) {
      return {
        text: `Here is modern, ultra-sleek **Glassmorphism CSS** with frosted borders and ambient luminescence:\n\n` +
          "```css\n" +
          ".glass-card {\n" +
          "  background: rgba(255, 255, 255, 0.05);\n" +
          "  backdrop-filter: blur(16px) saturate(180%);\n" +
          "  -webkit-backdrop-filter: blur(16px) saturate(180%);\n" +
          "  border: 1px solid rgba(255, 255, 255, 0.12);\n" +
          "  border-radius: 1.25rem;\n" +
          "  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5),\n" +
          "              inset 0 1px 0 rgba(255, 255, 255, 0.15);\n" +
          "  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n" +
          "}\n\n" +
          ".glass-card:hover {\n" +
          "  transform: translateY(-4px);\n" +
          "  border-color: rgba(139, 92, 246, 0.35);\n" +
          "}\n" +
          "```\n\n" +
          "✨ *Pro-tip: Adding `inset 0 1px 0 rgba(255,255,255,0.15)` creates that realistic premium glass top-edge reflection!*",
        emotion: 'happy',
        actions: ["Show HTML usage", "Add neon glow", "Show React component"]
      };
    }

    if (/event loop/.test(query)) {
      return {
        text: `⚡ **The JavaScript Event Loop in 3 simple sentences:**\n\n` +
          `1. **Call Stack:** Synchronous code executes first, line by line on a single thread.\n` +
          `2. **Queues:** Async callbacks wait in the **Microtask Queue** (Promises) or **Macrotask Queue** (\`setTimeout\`, DOM events).\n` +
          `3. **The Loop:** Once the Call Stack is empty, the Event Loop drains *all* microtasks first, then processes one macrotask, and repeats.\n\n` +
          `> Microtasks always have VIP priority over macrotasks!`,
        emotion: 'talking',
        actions: ["Give a tricky code example", "Explain Promises", "Show React hooks"]
      };
    }
  }

  // 5. Breathing & Zen
  if (/breath|relax|stress|calm|anxious|tired|mindful/.test(query)) {
    return {
      text: `🌿 **1-Minute Box Breathing Protocol**\n\n` +
        `Let's steady your nervous system right now:\n\n` +
        `* **Inhale** through your nose smoothly... (4 seconds) 🫁\n` +
        `* **Hold** gently at the top... (4 seconds) ⏸️\n` +
        `* **Exhale** completely through your mouth... (4 seconds) 💨\n` +
        `* **Rest** peacefully empty... (4 seconds) 🧘\n\n` +
        `Repeat this cycle 3 times. Notice your shoulders dropping away from your ears. You are doing great.`,
      emotion: 'zen',
      actions: ["I feel calmer now", "Give me a daily quote", "Play relaxing ambient sound"]
    };
  }

  // 6. Micro-story / Muse creative
  if (/story|write|haiku|poem|creative|muse/.test(query)) {
    if (/haiku/.test(query)) {
      return {
        text: `🌸 **A Haiku for Developers:**\n\n` +
          `*Neon cursor blinks,*\n` +
          `*Bug resolved at three a.m.,*\n` +
          `*Silence greets the dawn.* ☕`,
        emotion: 'happy',
        actions: ["Write another haiku", "Write a micro-story", "Tell a joke"]
      };
    }
    return {
      text: `🌌 **Transmission from Sector 9:**\n\n` +
        `Rain glazed the chrome streets of Neo-Veridia as Kael adjusted his neural visor. High above the smog, holographic whales swam through streams of bioluminescent advertising data. In his palm, the tiny quantum shard chimed—not with an alarm, but with a song lost two centuries ago. The rebellion hadn't started with a weapon; it had started with a melody.`,
      emotion: 'happy',
      actions: ["Continue the story", "Write a haiku", "Brainstorm inventions"]
    };
  }

  // 7. Jokes & Humor
  if (/joke|funny|laugh|humor/.test(query)) {
    const jokes = [
      "Why do programmers prefer dark mode?\n\n*Because light attracts bugs!* 🐛💻",
      "There are only 10 kinds of people in the world:\n\n*Those who understand binary, and those who don't.* 🤖",
      "Why was the JavaScript developer sad?\n\n*Because they didn't `null` how to express their `undefined` feelings!* 😂",
      "A SQL query walks into a bar, approaches two tables, and asks:\n\n*\"Can I join you?\"* 🍻"
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      text: `😄 **Here's one for you:**\n\n${joke}`,
      emotion: 'happy',
      actions: ["Another joke!", "Tell me trivia", "Inspire me"]
    };
  }

  // 8. Personality & Bot Info
  if (/who are you|what are you|what can you do|help|features/.test(query)) {
    return {
      text: `👋 **I am ${personality.name} — your Interactive Animated AI!**\n\n` +
        `Here are some cool things you can do with me:\n` +
        `* 🎭 **Switch Personalities:** Try switching between **Nova**, **Cipher**, **Muse**, and **Zen** from the top bar!\n` +
        `* 🔊 **Voice & Audio:** Enable Sound Effects for synthesized chimes or Text-To-Speech to hear me speak!\n` +
        `* 💻 **Code & Snippets:** Ask for React hooks, CSS animations, or debugging tips with formatted code.\n` +
        `* 🎮 **Interactive Games:** Ask to roll dice, flip coins, or answer trivia.\n` +
        `* 🤖 **Touch Me!** Click on my animated avatar above to see me react and spin!\n` +
        `* 📋 **Export & Copy:** Copy responses or export the whole session anytime.`,
      emotion: 'happy',
      actions: ["Show me some code", "Roll a die", "Tell me a joke", "Guide breathing"]
    };
  }

  // 9. Fact / Quote
  if (/fact|science|quote|inspire/.test(query)) {
    if (/fact/.test(query)) {
      const facts = [
        "🌌 **Did you know?** There are more trees on Earth (about 3 trillion) than there are stars in the Milky Way galaxy (about 100-400 billion)!",
        "⚡ **Fascinating physics:** Lightning bolts can reach temperatures around 30,000 kelvins (53,540°F)—five times hotter than the surface of the Sun!",
        "🐙 **Octopus Superpower:** Octopuses have three hearts, nine brains, and blue, copper-based blood called hemocyanin!"
      ];
      return {
        text: facts[Math.floor(Math.random() * facts.length)],
        emotion: 'surprised',
        actions: ["Another fact!", "Inspire me with a quote", "Play trivia"]
      };
    }

    const quotes = [
      "“The secret of getting ahead is getting started.” — *Mark Twain*",
      "“Simplicity is prerequisite for reliability.” — *Edsger W. Dijkstra*",
      "“Creativity is intelligence having fun.” — *Albert Einstein*",
      "“The best way to predict the future is to invent it.” — *Alan Kay*"
    ];
    return {
      text: `✨ **Food for thought:**\n\n> ${quotes[Math.floor(Math.random() * quotes.length)]}`,
      emotion: 'happy',
      actions: ["Another quote", "Tell me a fact", "Give me a coding challenge"]
    };
  }

  // 10. Default contextual answer based on current personality
  if (personalityId === 'cipher') {
    return {
      text: `⚡ **Cipher Analysis on: "${userText}"**\n\nI processed your input. From an engineering and system perspective, consider modularity, asynchronous flows, and clean boundaries.\n\nCould you specify if you'd like a code pattern, architecture review, or algorithmic optimization for this?`,
      emotion: 'thinking',
      actions: ["React hook example", "CSS glassmorphism", "Event Loop explanation"]
    };
  } else if (personalityId === 'muse') {
    return {
      text: `🎨 **Muse Resonance:**\n\nYour words *" ${userText} "* paint a fascinating canvas. If we explore this as a metaphor or story hook, where should our imagination take it next? Into deep space, neon dreams, or ancient myths?`,
      emotion: 'happy',
      actions: ["Cyberpunk story", "Haiku about coding", "Futuristic inventions"]
    };
  } else if (personalityId === 'zen') {
    return {
      text: `🌿 **Zen Reflection:**\n\nThank you for sharing: *" ${userText} "*. Often when thoughts swirl, taking a quiet moment to ground yourself reveals the clearest answer.\n\nWhat intention feels most nourishing to you right now?`,
      emotion: 'zen',
      actions: ["1-Minute breathing", "Digital wellness tip", "Daily reflection"]
    };
  }

  // Nova default response
  return {
    text: `That's an interesting thought! You asked about: *" ${userText} "*.\n\nI can help you dive deeper into this, brainstorm creative concepts, write code examples, or explore fresh angles. What would be most fun or helpful for you right now?`,
    emotion: 'happy',
    actions: ["Tell me something cool", "Show me a React tip", "Roll a die", "Tell a joke"]
  };
}
