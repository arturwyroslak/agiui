import { AgentExecuter } from '../base/AgentExecuter';
import { taskCreationAgent } from './agents/taskCreation/agent';
import { AgentTask } from '@/types';
import { getTaskById } from '@/utils/task';
import { webBrowsing } from './tools/webBrowsing';
import { textCompletionToolPrompt } from './prompt';
import { textCompletionTool } from '../common/tools/textCompletionTool';
import { setupMessage } from '@/utils/message';
import { toast } from 'sonner';
import { translate } from '@/utils/translate';
import { gitHubTool } from './tools/github';


export class BabyDeerAGI extends AgentExecuter {
  sessionSummary = `OBJECTIVE: ${this.objective}\n\n`;
  userInputResolvers: { [id: number]: (message: string) => void } = {};
  userInputPromises: { [id: number]: Promise<string> } = {};

  // Create task list by agent
  async taskCreation() {
    this.statusCallback({ type: 'creating' });
    this.abortController = new AbortController();
    const taskList = await taskCreationAgent(
      this.objective,
      this.modelName,
      this.language,
      this.abortController?.signal,
      this.messageCallback,
    );

    if (!taskList) {
      toast.error(translate('ERROR_CREATING_TASKS', 'message'));
      this.stop();
      return;
    }

    this.taskList = taskList;
    this.printer.printTaskList(this.taskList, 0);
  }

