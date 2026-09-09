import {
  adjectives,
  type Config,
  nouns,
  uniqueUsernameGenerator,
} from "unique-username-generator";

const config: Config = {
  dictionaries: [adjectives, nouns],
  separator: " ",
  style: "titleCase",
};

export function generateUsername(): string {
  return uniqueUsernameGenerator(config);
}
