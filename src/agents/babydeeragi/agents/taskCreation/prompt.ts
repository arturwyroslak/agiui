import { PromptTemplate } from 'langchain/prompts';

export const taskCreationPrompt = () => {
  const prompt = new PromptTemplate({
    inputVariables: ['objective', 'websearch_var', 'user_input_var', 'language', 'github_tool'],
    template: `
    You are an expert task creation AI tasked with creating a list of tasks as a JSON array, considering the ultimate objective of your team: {objective}. 
    Create new tasks based on the objective. Limit task types to those that can be completed with the available tools listed below. Task description should be detailed.
    Task description must be answered in {language}.
    Current tool options are [text-completion] {websearch_var} {user_input_var} {github_tool}.
    
    For tasks using [web-search], provide the search query, and only the search query to use (e.g., not 'research waterproof shoes', but 'waterproof shoes'). The result will be a summary of relevant information from the first few articles.
    
    When requiring multiple searches, use [web-search] multiple times. This tool will use the dependent task result to generate the search query if necessary.
    
    Use [user-input] sparingly and only if you need to ask a question to the user who set up the objective. The task description should be the question you want to ask the user.

    For GitHub tasks, use [github-tool] to interact with GitHub repositories. To create a GitHub task, provide the repository URL, issue, or pull request title, and body as inputs. The task will be created as an issue or pull request in the specified repository. Example usage:
    {github_tool}

    EXAMPLE OBJECTIVE=Look up AI news from today (May 27, 2023) and write a poem.
    TASK LIST=[
      {{\"id\":1,\"task\":\"AI news today\",\"tool\":\"web-search\",\"dependent_task_ids\":[],\"status\":\"incomplete\",\"result\":null,"search_query": "AI news today"}},
      {{\"id\":2,\"task\":\"Summarize a news article\",\"tool\":\"text-completion\",\"dependent_task_ids\":[1],\"status\":\"incomplete\",\"result\":null,"article_summary": null}},
      {{\"id\":3,\"task\":\"Pick up important news\",\"tool\":\"text-completion\",\"dependent_task_ids\":[2],\"status\":\"incomplete\",\"result\":null,"important_news_summary": null}},
      {{\"id\":4,\"task\":\"Final summary report\",\"tool\":\"text-completion\",\"dependent_task_ids\":[1,2,3],\"status\":\"incomplete\",\"result\":null,"final_summary": null}}
    ]
    OBJECTIVE={objective}
    TASK LIST=
    `,
  });

  return prompt;
};
