export interface OewnCliArguments {
  inputArgument: string;
  outputArgument: string | undefined;
}

export function parseOewnCliArguments(arguments_: readonly string[]): OewnCliArguments {
  const positionalArguments = arguments_[0] === "--" ? arguments_.slice(1) : arguments_;
  const [inputArgument, outputArgument, ...unexpectedArguments] = positionalArguments;

  if (!inputArgument || unexpectedArguments.length > 0) {
    throw new Error(
      "Usage: pnpm dictionary:prepare:oewn -- <path-to-english-wordnet-2025.xml.gz> [output-directory]",
    );
  }

  return { inputArgument, outputArgument };
}
