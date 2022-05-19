import core from "@actions/core";
import github from "@actions/github";
import { ConventionalLabeler } from "../labeler";

jest.mock("@actions/core", () => ({
  getInput: jest.fn().mockReturnValue("mock_token"),
  getBooleanInput: jest.fn().mockReturnValue(true),
  info: jest.fn(),
  error: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
}));

jest.mock("@actions/github", () => ({
  getOctokit: jest.fn().mockReturnValue({
    rest: {
      issues: {
        listLabelsOnIssue: jest.fn().mockReturnValue({
          data: [{ name: "bugfix" }],
        }),
        removeLabel: jest.fn().mockReturnValue({}),
        addLabels: jest.fn().mockReturnValue({}),
      },
      pulls: {
        listCommits: jest.fn().mockReturnValue({
          data: [{ commit: { message: "fix: add a new feature" } }],
        }),
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
    (core.setFailed as any).mockClear();
  });

  it("should return the corresponding labels for the commit title", async () => {
    await client.labels();
    expect(core.info).toHaveBeenCalledTimes(7);
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
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [{ commit: { message: "fix: add a new feature" } }],
          }),
        },
      },
    });
    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("Error: add label error");
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
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [{ commit: { message: "fix: add a new feature" } }],
          }),
        },
      },
    });
    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("Error: remove label error");
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
    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("Error: issue error");
  });

  it("should return the pr error", async () => {
    (github as any).context.payload.pull_request!.number = undefined;
    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("No pull request found");
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

    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith("Failed to get the pr title");
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
        pulls: {
          listCommits: jest.fn().mockReturnValue({ data: [] }),
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

    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      "title [hello] does not follow the conventional commit format"
    );
  });

  it("should return the commit message error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: jest.fn(),
          removeLabel: jest.fn().mockReturnValue({}),
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }, { name: "enhancement" }],
          }),
        },
        pulls: {
          listCommits: jest
            .fn()
            .mockReturnValue({ data: [{ commit: { message: "fix: hell" } }] }),
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
          title: "fix: hello",
          number: 123,
        },
      },
    };

    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      "commit message [fix: hell] does not equal to the title of the PR [fix: hello]"
    );
  });

  it("should return the commit message error", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: jest.fn(),
          removeLabel: jest.fn().mockReturnValue({}),
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }, { name: "enhancement" }],
          }),
        },
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [
              { commit: { message: "fix: hello" } },
              { commit: { message: "hello" } },
            ],
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
          title: "fix: hello",
          number: 123,
        },
      },
    };

    await client.labels();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      "commit message [hello] does not follow the conventional commit format"
    );
  });
});

describe("Given a labeler with predifined labels", () => {
  const client = new ConventionalLabeler();
  const addLabels = jest.fn();
  const removeLabels = jest.fn();

  afterEach(() => {
    addLabels.mockClear();
    removeLabels.mockClear();
  });

  it("should return the corresponding label for the commit title", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: addLabels,
          removeLabel: removeLabels,
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bugfix" }],
          }),
        },
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [{ commit: { message: "fix: some bugs" } }],
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
          title: "fix: some bugs",
          number: 123,
        },
      },
    };
    await client.labels();
    const addCalls = addLabels.mock.calls;

    expect(addCalls.length).toBe(1);
    expect(addCalls[0][0].labels).toStrictEqual(["bug"]);

    expect(removeLabels).toHaveBeenCalledTimes(0);
  });

  it("should return the corresponding label for the commit title", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: addLabels,
          removeLabel: removeLabels,
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [{ name: "bug" }],
          }),
        },
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [{ commit: { message: "feat: some bugs" } }],
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
          title: "feat: some bugs",
          number: 123,
        },
      },
    };
    await client.labels();
    const addCalls = addLabels.mock.calls;

    expect(removeLabels).toHaveBeenCalledTimes(1);
    expect(addCalls.length).toBe(1);
    expect(addCalls[0][0].labels).toStrictEqual(["enhancement"]);
  });

  it("should return the corresponding label for the commit title", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: addLabels,
          removeLabel: removeLabels,
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [],
          }),
        },
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [{ commit: { message: "feat: some bugs" } }],
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
          title: "feat: some bugs",
          number: 123,
        },
      },
    };
    await client.labels();
    const addCalls = addLabels.mock.calls;

    expect(removeLabels).toHaveBeenCalledTimes(0);
    expect(addCalls.length).toBe(1);
    expect(addCalls[0][0].labels).toStrictEqual(["enhancement"]);
  });

  it("should return the corresponding label for the commit title", async () => {
    (github.getOctokit as any).mockReturnValue({
      rest: {
        issues: {
          addLabels: addLabels,
          removeLabel: removeLabels,
          listLabelsOnIssue: jest.fn().mockReturnValue({
            data: [],
          }),
        },
        pulls: {
          listCommits: jest.fn().mockReturnValue({
            data: [{ commit: { message: "feat: some bugs\n* some bugs" } }],
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
          title: "feat: some bugs",
          number: 123,
        },
      },
    };
    await client.labels();
    const addCalls = addLabels.mock.calls;

    expect(removeLabels).toHaveBeenCalledTimes(0);
    expect(addCalls.length).toBe(1);
    expect(addCalls[0][0].labels).toStrictEqual(["enhancement"]);
  });
});
