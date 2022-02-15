import { ConventionalCommit } from "./client/conventional_commit";
import { GithubClient } from "./client/github";
import * as core from "@actions/core";

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
      core.setFailed("No pull request found");
      return;
    }

    // get pr's existing labels
    core.info("Getting PR labels");
    const labels = await this.githubClient.getLabels(pr);
    if (labels.error) {
      core.error(labels.error);
      core.setFailed(labels.error);
      return;
    }

    // get the pr title
    const title = this.githubClient.getTitle();
    if (!title || title.length === 0) {
      core.error("Failed to get the pr title");
      core.setFailed("Failed to get the pr title");
      return;
    }

    // get the label
    core.info(`Getting conventional label from title ${title}`);
    const generatedLabel = this.conventionalCommit.getLabel(title);
    if (generatedLabel.error) {
      core.error(generatedLabel.error);
      core.setFailed(generatedLabel.error);
      return;
    }

    // get list of preset labels
    core.info("Getting preset labels");
    const presetLabels = this.conventionalCommit.getValidLabels(
      labels.labels ?? []
    );

    const differentLabels = this.conventionalCommit.getDiffLabels(
      presetLabels,
      [generatedLabel.label!]
    );

    // remove them
    core.info("Removing different label");
    const removeError = await this.githubClient.removeLabels(
      pr,
      differentLabels
    );
    if (removeError) {
      core.error(removeError);
      core.setFailed(removeError);
      return;
    }

    // add the label
    core.info(`Adding label ${generatedLabel.label} to PR`);
    const error = await this.githubClient.addLabel(pr, [generatedLabel.label!]);
    if (error) {
      core.error(error);
      core.setFailed(error);
      return;
    }

    core.setOutput("labels", generatedLabel.label);
  }
}
