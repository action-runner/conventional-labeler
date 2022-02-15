import { GithubClient } from "../client/github";
import core from "@actions/core";
import github from "@actions/github";
import { ConventionalLabeler } from "../labeler";

jest.mock("@actions/core", () => ({
  getInput: jest.fn().mockReturnValue("mock_token"),
  info: jest.fn(),
  error: jest.fn(),
  setOutput: jest.fn(),
}));

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

describe("Given a labeler client", () => {
  const client = new ConventionalLabeler();

  afterEach(() => {
    // clear mock calls
    (github.getOctokit as any).mockClear();
    (core.info as any).mockClear();
    (core.error as any).mockClear();
  });

  it("should return the corresponding label for the commit title", async () => {
    await client.label();
    expect(core.info).toHaveBeenCalledTimes(6);
  });

  it("Should add label with an error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: jest.fn().mockImplementation(() => {
            throw new Error("add label error");
          }),
          removeLabel: jest.fn().mockReturnValue({}),
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }, { name: "enhancement" }],
          }),
        },
      },
    });
    await client.label();
    expect(core.error).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith("Error: add label error");
  });

  it("Should remove labels with an error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          removeLabel: jest.fn().mockImplementation(() => {
            throw new Error("remove label error");
          }),
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }, { name: "enhancement" }],
          }),
          addLabels: jest.fn().mockReturnValue({}),
        },
      },
    });
    await client.label();
    expect(core.error).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith("Error: remove label error");
  });

  it("should return the corresponding label with an error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          listLabelsOnIssue: jest.fn().mockImplementation(() => {
            throw new Error("issue error");
          }),
        },
      },
    });
    await client.label();
    expect(core.error).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith("Error: issue error");
  });

  it("should return the pr error", async () => {
    (github as any).context.payload.pull_request!.number = undefined;
    await client.label();
    expect(core.error).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith("No pull request found");
  });

  it("should return the title error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: jest.fn(),
          removeLabel: jest.fn().mockReturnValue({}),
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }, { name: "enhancement" }],
          }),
        },
      },
    });
    (github as any).context = {
      repo: {
        owner: "monalisa",
        repo: "helloworld",
      },
      payload: {
        pull_request: {
          title: "",
          number: 123,
        },
      },
    };

    await client.label();
    expect(core.error).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith("Failed to get the pr title");
  });

  it("should return the title error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: jest.fn(),
          removeLabel: jest.fn().mockReturnValue({}),
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }, { name: "enhancement" }],
          }),
        },
      },
    });
    (github as any).context = {
      repo: {
        owner: "monalisa",
        repo: "helloworld",
      },
      payload: {
        pull_request: {
          title: "hello",
          number: 123,
        },
      },
    };

    await client.label();
    expect(core.error).toHaveBeenCalledTimes(1);
    expect(core.error).toHaveBeenCalledWith("Invalid commit message");
  });
});
