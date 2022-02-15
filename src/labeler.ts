import { ConventionalCommit } from "./client/conventional_commit";
import { GithubClient } from "./client/github";
import core from "@actions/core";

export class ConventionalLabeler {
  private githubClient: GithubClient;
  private conventionalCommit: ConventionalCommit;

  constructor() {
    const token = core.getInput("access_token", { required: true });
    this.githubClient = new GithubClient(token);
    this.conventionalCommit = new ConventionalCommit();
  }

  /**
   * Label the pr based on the title
   */
  async label() {
    // get pr's number
    core.info("Getting PR number");
    const pr = this.githubClient.getPr();
    if (!pr) {
      core.error("No pull request found");
      return;
    }

    // get pr's existing labels
    core.info("Getting PR labels");
    const labels = await this.githubClient.getLabels(pr);
    if (labels.error) {
      core.error(labels.error);
      return;
    }

    // get list of preset labels
    core.info("Getting preset labels");
    const presetLabels = this.conventionalCommit.getValidLabels(
      labels.labels ?? []
    );
    // remove them
    core.info("Removing preset labels");
    const removeError = await this.githubClient.removeLabels(pr, presetLabels);
    if (removeError) {
      core.error(removeError);
      return;
    }

    // get the pr title
    const title = this.githubClient.getTitle();
    if (!title || title.length === 0) {
      core.error("Failed to get the pr title");
      return;
    }

    // get the label
    core.info("Getting conventional label");
    const label = this.conventionalCommit.getLabel(title);
    if (label.error) {
      core.error(label.error);
      return;
    }

    // add the label
    core.info("Adding label to PR");
    const error = await this.githubClient.addLabel(pr, [label.label!]);
    if (error) {
      core.error(error);
      return;
    }

    core.setOutput("labels", labels.labels);
  }
}
