/** Funny/goofy notification messages for plant watering reminders. */

/** Day-of friendly reminder messages. */
const dayOfMessages = [
  "{name} is getting thirsty 👀",
  "Hey! {name} would love a little drink today 💧",
  "Time to show {name} some love – watering day! 🌱",
  "Reminder: {name} is waiting patiently for you 🪴",
];

/** 1-day late sassy messages. */
const oneDayLateMessages = [
  "Hey! {name} hasn't had a drink in a while 🥺",
  "You forgot {name} again. He's judging you. 😤",
  "{name} just sent you a strongly worded letter. 📬",
  "{name}'s leaves are looking a little sad right now 😢",
];

/** 3+ days late emergency messages. */
const emergencyMessages = [
  "{name} is writing his will. Water him NOW. 📝",
  "Emergency: {name} is in plant heaven soon 💀",
  "{name} just called. He said you're a terrible plant parent. 🌵",
  "If {name} could walk, he'd walk to the sink himself. 🚶",
  "{name}'s leaves are crispier than your morning toast 🍞",
  "SOS: {name} is on life support. This is not a drill. 🚨",
];

type SassLevel = 'friendly' | 'sassy' | 'emergency';

/**
 * Returns a random funny notification message for a plant.
 * @param plantName - The name of the plant (e.g. "Barry")
 * @param sassLevel - How overdue the plant is
 */
export const getNotificationMessage = (
  plantName: string,
  sassLevel: SassLevel = 'friendly',
): { title: string; body: string } => {
  let pool: string[];

  switch (sassLevel) {
    case 'emergency':
      pool = emergencyMessages;
      break;
    case 'sassy':
      pool = oneDayLateMessages;
      break;
    default:
      pool = dayOfMessages;
  }

  const template = pool[Math.floor(Math.random() * pool.length)];
  const body = template.replace(/{name}/g, plantName);

  return {
    title: '🌿 PlantPal',
    body,
  };
};
