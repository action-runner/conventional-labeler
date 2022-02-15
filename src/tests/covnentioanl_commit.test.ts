import { ConventionalCommit } from "../client/conventional_commit";

describe("Given a conventional commit client", () => {
  let client: ConventionalCommit;

  beforeEach(() => {
    client = new ConventionalCommit();
  });

  it("should return the corresponding label for the commit title", () => {
    const label = client.getLabel("fix: add a new feature");
    expect(label.error).toBeUndefined();
    expect(label.label).toEqual("bugfix");
  });

  it("should return the corresponding label for the commit title", () => {
    const message = "feat: add test";
    const label = client.getLabel(message);
    expect(label.label).toEqual("enhancement");
  });

  it("should return an error if the commit title is invalid", () => {
    const message = "add test";
    const label = client.getLabel(message);
    expect(label.error).toBeDefined();
    expect(label.label).toBeUndefined();
  });

  it("should return an error if the commit title is invalid", () => {
    const message = "";
    const label = client.getLabel(message);
    expect(label.error).toBe("commit message is empty");
    expect(label.label).toBeUndefined();
  });

  it("Should return true if the label is one of the predefined labels", () => {
    const result = client.isConventionalLabel("enhancement");
    expect(result).toBeTruthy();
  });

  it("Should return false if the label is not one of the predefined labels", () => {
    const result = client.isConventionalLabel("enhance");
    expect(result).toBeFalsy();
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels(["enhancement", "enhance"]);
    expect(labels).toEqual(["enhance"]);
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels(["enhancement", "bugfix"]);
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
    const labels = client.getValidLabels(["enhancement", "bugfix"]);
    expect(labels.length).toBe(2);
  });

  it("Should return a list of valid labels", () => {
    const labels = client.getValidLabels([]);
    expect(labels.length).toBe(0);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement", "bugfix"],
      ["enhancement", "bugfix"]
    );
    expect(diff.length).toBe(0);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement", "bug"],
      ["enhancement", "bugfix"]
    );
    expect(diff).toEqual(["bug"]);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement"],
      ["enhancement", "bugfix"]
    );
    expect(diff.length).toEqual(0);
  });

  it("Should return different labels", () => {
    const diff = client.getDiffLabels(
      ["enhancement", "bug", "bugfix"],
      ["enhancement", "bugfix"]
    );
    expect(diff).toEqual(["bug"]);
  });
});
