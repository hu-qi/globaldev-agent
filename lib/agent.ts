import { fetchRepoSnapshot, type RepoSnapshot } from './github';
import { generateText, safeJsonParse } from './llm';

export type LaunchKit = {
  repo: {
    name: string;
    url: string;
    ownerAvatarUrl: string | null;
    description: string | null;
    language: string | null;
    stars: number;
    topics: string[];
  };
  timeline: Array<{
    agent: string;
    status: 'completed';
    summary: string;
  }>;
  product: {
    category: string;
    coreValue: string;
    targetUsers: string[];
    differentiators: string[];
  };
  positioning: {
    oneLiner: string;
    narrative: string;
    personas: Array<{ name: string; need: string }>;
  };
  launchContent: {
    productHunt: string;
    hackerNews: string;
    reddit: string;
    xThread: string[];
    linkedin: string;
  };
  productHuntAssets: {
    tagline: string;
    shortDescription: string;
    firstComment: string;
    keyFeatures: string[];
    faq: Array<{ question: string; answer: string }>;
    galleryCaptions: string[];
  };
  communityChecks: {
    hackerNews: { risks: string[]; rewrite: string; checklist: string[] };
    reddit: { risks: string[]; rewrite: string; checklist: string[] };
  };
  issueInsights: {
    themes: string[];
    concerns: string[];
    sourceIssueCount: number;
  };
  growthTasks: Array<{
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    reason: string;
  }>;
  result?: { id: string; url: string };
};

function compactRepo(snapshot: RepoSnapshot) {
  return {
    name: snapshot.name,
    description: snapshot.description,
    language: snapshot.language,
    stars: snapshot.stars,
    forks: snapshot.forks,
    openIssues: snapshot.openIssues,
    topics: snapshot.topics,
    readme: snapshot.readme.slice(0, 12000),
    issues: snapshot.issues
  };
}

