import type { FeudRound } from "@feud/shared";

export const PACK_01: FeudRound[] = [
  {
    id: "r1",
    prompt: "Name something parents with young kids are constantly Googling",
    answers: [
      {
        id: "r1a1",
        text: "Is this normal?",
        points: 35,
        aliases: ["normal?", "is this okay", "should I worry"]
      },
      {
        id: "r1a2",
        text: "Kids sleep schedules",
        points: 25,
        aliases: ["sleep regression", "bedtime", "wake windows"]
      },
      {
        id: "r1a3",
        text: "Quick dinner ideas",
        points: 15,
        aliases: ["easy dinner", "fast meals", "what's for dinner"]
      },
      {
        id: "r1a4",
        text: "How much screen time is too much",
        points: 10,
        aliases: ["screen time limits", "ipad time", "tv time"]
      },
      {
        id: "r1a5",
        text: "Symptoms at 2 a.m.",
        points: 5,
        aliases: ["fever at night", "why are they coughing", "sick kid"]
      }
    ]
  },
  {
    id: "r2",
    prompt: "Name something parents judge other parents for (but pretend they don’t)",
    answers: [
      { id: "r2a1", text: "Screen time", points: 38, aliases: ["ipad kids", "too much tv"] },
      { id: "r2a2", text: "Discipline style", points: 22, aliases: ["gentle parenting", "timeouts"] },
      { id: "r2a3", text: "What their kids eat", points: 18, aliases: ["junk food", "snacks", "diet"] },
      { id: "r2a4", text: "Bedtimes", points: 12, aliases: ["late bedtime", "sleep schedule"] },
      { id: "r2a5", text: "Public behavior", points: 10, aliases: ["tantrums", "meltdowns"] }
    ]
  },
  {
    id: "r3",
    prompt: "Name something parents miss from their pre-kid life",
    answers: [
      { id: "r3a1", text: "Spontaneity", points: 30, aliases: ["last minute plans", "being spontaneous"] },
      { id: "r3a2", text: "Sleeping in", points: 22, aliases: ["late mornings", "sleep late"] },
      { id: "r3a3", text: "Quiet", points: 18, aliases: ["silence", "peace"] },
      { id: "r3a4", text: "Disposable income", points: 16, aliases: ["extra money", "no kids expenses"] },
      { id: "r3a5", text: "Going out without planning",
        points: 14,
        aliases: ["no babysitter", "easy nights out"]
      }
    ]
  },
  {
    id: "r4",
    prompt: "Name something parents argue about that has nothing to do with kids",
    answers: [
      { id: "r4a1", text: "Money",
        points: 34,
        aliases: ["finances", "budget", "spending"]
      },
      {
        id: "r4a2",
        text: "House chores",
        points: 26,
        aliases: ["cleaning", "who does what"]
      },
      {
        id: "r4a3",
        text: "Temperature",
        points: 18,
        aliases: ["thermostat", "too hot", "too cold"]
      },
      {
        id: "r4a4",
        text: "Phone usage",
        points: 12,
        aliases: ["on your phone", "screen time adults"]
      },
      {
        id: "r4a5",
        text: "What to watch",
        points: 10,
        aliases: ["tv choice", "netflix arguments"]
      }
    ]
  },
  {
    id: "r5",
    prompt: "Name something parents consider a luxury now",
    answers: [
      { id: "r5a1", text: "Time alone",
        points: 32,
        aliases: ["alone time", "me time"]
      },
      {
        id: "r5a2",
        text: "Going to the bathroom uninterrupted",
        points: 24,
        aliases: ["bathroom alone", "privacy"]
      },
      {
        id: "r5a3",
        text: "A clean house",
        points: 18,
        aliases: ["clean floors", "no toys"]
      },
      {
        id: "r5a4",
        text: "A date night",
        points: 16,
        aliases: ["date", "night out"]
      },
      {
        id: "r5a5",
        text: "Finishing a hot cup of coffee",
        points: 10,
        aliases: ["hot coffee", "drink coffee"]
      }
    ]
  }
];
