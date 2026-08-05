export interface DialogueTurn {
  speaker: string;
  message: string;
}

export function parseDialogue(prompt: string): DialogueTurn[] {
  return prompt
    .split(/\n|(?=\b(?:A|B|Speaker [12]):)/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^:]{1,12}):\s*(.*)$/s);
      return match ? { speaker: match[1], message: match[2] } : undefined;
    })
    .filter((turn): turn is DialogueTurn => Boolean(turn));
}
