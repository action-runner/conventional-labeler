import { GithubClient } from "../client/github";
import * as github from "@actions/github";

jest.mock("@actions/core");
jest.mock("@actions/github", () => ({
  getOctokit: jest.fn().mockReturnValue({
    rest: {
      issues: {
        listLabelsOnIssue: jest.fn().mockReturnValue({
          data: [{ name: "bugfix" }, { name: "enhancement" }],
        }),
        removeLabel: jest.fn().mockReturnValue({}),
        addLabels: jest.fn().mockReturnValue({}),
      },
    },
  }),
  context: {
    repo: {
      owner: "monalisa",
      repo: "helloworld",
    },
    payload: {
      pull_request: {
        title: "fix: add a new feature",
        number: 123,
      },
    },
  },
}));

describe("Given a github client", () => {
  const client: GithubClient = new GithubClient("");

  it("should return the corresponding label for the commit title", async () => {
    const label = await client.getLabels(123);
    expect(label.error).toBeUndefined();
    expect(label.labels).toEqual(["bugfix", "enhancement"]);
  });

  it("should return the corresponding label for the commit title", async () => {
    const title = client.getTitle();
    expect(title).toEqual("fix: add a new feature");
  });

  it("should remove the preset labels", async () => {
    const error = await client.removeLabels(123, ["bugfix", "enhancement"]);
    expect(error).toBeUndefined();
  });

  it("Should add label successfully", async () => {
    const error = await client.addLabel(123, ["bugfix"]);
    expect(error).toBeUndefined();
  });

  it("Should add label with an error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: jest.fn().mockImplementation(() => {
            throw new Error("error");
          }),
        },
      },
    });
    const error = await client.addLabel(123, ["bugfix"]);
    expect(error).toBe("Error: error");
  });

  it("Should remove labels with an error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          removeLabel: jest.fn().mockImplementation(() => {
            throw new Error("error");
          }),
        },
      },
    });
    const error = await client.removeLabels(123, ["bugfix"]);
    expect(error).toBe("Error: error");
  });

  it("should return the corresponding label with an error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          listLabelsOnIssue: jest.fn().mockImplementation(() => {
            throw new Error("error");
          }),
        },
      },
    });
    const label = await client.getLabels(123);
    expect(label.error).toBe("Error: error");
  });

  it("Should return a correct pr number", () => {
    expect(client.getPr()).toEqual(123);
  });
});
