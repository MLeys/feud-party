import type { FeudRound } from "@feud/shared";

export const PACK_01: FeudRound[] = [
  {
    id: "r1",
    prompt: "Name something people do before going to bed",
    answers: [
      {
        id: "r1a1",
        text: "Brush teeth",
        points: 35,
        aliases: ["brush my teeth", "brush teeth", "brushing", "brush", "toothbrush", "brush your teeth"]
      },
      {
        id: "r1a2",
        text: "Put on pajamas",
        points: 25,
        aliases: ["pajamas", "pjs", "put on pjs", "change into pajamas", "get changed", "change clothes", "night clothes"]
      },
      {
        id: "r1a3",
        text: "Set an alarm",
        points: 15,
        aliases: ["alarm", "set alarm", "set my alarm", "wake-up alarm", "set a timer", "schedule alarm"]
      },
      {
        id: "r1a4",
        text: "Check phone / scroll",
        points: 10,
        aliases: ["phone", "check my phone", "scroll", "scrolling", "social media", "tiktok", "instagram", "youtube", "doomscroll"]
      },
      {
        id: "r1a5",
        text: "Read",
        points: 5,
        aliases: ["read a book", "book", "reading", "read", "magazine", "kindle", "audiobook"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Name a food people eat at a baseball game",
    answers: [
      { id: "r2a1", text: "Hot dog", points: 38, aliases: ["hotdog", "hot dogs", "hotdogging", "frank", "frankfurter"] },
      { id: "r2a2", text: "Popcorn", points: 22, aliases: ["pop corn", "buttered popcorn"] },
      { id: "r2a3", text: "Nachos", points: 18, aliases: ["nacho", "chips and cheese", "tortilla chips", "cheese nachos"] },
      { id: "r2a4", text: "Peanuts", points: 12, aliases: ["nuts", "peanut", "salted peanuts"] },
      { id: "r2a5", text: "Pretzel", points: 10, aliases: ["pretzels", "soft pretzel", "pretzel bites"] }
    ]
  },
  {
    id: "r3",
    prompt: "Name something people bring to a picnic",
    answers: [
      { id: "r3a1", text: "Sandwiches", points: 30, aliases: ["sandwich", "subs", "hoagies", "wraps"] },
      { id: "r3a2", text: "Chips", points: 22, aliases: ["potato chips", "crisps", "snacks"] },
      { id: "r3a3", text: "Drinks", points: 18, aliases: ["soda", "pop", "water", "juice", "lemonade", "iced tea"] },
      { id: "r3a4", text: "Fruit", points: 16, aliases: ["watermelon", "grapes", "berries", "fruit salad"] },
      { id: "r3a5", text: "Blanket", points: 14, aliases: ["picnic blanket", "mat", "tarp"] }
    ]
  },
  {
    id: "r4",
    prompt: "Name a common household chore",
    answers: [
      { id: "r4a1", text: "Dishes", points: 34, aliases: ["wash dishes", "do the dishes", "dishwashing"] },
      { id: "r4a2", text: "Laundry", points: 26, aliases: ["wash clothes", "fold laundry", "do laundry"] },
      { id: "r4a3", text: "Vacuuming", points: 18, aliases: ["vacuum", "vacuum floors", "sweep", "sweeping"] },
      { id: "r4a4", text: "Taking out trash", points: 12, aliases: ["trash", "garbage", "take out garbage", "take out the trash"] },
      { id: "r4a5", text: "Cleaning bathroom", points: 10, aliases: ["bathroom", "scrub toilet", "clean toilet", "clean shower"] }
    ]
  },
  {
    id: "r5",
    prompt: "Name something people do when they’re bored",
    answers: [
      { id: "r5a1", text: "Watch TV", points: 32, aliases: ["tv", "netflix", "youtube", "streaming", "watch a show"] },
      { id: "r5a2", text: "Scroll social media", points: 24, aliases: ["phone", "tiktok", "instagram", "facebook", "doomscroll"] },
      { id: "r5a3", text: "Snack", points: 18, aliases: ["eat", "eat snacks", "chips", "cookies"] },
      { id: "r5a4", text: "Play games", points: 16, aliases: ["video games", "gaming", "board games", "cards"] },
      { id: "r5a5", text: "Nap", points: 10, aliases: ["sleep", "take a nap", "rest"] }
    ]
  }
];
