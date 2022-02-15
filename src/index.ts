import { ConventionalLabeler } from "./labeler";

(async () => {
  const labeler = new ConventionalLabeler();
  await labeler.label();
})();
