import {
  adjectives,
  type Config,
  nouns,
  uniqueUsernameGenerator,
} from "unique-username-generator";

const config: Config = {
  dictionaries: [adjectives, nouns],
  separator: " ",
  style: "capital",
};

export function generateUsername(): string {
  return uniqueUsernameGenerator(config);
}
