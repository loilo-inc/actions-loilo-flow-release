import * as core from "@actions/core";
import { createRelease } from "./release";

async function main() {
  const githubRef = core.getInput("github-ref");
  const githubRepo = core.getInput("github-repository");
  const [owner, repo] = githubRepo.split("/");
  const githubToken = core.getInput("github-token");
  try {
    await createRelease({ tag: githubRef, owner, repo, token: githubToken });
    core.info(`Release created!: https://github.com/${githubRepo}/releases/tag/${githubRef}`)
  } catch (e) {
    core.error(e as Error)
  }
}
if (require.main === module) {
  main();
}
