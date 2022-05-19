import { ConventionalCommit } from "../client/conventional_commit";

describe("Given a conventional commit client", () => {
  let client: ConventionalCommit;

  beforeEach(() => {
    client = new ConventionalCommit();
  });

  it("should return the corresponding labels for the commit title", () => {
    const labels = client.getLabels("fix: add a new feature");
    expect(labels.error).toBeUndefined();
    expect(labels.labels).toEqual(["bug"]);
  });

  it("should return the corresponding labels for the commit title", () => {
    const message = "feat: add test";
    const labels = client.getLabels(message);
    expect(labels.labels).toEqual(["enhancement"]);
  });

  it("should return the corresponding labels for the commit title", () => {
    const labels = client.getLabels("fix!: it is a breaking change");
    expect(labels.error).toBeUndefined();
    expect(labels.labels).toEqual(["bug","breaking"]);
  });

  it("should return the corresponding labels for the commit title", () => {
    const labels = client.getLabels("feat!: it is a breaking change");
    expect(labels.error).toBeUndefined();
    expect(labels.labels).toEqual(["enhancement","breaking"]);
  });

  it("should return an error if the commit title is invalid", () => {
    const message = "add test";
    const labels = client.getLabels(message);
    expect(labels.error).toBeDefined();
    expect(labels.labels).toBeUndefined();
  });

  it("should return an error if the commit title is invalid", () => {
    const message = "";
    const labels = client.getLabels(message);
    expect(labels.error).toBe("commit message is empty");
    expect(labels.labels).toBeUndefined();
  });

  it("Should return true if the labels is one of the predefined labels", () => {
    const result = client.isConventionalLabel("enhancement");
    expect(result).toBeTruthy();
  });

  it("Should return false if the labels is not one of the predefined labels", () => {
    const result = client.isConventionalLabel("enhance");
    expect(result).toBeFalsy();
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels(["enhancement", "enhance"]);
    expect(labels).toEqual(["enhance"]);
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels(["enhancement", "bug"]);
    expect(labels.length).toBe(0);
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels([]);
    expect(labels.length).toBe(0);
  });

  it("Should return a list of valid labels", () => {
    const labels = client.getValidLabels(["enhancement", "enhance"]);
    expect(labels).toEqual(["enhancement"]);
  });

  it("Should return a list of valid labels", () => {
    const labels = client.getValidLabels(["enhancement", "bug"]);
    expect(labels.length).toBe(2);
  });

  it("Should return a list of valid labels", () => {
    const labels = client.getValidLabels([]);
    expect(labels.length).toBe(0);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement", "bug"],
      ["enhancement", "bug"]
    );
    expect(diff.length).toBe(0);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement", "bug"],
      ["enhancement", "bu"]
    );
    expect(diff).toEqual(["bug"]);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(["enhancement"], ["enhancement", "bug"]);
    expect(diff.length).toEqual(0);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement", "bag", "bug"],
      ["enhancement", "bug"]
    );
    expect(diff).toEqual(["bag"]);
  });

  it("Should return an conventional commit error", () => {
    const error = client.validate([], "hello");
    expect(error).toBe(
      "title [hello] does not follow the conventional commit format"
    );
  });

  it("Should return an conventional commit error", () => {
    const error = client.validate([], "fix: hello");
    expect(error).toBe("commit message is empty");
  });

  it("Should return an conventional commit error", () => {
    const error = client.validate(["fix: hell"], "fix: hello");
    expect(error).toBe(
      "commit message [fix: hell] does not equal to the title of the PR [fix: hello]"
    );
  });

  it("Should return an conventional commit error", () => {
    const error = client.validate(["fix: hello", "fi: hello"], "fix: hello");
    expect(error).toBe(
      "commit message [fi: hello] does not follow the conventional commit format"
    );
  });

  it("Should return no error", () => {
    const error = client.validate(["fix: hello\n* a: fix error"], "fix: hello");
    expect(error).toBeUndefined();
  });

  it("Should return no error when not strict", () => {
    const error = client.validate(["hello", "fix error"], "fix: hello", false);
    expect(error).toBeUndefined();
  });
});
