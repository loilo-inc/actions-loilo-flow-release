import { getOctokit } from "@actions/github";
import * as semver from "semver";
import * as cp from "child_process";

function getExecOutput(cmd: string, args: string[]) {
  const p = cp.spawn(cmd, args);
  console.log(cmd, ...args);
  return new Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    let stdout: string = "";
    let stderr: string = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.stderr.on("data", (d) => (stderr += d));
    p.on("exit", (code) =>
      resolve({
        exitCode: code ?? 1,
        stdout: stdout,
        stderr: stderr,
      })
    );
  });
}

async function getLogs(tag: string, toTag: string | undefined) {
  const args = ["log", "--oneline"];
  if (toTag) {
    args.push(tag + "..." + toTag);
  }
  const output = await getExecOutput("git", args);
  if (output.exitCode !== 0) {
    throw new Error(output.stderr);
  }
  return output.stdout;
}

async function getLatestTag(p: {
  includeRc: boolean;
}): Promise<string | undefined> {
  const output = await getExecOutput("git", ["tag"]);
  if (output.exitCode !== 0) {
    throw new Error(output.stderr);
  }
  let list = output.stdout.split("\n").filter((v) => semver.valid(v));
  if (!p.includeRc) {
    list = list.filter((v) => !!v.match(/^v?(\d+)\.(\d+)\.(\d+)$/));
  }
  const prev = semver.rsort(list)[1];
  return prev;
}

export async function createRelease({
  token,
  tag,
  owner,
  repo,
}: {
  token: string;
  tag: string;
  repo: string;
  owner: string;
}): Promise<"created" | "updated"> {
  if (!semver.valid(tag)) {
    throw new Error("invalid semver: " + tag);
  }
  const latest = await getLatestTag({ includeRc: !!tag.match(/-rc\d+$/) });
  let body = await getLogs(tag, latest);
  body = body.replace("\n", "<br />");
  console.log(body);
  const github = getOctokit(token);
  let release_id: number | undefined;
  try {
    const release = await github.repos.getReleaseByTag({ tag, owner, repo });
    release_id = release.data.id;
  } catch (e) {}
  if (release_id != null) {
    // update
    await github.repos.updateRelease({ release_id, body, owner, repo });
    return "updated";
  } else {
    // create
    await github.repos.createRelease({
      repo,
      owner,
      body,
      tag_name: tag,
      name: tag,
    });
    return "created";
  }
}
