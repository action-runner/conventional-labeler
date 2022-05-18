import { ConventionalCommit } from "./client/conventional_commit";
import { GithubClient } from "./client/github";
import * as core from "@actions/core";

export class ConventionalLabeler {
  private githubClient: GithubClient;
  private conventionalCommit: ConventionalCommit;
  private strict: boolean;

  constructor() {
    const token = core.getInput("access_token", { required: true });

    this.githubClient = new GithubClient(token);
    this.conventionalCommit = new ConventionalCommit();
    this.strict = core.getBooleanInput(token);
  }

  /**
   * Label the pr based on the title
   */
  async label() {
    // get pr's number
    core.info("Getting PR number");
    const pr = this.githubClient.getPr();
    if (!pr) {
      core.setFailed("No pull request found");
      return;
    }

    // get pr's existing labels
    core.info("Getting PR labels");
    const labels = await this.githubClient.getLabels(pr);
    if (labels.error) {
      core.setFailed(labels.error);
      return;
    }

    // get the pr title
    const title = this.githubClient.getTitle();
    if (!title || title.length === 0) {
      core.setFailed("Failed to get the pr title");
      return;
    }

    // get list of predefined labels
    core.info("Getting predefined labels");
    const predefinedLabels = this.conventionalCommit.getValidLabels(
      labels.labels ?? []
    );

    // validate the commit message and title
    core.info("Validating commit message and title");
    const commitMessages = await this.githubClient.getCommitMessages(pr);
    if (commitMessages.err) {
      core.setFailed(commitMessages.err);
    }
    const validationError = this.conventionalCommit.validate(
      commitMessages.commitMessages!,
      title,
      this.strict
    );
    if (validationError) {
      core.setFailed(validationError);
      return;
    }

    // get the generated label
    core.info(`Getting conventional label from title ${title}`);
    const generatedLabel = this.conventionalCommit.getLabel(title);
    if (generatedLabel.error) {
      core.setFailed(generatedLabel.error);
      return;
    }

    const differentLabels = this.conventionalCommit.getDiffLabels(
      predefinedLabels,
      [generatedLabel.label!]
    );

    // remove the labels that are not in the preset labels
    core.info("Removing different label");
    const removeError = await this.githubClient.removeLabels(
      pr,
      differentLabels
    );
    if (removeError) {
      core.setFailed(removeError);
      return;
    }

    // add the generated label
    core.info(`Adding label ${generatedLabel.label} to PR`);
    const error = await this.githubClient.addLabel(pr, [generatedLabel.label!]);
    if (error) {
      core.setFailed(error);
      return;
    }

    core.setOutput("labels", generatedLabel.label);
  }
}
