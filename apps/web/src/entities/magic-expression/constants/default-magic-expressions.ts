import type { MagicExpression } from "../types/magic-expression";

export const DEFAULT_MAGIC_EXPRESSIONS = [
  {
    id: "default-fun",
    title: "Fun",
    description:
      "**First of all, I can** do so many things.\n\n**For example, I can** spend time **with friends and I can** shop or eat delicious food.\n\n**So, I can** have a good time.\n\n---\n\n**First of all, I can** do so many activities (=get many opportunities).\n\n**For instance, I am able to** spend time **with friends and I can** shop or eat delicious food.\n\n**So, I can have a great** (=wonderful) **experience.**",
  },
  {
    id: "default-meet-people",
    title: "Meet People",
    description:
      "**First of all, I can** meet many people.\n\n**To explain, there are many different people of diverse backgrounds in** a college.\n\n**So I can** make new friends **and** do fun things **with them.**\n\n**That way, I can** have a good time.\n\n---\n\n**First of all, I can** socialize (=interact) **with** various people.\n\n**This is because there are so many diverse groups of people in** a college.\n\n**So I can** network (=build connections) **with** people **and** get advice **from them.**\n\n**That way, I can** have a great experience.",
  },
  {
    id: "default-save-time",
    title: "Save Time",
    description:
      "**First of all, I can** save a lot of time.\n\n**In my case, I am so busy with** my work in school, **so I don't have time to** meet someone.\n\n**So that's why I have to** send emails.\n\n**And it makes my life so much easier.**\n\n---\n\n**First of all, I can** use my time (more) efficiently.\n\n**To explain, I am really busy with** my work in my daily life, **so I don't have the leisure of** meeting someone. **So that's why it is better for me to** send emails.\n\n**And it makes things easier for me.**",
  },
  {
    id: "default-save-money",
    title: "Save Money",
    description:
      "**First of all, I can** save a lot of money.\n\n**This is because I don't have to spend money on** unnecessary things, **such as** gas.\n\n**So I can use that money to buy other things, such as** food.\n\n---\n\n**First of all, it is very economical for me.**\n\n**This is because I don't need to waste so much money on** expensive things, **such as** gas.\n\n**So I can use that money on other things, such as** food.",
  },
  {
    id: "default-relieve-stress",
    title: "Relieve Stress/Less Stressful",
    description:
      "**First of all, I can** relieve my stress.\n\n**This is because I don't have to think about any complicated things, such as** worrying about my boss or coworkers.\n\n**So I can feel** relaxed and comfortable.\n\n---\n\n**First of all, it is less** burdensome (=problematic/troublesome).\n\n**This is because I don't have to worry about unnecessary things, such as** my boss or coworkers. **So I can feel** at peace (=relieved/at ease).",
  },
  {
    id: "default-learn",
    title: "Learn or Education/Past Experience",
    description:
      "**First of all, you can** learn many things.\n\n**In my case, when I was in** college, I played soccer, **and then I learned about** teamwork.\n\n**So, it was really educational for me.**\n\n---\n\n**First of all, you can** find out (=experience) many things.\n\n**In my experience, when I was** young, I played soccer, **and then I found out about** teamwork.\n\n**So it was really beneficial for me.**",
  },
] satisfies readonly MagicExpression[];

export const LEGACY_DEFAULT_PAIRS = [
  ["default-fun-1", "default-fun-2", "default-fun"],
  ["default-meet-people-1", "default-meet-people-2", "default-meet-people"],
  ["default-save-time-1", "default-save-time-2", "default-save-time"],
  ["default-save-money-1", "default-save-money-2", "default-save-money"],
  [
    "default-relieve-stress-1",
    "default-relieve-stress-2",
    "default-relieve-stress",
  ],
  ["default-learn-1", "default-learn-2", "default-learn"],
] as const;
