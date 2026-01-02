import type { FeudRound } from "@feud/shared";

export const PACK_01: FeudRound[] = [
  {
    id: "r1",
    prompt: "Name something parents of young kids fantasize about",
    answers: [
      {
        id: "r1a1",
        text: "A full night of sleep",
        points: 35,
        aliases: ["sleep", "sleeping in", "uninterrupted sleep", "nap"]
      },
      {
        id: "r1a2",
        text: "A quiet house",
        points: 25,
        aliases: ["silence", "peace", "no noise", "quiet time"]
      },
      {
        id: "r1a3",
        text: "A kid-free vacation",
        points: 15,
        aliases: ["vacation alone", "adult vacation", "no kids trip"]
      },
      {
        id: "r1a4",
        text: "Going out past 9 pm",
        points: 10,
        aliases: ["late night", "night out", "staying out late"]
      },
      {
        id: "r1a5",
        text: "Finishing a meal while it’s hot",
        points: 5,
        aliases: ["hot food", "eat in peace", "no interruptions"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Name something that completely kills the mood for parents",
    answers: [
      { id: "r2a1", text: "A kid waking up", points: 38, aliases: ["child wakes up", "baby crying", "toddler awake"] },
      { id: "r2a2", text: "Being exhausted", points: 22, aliases: ["too tired", "no energy", "wiped out"] },
      { id: "r2a3", text: "House mess", points: 18, aliases: ["toys everywhere", "dirty house", "messy"] },
      { id: "r2a4", text: "Tomorrow’s schedule", points: 12, aliases: ["busy day", "early morning", "calendar"] },
      { id: "r2a5", text: "Falling asleep mid-conversation",
        points: 10,
        aliases: ["passed out", "dozed off", "fell asleep"]
      }
    ]
  },
  {
    id: "r3",
    prompt: "Name something parents consider a \"romantic date\" now",
    answers: [
      { id: "r3a1", text: "Going to bed early together", points: 30, aliases: ["early bedtime", "sleep early"] },
      { id: "r3a2", text: "Watching a show uninterrupted", points: 22, aliases: ["tv together", "netflix", "no kids tv"] },
      { id: "r3a3", text: "Eating takeout in peace", points: 18, aliases: ["takeout", "dinner alone"] },
      { id: "r3a4", text: "A quiet drive alone",
        points: 16,
        aliases: ["car ride", "driving in silence"]
      },
      { id: "r3a5", text: "Running errands together",
        points: 14,
        aliases: ["target run", "grocery shopping"]
      }
    ]
  },
  {
    id: "r4",
    prompt: "Name something parents lie about on social media",
    answers: [
      { id: "r4a1", text: "How happy everyone is",
        points: 34,
        aliases: ["perfect family", "smiling photos"]
      },
      {
        id: "r4a2",
        text: "How clean the house is",
        points: 26,
        aliases: ["clean home", "no mess"]
      },
      {
        id: "r4a3",
        text: "How much sleep they get",
        points: 18,
        aliases: ["well rested", "slept great"]
      },
      {
        id: "r4a4",
        text: "How well-behaved the kids are",
        points: 12,
        aliases: ["angel kids", "perfect kids"]
      },
      {
        id: "r4a5",
        text: "How organized they feel",
        points: 10,
        aliases: ["got it together", "on top of things"]
      }
    ]
  },
  {
    id: "r5",
    prompt: "Name something parents say that really means \"not tonight\"",
    answers: [
      { id: "r5a1", text: "I’m exhausted",
        points: 32,
        aliases: ["so tired", "too tired"]
      },
      {
        id: "r5a2",
        text: "We have an early morning",
        points: 24,
        aliases: ["early tomorrow", "morning schedule"]
      },
      {
        id: "r5a3",
        text: "Let’s do it this weekend",
        points: 18,
        aliases: ["later", "not now", "another time"]
      },
      {
        id: "r5a4",
        text: "Did you hear a noise?",
        points: 16,
        aliases: ["what was that", "check on the kids"]
      },
      {
        id: "r5a5",
        text: "Just one more episode",
        points: 10,
        aliases: ["next episode", "one more show"]
      }
    ]
  }
];
