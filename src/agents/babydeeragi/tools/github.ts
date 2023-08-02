import { Octokit } from "@octokit/rest";
class GitHubTool {
  private octokit: Octokit;
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }
  async createRepo(name: string) {
    const response = await this.octokit.repos.createForAuthenticatedUser({ name });
    return response.data;
  }
  async createFile(owner: string, repo: string, path: string, content: string) {
    const blobData = await this.octokit.git.createBlob({
      owner,
      repo,
      content,
      encoding: "utf-8",
    });
    const treeData = await this.octokit.git.createTree({
      owner,
      repo,
      tree: [
        {
          path,
          mode: "100644",
          type: "blob",
          sha: blobData.data.sha,
        },
      ],
    });
    const commitData = await this.octokit.git.createCommit({
      owner,
      repo,
      message: `Create ${path}`,
      tree: treeData.data.sha,
      parents: ["master"], // Replace 'master' with the SHA of the latest commit on master
    });
    await this.octokit.git.updateRef({
      owner,
      repo,
      ref: "heads/master",
      sha: commitData.data.sha,
    });
   return commitData.data;
  }
  async commitAndPush(owner: string, repo: string, message: string) {
    await this.git.add('./*');
    await this.git.commit(message);
    await this.git.push('origin', 'master');
  }
  async createBranch(owner: string, repo: string, branchName: string) {
    const { data: ref } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: "heads/master",
    });
   const response = await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
    return response.data;
  }
  async searchCode(query: string) {
    const response = await this.octokit.search.code({ q: query });
    return response.data;
  }
  async listFiles(owner: string, repo: string, branch: string) {
    const { data: treeData } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: true,
    });
    // Filter out tree entries that are not files.
    const files = treeData.tree.filter((item) => item.type === "blob");
    return files;
  }
  async listRepos(user: string) {
    const repos = await this.octokit.repos.listForUser({ username: user });
    return repos.data;
  }
  async createIssue(owner: string, repo: string, title: string, body: string) {
    const issue = await this.octokit.issues.create({ owner, repo, title, body });
    return issue.data;
  }
  async listPullRequests(owner: string, repo: string) {
    const pulls = await this.octokit.pulls.list({ owner, repo });
    return pulls.data;
  }
  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string) {
    const pull = await this.octokit.pulls.create({ owner, repo, title, head, base });
    return pull.data;
  }
  async mergePullRequest(owner: string, repo: string, pull_number: number, commit_title: string) {
    const merge = await this.octokit.pulls.merge({ owner, repo, pull_number, commit_title });
    return merge.data;
  }
  async listCommits(owner: string, repo: string) {
    const commits = await this.octokit.repos.listCommits({ owner, repo });
    return commits.data;
  }
  async getCommit(owner: string, repo: string, ref: string) {
    const commit = await this.octokit.repos.getCommit({ owner, repo, ref });
    return commit.data;
  }
  async listGists(username: string) {
    const gists = await this.octokit.gists.listForUser({ username });
    return gists.data;
  }
  async getGitData(owner: string, repo: string, file_sha: string) {
    const gitData = await this.octokit.git.getBlob({ owner, repo, file_sha });
    return gitData.data;
  }
  async listIssues(owner: string, repo: string) {
    const issues = await this.octokit.issues.listForRepo({ owner, repo });
    return issues.data;
  }
  async listReposForOrg(org: string) {
    const repos = await this.octokit.repos.listForOrg({ org });
    return repos.data;
  }
  async searchRepos(query: string) {
    const repos = await this.octokit.search.repos({ q: query });
    return repos.data;
  }
  async getUser(username: string) {
    const user = await this.octokit.users.getByUsername({ username });
    return user.data;
  }
  async listOrgs(username: string) {
    const orgs = await this.octokit.orgs.listForUser({ username });
    return orgs.data;
  }
  async listProjects(owner: string, repo: string) {
    const projects = await this.octokit.projects.listForRepo({ owner, repo });
    return projects.data;
  }
  async listChecks(owner: string, repo: string, ref: string) {
    const checks = await this.octokit.checks.listForRef({ owner, repo, ref });
    return checks.data;
  }
  async listApps() {
    const apps = await this.octokit.apps.listInstallations();
    return apps.data;
  }
  async listMarketplaceListings() {
    const listings = await this.octokit.marketplace.listListings();
    return listings.data;
  }
  async listActions(owner: string, repo: string) {
    const actions = await this.octokit.actions.listRepoWorkflowRuns({ owner, repo });
    return actions.data;
  }
  async listCodesOfConduct() {
    const codes = await this.octokit.codesOfConduct.getAllCodesOfConduct();
    return codes.data;
  }
  async listLicenses() {
    const licenses = await this.octokit.licenses.getAll();
    return licenses.data;
  }
  async getRateLimit() {
    const rateLimit = await this.octokit.rateLimit.get();
    return rateLimit.data;
  }
  async getCacheKey(owner: string, repo: string, key: string) {
    const cacheKey = await this.octokit.actions.getRepoCache({ owner, repo, key });
    return cacheKey.data;
  }
  async createCacheKey(owner: string, repo: string, key: string, paths: string[]) {
    const cacheKey = await this.octokit.actions.createOrUpdateRepoCache({ owner, repo, key, paths });
    return cacheKey.data;
  }
  async listCacheKeys(owner: string, repo: string) {
    const cacheKeys = await this.octokit.actions.listRepoCaches({ owner, repo });
    return cacheKeys.data;
  }
  async deleteCacheKey(owner: string, repo: string, cache_key: string) {
    const response = await this.octokit.actions.deleteRepoCache({ owner, repo, cache_key });
    return response.status;
  }
  async listArtifacts(owner: string, repo: string) {
    const artifacts = await this.octokit.actions.listArtifactsForRepo({ owner, repo });
    return artifacts.data;
  }
  async getArtifact(owner: string, repo: string, artifact_id: number) {
    const artifact = await this.octokit.actions.getArtifact({ owner, repo, artifact_id });
    return artifact.data;
  }
  async downloadArtifact(owner: string, repo: string, artifact_id: number, archive_format: string) {
    const artifact = await this.octokit.actions.downloadArtifact({ owner, repo, artifact_id, archive_format });
    return artifact.data;
  }
  async deleteArtifact(owner: string, repo: string, artifact_id: number) {
    const response = await this.octokit.actions.deleteArtifact({ owner, repo, artifact_id });
    return response.status;
  }
  async createOIDCToken(owner: string, repo: string, act_as: string) {
    const oidcToken = await this.octokit.actions.createRegistrationTokenForRepo({ owner, repo, act_as });
    return oidcToken.data;
  }
  async getOIDCToken(owner: string, repo: string, act_as: string) {
    const oidcToken = await this.octokit.actions.getRegistrationTokenForRepo({ owner, repo, act_as });
    return oidcToken.data;
  }
  async listSelfHostedRunners(owner: string, repo: string) {
    const runners = await this.octokit.actions.listSelfHostedRunnersForRepo({ owner, repo });
    return runners.data;
  }
  async getSelfHostedRunner(owner: string, repo: string, runner_id: number) {
    const runner = await this.octokit.actions.getSelfHostedRunnerForRepo({ owner, repo, runner_id });
    return runner.data;
  }
  async createRegistrationTokenForRunner(owner: string, repo: string) {
    const token = await this.octokit.actions.createRegistrationTokenForRepo({ owner, repo });
    return token.data;
  }
  async createRemoveTokenForRunner(owner: string, repo: string) {
    const token = await this.octokit.actions.createRemoveTokenForRepo({ owner, repo });
    return token.data;
  }
  async deleteSelfHostedRunner(owner: string, repo: string, runner_id: number) {
    const response = await this.octokit.actions.deleteSelfHostedRunnerFromRepo({ owner, repo, runner_id });
    return response.status;
  }
  async listEnvironmentVariables(owner: string, repo: string, environment_name: string) {
    const variables = await this.octokit.actions.getAllEnvironmentSecrets({ owner, repo, environment_name });
    return variables.data;
  }
  async getEnvironmentVariable(owner: string, repo: string, environment_name: string, secret_name: string) {
    const variable = await this.octokit.actions.getEnvironmentSecret({ owner, repo, environment_name, secret_name });
    return variable.data;
  }
  async createOrUpdateEnvironmentVariable(owner: string, repo: string, environment_name: string, secret_name: string, encrypted_value: string, key_id: string) {
    const response = await this.octokit.actions.createOrUpdateEnvironmentSecret({ owner, repo, environment_name, secret_name, encrypted_value, key_id });
    return response.status;
  }
  async deleteEnvironmentVariable(owner: string, repo: string, environment_name: string, secret_name: string) {
    const response = await this.octokit.actions.deleteEnvironmentSecret({ owner, repo, environment_name, secret_name });
    return response.status;
  }
  async listWorkflowJobs(owner: string, repo: string, run_id: number) {
    const jobs = await this.octokit.actions.listJobsForWorkflowRun({ owner, repo, run_id });
    return jobs.data;
  }
  async getWorkflowJob(owner: string, repo: string, job_id: number) {
    const job = await this.octokit.actions.getJobForWorkflowRun({ owner, repo, job_id });
    return job.data;
  }
  async downloadJobLogs(owner: string, repo: string, job_id: number) {
    const logs = await this.octokit.actions.downloadJobLogsForWorkflowRun({ owner, repo, job_id });
    return logs.data;
  }
  async listWorkflowRuns(owner: string, repo: string, workflow_id: number) {
    const runs = await this.octokit.actions.listWorkflowRuns({ owner, repo, workflow_id });
    return runs.data;
  }
  async getWorkflowRun(owner: string, repo: string, run_id: number) {
    const run = await this.octokit.actions.getWorkflowRun({ owner, repo, run_id });
    return run.data;
  }
  async rerunWorkflow(owner: string, repo: string, run_id: number) {
    const response = await this.octokit.actions.reRunWorkflow({ owner, repo, run_id });
    return response.status;
  }
  async cancelWorkflowRun(owner: string, repo: string, run_id: number) {
    const response = await this.octokit.actions.cancelWorkflowRun({ owner, repo, run_id });
    return response.status;
  }
  async listWorkflowRunArtifacts(owner: string, repo: string, run_id: number) {
    const artifacts = await this.octokit.actions.listWorkflowRunArtifacts({ owner, repo, run_id });
    return artifacts.data;
  }
  async listRepoWorkflows(owner: string, repo: string) {
    const workflows = await this.octokit.actions.listRepoWorkflows({ owner, repo });
    return workflows.data;
  }
  async getRepoWorkflow(owner: string, repo: string, workflow_id: number) {
    const workflow = await this.octokit.actions.getWorkflow({ owner, repo, workflow_id });
    return workflow.data;
  }
  async getWorkflowUsage(owner: string, repo: string, workflow_id: number) {
    const usage = await this.octokit.actions.getWorkflowUsage({ owner, repo, workflow_id });
    return usage.data;
  }
  async getApp(owner: string, repo: string) {
    const app = await this.octokit.apps.getRepoInstallation({ owner, repo });
    return app.data;
  }
  async listInstallationsForAuthenticatedUser() {
    const installations = await this.octokit.apps.listInstallationsForAuthenticatedUser();
    return installations.data;
  }
  async getAuthenticatedApp() {
    const app = await this.octokit.apps.getAuthenticated();
    return app.data;
  }
  async listInstallationsForAuthenticatedUser() {
    const installations = await this.octokit.apps.listInstallationsForAuthenticatedUser();
    return installations.data;
  }
  async getInstallationForAuthenticatedUser(installation_id: number) {
    const installation = await this.octokit.apps.getInstallation({ installation_id });
    return installation.data;
  }
  async listInstallationReposForAuthenticatedUser(installation_id: number) {
    const repos = await this.octokit.apps.listInstallationReposForAuthenticatedUser({ installation_id });
    return repos.data;
  }
  async addRepoToInstallation(installation_id: number, repository_id: number) {
    const response = await this.octokit.apps.addRepoToInstallation({ installation_id, repository_id });
    return response.status;
  }
  async removeRepoFromInstallation(installation_id: number, repository_id: number) {
    const response = await this.octokit.apps.removeRepoFromInstallation({ installation_id, repository_id });
    return response.status;
  }
  async listAppWebhooks(app_slug: string) {
    const webhooks = await this.octokit.apps.listWebhookDeliveriesForApp({ app_slug });
    return webhooks.data;
  }
  async getAppWebhook(app_slug: string, delivery_id: string) {
    const webhook = await this.octokit.apps.getWebhookDeliveryForApp({ app_slug, delivery_id });
    return webhook.data;
  }
  async redeliverAppWebhook(app_slug: string, delivery_id: string) {
    const response = await this.octokit.apps.redeliverWebhookDeliveryForApp({ app_slug, delivery_id });
    return response.status;
  }
  async createCheckRun(owner: string, repo: string, name: string, head_sha: string) {
    const checkRun = await this.octokit.checks.create({ owner, repo, name, head_sha });
    return checkRun.data;
  }
  async getCheckRun(owner: string, repo: string, check_run_id: number) {
    const checkRun = await this.octokit.checks.get({ owner, repo, check_run_id });
    return checkRun.data;
  }
  async listCheckRunsForRef(owner: string, repo: string, ref: string) {
    const checkRuns = await this.octokit.checks.listForRef({ owner, repo, ref });
    return checkRuns.data;
  }
  async updateCheckRun(owner: string, repo: string, check_run_id: number, name: string, status: string, conclusion: string) {
    const checkRun = await this.octokit.checks.update({ owner, repo, check_run_id, name, status, conclusion });
    return checkRun.data;
  }
  async listCodesOfConduct() {
    const codes = await this.octokit.codesOfConduct.getAllCodesOfConduct();
    return codes.data;
  }
  async getCodeOfConduct(key: string) {
    const code = await this.octokit.codesOfConduct.getCodeOfConduct({ key });
    return code.data;
  }
  async getRepoCodeOfConduct(owner: string, repo: string) {
    const code = await this.octokit.codesOfConduct.getForRepo({ owner, repo });
    return code.data;
  }
  async listCodeScanningAlertsForRepo(owner: string, repo: string) {
    const alerts = await this.octokit.codeScanning.listAlertsForRepo({ owner, repo });
    return alerts.data;
  }
  async getCodeScanningAlert(owner: string, repo: string, alert_id: number) {
    const alert = await this.octokit.codeScanning.getAlert({ owner, repo, alert_id });
    return alert.data;
  }
  async updateCodeScanningAlert(owner: string, repo: string, alert_id: number, ref: string) {
    const alert = await this.octokit.codeScanning.updateAlert({ owner, repo, alert_id, ref });
    return alert.data;
  }
  async listCodespacesForUser() {
    const codespaces = await this.octokit.codespaces.listForAuthenticatedUser();
    return codespaces.data;
  }
  async getCodespace(owner: string, repo: string, codespace_id: number) {
    const codespace = await this.octokit.codespaces.get({ owner, repo, codespace_id });
    return codespace.data;
  }
  async createCodespace(owner: string, repo: string, branch: string, machine_type: string) {
    const codespace = await this.octokit.codespaces.create({ owner, repo, branch, machine_type });
    return codespace.data;
  }
  async updateCodespace(owner: string, repo: string, codespace_id: number, machine_type: string) {
    const codespace = await this.octokit.codespaces.update({ owner, repo, codespace_id, machine_type });
    return codespace.data;
  }
  async deleteCodespace(owner: string, repo: string, codespace_id: number) {
    const response = await this.octokit.codespaces.delete({ owner, repo, codespace_id });
    return response.status;
  }
  async listCommits(owner: string, repo: string) {
    const commits = await this.octokit.repos.listCommits({ owner, repo });
    return commits.data;
  }
  async getCommit(owner: string, repo: string, ref: string) {
    const commit = await this.octokit.repos.getCommit({ owner, repo, ref });
    return commit.data;
  }
  async compareCommits(owner: string, repo: string, base: string, head: string) {
    const comparison = await this.octokit.repos.compareCommits({ owner, repo, base, head });
    return comparison.data;
  }
  async listCommitCommentsForRepo(owner: string, repo: string) {
    const comments = await this.octokit.repos.listCommitCommentsForRepo({ owner, repo });
    return comments.data;
  }
  async getCommitComment(owner: string, repo: string, comment_id: number) {
    const comment = await this.octokit.repos.getCommitComment({ owner, repo, comment_id });
    return comment.data;
  }
  async createCommitComment(owner: string, repo: string, commit_sha: string, body: string) {
    const comment = await this.octokit.repos.createCommitComment({ owner, repo, commit_sha, body });
    return comment.data;
  }
  async listDependabotAlerts(owner: string, repo: string) {
    const alerts = await this.octokit.issues.listDependabotAlerts({ owner, repo });
    return alerts.data;
  }
  async getDependabotAlert(owner: string, repo: string, alert_id: number) {
    const alert = await this.octokit.issues.getDependabotAlert({ owner, repo, alert_id });
    return alert.data;
  }
  async listDependabotSecrets(owner: string, repo: string) {
    const secrets = await this.octokit.issues.listDependabotSecrets({ owner, repo });
    return secrets.data;
  }
  async getDependabotSecret(owner: string, repo: string, secret_id: number) {
    const secret = await this.octokit.issues.getDependabotSecret({ owner, repo, secret_id });
    return secret.data;
  }
  async createDependabotSecret(owner: string, repo: string, name: string, value: string) {
    const secret = await this.octokit.issues.createDependabotSecret({ owner, repo, name, value });
    return secret.data;
  }
  async updateDependabotSecret(owner: string, repo: string, secret_id: number, name: string, value: string) {
    const secret = await this.octokit.issues.updateDependabotSecret({ owner, repo, secret_id, name, value });
    return secret.data;
  }
  async deleteDependabotSecret(owner: string, repo: string, secret_id: number) {
    const response = await this.octokit.issues.deleteDependabotSecret({ owner, repo, secret_id });
    return response.status;
  }
  async listDeployKeys(owner: string, repo: string) {
    const keys = await this.octokit.repos.listDeployKeys({ owner, repo });
    return keys.data;
  }
  async getDeployKey(owner: string, repo: string, key_id: number) {
    const key = await this.octokit.repos.getDeployKey({ owner, repo, key_id });
    return key.data;
  }
  async addDeployKey(owner: string, repo: string, title: string, key: string, read_only: boolean) {
    const newKey = await this.octokit.repos.createDeployKey({ owner, repo, title, key, read_only });
    return newKey.data;
  }
  async deleteDeployKey(owner: string, repo: string, key_id: number) {
    const response = await this.octokit.repos.deleteDeployKey({ owner, repo, key_id });
    return response.status;
  }
  async getInteractionRestrictions(owner: string, repo: string) {
    const restrictions = await this.octokit.interactions.getRestrictionsForRepo({ owner, repo });
    return restrictions.data;
  }
  async setInteractionRestrictions(owner: string, repo: string, limit: string, days: number) {
    const response = await this.octokit.interactions.setRestrictionsForRepo({ owner, repo, limit, days });
    return response.data;
  }
  async removeInteractionRestrictions(owner: string, repo: string) {
    const response = await this.octokit.interactions.removeRestrictionsForRepo({ owner, repo });
    return response.status;
  }
  async listIssuesForRepo(owner: string, repo: string) {
    const issues = await this.octokit.issues.listForRepo({ owner, repo });
    return issues.data;
  }
  async getIssue(owner: string, repo: string, issue_number: number) {
    const issue = await this.octokit.issues.get({ owner, repo, issue_number });
    return issue.data;
  }
  async createIssue(owner: string, repo: string, title: string, body: string) {
    const issue = await this.octokit.issues.create({ owner, repo, title, body });
    return issue.data;
  }
  async updateIssue(owner: string, repo: string, issue_number: number, title: string, body: string) {
    const issue = await this.octokit.issues.update({ owner, repo, issue_number, title, body });
    return issue.data;
  }
  async lockIssue(owner: string, repo: string, issue_number: number) {
    const response = await this.octokit.issues.lock({ owner, repo, issue_number });
    return response.status;
  }
  async unlockIssue(owner: string, repo: string, issue_number: number) {
    const response = await this.octokit.issues.unlock({ owner, repo, issue_number });
    return response.status;
  }
  async startImport(owner: string, repo: string, vcs_url: string, vcs: string) {
    const importData = await this.octokit.migrations.startImport({ owner, repo, vcs_url, vcs });
    return importData.data;
  }
  async getImportProgress(owner: string, repo: string) {
    const progress = await this.octokit.migrations.getImportProgress({ owner, repo });
    return progress.data;
  }
  async updateImport(owner: string, repo: string, vcs_url: string) {
    const updatedImport = await this.octokit.migrations.updateImport({ owner, repo, vcs_url });
    return updatedImport.data;
  }
  async cancelImport(owner: string, repo: string) {
    const response = await this.octokit.migrations.cancelImport({ owner, repo });
    return response.status;
  }
  async getPages(owner: string, repo: string) {
    const pages = await this.octokit.repos.getPages({ owner, repo });
    return pages.data;
  }
  async createPagesSite(owner: string, repo: string, source: { branch: string, path: string }) {
    const site = await this.octokit.repos.createPagesSite({ owner, repo, source });
    return site.data;
  }
  async updateInformationAboutPagesSite(owner: string, repo: string, cname: string, source: { branch: string, path: string }) {
    const site = await this.octokit.repos.updateInformationAboutPagesSite({ owner, repo, cname, source });
    return site.data;
  }
  async deletePagesSite(owner: string, repo: string) {
    const response = await this.octokit.repos.deletePagesSite({ owner, repo });
    return response.status;
  }
  async listProjectsForUser(username: string) {
    const projects = await this.octokit.projects.listForUser({ username });
    return projects.data;
  }
  async getProject(project_id: number) {
    const project = await this.octokit.projects.get({ project_id });
    return project.data;
  }
  async createProject(owner: string, repo: string, name: string, body: string) {
    const project = await this.octokit.projects.createForRepo({ owner, repo, name, body });
    return project.data;
  }

  async updateProject(project_id: number, name: string, body: string, state: string) {
    const project = await this.octokit.projects.update({ project_id, name, body, state });
    return project.data;
  }
  async deleteProject(project_id: number) {
    const response = await this.octokit.projects.delete({ project_id });
    return response.status;
  }
  async listPullRequests(owner: string, repo: string) {
    const pulls = await this.octokit.pulls.list({ owner, repo });
    return pulls.data;
  }
  async getPullRequest(owner: string, repo: string, pull_number: number) {
    const pull = await this.octokit.pulls.get({ owner, repo, pull_number });
    return pull.data;
  }
  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string) {
    const pull = await this.octokit.pulls.create({ owner, repo, title, head, base });
    return pull.data;
  }
  async updatePullRequest(owner: string, repo: string, pull_number: number, title: string, body: string, state: string) {
    const pull = await this.octokit.pulls.update({ owner, repo, pull_number, title, body, state });
    return pull.data;
  }
  async listReviewCommentsOnPullRequest(owner: string, repo: string, pull_number: number) {
    const comments = await this.octokit.pulls.listReviewComments({ owner, repo, pull_number });
    return comments.data;
  }
  async createReviewComment(owner: string, repo: string, pull_number: number, body: string, commit_id: string, path: string, position: number) {
    const comment = await this.octokit.pulls.createReviewComment({ owner, repo, pull_number, body, commit_id, path, position });
    return comment.data;
  }
  async listReleases(owner: string, repo: string) {
    const releases = await this.octokit.repos.listReleases({ owner, repo });
    return releases.data;
  }
  async getRelease(owner: string, repo: string, release_id: number) {
    const release = await this.octokit.repos.getRelease({ owner, repo, release_id });
    return release.data;
  }
  async createRelease(owner: string, repo: string, tag_name: string, name: string, body: string) {
    const release = await this.octokit.repos.createRelease({ owner, repo, tag_name, name, body });
    return release.data;
  }
  async updateRelease(owner: string, repo: string, release_id: number, tag_name: string, name: string, body: string) {
    const release = await this.octokit.repos.updateRelease({ owner, repo, release_id, tag_name, name, body });
    return release.data;
  }
  async deleteRelease(owner: string, repo: string, release_id: number) {
    const response = await this.octokit.repos.deleteRelease({ owner, repo, release_id });
    return response.status;
  }
  async getContents(owner: string, repo: string, path: string) {
    const contents = await this.octokit.repos.getContent({ owner, repo, path });
    return contents.data;
  }
  async createOrUpdateFileContents(owner: string, repo: string, path: string, message: string, content: string, branch: string) {
    const response = await this.octokit.repos.createOrUpdateFileContents({ owner, repo, path, message, content, branch });
    return response.data;
  }
  async deleteFile(owner: string, repo: string, path: string, message: string, branch: string) {
    const response = await this.octokit.repos.deleteFile({ owner, repo, path, message, branch });
    return response.data;
  }
  async listForks(owner: string, repo: string) {
    const forks = await this.octokit.repos.listForks({ owner, repo });
    return forks.data;
  }
  async createFork(owner: string, repo: string) {
    const fork = await this.octokit.repos.createFork({ owner, repo });
    return fork.data;
  }
  async listUserRepos(username: string, type: string) {
    const repos = await this.octokit.repos.listForUser({ username, type });
    return repos.data;
  }
  async getRepo(owner: string, repo: string) {
    const repository = await this.octokit.repos.get({ owner, repo });
    return repository.data;
  }
  async createRepo(name: string, description: string, private: boolean) {
    const repo = await this.octokit.repos.createForAuthenticatedUser({ name, description, private });
    return repo.data;
  }
  async updateRepo(owner: string, repo: string, name: string, description: string, private: boolean) {
    const updatedRepo = await this.octokit.repos.update({ owner, repo, name, description, private });
    return updatedRepo.data;
  }
  async deleteRepo(owner: string, repo: string) {
    const response = await this.octokit.repos.delete({ owner, repo });
    return response.status;
  }
  async searchRepositories(query: string, sort: string, order: string) {
    const repos = await this.octokit.search.repos({ q: query, sort, order });
    return repos.data;
  }
  async searchCode(query: string, sort: string, order: string) {
    const code = await this.octokit.search.code({ q: query, sort, order });
    return code.data;
  }
  async searchIssuesAndPullRequests(query: string, sort: string, order: string) {
    const issuesAndPulls = await this.octokit.search.issuesAndPullRequests({ q: query, sort, order });
    return issuesAndPulls.data;
  }
  async searchUsers(query: string, sort: string, order: string) {
    const users = await this.octokit.search.users({ q: query, sort, order });
    return users.data;
  }
  async searchTopics(query: string) {
    const topics = await this.octokit.search.topics({ q: query });
    return topics.data;
  }
  async searchLabels(query: string, repository_id: number) {
    const labels = await this.octokit.search.labels({ q: query, repository_id });
    return labels.data;
  }
  async listRepoWebhooks(owner: string, repo: string) {
    const webhooks = await this.octokit.repos.listWebhooks({ owner, repo });
    return webhooks.data;
  }
  async getRepoWebhook(owner: string, repo: string, hook_id: number) {
    const webhook = await this.octokit.repos.getWebhook({ owner, repo, hook_id });
    return webhook.data;
  }
  async createRepoWebhook(owner: string, repo: string, config: { url: string, content_type: string, secret: string }, events: string[]) {
    const webhook = await this.octokit.repos.createWebhook({ owner, repo, config, events });
    return webhook.data;
  }
  async updateRepoWebhook(owner: string, repo: string, hook_id: number, config: { url: string, content_type: string, secret: string }, events: string[]) {
    const webhook = await this.octokit.repos.updateWebhook({ owner, repo, hook_id, config, events });
    return webhook.data;
  }
  async deleteRepoWebhook(owner: string, repo: string, hook_id: number) {
    const response = await this.octokit.repos.deleteWebhook({ owner, repo, hook_id });
    return response.status;
  }
  async listRepoWebhooks(owner: string, repo: string) {
    const webhooks = await this.octokit.repos.listWebhooks({ owner, repo });
    return webhooks.data;
  }
  async getRepoWebhook(owner: string, repo: string, hook_id: number) {
    const webhook = await this.octokit.repos.getWebhook({ owner, repo, hook_id });
    return webhook.data;
  }
  async createRepoWebhook(owner: string, repo: string, config: { url: string, content_type: string, secret: string }, events: string[]) {
    const webhook = await this.octokit.repos.createWebhook({ owner, repo, config, events });
    return webhook.data;
  }
  async updateRepoWebhook(owner: string, repo: string, hook_id: number, config: { url: string, content_type: string, secret: string }, events: string[]) {
    const webhook = await this.octokit.repos.updateWebhook({ owner, repo, hook_id, config, events });
    return webhook.data;
  }
  async deleteRepoWebhook(owner: string, repo: string, hook_id: number) {
    const response = await this.octokit.repos.deleteWebhook({ owner, repo, hook_id });
    return response.status;
  }
}

export const gitHubTool = new GitHubTool('your-github-token');
