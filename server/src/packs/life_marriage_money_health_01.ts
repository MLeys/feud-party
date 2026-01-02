import type { FeudRound } from "@feud/shared";

export const PACK_02: FeudRound[] = [
  {
    id: "r1",
    prompt: "Marriage: Name something couples argue about at least once a week",
    answers: [
      {
        id: "r1a1",
        text: "Chores",
        points: 34,
        aliases: ["cleaning", "dishes", "laundry", "housework"]
      },
      {
        id: "r1a2",
        text: "Money",
        points: 26,
        aliases: ["budget", "spending", "bills", "finances"]
      },
      {
        id: "r1a3",
        text: "Tone / communication",
        points: 18,
        aliases: ["attitude", "how you said it", "not listening", "communication"]
      },
      {
        id: "r1a4",
        text: "The thermostat",
        points: 12,
        aliases: ["temperature", "too hot", "too cold", "heat", "ac"]
      },
      {
        id: "r1a5",
        text: "Phone time",
        points: 10,
        aliases: ["on your phone", "scrolling", "screen time", "social media"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Money: Name something parents spend money on that disappears immediately",
    answers: [
      { id: "r2a1", text: "Groceries", points: 30, aliases: ["food", "snacks", "grocery store"] },
      { id: "r2a2", text: "Takeout", points: 22, aliases: ["delivery", "doordash", "pizza", "ubereats"] },
      { id: "r2a3", text: "Kids clothes", points: 18, aliases: ["shoes", "outfits", "they outgrow it"] },
      { id: "r2a4", text: "Gas", points: 14, aliases: ["fuel", "fill up", "gas tank"] },
      { id: "r2a5", text: "Birthday party stuff", points: 10, aliases: ["decorations", "goodie bags", "party supplies"] },
      { id: "r2a6", text: "School / daycare fees", points: 6, aliases: ["daycare", "tuition", "aftercare"] }
    ]
  },
  {
    id: "r3",
    prompt: "Health: Name something adults do and immediately feel proud of",
    answers: [
      { id: "r3a1", text: "Work out", points: 30, aliases: ["exercise", "gym", "workout"] },
      { id: "r3a2", text: "Drink water", points: 22, aliases: ["hydration", "water bottle", "more water"] },
      { id: "r3a3", text: "Go to bed early", points: 18, aliases: ["sleep early", "early bedtime"] },
      { id: "r3a4", text: "Eat something healthy", points: 14, aliases: ["salad", "healthy meal", "greens"] }
    ]
  },
  {
    id: "r4",
    prompt: "Aging: Name something that makes you say “wow, I’m old”",
    answers: [
      { id: "r4a1", text: "Back pain", points: 28, aliases: ["my back", "aches", "sore"] },
      { id: "r4a2", text: "Getting excited about a new appliance", points: 22, aliases: ["vacuum", "dishwasher", "washer", "dryer"] },
      { id: "r4a3", text: "Not understanding new slang", points: 18, aliases: ["kids these days", "what does that mean"] },
      { id: "r4a4", text: "Saying “turn it down”", points: 16, aliases: ["too loud", "loud music"] },
      { id: "r4a5", text: "Needing recovery time", points: 10, aliases: ["sore tomorrow", "recovery", "takes longer"] },
      { id: "r4a6", text: "Liking quiet weekends", points: 6, aliases: ["staying in", "homebody", "quiet nights"] }
    ]
  },
  {
    id: "r5",
    prompt: "Romance: Name something that feels romantic to parents now",
    answers: [
      { id: "r5a1", text: "A kid-free dinner", points: 32, aliases: ["date night", "dinner alone", "babysitter"] },
      { id: "r5a2", text: "Watching a show uninterrupted", points: 20, aliases: ["netflix", "tv together", "no interruptions"] },
      { id: "r5a3", text: "A clean house", points: 18, aliases: ["picked up", "no toys", "tidy"] },
      { id: "r5a4", text: "A real conversation", points: 16, aliases: ["talking", "quality time", "no phones"] },
      { id: "r5a5", text: "Sleeping in", points: 14, aliases: ["late morning", "sleep late"] }
    ]
  }
];
