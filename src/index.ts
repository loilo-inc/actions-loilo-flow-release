import * as core from "@actions/core";
import { createRelease } from "./release";
import * as semver from "semver";

async function main() {
  const githubRef = core.getInput("github-ref");
  const m = githubRef.match(/^refs\/tags\/(.+?)$/);
  if (!m) {
    core.error(new Error("not tagged"));
    return;
  }
  const tag = m[1];
  if (!semver.valid(tag)) {
    core.warning("Not semver. skip: " + tag);
    return;
  }
  const githubRepo = core.getInput("github-repository");
  const [owner, repo] = githubRepo.split("/");
  const githubToken = core.getInput("github-token");
  try {
    const state = await createRelease({ tag, owner, repo, token: githubToken });
    core.info(
      `Release ${state}!: https://github.com/${githubRepo}/releases/tag/${tag}`
    );
  } catch (e) {
    core.setFailed((e as Error).message);
  }
}
if (require.main === module) {
  main();
}
