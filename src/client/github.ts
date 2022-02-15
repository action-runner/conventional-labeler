import github from "@actions/github";

/**
 * Github client is a wrapper for the Github API.
 */
export class GithubClient {
  /**
   * Github token
   */
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async addLabel(pr: number, labels: string[]): Promise<string | undefined> {
    const client = github.getOctokit(this.token);
    try {
      await client.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr,
        labels: labels,
      });
    } catch (error) {
      return `${error}`;
    }
  }

  /**
   * Remove labels from the pr
   *
   * @param pr PR number
   * @param labels labels to be deleted
   * @returns error message if error occurs
   */
  async removeLabels(
    pr: number,
    labels: string[]
  ): Promise<string | undefined> {
    const client = github.getOctokit(this.token);
    try {
      await Promise.all(
        labels.map((label) =>
          client.rest.issues.removeLabel({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: pr,
            name: label,
          })
        )
      );
    } catch (e) {
      return `${e}`;
    }
  }

  /**
   *  Get the list of labels of the pr
   * @param pr
   * @returns
   */
  async getLabels(pr: number): Promise<{ labels?: string[]; error?: string }> {
    try {
      const client = github.getOctokit(this.token);
      const labels = await client.rest.issues.listLabelsOnIssue({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: pr,
      });

      return {
        labels: labels.data.map((label) => label.name),
      };
    } catch (e) {
      return {
        error: `${e}`,
      };
    }
  }

  /**
   * Get pr's title
   */
  getTitle(): string | undefined {
    // use github api to get pr's title
    const pullRequest = github.context.payload.pull_request;
    return pullRequest?.title;
  }

  /**
   * Get pr's number
   * @returns  the number of the pr
   */
  getPr(): number | undefined {
    return github.context.payload.pull_request?.number;
  }
}
