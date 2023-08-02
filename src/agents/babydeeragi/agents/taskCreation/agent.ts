import { Octokit } from '@octokit/rest';
import { OpenAIChat } from 'langchain/llms/openai';
import { taskCreationPrompt } from './prompt';
import { LLMChain } from 'langchain/chains';
import { AgentTask, Message } from '@/types';
import { getUserApiKey } from '@/utils/settings';
import { parseTasks } from '@/utils/task';
import { translate } from '@/utils/translate';
import axios from 'axios';

export const taskCreationAgent = async (
  objective: string,
  modelName: string,
  language: string,
  signal?: AbortSignal,
  messageCallback?: (message: Message) => void,
) => {
  let chunk = '```json\n';
  const websearchVar =
    process.env.SERP_API_KEY || process.env.GOOGLE_SEARCH_API_KEY
      ? '[web-search] '
      : ''; // if search api key is not set, don't add [web-search] to the task description

  const userinputVar = '[user-input] ';
  const prompt = taskCreationPrompt();
  const openAIApiKey = getUserApiKey();

  if (!openAIApiKey && process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true') {
    throw new Error('User API key is not set.');
  }

  let result = '';
  if (getUserApiKey()) {
    // client side request
    const model = new OpenAIChat(
      {
        openAIApiKey,
        modelName,
        temperature: 0,
        maxTokens: 1500,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxRetries: 3,
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              chunk += token;
              const message: Message = {
                type: 'task-execute',
                title: translate('CREATING', 'message'),
                text: chunk,
                icon: '📝',
                id: 0,
              };
              messageCallback?.(message);
            },
          },
        ],
      },
      { baseOptions: { signal: signal } },
    );

    const chain = new LLMChain({ llm: model, prompt });
    try {
      const response = await chain.call({
        objective,
        websearch_var: websearchVar,
        user_input_var: userinputVar,
        language,
      });
      result = response.text;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return null;
      }
      console.log(error);
      return null;
    }
  } else {
    // server side request
    const response = await axios
      .post(
        '/api/deer/create',
        {
          objective: objective,
          websearch_var: websearchVar,
          user_input_var: userinputVar,
          model_name: modelName,
        },
        {
          signal: signal,
        },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });
    result = response?.data?.response;
  }

  if (!result) {
    return null;
  }

  let taskList: AgentTask[] = [];
  // update task list
  try {
    taskList = parseTasks(result);
  } catch (error) {
    console.log(error);
    // TODO: handle error
    return null;
  }

  // Integrate with GitHub API for task creation
  const octokit = new Octokit({ auth: 'YOUR_GITHUB_ACCESS_TOKEN' });

  try {
    const repoName = 'YOUR_REPO_NAME';
    const repo = await octokit.repos.get({ owner: 'YOUR_GITHUB_USERNAME', repo: repoName });
    const workflowFileName = 'YOUR_WORKFLOW_FILENAME'; // Replace with the actual filename of your workflow

    // Add tasks to the workflow file (if needed)
    const workflowFilePath = `.github/workflows/${workflowFileName}`;
    const workflowContent = await octokit.repos.getContent({
      owner: repo.data.owner.login,
      repo: repoName,
      path: workflowFilePath,
    });

    const existingWorkflowContent = Buffer.from(workflowContent.data.content, 'base64').toString();

    // Update the workflow content with the tasks
    const tasksToAdd = taskList;
    const updatedWorkflowContent = addTasksToWorkflow(existingWorkflowContent, tasksToAdd);

    // Commit the updated workflow content to the repository
    await octokit.repos.createOrUpdateFileContents({
      owner: repo.data.owner.login,
      repo: repoName,
      path: workflowFilePath,
      message: 'Add tasks to workflow',
      content: Buffer.from(updatedWorkflowContent).toString('base64'),
      sha: workflowContent.data.sha,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log(error);
    return null;
  }

  return taskList;
};

// Helper function to add tasks to the workflow file content
function addTasksToWorkflow(existingContent: string, tasksToAdd: AgentTask[]) {
  // Customize this function based on your workflow file format and how tasks should be added
  // For example, you can use regular expressions to find specific lines and insert tasks there
  // Or you can parse the YAML content, add tasks to the appropriate section, and then stringify it back to YAML
  // In this example, I'm simply appending the tasks at the end of the file

  const updatedContent = `${existingContent}\n\n# Added tasks\n`;

  tasksToAdd.forEach((task) => {
    updatedContent += `# Task: ${task.title}\n`;
    updatedContent += `# Description: ${task.description}\n`;
    updatedContent += `# ... (add other relevant task data)\n`;
    updatedContent += `# End of Task\n\n`;
  });

  return updatedContent;
}

// Example usage:
const existingContent = `
# Your existing workflow content here
`;

const tasksToAdd: AgentTask[] = [
  {
    title: 'Task 1',
    description: 'Description of Task 1',
    // Add other relevant task data
  },
  {
    title: 'Task 2',
    description: 'Description of Task 2',
    // Add other relevant task data
  },
  // Add more tasks as needed
];

const updatedContent = addTasksToWorkflow(existingContent, tasksToAdd);
console.log(updatedContent);
