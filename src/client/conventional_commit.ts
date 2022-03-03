/**
 * Conventional commit client
 */
export class ConventionalCommit {
  // map of conventional commit and its corresponding label
  map: { [key: string]: string } = {
    feat: "enhancement",
    fix: "bug",
    docs: "documentation",
    style: "style",
    refactor: "refactor",
    perf: "performance",
    test: "test",
    chore: "chore",
    build: "build",
  };

  /**
   * validate the message
   * @param message commit message
   * @returns true if the message is valid, false otherwise
   */
  private validateMessage(message: string): boolean {
    // list of conventional commit rules
    const rules = [
      {
        name: "title",
        regex:
          /^(feat|fix|docs|style|refactor|perf|test|chore|build)(\(([\w\s]+)\))?: /,
      },
    ];

    // check if the commit message follows the conventional commit format
    for (const rule of rules) {
      const match = message.match(rule.regex);
      if (match) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the corresponding label for the commit title
   */
  getLabel(message: string): { label?: string; error?: string } {
    // if message is empty, return error
    if (message.length === 0) {
      return { error: "commit message is empty" };
    }

    const cleanedMessage = this.cleanMessage(message);

    // validate the commit message
    if (!this.validateMessage(cleanedMessage)) {
      return {
        error: `commit message [${cleanedMessage}] does not follow the conventional commit format`,
      };
    }

    // get the label
    const match = message.match(
      /^(feat|fix|docs|style|refactor|perf|test|chore|build)(\(([\w\s]+)\))?: /
    );

    const matchedLabel = match![1];
    return {
      label: this.map[matchedLabel],
    };
  }

  /**
   * Check if the label is one of the conventional commit labels
   */
  isConventionalLabel(label: string): boolean {
    return Object.values(this.map).includes(label);
  }

  /**
   * Get list of labels not in the conventional commit format
   */
  getInvalidLabels(labels: string[]): string[] {
    return labels.filter((label) => !this.isConventionalLabel(label));
  }

  /**
   * Get list of labels in the conventional commit format
   */
  getValidLabels(labels: string[]): string[] {
    const validLabels = [];
    for (const label of labels) {
      if (this.isConventionalLabel(label)) {
        validLabels.push(label);
      }
    }
    return validLabels;
  }

  /**
   * Given two labels array labels1 and labels2, return the labels that are not in labels2
   */
  getDiffLabels(labels: string[], labels2: string[]): string[] {
    const diffLabels = [];
    for (const label of labels) {
      if (!labels2.includes(label)) {
        diffLabels.push(label);
      }
    }
    return diffLabels;
  }

  cleanMessage(message: string) {
    return message.split("\n")[0];
  }

  /**
   * Validate commit messages based on the conventional commit format.
   * The following rules will be applied:
   * (1): If only one message and it is not equal to the title of the PR, return error
   * (2): Otherwise, if the message is not in the conventional commit format, return error
   *
   * @param messages commit messages
   * @returns an error message if the commit messages are not valid, otherwise return undefined
   */
  validate(messages: string[], title: string): string | undefined {
    // Check if title meets the conventional commit format
    if (!this.validateMessage(title)) {
      return `title [${title}] does not follow the conventional commit format`;
    }

    if (messages.length === 0) {
      return `commit message is empty`;
    }

    // if there is only one message, check if it is equal to the title of the PR
    if (messages.length === 1 && this.cleanMessage(messages[0]) !== title) {
      return `commit message [${this.cleanMessage(
        messages[0]
      )}] does not equal to the title of the PR [${title}]`;
    }

    // check if the commit messages are valid
    for (const message of messages) {
      if (!this.validateMessage(message)) {
        return `commit message [${message}] does not follow the conventional commit format`;
      }
    }

    return undefined;
  }
}
