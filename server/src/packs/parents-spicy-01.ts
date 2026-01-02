import type { FeudRound } from "@feud/shared";

export const PACK_01: FeudRound[] = [
  {
    id: "r1",
    prompt: "Name something parents do to hint they want alone time",
    answers: [
      {
        id: "r1a1",
        text: "Send the kids to bed early",
        points: 32,
        aliases: ["early bedtime", "bedtime now", "go to bed", "lights out"]
      },
      {
        id: "r1a2",
        text: "Say “I’ll lock the door”",
        points: 22,
        aliases: ["lock the door", "close the door", "privacy", "door locked"]
      },
      {
        id: "r1a3",
        text: "Start a “movie” no one will finish",
        points: 18,
        aliases: ["put on a movie", "netflix", "movie night", "watch something"]
      },
      {
        id: "r1a4",
        text: "Light a candle",
        points: 14,
        aliases: ["candles", "mood lighting", "set the mood", "romantic candle"]
      },
      {
        id: "r1a5",
        text: "Offer a “quick back rub”",
        points: 9,
        aliases: ["massage", "back rub", "shoulder rub", "rub my back"]
      },
      {
        id: "r1a6",
        text: "Suddenly start cleaning the bedroom",
        points: 5,
        aliases: ["tidy room", "pick up the room", "clean the room"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Name something that instantly kills the mood in a house with kids",
    answers: [
      { id: "r2a1", text: "A kid yelling your name", points: 30, aliases: ["mom!", "dad!", "they need you", "kids screaming"] },
      { id: "r2a2", text: "A random door opening", points: 22, aliases: ["door opens", "someone walks in", "kid walks in"] },
      { id: "r2a3", text: "The baby monitor lights up", points: 18, aliases: ["monitor", "baby woke up", "crying"] },
      { id: "r2a4", text: "Stepping on a toy", points: 14, aliases: ["lego", "toy on floor", "hurt my foot"] }
    ]
  },
  {
    id: "r3",
    prompt: "Name something couples do that counts as \"spicy\" after three kids",
    answers: [
      { id: "r3a1", text: "Go to bed at the same time", points: 26, aliases: ["same bedtime", "bed together", "sleep same time"] },
      { id: "r3a2", text: "Sit close on the couch", points: 20, aliases: ["cuddle", "snuggle", "sit together"] },
      { id: "r3a3", text: "Send a flirty text", points: 16, aliases: ["flirt", "texting", "spicy text", "cute text"] },
      { id: "r3a4", text: "Shower without interruptions", points: 14, aliases: ["shower", "bath", "no one knocks"] },
      { id: "r3a5", text: "Wear real clothes at home", points: 12, aliases: ["not sweatpants", "jeans", "nice outfit"] },
      { id: "r3a6", text: "Make it through a conversation uninterrupted", points: 8, aliases: ["talk", "chat", "no interruptions"] },
      { id: "r3a7", text: "Brush teeth before 10 pm", points: 4, aliases: ["brush teeth", "brushing", "oral hygiene"] }
    ]
  },
  {
    id: "r4",
    prompt: "Name something parents say that secretly means “I’m in the mood”",
    answers: [
      { id: "r4a1", text: "“Are the kids asleep?”", points: 30, aliases: ["kids asleep", "they asleep yet", "everyone asleep"] },
      { id: "r4a2", text: "“Come sit next to me”", points: 22, aliases: ["sit by me", "come here", "sit closer"] },
      { id: "r4a3", text: "“Let’s put our phones away”", points: 18, aliases: ["no phones", "put the phone down", "phones off"] },
      { id: "r4a4", text: "“I took a shower”", points: 16, aliases: ["showered", "freshened up", "cleaned up"] },
      { id: "r4a5", text: "“Want a glass of wine?”", points: 14, aliases: ["wine", "drink", "nightcap"] }
    ]
  },
  {
    id: "r5",
    prompt: "Name a place couples have to be extra quiet because kids are nearby",
    answers: [
      { id: "r5a1", text: "Bedroom", points: 28, aliases: ["our room", "master bedroom", "bedroom"] },
      { id: "r5a2", text: "Living room", points: 22, aliases: ["couch", "family room", "living room"] },
      { id: "r5a3", text: "Bathroom", points: 18, aliases: ["shower", "bathroom", "in the bathroom"] },
      { id: "r5a4", text: "Car", points: 14, aliases: ["in the car", "driveway", "parking lot"] },
      { id: "r5a5", text: "Kitchen", points: 10, aliases: ["kitchen", "counter", "kitchen counter"] },
      { id: "r5a6", text: "Hallway", points: 8, aliases: ["hall", "in the hall", "hallway"] }
    ]
  }
];