function fallbackLaunchKit(snapshot: RepoSnapshot): LaunchKit {
  const productName = snapshot.name;
  const language = snapshot.language || 'developer';
  const hasIssues = snapshot.issues.length > 0;
  const productHuntTagline = `${productName} — ${snapshot.description || 'from README to global launch'}`.slice(0, 60);

  return {
    repo: {
      name: productName,
      url: snapshot.htmlUrl,
      ownerAvatarUrl: snapshot.ownerAvatarUrl ?? null,
      description: snapshot.description,
      language: snapshot.language,
      stars: snapshot.stars,
      topics: snapshot.topics
    },
    timeline: [
      { agent: 'Repo Analyzer', status: 'completed', summary: `Read ${productName} metadata, README, and ${snapshot.issues.length} recent issues.` },
      { agent: 'Product Analyst', status: 'completed', summary: 'Extracted product value, target developers, and likely category.' },
      { agent: 'Market Positioning Agent', status: 'completed', summary: 'Created global developer positioning and overseas personas.' },
      { agent: 'Content Agent', status: 'completed', summary: 'Generated Product Hunt, Hacker News, Reddit, X, and LinkedIn launch drafts.' },
      { agent: 'Feedback Agent', status: 'completed', summary: hasIssues ? 'Clustered GitHub issues into feedback themes.' : 'No open issues found; used README-based assumptions.' },
      { agent: 'Growth PM Agent', status: 'completed', summary: 'Converted insights into prioritized launch and product growth tasks.' }
    ],
    product: {
      category: `${language} developer tool`,
      coreValue: snapshot.description || `${productName} helps developers solve a focused workflow problem more efficiently.`,
      targetUsers: ['Open-source maintainers', 'Developer tool builders', 'Indie hackers', 'Technical founders'],
      differentiators: [
        'Starts from the actual repository instead of a generic product brief',
        'Connects developer feedback with global launch messaging',
        'Turns growth insights into GitHub-native execution tasks'
      ]
    },
    positioning: {
      oneLiner: `${productName}: a developer-first tool ready for global launch.`,
      narrative: `For global developers who discover products through GitHub, communities, and technical content, ${productName} should be positioned around practical workflow value, clear documentation, and transparent roadmap signals.`,
      personas: [
        { name: 'Open-source maintainer', need: 'Needs tools that are easy to evaluate, install, and recommend.' },
        { name: 'Startup developer', need: 'Wants practical tooling that saves time without adding workflow complexity.' },
        { name: 'DevRel lead', need: 'Needs crisp messaging, examples, and community-ready assets.' }
      ]
    },
    launchContent: {
      productHunt: `Meet ${productName} — a developer-first project built to make ${snapshot.description || 'technical workflows'} easier. We are launching globally and looking for feedback from builders, maintainers, and technical teams.`,
      hackerNews: `Show HN: ${productName} — ${snapshot.description || 'a developer tool from GitHub'}\n\nI built/maintain ${productName} to solve a recurring developer workflow problem. The project is open for feedback, especially around README clarity, onboarding, and real-world use cases.`,
      reddit: `I am preparing ${productName} for a broader developer audience and would love feedback from people who have solved similar workflow problems. The project is on GitHub, and I am especially interested in whether the README explains the value clearly enough.`,
      xThread: [
        `1/ Preparing ${productName} for a global developer launch.`,
        `2/ The core idea: ${snapshot.description || 'turn a focused developer workflow into a simpler experience.'}`,
        '3/ We are improving README clarity, onboarding examples, and community feedback loops.',
        '4/ Looking for feedback from open-source maintainers and developer tool builders.'
      ],
      linkedin: `${productName} is preparing for a global developer launch. The goal is to make the project easier to understand, evaluate, and adopt for overseas developers through clearer positioning, better documentation, and community-native launch content.`
    },
    productHuntAssets: {
      tagline: productHuntTagline,
      shortDescription: snapshot.description || `${productName} helps developers ship faster with clearer workflows.`,
      firstComment: `Hi Product Hunt! I built/maintain ${productName} to solve a recurring workflow problem for developers.\n\nI would love feedback on:\n- whether the value is clear from the README\n- what use cases you would like to see documented\n- what would block adoption in your team\n\nRepo: ${snapshot.htmlUrl}`,
      keyFeatures: [
        'Fast evaluation from a real GitHub repository snapshot',
        'Platform-native launch drafts across developer communities',
        'Issue insights turned into actionable growth tasks'
      ],
      faq: [
        { question: 'Who is this for?', answer: 'Open-source maintainers, developer tool builders, and indie teams preparing to launch globally.' },
        { question: 'What do I need to run it?', answer: 'A public GitHub repository URL. Configure GMI_API_KEY for live reasoning; otherwise a demo-quality mock kit is generated.' }
      ],
      galleryCaptions: ['Paste a GitHub repo URL', 'Agent timeline and positioning', 'Launch content and community-ready drafts', 'Issue insights and growth task board']
    },
    communityChecks: {
      hackerNews: {
        risks: ['Too marketing-heavy wording', 'Missing concrete technical details', 'Unclear what feedback you want'],
        rewrite: `Show HN: ${productName} — ${snapshot.description || 'a developer tool from GitHub'}\n\nI maintain ${productName} and I am preparing it for a broader developer audience.\n\nWhat I am looking for feedback on:\n- Is the README enough to understand the value in 60 seconds?\n- What examples would make evaluation easier?\n- What would block adoption for your team?\n\nRepo: ${snapshot.htmlUrl}`,
        checklist: ['Include concrete problem + why you built it', 'Keep tone technical and specific', 'Ask for one or two clear feedback questions', 'Add a direct link to the repo and a minimal demo/quickstart if available']
      },
      reddit: {
        risks: ['Looks like self-promotion without context', 'Not tailored to a specific subreddit', 'Does not state what kind of feedback is wanted'],
        rewrite: `I am preparing ${productName} for a global dev audience and would love feedback on the project positioning and onboarding.\n\nWhat I am trying to improve:\n- clearer quickstart\n- more real-world examples\n- less friction for first-time users\n\nRepo: ${snapshot.htmlUrl}\n\nIf you have launched a dev tool before, what would you change first for overseas adoption?`,
        checklist: ['Pick the right subreddit and follow its posting rules', 'Lead with the problem and what you tried', 'Be explicit about the type of feedback you want', 'Avoid salesy language; keep it practical', 'Engage in replies with details and updates']
      }
    },
    issueInsights: {
      themes: hasIssues ? ['Documentation clarity', 'Feature requests', 'Integration questions', 'Bug reports'] : ['README clarity', 'Use case explanation', 'Onboarding examples'],
      concerns: hasIssues ? snapshot.issues.slice(0, 4).map((issue) => issue.title) : ['Need clearer quickstart', 'Need comparison with alternatives', 'Need concrete usage examples'],
      sourceIssueCount: snapshot.issues.length
    },
    growthTasks: [
      { title: 'Rewrite README quickstart for overseas developers', priority: 'High', reason: 'GitHub README is the first conversion surface for global developers.' },
      { title: 'Create Show HN and Product Hunt launch drafts', priority: 'High', reason: 'These channels are highly relevant for developer tool discovery.' },
      { title: 'Add use-case examples for target personas', priority: 'Medium', reason: 'Examples reduce evaluation friction for new users.' },
      { title: 'Create a comparison section against common alternatives', priority: 'Medium', reason: 'Global users need fast differentiation before trying a new tool.' },
      { title: 'Convert top feedback themes into GitHub Issues', priority: 'Low', reason: 'This keeps growth insights connected to the engineering workflow.' }
    ]
  };
}

