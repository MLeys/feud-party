import type { FeudRound } from "@feud/shared";

export const PACK_01: FeudRound[] = [
  {
    id: "r1",
    prompt: "Name something that instantly makes someone more attractive",
    answers: [
      {
        id: "r1a1",
        text: "Confidence",
        points: 35,
        aliases: ["self confidence", "confident", "swagger", "energy"]
      },
      {
        id: "r1a2",
        text: "Good smile",
        points: 25,
        aliases: ["nice smile", "great teeth", "smiling"]
      },
      {
        id: "r1a3",
        text: "Sense of humor",
        points: 15,
        aliases: ["funny", "makes me laugh", "humor"]
      },
      {
        id: "r1a4",
        text: "Nice voice",
        points: 10,
        aliases: ["deep voice", "smooth voice", "sexy voice"]
      },
      {
        id: "r1a5",
        text: "Good style",
        points: 5,
        aliases: ["fashion", "well dressed", "outfit"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Name something people do to flirt",
    answers: [
      { id: "r2a1", text: "Compliment", points: 38, aliases: ["give compliments", "flattery"] },
      { id: "r2a2", text: "Make eye contact", points: 22, aliases: ["eye contact", "eye contact and smile"] },
      { id: "r2a3", text: "Touch their arm", points: 18, aliases: ["light touch", "arm touch"] },
      { id: "r2a4", text: "Tease playfully", points: 12, aliases: ["joking", "playful teasing"] },
      { id: "r2a5", text: "Smile a lot", points: 10, aliases: ["smiling", "big smile"] }
    ]
  },
  {
    id: "r3",
    prompt: "Name something people do on a date when they’re really into the other person",
    answers: [
      { id: "r3a1", text: "Lean in close", points: 30, aliases: ["leaning in", "get closer"] },
      { id: "r3a2", text: "Laugh at everything", points: 22, aliases: ["laugh a lot", "giggle"] },
      { id: "r3a3", text: "Maintain eye contact", points: 18, aliases: ["stare", "locked eyes"] },
      { id: "r3a4", text: "Touch casually", points: 16, aliases: ["hand on arm", "casual touch"] },
      { id: "r3a5", text: "Lose track of time", points: 14, aliases: ["forget time", "date goes long"] }
    ]
  },
  {
    id: "r4",
    prompt: "Name something people brag about to impress a date",
    answers: [
      { id: "r4a1", text: "Their job",
        points: 34,
        aliases: ["career", "work", "what they do"]
      },
      {
        id: "r4a2",
        text: "Money",
        points: 26,
        aliases: ["income", "salary", "how much they make"]
      },
      {
        id: "r4a3",
        text: "Travel experiences",
        points: 18,
        aliases: ["vacations", "places I've been", "travel"]
      },
      {
        id: "r4a4",
        text: "Fitness",
        points: 12,
        aliases: ["gym", "workout", "being in shape"]
      },
      {
        id: "r4a5",
        text: "Connections",
        points: 10,
        aliases: ["who they know", "network", "friends"]
      }
    ]
  },
  {
    id: "r5",
    prompt: "Name something that signals a hookup might happen",
    answers: [
      { id: "r5a1", text: "Lingering eye contact", points: 32, aliases: ["long looks", "eye contact"] },
      { id: "r5a2", text: "Flirty touching", points: 24, aliases: ["touching", "handsy"] },
      { id: "r5a3", text: "Lowered voices", points: 18, aliases: ["talking close", "quiet talking"] },
      { id: "r5a4", text: "Suggestive jokes", points: 16, aliases: ["innuendo", "dirty jokes"] },
      { id: "r5a5", text: "Staying out late", points: 10, aliases: ["late night", "after hours"] }
    ]
  }
];
