/**
 * Conventional commit client
 */
export class ConventionalCommit {
  // map of conventional commit and its corresponding label
  map: { [key: string]: string } = {
    feat: "conventional: enhancement",
    fix: "conventional: bugfix",
    docs: "conventional: documentation",
    style: "conventional: style",
    refactor: "conventional: refactor",
    perf: "conventional: performance",
    test: "conventional: test",
    chore: "conventional: chore",
    build: "conventional: build",
  };

  /**
   * validate the pr title
   */
  private validate(message: string): boolean {
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

    // validate the commit message
    if (!this.validate(message)) {
      return {
        error: "commit message does not follow the conventional commit format",
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
}