  async taskOutputWithTool(task: AgentTask) {
    let taskOutput = '';
    switch (task.tool) {
      case 'text-completion':
        this.abortController = new AbortController();
        let dependentTasksOutput = '';
        if (task.dependentTaskIds) {
          for (const id of task.dependentTaskIds) {
            const dependentTask = getTaskById(this.taskList, id);
            const dependentTaskOutput = dependentTask?.output;
            dependentTasksOutput += `${dependentTask?.task}: ${dependentTaskOutput}\n`;
          }
        }
        const prompt = textCompletionToolPrompt(
          this.objective,
          this.language,
          task.task,
          dependentTasksOutput.slice(0, 14000),
        );

        taskOutput = await textCompletionTool(
          prompt,
          this.modelName,
          this.abortController?.signal,
          task.id,
          this.messageCallback,
        );
        break;
      case 'web-search':
        let dependentOutput = '';
        if (task.dependentTaskIds) {
          for (const dependentTaskId of task.dependentTaskIds) {
            const dependentTask = getTaskById(this.taskList, dependentTaskId);
            if (!dependentTask) continue;
            const dependentTaskOutput = dependentTask.output;
            dependentOutput += `${dependentTask.task}: ${dependentTaskOutput}\n`;
          }
        }
        taskOutput =
          (await webBrowsing(
            this.objective,
            task,
            dependentOutput,
            this.messageCallback,
            this.statusCallback,
            this.isRunningRef,
            this.verbose,
            this.modelName,
            this.language,
            this.abortController?.signal,
          )) ?? '';
        break;
      case 'user-input':
        taskOutput = await this.getUserInput(task);
        break;
      default:
        break;
    }
    return taskOutput;
  }
interface AgentTask {
  id: number;
  task: string;
  tool: string;
  status: 'incomplete' | 'running' | 'complete';
  output?: string;
  dependentTaskIds?: number[];
  config?: any;
  name: string; // Add the name property here
}
  async executeTask(task: AgentTask) {

  switch(task.name) {

    case 'createRepo':  
      return await gitHubTool.createRepo(task.config.name);

    case 'createFile':
      return await gitHubTool.createFile(
        task.config.owner,
        task.config.repo,
        task.config.path, 
        task.config.content
      );
    
    case 'commitAndPush':
      return await gitHubTool.commitAndPush(
        task.config.owner,
        task.config.repo,
        task.config.message  
      );

    case 'createBranch':
      return await gitHubTool.createBranch(
        task.config.owner,
        task.config.repo,
        task.config.branchName
      );
    case 'searchCode':
    return await gitHubTool.searchCode(task.config.query);
  
  case 'listFiles':
    return await gitHubTool.listFiles(
      task.config.owner,
      task.config.repo,
      task.config.branch  
    );

  case 'listRepos':
    return await gitHubTool.listRepos(task.config.username);
  
  case 'createIssue':
    return await gitHubTool.createIssue(
      task.config.owner,
      task.config.repo,
      task.config.title, 
      task.config.body
    );

  case 'listPullRequests':
    return await gitHubTool.listPullRequests(
      task.config.owner,
      task.config.repo
    );

  case 'createPullRequest':
    return await gitHubTool.createPullRequest(
      task.config.owner,
      task.config.repo,
      task.config.title,
      task.config.head,
      task.config.base
    );

  case 'mergePullRequest':
    return await gitHubTool.mergePullRequest(
      task.config.owner,
      task.config.repo,
      task.config.pull_number,
      task.config.commit_title
    );
  case 'listCommits':
  return await gitHubTool.listCommits(
    task.config.owner, 
    task.config.repo
  );

case 'getCommit':
  return await gitHubTool.getCommit(
    task.config.owner,
    task.config.repo,
    task.config.ref
  );

case 'listGists':
  return await gitHubTool.listGists(task.config.username);

case 'getGitData':
  return await gitHubTool.getGitData(
    task.config.owner,
    task.config.repo, 
    task.config.file_sha
  );  

case 'listIssues':
  return await gitHubTool.listIssues(
    task.config.owner,
    task.config.repo
  );

case 'listReposForOrg':
  return await gitHubTool.listReposForOrg(task.config.org);

case 'searchRepos':
  return await gitHubTool.searchRepos(task.config.query);  

case 'getUser':
  return await gitHubTool.getUser(task.config.username);

case 'listOrgs':
  return await gitHubTool.listOrgs(task.config.username);

case 'listProjects':
  return await gitHubTool.listProjects(
    task.config.owner,
    task.config.repo
  );

case 'listChecks':
  return await gitHubTool.listChecks(
    task.config.owner,
    task.config.repo,
    task.config.ref
  );

case 'listApps':
  return await gitHubTool.listApps();

case 'listMarketplaceListings':
  return await gitHubTool.listMarketplaceListings();
case 'listActions':
  return await gitHubTool.listActions(
    task.config.owner,
    task.config.repo
  );

case 'listCodesOfConduct':
  return await gitHubTool.listCodesOfConduct();

case 'listLicenses':
  return await gitHubTool.listLicenses();

case 'getRateLimit':
  return await gitHubTool.getRateLimit();

case 'getCacheKey':
  return await gitHubTool.getCacheKey(
    task.config.owner, 
    task.config.repo,
    task.config.key
  );

case 'createCacheKey':
  return await gitHubTool.createCacheKey(
    task.config.owner,
    task.config.repo,
    task.config.key, 
    task.config.paths
  );

case 'listCacheKeys':
  return await gitHubTool.listCacheKeys(
    task.config.owner,
    task.config.repo
  );

case 'deleteCacheKey':
  return await gitHubTool.deleteCacheKey(
    task.config.owner,
    task.config.repo,
    task.config.cache_key
  );
  
case 'listArtifacts':
  return await gitHubTool.listArtifacts(
    task.config.owner, 
    task.config.repo
  );

case 'getArtifact':
  return await gitHubTool.getArtifact(
    task.config.owner,
    task.config.repo,
    task.config.artifact_id
  );

case 'downloadArtifact':
  return await gitHubTool.downloadArtifact(
    task.config.owner,
    task.config.repo,
    task.config.artifact_id,
    task.config.archive_format
  );  

case 'deleteArtifact':
  return await gitHubTool.deleteArtifact(
    task.config.owner,
    task.config.repo,
    task.config.artifact_id
  );

case 'createOIDCToken':
  return await gitHubTool.createOIDCToken(
    task.config.owner,
    task.config.repo,
    task.config.act_as
  );
case 'getOIDCToken':
  return await gitHubTool.getOIDCToken(
    task.config.owner,
    task.config.repo,
    task.config.act_as
  );

case 'listSelfHostedRunners':
  return await gitHubTool.listSelfHostedRunners(
    task.config.owner,
    task.config.repo
  );

case 'getSelfHostedRunner':
  return await gitHubTool.getSelfHostedRunner(
    task.config.owner,
    task.config.repo,
    task.config.runner_id
  );

case 'createRegistrationTokenForRunner':
  return await gitHubTool.createRegistrationTokenForRunner(
    task.config.owner,
    task.config.repo
  );

case 'createRemoveTokenForRunner':
  return await gitHubTool.createRemoveTokenForRunner(
    task.config.owner,
    task.config.repo
  );

case 'deleteSelfHostedRunner':
  return await gitHubTool.deleteSelfHostedRunner(
    task.config.owner,
    task.config.repo,
    task.config.runner_id
  );

case 'listEnvironmentVariables':
  return await gitHubTool.listEnvironmentVariables(
    task.config.owner,
    task.config.repo,
    task.config.environment_name
  );  

case 'getEnvironmentVariable':
  return await gitHubTool.getEnvironmentVariable(
    task.config.owner,
    task.config.repo,
    task.config.environment_name,
    task.config.secret_name
  );

case 'createOrUpdateEnvironmentVariable':
  return await gitHubTool.createOrUpdateEnvironmentVariable(
    task.config.owner,
    task.config.repo,
    task.config.environment_name,
    task.config.secret_name, 
    task.config.encrypted_value,
    task.config.key_id
  );

case 'deleteEnvironmentVariable':
  return await gitHubTool.deleteEnvironmentVariable(
    task.config.owner,
    task.config.repo,
    task.config.environment_name,
    task.config.secret_name
  );
case 'listRepoWorkflows':
  return await gitHubTool.listRepoWorkflows(
    task.config.owner,
    task.config.repo
  );

case 'getRepoWorkflow':
  return await gitHubTool.getRepoWorkflow(
    task.config.owner, 
    task.config.repo,
    task.config.workflow_id
  );

case 'getWorkflowUsage':
  return await gitHubTool.getWorkflowUsage(
    task.config.owner,
    task.config.repo,
    task.config.workflow_id
  );

case 'getApp':
  return await gitHubTool.getApp(
    task.config.owner,
    task.config.repo
  );
  
case 'listInstallationsForAuthenticatedUser':
  return await gitHubTool.listInstallationsForAuthenticatedUser();

case 'getAuthenticatedApp':
  return await gitHubTool.getAuthenticatedApp();

case 'listInstallationsForAuthenticatedUser':
  return await gitHubTool.listInstallationsForAuthenticatedUser();

case 'getInstallationForAuthenticatedUser':
  return await gitHubTool.getInstallationForAuthenticatedUser(
    task.config.installation_id
  );

case 'listInstallationReposForAuthenticatedUser':
  return await gitHubTool.listInstallationReposForAuthenticatedUser(
   task.config.installation_id
  );

case 'addRepoToInstallation':
  return await gitHubTool.addRepoToInstallation(
    task.config.installation_id,
    task.config.repository_id
  );
case 'removeRepoFromInstallation':
  return await gitHubTool.removeRepoFromInstallation(
    task.config.installation_id, 
    task.config.repository_id
  );

case 'listAppWebhooks':
  return await gitHubTool.listAppWebhooks(
    task.config.app_slug
  );

case 'getAppWebhook':
  return await gitHubTool.getAppWebhook(
    task.config.app_slug,
    task.config.delivery_id
  );

case 'redeliverAppWebhook':
  return await gitHubTool.redeliverAppWebhook(
    task.config.app_slug, 
    task.config.delivery_id
  );

case 'createCheckRun':
  return await gitHubTool.createCheckRun(
    task.config.owner,
    task.config.repo,
    task.config.name,
    task.config.head_sha
  );

case 'getCheckRun':
  return await gitHubTool.getCheckRun(
    task.config.owner,
    task.config.repo,
    task.config.check_run_id
  );

case 'listCheckRunsForRef':
  return await gitHubTool.listCheckRunsForRef(
    task.config.owner,
    task.config.repo,
    task.config.ref
  );

case 'updateCheckRun':
  return await gitHubTool.updateCheckRun(
    task.config.owner,
    task.config.repo,
    task.config.check_run_id,
    task.config.name,
    task.config.status,
    task.config.conclusion
  );      
case 'listCodeScanningAlertsForRepo':
  return await gitHubTool.listCodeScanningAlertsForRepo(
    task.config.owner, 
    task.config.repo
  );

case 'getCodeScanningAlert':
  return await gitHubTool.getCodeScanningAlert(
    task.config.owner,
    task.config.repo,
    task.config.alert_id
  );

case 'updateCodeScanningAlert':
  return await gitHubTool.updateCodeScanningAlert(
    task.config.owner,
    task.config.repo,
    task.config.alert_id,
    task.config.ref
  );

case 'listCodespacesForUser':
  return await gitHubTool.listCodespacesForUser();

case 'getCodespace':
  return await gitHubTool.getCodespace(
    task.config.owner,
    task.config.repo,
    task.config.codespace_id
  );

case 'createCodespace':
  return await gitHubTool.createCodespace(
    task.config.owner,
    task.config.repo,
    task.config.branch,
    task.config.machine_type
  );

case 'updateCodespace':
  return await gitHubTool.updateCodespace(
    task.config.owner,
    task.config.repo,
    task.config.codespace_id,
    task.config.machine_type
  );

case 'deleteCodespace':
  return await gitHubTool.deleteCodespace(
    task.config.owner,
    task.config.repo,
    task.config.codespace_id
  );

case 'listCommits':
  return await gitHubTool.listCommits(
    task.config.owner,
    task.config.repo
  );

case 'getCommit':
  return await gitHubTool.getCommit(
    task.config.owner,
    task.config.repo,
    task.config.ref
  );

case 'compareCommits':
  return await gitHubTool.compareCommits(
    task.config.owner,
    task.config.repo,
    task.config.base,
    task.config.head
  );

case 'listCommitCommentsForRepo':
  return await gitHubTool.listCommitCommentsForRepo(
    task.config.owner,
    task.config.repo
  );

case 'getCommitComment':
  return await gitHubTool.getCommitComment(
    task.config.owner,
    task.config.repo,
    task.config.comment_id
  );

case 'createCommitComment':
  return await gitHubTool.createCommitComment(
    task.config.owner,
    task.config.repo,
    task.config.commit_sha,
    task.config.body
  );

case 'listDependabotAlerts':
  return await gitHubTool.listDependabotAlerts(
    task.config.owner,
    task.config.repo
  );

case 'getDependabotAlert':
  return await gitHubTool.getDependabotAlert(
    task.config.owner,
    task.config.repo,
    task.config.alert_id
  );

case 'listDependabotSecrets':
  return await gitHubTool.listDependabotSecrets(
    task.config.owner,
    task.config.repo
  );
case 'getDependabotSecret':
  return await gitHubTool.getDependabotSecret(
    task.config.owner,
    task.config.repo,
    task.config.secret_id
  );

case 'createDependabotSecret':
  return await gitHubTool.createDependabotSecret(
    task.config.owner,
    task.config.repo,
    task.config.name,
    task.config.value
  );

case 'updateDependabotSecret':
  return await gitHubTool.updateDependabotSecret(
    task.config.owner,
    task.config.repo,
    task.config.secret_id,
    task.config.name,
    task.config.value
  );

case 'deleteDependabotSecret':
  return await gitHubTool.deleteDependabotSecret(
    task.config.owner,
    task.config.repo,
    task.config.secret_id
  );

case 'listDeployKeys':
  return await gitHubTool.listDeployKeys(
    task.config.owner,
    task.config.repo
  );

case 'getDeployKey':
  return await gitHubTool.getDeployKey(
    task.config.owner,
    task.config.repo,
    task.config.key_id
  );

case 'addDeployKey':
  return await gitHubTool.addDeployKey(
    task.config.owner,
    task.config.repo,
    task.config.title,
    task.config.key,
    task.config.read_only
  );

case 'deleteDeployKey':
  return await gitHubTool.deleteDeployKey(
    task.config.owner,
    task.config.repo,
    task.config.key_id
  );

case 'getInteractionRestrictions':
  return await gitHubTool.getInteractionRestrictions(
    task.config.owner,
    task.config.repo
  );

case 'setInteractionRestrictions':
  return await gitHubTool.setInteractionRestrictions(
    task.config.owner,
    task.config.repo,
    task.config.limit,
    task.config.days
  );

case 'removeInteractionRestrictions':
  return await gitHubTool.removeInteractionRestrictions(
    task.config.owner,
    task.config.repo
  );

case 'listIssuesForRepo':
  return await gitHubTool.listIssuesForRepo(
    task.config.owner,
    task.config.repo
  );

case 'getIssue':
  return await gitHubTool.getIssue(
    task.config.owner,
    task.config.repo,
    task.config.issue_number
  );

case 'createIssue':
  return await gitHubTool.createIssue(
    task.config.owner,
    task.config.repo,
    task.config.title,
    task.config.body
  );

case 'updateIssue':
  return await gitHubTool.updateIssue(
    task.config.owner,
    task.config.repo,
    task.config.issue_number,
    task.config.title,
    task.config.body
  );

case 'lockIssue':
  return await gitHubTool.lockIssue(
    task.config.owner,
    task.config.repo,
    task.config.issue_number
  );

case 'unlockIssue':
  return await gitHubTool.unlockIssue(
    task.config.owner,
    task.config.repo,
    task.config.issue_number
  );

case 'startImport':
  return await gitHubTool.startImport(
    task.config.owner,
    task.config.repo,
    task.config.vcs_url,
    task.config.vcs
  );

case 'getImportProgress':
  return await gitHubTool.getImportProgress(
    task.config.owner,
    task.config.repo
  );

case 'updateImport':
  return await gitHubTool.updateImport(
    task.config.owner,
    task.config.repo,
    task.config.vcs_url
  );

case 'cancelImport':
  return await gitHubTool.cancelImport(
    task.config.owner,
    task.config.repo
  );

case 'getPages':
  return await gitHubTool.getPages(
    task.config.owner,
    task.config.repo
  );
case 'createPagesSite':
  return await gitHubTool.createPagesSite(
    task.config.owner,
    task.config.repo,
    task.config.source
  );

case 'updateInformationAboutPagesSite':
  return await gitHubTool.updateInformationAboutPagesSite(
    task.config.owner,
    task.config.repo,
    task.config.cname,
    task.config.source
  );

case 'deletePagesSite':
  return await gitHubTool.deletePagesSite(
    task.config.owner,
    task.config.repo
  );

case 'listProjectsForUser':
  return await gitHubTool.listProjectsForUser(
    task.config.username
  );

case 'getProject':
  return await gitHubTool.getProject(
    task.config.project_id
  );

case 'createProject':
  return await gitHubTool.createProject(
    task.config.owner,
    task.config.repo,
    task.config.name,
    task.config.body
  );

case 'updateProject':
  return await gitHubTool.updateProject(
    task.config.project_id,
    task.config.name,
    task.config.body,
    task.config.state
  );

case 'deleteProject':
  return await gitHubTool.deleteProject(
    task.config.project_id
  );

case 'listPullRequests':
  return await gitHubTool.listPullRequests(
    task.config.owner,
    task.config.repo
  );

case 'getPullRequest':
  return await gitHubTool.getPullRequest(
    task.config.owner,
    task.config.repo,
    task.config.pull_number
  );

case 'createPullRequest':
  return await gitHubTool.createPullRequest(
    task.config.owner,
    task.config.repo,
    task.config.title,
    task.config.head,
    task.config.base
  );

case 'updatePullRequest':
  return await gitHubTool.updatePullRequest(
    task.config.owner,
    task.config.repo,
    task.config.pull_number,
    task.config.title,
    task.config.body,
    task.config.state
  );

case 'listReviewCommentsOnPullRequest':
  return await gitHubTool.listReviewCommentsOnPullRequest(
    task.config.owner,
    task.config.repo,
    task.config.pull_number
  );

case 'createReviewComment':
  return await gitHubTool.createReviewComment(
    task.config.owner,
    task.config.repo,
    task.config.pull_number,
    task.config.body,
    task.config.commit_id,
    task.config.path,
    task.config.position
  );

case 'listReleases':
  return await gitHubTool.listReleases(
    task.config.owner,
    task.config.repo
  );

case 'getRelease':
  return await gitHubTool.getRelease(
    task.config.owner,
    task.config.repo,
    task.config.release_id
  );

case 'createRelease':
  return await gitHubTool.createRelease(
    task.config.owner,
    task.config.repo,
    task.config.tag_name,
    task.config.name,
    task.config.body
  );
 case 'updateRelease':
  return await gitHubTool.updateRelease(
    task.config.owner,
    task.config.repo,
    task.config.release_id,
    task.config.tag_name,
    task.config.name,
    task.config.body
  );

case 'deleteRelease':
  return await gitHubTool.deleteRelease(
    task.config.owner,
    task.config.repo,
    task.config.release_id
  );

case 'getContents':
  return await gitHubTool.getContents(
    task.config.owner,
    task.config.repo,
    task.config.path
  );

case 'createOrUpdateFileContents':
  return await gitHubTool.createOrUpdateFileContents(
    task.config.owner,
    task.config.repo,
    task.config.path,
    task.config.message,
    task.config.content,
    task.config.branch
  );

case 'deleteFile':
  return await gitHubTool.deleteFile(
    task.config.owner,
    task.config.repo,
    task.config.path,
    task.config.message,
    task.config.branch
  );

case 'listForks':
  return await gitHubTool.listForks(
    task.config.owner,
    task.config.repo
  );

case 'createFork':
  return await gitHubTool.createFork(
    task.config.owner,
    task.config.repo
  );

case 'listUserRepos':
  return await gitHubTool.listUserRepos(
    task.config.username,
    task.config.type
  );

case 'getRepo':
  return await gitHubTool.getRepo(
    task.config.owner,
    task.config.repo
  );

case 'createRepo':
  return await gitHubTool.createRepo(
    task.config.name,
    task.config.description,
    task.config.private
  );

case 'updateRepo':
  return await gitHubTool.updateRepo(
    task.config.owner,
    task.config.repo,
    task.config.name,
    task.config.description,
    task.config.private
  );

case 'deleteRepo':
  return await gitHubTool.deleteRepo(
    task.config.owner,
    task.config.repo
  );

case 'searchRepositories':
  return await gitHubTool.searchRepositories(
    task.config.query,
    task.config.sort,
    task.config.order
  );

case 'searchCode':
  return await gitHubTool.searchCode(
    task.config.query,
    task.config.sort,
    task.config.order
  );

case 'searchIssuesAndPullRequests':
  return await gitHubTool.searchIssuesAndPullRequests(
    task.config.query,
    task.config.sort,
    task.config.order
  );

case 'searchUsers':
  return await gitHubTool.searchUsers(
    task.config.query,
    task.config.sort,
    task.config.order
  );

case 'searchTopics':
  return await gitHubTool.searchTopics(
    task.config.query
  );

case 'searchLabels':
  return await gitHubTool.searchLabels(
    task.config.query,
    task.config.repository_id
  );

case 'listRepoWebhooks':
  return await gitHubTool.listRepoWebhooks(
    task.config.owner,
    task.config.repo
  );

case 'getRepoWebhook':
  return await gitHubTool.getRepoWebhook(
    task.config.owner,
    task.config.repo,
    task.config.hook_id
  );

case 'createRepoWebhook':
  return await gitHubTool.createRepoWebhook(
    task.config.owner,
    task.config.repo,
    task.config.config,
    task.config.events
  );

case 'updateRepoWebhook':
  return await gitHubTool.updateRepoWebhook(
    task.config.owner,
    task.config.repo,
    task.config.hook_id,
    task.config.config,
    task.config.events
  );

case 'deleteRepoWebhook':
  return await gitHubTool.deleteRepoWebhook(
    task.config.owner,
    task.config.repo,
    task.config.hook_id
  );     
      

      
  }

}