export async function runGlobalDevAgent(repoUrl: string): Promise<LaunchKit> {
  return runGlobalDevAgentWithProgress(repoUrl);
}

export async function runGlobalDevAgentWithProgress(
  repoUrl: string,
  hooks?: { onStage?: (input: { name: 'repo' | 'llm'; status: 'start' | 'done' }) => void }
): Promise<LaunchKit> {
  hooks?.onStage?.({ name: 'repo', status: 'start' });
  const snapshot = await fetchRepoSnapshot(repoUrl);
  hooks?.onStage?.({ name: 'repo', status: 'done' });

  const fallback = fallbackLaunchKit(snapshot);

  hooks?.onStage?.({ name: 'llm', status: 'start' });
  const response = await generateText([
    {
      role: 'system',
      content: 'You are GlobalDev Agent, a senior AI DevRel strategist. Return only valid JSON matching the requested shape.'
    },
    {
      role: 'user',
      content: `Analyze this GitHub repository and create a Global Launch Kit for overseas developer growth.\n\nReturn JSON with this exact structure:\n{
  "product": {"category": string, "coreValue": string, "targetUsers": string[], "differentiators": string[]},
  "positioning": {"oneLiner": string, "narrative": string, "personas": [{"name": string, "need": string}]},
  "launchContent": {"productHunt": string, "hackerNews": string, "reddit": string, "xThread": string[], "linkedin": string},
  "productHuntAssets": {"tagline": string, "shortDescription": string, "firstComment": string, "keyFeatures": string[], "faq": [{"question": string, "answer": string}], "galleryCaptions": string[]},
  "communityChecks": {"hackerNews": {"risks": string[], "rewrite": string, "checklist": string[]}, "reddit": {"risks": string[], "rewrite": string, "checklist": string[]}},
  "issueInsights": {"themes": string[], "concerns": string[], "sourceIssueCount": number},
  "growthTasks": [{"title": string, "priority": "High" | "Medium" | "Low", "reason": string}]
}\n\nRepository snapshot:\n${JSON.stringify(compactRepo(snapshot), null, 2)}`
    }
  ]);

  const generated = safeJsonParse<Partial<LaunchKit>>(response, {});

  const kit: LaunchKit = {
    ...fallback,
    product: generated.product || fallback.product,
    positioning: generated.positioning || fallback.positioning,
    launchContent: generated.launchContent || fallback.launchContent,
    productHuntAssets: generated.productHuntAssets || fallback.productHuntAssets,
    communityChecks: generated.communityChecks || fallback.communityChecks,
    issueInsights: generated.issueInsights || fallback.issueInsights,
    growthTasks: generated.growthTasks || fallback.growthTasks
  };

  hooks?.onStage?.({ name: 'llm', status: 'done' });
  return kit;
}
