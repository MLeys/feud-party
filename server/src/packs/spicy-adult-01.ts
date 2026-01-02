import type { FeudRound } from "@feud/shared";

export const PACK_01: FeudRound[] = [
  {
    id: "r1",
    prompt: "Name something people do that screams “I’m trying to look rich”",
    answers: [
      {
        id: "r1a1",
        text: "Drive a fancy car",
        points: 35,
        aliases: ["luxury car", "bmw", "mercedes", "tesla", "expensive car", "new car"]
      },
      {
        id: "r1a2",
        text: "Wear designer brands",
        points: 25,
        aliases: ["designer", "gucci", "prada", "louis vuitton", "lv", "name brand"]
      },
      {
        id: "r1a3",
        text: "Post about it online",
        points: 15,
        aliases: ["instagram", "flex", "show off", "social media", "post pics", "brag online"]
      },
      {
        id: "r1a4",
        text: "Order the most expensive thing",
        points: 10,
        aliases: ["expensive menu item", "top shelf", "bottle service", "most expensive"]
      },
      {
        id: "r1a5",
        text: "Talk about investments",
        points: 5,
        aliases: ["crypto", "stocks", "bitcoin", "portfolio", "real estate talk"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Name something you do while waiting for someone to text you back",
    answers: [
      { id: "r2a1", text: "Check your phone nonstop", points: 38, aliases: ["refresh", "check messages", "open phone", "stare at phone"] },
      { id: "r2a2", text: "Overthink what you said", points: 22, aliases: ["re-read", "analyze", "second guess", "overthinking"] },
      { id: "r2a3", text: "Stalk their social media", points: 18, aliases: ["instagram", "facebook", "snapchat", "tiktok", "socials"] },
      { id: "r2a4", text: "Text a friend about it", points: 12, aliases: ["group chat", "ask my friend", "send screenshots"] },
      { id: "r2a5", text: "Pretend you don’t care", points: 10, aliases: ["play it cool", "act normal", "i'm fine", "ignore it"] }
    ]
  },
  {
    id: "r3",
    prompt: "Name something you’d hate to hear your date say on the first date",
    answers: [
      { id: "r3a1", text: "“My ex…”", points: 30, aliases: ["talk about ex", "ex boyfriend", "ex girlfriend", "my last relationship"] },
      { id: "r3a2", text: "“I’m not looking for anything serious”", points: 22, aliases: ["not serious", "no commitment", "just vibing", "keep it casual"] },
      { id: "r3a3", text: "“So… how much do you make?”", points: 18, aliases: ["your salary", "income", "money", "what do you earn"] },
      { id: "r3a4", text: "“I’m moving in a month”", points: 16, aliases: ["moving away", "relocating", "leaving town"] },
      { id: "r3a5", text: "“I forgot my wallet”", points: 14, aliases: ["no money", "can't pay", "left my card", "broke"] }
    ]
  },
  {
    id: "r4",
    prompt: "Name something people blame on being “hangry”",
    answers: [
      { id: "r4a1", text: "Snapping at someone", points: 34, aliases: ["yelling", "being rude", "attitude", "short temper"] },
      { id: "r4a2", text: "Starting an argument", points: 26, aliases: ["fight", "argue", "pick a fight"] },
      { id: "r4a3", text: "Making bad decisions", points: 18, aliases: ["impulse", "poor choices", "bad choices"] },
      { id: "r4a4", text: "Ordering too much food", points: 12, aliases: ["overorder", "too much", "extra food"] },
      { id: "r4a5", text: "Crying or getting emotional", points: 10, aliases: ["cry", "teary", "emotional"] }
    ]
  },
  {
    id: "r5",
    prompt: "Name something people do at a party that makes you think “they’re a mess”",
    answers: [
      { id: "r5a1", text: "Overshare personal drama", points: 32, aliases: ["too much info", "trauma dump", "tell secrets", "over sharing"] },
      { id: "r5a2", text: "Get way too drunk", points: 24, aliases: ["wasted", "hammered", "blackout", "drunk"] },
      { id: "r5a3", text: "Start a fight", points: 18, aliases: ["argue", "cause drama", "yell"] },
      { id: "r5a4", text: "Flirt with everyone", points: 16, aliases: ["hit on everyone", "too flirty", "trying too hard"] },
      { id: "r5a5", text: "Cry in the bathroom", points: 10, aliases: ["bathroom cry", "crying", "emotional in bathroom"] }
    ]
  }
];