  // Override AgentExecuter
  async prepare() {
    super.prepare();
    this.userInputPromises = {};
    this.userInputResolvers = {};
    // 1. Create task list
    await this.taskCreation();
  }

  async loop() {
    // Continue the loop while there are incomplete tasks
    while (
      this.isRunningRef.current &&
      this.taskList.some((task) => task.status === 'incomplete')
    ) {
      if (!this.isRunningRef.current) {
        break;
      }

      this.statusCallback({ type: 'preparing' });

      const incompleteTasks = this.taskList.filter(
        (task) => task.status === 'incomplete',
      );
      // Filter tasks that have all their dependencies completed
      const MaxExecutableTasks = 5;
      const executableTasks = incompleteTasks
        .filter((task) => {
          if (!task.dependentTaskIds) return true;
          return task.dependentTaskIds.every((id) => {
            const dependentTask = getTaskById(this.taskList, id);
            return dependentTask?.status === 'complete';
          });
        })
        .slice(0, MaxExecutableTasks);

      // Execute all executable tasks in parallel
      await Promise.all(executableTasks.map((task) => this.executeTask(task)));
    }
  }

  async finishup() {
    if (!this.isRunningRef.current) {
      this.statusCallback({ type: 'finished' });
      return;
    }
    const id = this.taskList.length + 1;
    this.printer.printTaskList(this.taskList, id);

    super.finishup();
  }

  async userInput(taskId: number, message: string): Promise<void> {
    if (this.userInputResolvers[taskId]) {
      this.userInputResolvers[taskId](message);
      delete this.userInputResolvers[taskId];
      delete this.userInputPromises[taskId];
    }
  }

  getUserInput(task: AgentTask) {
    this.messageCallback(
      setupMessage('user-input', task.task, task.tool, undefined, task.id),
    );
    toast.message(translate('USER_INPUT_WAITING', 'message'));
    this.statusCallback({ type: 'user-input' });
    this.userInputPromises[task.id] = new Promise((resolve) => {
      this.userInputResolvers[task.id] = resolve;
    });
    return this.userInputPromises[task.id];
  }

  currentStatusCallback = () => {
    const ids = this.taskList
      .filter((t) => t.status === 'running')
      .map((t) => t.id);
    this.statusCallback({
      type: 'executing',
      message: `(👉 ${ids.join(', ')} / ${this.taskList.length})`,
    });
  };
}
