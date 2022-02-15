import { ConventionalCommit } from "../client/conventional_commit";

describe("Given a conventional commit client", () => {
  let client: ConventionalCommit;

  beforeEach(() => {
    client = new ConventionalCommit();
  });

  it("should return the corresponding label for the commit title", () => {
    const label = client.getLabel("fix: add a new feature");
    expect(label.error).toBeUndefined();
    expect(label.label).toEqual("conventional: bugfix");
  });

  it("should return the corresponding label for the commit title", () => {
    const message = "feat: add test";
    const label = client.getLabel(message);
    expect(label.label).toEqual("conventional: enhancement");
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
    const result = client.isConventionalLabel("conventional: enhancement");
    expect(result).toBeTruthy();
  });

  it("Should return false if the label is not one of the predefined labels", () => {
    const result = client.isConventionalLabel("conventional: enhance");
    expect(result).toBeFalsy();
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels([
      "conventional: enhancement",
      "conventional: enhance",
    ]);
    expect(labels).toEqual(["conventional: enhance"]);
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels([
      "conventional: enhancement",
      "conventional: bugfix",
    ]);
    expect(labels.length).toBe(0);
  });

  it("Should return a list of invalid labels", () => {
    const labels = client.getInvalidLabels([]);
    expect(labels.length).toBe(0);
  });

  it("Should return a list of valid labels", () => {
    const labels = client.getValidLabels([
      "conventional: enhancement",
      "conventional: enhance",
    ]);
    expect(labels).toEqual(["conventional: enhancement"]);
  });

  it("Should return a list of valid labels", () => {
    const labels = client.getValidLabels([
      "conventional: enhancement",
      "conventional: bugfix",
    ]);
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
});
