/**
 * Wix Dashboard Project Demo Data
 * Skills, Scenarios, Suites, Target Groups, Prompt Agents, Improvement Runs
 */

import type {
  Skill,
  TestScenario,
  TestSuite,
  TargetGroup,
  ImprovementRun,
  Agent,
  EvalRun,
} from "@lib/types";
import { createSkill, WIX_APP_BUILDER_PROJECT_ID } from "./shared";

// ==========================================
// Wix App Builder Agent (project-specific)
// ==========================================

export const WIX_APP_BUILDER_AGENT: Agent = {
  id: "agent-wix-app-builder",
  type: "custom",
  name: "Wix App Builder",
  description: "AI agent for building Wix applications including dashboard apps, widgets, and Blocks components",
  icon: "layout-dashboard",
  runCommand: "npx",
  runArgs: ["@wix/app-builder", "create"],
  workingDirectory: "./wix-app",
  templateFiles: [
    { targetPath: "wix.config.json", content: '{"type": "app"}' },
    { targetPath: "tsconfig.json", content: '{"compilerOptions": {"jsx": "react-jsx", "strict": true}}' },
  ],
  envVars: {
    WIX_ENV: "development",
  },
  modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
  capabilities: [
    "Dashboard page generation",
    "Widget app creation",
    "Blocks component development",
    "Wix Design System integration",
    "Data management with Wix SDK",
    "Settings and configuration pages",
  ],
  isBuiltIn: false,
  isDefault: false,
  createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

// ==========================================
// Wix Dashboard Skills
// ==========================================

export const WIX_SKILLS: Skill[] = [
  createSkill(
    "skill-wix-dashboard-page",
    WIX_APP_BUILDER_PROJECT_ID,
    "Dashboard Page",
    "Creates Wix CLI dashboard pages with layouts, widgets, and data management",
    `---
name: dashboard-page
version: 1.0.0
author: Wix Team
tags:
  - wix
  - dashboard
  - cli
  - page
allowed-tools: Read, Write, Bash, WixSDK
---

# Dashboard Page

Create comprehensive dashboard pages for Wix applications using the Wix CLI.

## Capabilities

- Create dashboard pages with standard and advanced layouts
- Add widgets (stats, tables, cards, charts)
- Real-time data fetching with Wix SDK
- State management and form handling
- Dark/light theme support
- Use Wix Design System components

## Output Structure

\`\`\`
src/dashboard/pages/{PageName}/
├── page.tsx
├── page.module.css
├── components/
│   └── (page-specific components)
└── index.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-dashboard-page-v1",
        version: 1,
        skillMd: "# Dashboard Page v1",
        metadata: { name: "Dashboard Page", description: "v1 - Standard layouts" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial dashboard page skill",
      },
      {
        id: "skill-wix-dashboard-page-v2",
        version: 2,
        skillMd: "# Dashboard Page v2 - Enhanced widgets and data management",
        metadata: { name: "Dashboard Page", description: "v2 - Better widget and data support" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Added more widget types and data fetching patterns",
      },
    ],
    {
      type: "prompthub",
      promptHubId: "wix-dashboard-page-v2",
      version: "2.1.0",
      lastSyncedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ),
  createSkill(
    "skill-wix-backend-api",
    WIX_APP_BUILDER_PROJECT_ID,
    "Backend API",
    "Creates Wix backend API endpoints with HTTP functions and data management",
    `---
name: backend-api
version: 1.0.0
author: Wix Team
tags:
  - wix
  - backend
  - api
  - http
allowed-tools: Read, Write, Bash, WixData
---

# Backend API

Create backend API endpoints for Wix applications.

## Capabilities

- Create GET/POST/PUT/DELETE HTTP endpoints
- Input validation and error handling
- Authentication and authorization
- Wix Data collections and queries
- External API integrations
- Scheduled jobs and triggers

## Output Structure

\`\`\`
backend/
├── http-functions.ts
├── data.ts
├── helpers/
│   ├── validation.ts
│   └── auth.ts
└── services/
    └── external-api.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-backend-api-v1",
        version: 1,
        skillMd: "# Backend API v1",
        metadata: { name: "Backend API", description: "v1 - Basic endpoints" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial backend API skill",
      },
      {
        id: "skill-wix-backend-api-v2",
        version: 2,
        skillMd: "# Backend API v2 - With middleware and data hooks",
        metadata: { name: "Backend API", description: "v2 - Middleware and data hooks" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Added middleware, data hooks, and better error handling",
      },
    ],
    {
      type: "github",
      repository: "wix-private/backend-skills",
      branch: "main",
      path: "api/SKILL.md",
      lastSyncCommit: "a1b2c3d4e5f6",
      lastSyncedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ),
  createSkill(
    "skill-wix-embedded-script",
    WIX_APP_BUILDER_PROJECT_ID,
    "Embedded Script",
    "Creates embedded scripts for Wix sites with custom functionality",
    `---
name: embedded-script
version: 1.0.0
author: Wix Team
tags:
  - wix
  - embedded
  - script
  - widget
allowed-tools: Read, Write, Bash
---

# Embedded Script

Create embedded scripts that add custom functionality to Wix sites.

## Capabilities

- Create embeddable JavaScript widgets
- DOM manipulation and event handling
- Cross-origin communication
- Custom styling and animations
- Integration with external services
- Responsive design support

## Output Structure

\`\`\`
src/embedded/
├── widget.ts
├── styles.css
├── utils/
│   └── dom-helpers.ts
└── index.ts
\`\`\`
`,
    [
      {
        id: "skill-wix-embedded-script-v1",
        version: 1,
        skillMd: "# Embedded Script v1",
        metadata: { name: "Embedded Script", description: "v1 - Basic widgets" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial embedded script skill",
      },
    ],
    {
      type: "prompthub",
      promptHubId: "wix-embedded-script",
      version: "1.0.0",
      lastSyncedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ),
  createSkill(
    "skill-wix-blueprint-gemini",
    WIX_APP_BUILDER_PROJECT_ID,
    "Generate Blueprint - Gemini",
    "Generates app blueprints using Google Gemini for architecture planning",
    `---
name: generate-blueprint-gemini
version: 1.0.0
author: Wix Team
tags:
  - wix
  - blueprint
  - gemini
  - architecture
allowed-tools: Read, Write
---

# Generate Blueprint - Gemini

Generate comprehensive app blueprints using Google Gemini for architecture and planning.

## Capabilities

- App architecture design
- Component hierarchy planning
- Data model generation
- API endpoint mapping
- File structure recommendations
- Technology stack suggestions

## Output Structure

\`\`\`
blueprints/
├── architecture.md
├── components.md
├── data-models.md
└── api-spec.md
\`\`\`
`,
    [
      {
        id: "skill-wix-blueprint-gemini-v1",
        version: 1,
        skillMd: "# Generate Blueprint - Gemini v1",
        metadata: { name: "Generate Blueprint - Gemini", description: "v1 - Architecture planning" },
        model: { provider: "google", model: "gemini-2.0-flash", temperature: 0.4, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial Gemini blueprint generation skill",
      },
    ]
  ),
  createSkill(
    "skill-wix-blueprint-claude",
    WIX_APP_BUILDER_PROJECT_ID,
    "Generate Blueprint - Claude",
    "Generates app blueprints using Anthropic Claude for architecture planning",
    `---
name: generate-blueprint-claude
version: 1.0.0
author: Wix Team
tags:
  - wix
  - blueprint
  - claude
  - architecture
allowed-tools: Read, Write
---

# Generate Blueprint - Claude

Generate comprehensive app blueprints using Anthropic Claude for architecture and planning.

## Capabilities

- App architecture design
- Component hierarchy planning
- Data model generation
- API endpoint mapping
- File structure recommendations
- Technology stack suggestions

## Output Structure

\`\`\`
blueprints/
├── architecture.md
├── components.md
├── data-models.md
└── api-spec.md
\`\`\`
`,
    [
      {
        id: "skill-wix-blueprint-claude-v1",
        version: 1,
        skillMd: "# Generate Blueprint - Claude v1",
        metadata: { name: "Generate Blueprint - Claude", description: "v1 - Architecture planning" },
        model: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.4, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial Claude blueprint generation skill",
      },
    ]
  ),
  createSkill(
    "skill-wix-blueprint-gpt",
    WIX_APP_BUILDER_PROJECT_ID,
    "Generate Blueprint - GPT",
    "Generates app blueprints using OpenAI GPT for architecture planning",
    `---
name: generate-blueprint-gpt
version: 1.0.0
author: Wix Team
tags:
  - wix
  - blueprint
  - gpt
  - architecture
allowed-tools: Read, Write
---

# Generate Blueprint - GPT

Generate comprehensive app blueprints using OpenAI GPT for architecture and planning.

## Capabilities

- App architecture design
- Component hierarchy planning
- Data model generation
- API endpoint mapping
- File structure recommendations
- Technology stack suggestions

## Output Structure

\`\`\`
blueprints/
├── architecture.md
├── components.md
├── data-models.md
└── api-spec.md
\`\`\`
`,
    [
      {
        id: "skill-wix-blueprint-gpt-v1",
        version: 1,
        skillMd: "# Generate Blueprint - GPT v1",
        metadata: { name: "Generate Blueprint - GPT", description: "v1 - Architecture planning" },
        model: { provider: "openai", model: "gpt-4o", temperature: 0.4, maxTokens: 8192 },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Initial GPT blueprint generation skill",
      },
    ]
  ),
];

// ==========================================
// Wix Dashboard Test Scenarios
// ==========================================

export const WIX_SCENARIOS: TestScenario[] = [
  // Generate Blueprint scenarios
  {
    id: "scenario-blueprint-event-countdown",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-generate-blueprint",
    suiteIds: ["suite-generate-blueprint"],
    name: "Event Countdown",
    description: "Generate a blueprint for an app that displays a site widget with a countdown timer to a specific event",
    triggerPrompt: "Create a Wix app blueprint for an Event Countdown widget. The app should display a customizable countdown timer on the site that counts down to a user-specified date/time. Include settings for styling, timezone support, and what happens when the countdown reaches zero.",
    expectedFiles: [
      { path: "blueprints/architecture.md" },
      { path: "blueprints/components.md" },
    ],
    assertions: [
      { id: "bp-1", type: "file_presence", name: "Architecture doc exists", paths: ["blueprints/architecture.md"], shouldExist: true },
      { id: "bp-2", type: "file_presence", name: "Components doc exists", paths: ["blueprints/components.md"], shouldExist: true },
    ],
    tags: ["blueprint", "widget", "countdown", "timer"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-blueprint-shift-manager",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-generate-blueprint",
    suiteIds: ["suite-generate-blueprint"],
    name: "Shift Manager",
    description: "Generate a blueprint for an employee shift management app with a dashboard page",
    triggerPrompt: "Create a Wix app blueprint for a Shift Manager application. The app should have a dashboard page where managers can create, edit, and assign shifts to employees. Include features for viewing weekly schedules, handling shift swaps, and notifications for upcoming shifts.",
    expectedFiles: [
      { path: "blueprints/architecture.md" },
      { path: "blueprints/data-models.md" },
      { path: "blueprints/api-spec.md" },
    ],
    assertions: [
      { id: "bp-3", type: "file_presence", name: "Architecture doc exists", paths: ["blueprints/architecture.md"], shouldExist: true },
      { id: "bp-4", type: "file_presence", name: "Data models doc exists", paths: ["blueprints/data-models.md"], shouldExist: true },
      { id: "bp-5", type: "file_presence", name: "API spec exists", paths: ["blueprints/api-spec.md"], shouldExist: true },
    ],
    tags: ["blueprint", "dashboard", "shifts", "management"],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-blueprint-order-notification",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-generate-blueprint",
    suiteIds: ["suite-generate-blueprint"],
    name: "Order Notification",
    description: "Generate a blueprint for a backend app that listens to order events and sends Slack notifications",
    triggerPrompt: "Create a Wix app blueprint for an Order Notification service. The app should use backend APIs to listen to Wix eCommerce order events (new order, order paid, order fulfilled) and send formatted notifications to a configured Slack channel. Include settings page for Slack webhook configuration.",
    expectedFiles: [
      { path: "blueprints/architecture.md" },
      { path: "blueprints/api-spec.md" },
    ],
    assertions: [
      { id: "bp-6", type: "file_presence", name: "Architecture doc exists", paths: ["blueprints/architecture.md"], shouldExist: true },
      { id: "bp-7", type: "file_presence", name: "API spec exists", paths: ["blueprints/api-spec.md"], shouldExist: true },
    ],
    tags: ["blueprint", "backend", "notifications", "slack", "orders"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Dashboard Page - App Builder scenarios
  {
    id: "scenario-dashboard-analytics",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-dashboard-app-builder"],
    name: "Analytics Dashboard",
    description: "Create a dashboard page with analytics widgets showing key metrics",
    triggerPrompt: "Create a Wix dashboard page for analytics. Include stat cards showing total visitors, conversion rate, and revenue. Add a line chart for traffic over time and a table showing top-performing pages.",
    expectedFiles: [
      { path: "src/dashboard/pages/analytics/page.tsx" },
      { path: "src/dashboard/pages/analytics/page.module.css" },
    ],
    assertions: [
      { id: "dash-1", type: "file_presence", name: "Page exists", paths: ["src/dashboard/pages/analytics/page.tsx"], shouldExist: true },
      { id: "dash-2", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["dashboard", "analytics", "charts", "stats"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-dashboard-settings",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-dashboard-app-builder"],
    name: "App Settings Page",
    description: "Create a settings page with configuration forms and toggle options",
    triggerPrompt: "Create a Wix dashboard settings page. Include form sections for API configuration (API key input, endpoint URL), notification preferences (email toggles, frequency dropdown), and a danger zone with reset/delete actions.",
    expectedFiles: [
      { path: "src/dashboard/pages/settings/page.tsx" },
    ],
    assertions: [
      { id: "dash-3", type: "file_presence", name: "Settings page exists", paths: ["src/dashboard/pages/settings/page.tsx"], shouldExist: true },
      { id: "dash-4", type: "build_check", name: "TypeScript compiles", command: "npx tsc --noEmit", expectSuccess: true },
    ],
    tags: ["dashboard", "settings", "forms", "configuration"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-dashboard-data-table",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-dashboard-app-builder"],
    name: "Data Management Table",
    description: "Create a dashboard page with a full-featured data table",
    triggerPrompt: "Create a Wix dashboard page for managing products. Include a data table with columns for product name, SKU, price, and stock. Add sorting, filtering by category, pagination, and bulk action buttons (delete, export).",
    expectedFiles: [
      { path: "src/dashboard/pages/products/page.tsx" },
    ],
    assertions: [
      { id: "dash-5", type: "file_presence", name: "Products page exists", paths: ["src/dashboard/pages/products/page.tsx"], shouldExist: true },
      { id: "dash-6", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["dashboard", "table", "data", "pagination", "filtering"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-dashboard-form-wizard",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-dashboard-app-builder"],
    name: "Multi-step Form Wizard",
    description: "Create a dashboard page with a multi-step form wizard",
    triggerPrompt: "Create a Wix dashboard page with a multi-step form wizard for creating a new campaign. Step 1: Campaign details (name, description). Step 2: Audience targeting (age range, location). Step 3: Budget and schedule. Step 4: Review and submit.",
    expectedFiles: [
      { path: "src/dashboard/pages/campaigns/new/page.tsx" },
    ],
    assertions: [
      { id: "dash-7", type: "file_presence", name: "Campaign wizard exists", paths: ["src/dashboard/pages/campaigns/new/page.tsx"], shouldExist: true },
      { id: "dash-8", type: "build_check", name: "TypeScript compiles", command: "npx tsc --noEmit", expectSuccess: true },
    ],
    tags: ["dashboard", "form", "wizard", "multi-step"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Site Widgets - App Builder scenarios
  {
    id: "scenario-widget-contact-form",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-widgets-app-builder"],
    name: "Contact Form Widget",
    description: "Create a customizable contact form widget for site pages",
    triggerPrompt: "Create a Wix site widget for a contact form. Include fields for name, email, phone (optional), and message. Add form validation, success/error states, and styling options configurable from the widget settings panel.",
    expectedFiles: [
      { path: "src/site/widgets/contact-form/widget.tsx" },
      { path: "src/site/widgets/contact-form/settings.tsx" },
    ],
    assertions: [
      { id: "wgt-1", type: "file_presence", name: "Widget exists", paths: ["src/site/widgets/contact-form/widget.tsx"], shouldExist: true },
      { id: "wgt-2", type: "file_presence", name: "Settings panel exists", paths: ["src/site/widgets/contact-form/settings.tsx"], shouldExist: true },
      { id: "wgt-3", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["widget", "form", "contact", "site"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-widget-testimonials",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-widgets-app-builder"],
    name: "Testimonials Carousel",
    description: "Create a testimonials carousel widget with multiple display modes",
    triggerPrompt: "Create a Wix site widget for displaying customer testimonials. Support carousel and grid layouts, include customer photo, name, company, and quote. Add autoplay option, navigation arrows, and dot indicators. Allow customization of colors and fonts.",
    expectedFiles: [
      { path: "src/site/widgets/testimonials/widget.tsx" },
      { path: "src/site/widgets/testimonials/settings.tsx" },
    ],
    assertions: [
      { id: "wgt-4", type: "file_presence", name: "Widget exists", paths: ["src/site/widgets/testimonials/widget.tsx"], shouldExist: true },
      { id: "wgt-5", type: "file_presence", name: "Settings panel exists", paths: ["src/site/widgets/testimonials/settings.tsx"], shouldExist: true },
      { id: "wgt-6", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["widget", "testimonials", "carousel", "site"],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-widget-pricing-table",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-widgets-app-builder"],
    name: "Pricing Table Widget",
    description: "Create a pricing comparison table widget with multiple tiers",
    triggerPrompt: "Create a Wix site widget for a pricing table. Display 3 pricing tiers (Basic, Pro, Enterprise) with feature lists, pricing, and CTA buttons. Support highlighting a recommended tier, toggle for monthly/yearly pricing, and customizable colors.",
    expectedFiles: [
      { path: "src/site/widgets/pricing-table/widget.tsx" },
      { path: "src/site/widgets/pricing-table/settings.tsx" },
    ],
    assertions: [
      { id: "wgt-7", type: "file_presence", name: "Widget exists", paths: ["src/site/widgets/pricing-table/widget.tsx"], shouldExist: true },
      { id: "wgt-8", type: "file_presence", name: "Settings panel exists", paths: ["src/site/widgets/pricing-table/settings.tsx"], shouldExist: true },
      { id: "wgt-9", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["widget", "pricing", "table", "site"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-widget-social-feed",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetGroupId: "tg-wix-app-builder",
    suiteIds: ["suite-widgets-app-builder"],
    name: "Social Media Feed",
    description: "Create a social media feed widget that displays posts from various platforms",
    triggerPrompt: "Create a Wix site widget for displaying a social media feed. Support Instagram and Twitter/X feeds. Display posts in a masonry grid layout with images, captions, and engagement stats. Include settings for selecting platform, number of posts, and refresh interval.",
    expectedFiles: [
      { path: "src/site/widgets/social-feed/widget.tsx" },
      { path: "src/site/widgets/social-feed/settings.tsx" },
    ],
    assertions: [
      { id: "wgt-10", type: "file_presence", name: "Widget exists", paths: ["src/site/widgets/social-feed/widget.tsx"], shouldExist: true },
      { id: "wgt-11", type: "file_presence", name: "Settings panel exists", paths: ["src/site/widgets/social-feed/settings.tsx"], shouldExist: true },
      { id: "wgt-12", type: "build_check", name: "Build succeeds", command: "npm run build", expectSuccess: true },
    ],
    tags: ["widget", "social", "feed", "instagram", "twitter"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Dashboard Test Suites
// ==========================================

export const WIX_SUITES: TestSuite[] = [
  {
    id: "suite-generate-blueprint",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Generate Blueprint",
    description: "Test suite for evaluating blueprint generation across different LLM providers (Gemini, Claude, GPT)",
    scenarioIds: ["scenario-blueprint-event-countdown", "scenario-blueprint-shift-manager", "scenario-blueprint-order-notification"],
    tags: ["blueprint", "architecture", "planning"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-dashboard-app-builder",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Dashboard Page - App Builder",
    description: "Test suite for evaluating dashboard page generation using the Wix App Builder coding agent",
    scenarioIds: ["scenario-dashboard-analytics", "scenario-dashboard-settings", "scenario-dashboard-data-table", "scenario-dashboard-form-wizard"],
    tags: ["dashboard", "app-builder", "pages"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suite-widgets-app-builder",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Site Widgets - App Builder",
    description: "Test suite for evaluating site widget generation using the Wix App Builder coding agent",
    scenarioIds: ["scenario-widget-contact-form", "scenario-widget-testimonials", "scenario-widget-pricing-table", "scenario-widget-social-feed"],
    tags: ["widgets", "app-builder", "site"],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Dashboard Target Groups
// ==========================================

export const WIX_TARGET_GROUPS: TargetGroup[] = [
  {
    id: "tg-wix-app-builder",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Wix App Builder",
    description: "Wix App Builder coding agent for building Wix applications",
    targets: [
      {
        id: "target-app-builder",
        type: "coding_agent",
        agentId: "agent-wix-app-builder",
      },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-wix-dashboard-page",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Dashboard Page",
    description: "Dashboard Page skill for creating Wix CLI dashboard pages",
    targets: [
      {
        id: "target-dashboard-page",
        type: "agent_skill",
        skillId: "skill-wix-dashboard-page",
      },
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-wix-backend-api",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Backend API",
    description: "Backend API skill for creating Wix backend endpoints and data management",
    targets: [
      {
        id: "target-backend-api",
        type: "agent_skill",
        skillId: "skill-wix-backend-api",
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-wix-embedded-script",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Embedded Script",
    description: "Embedded Script skill for creating embeddable widgets and custom functionality",
    targets: [
      {
        id: "target-embedded-script",
        type: "agent_skill",
        skillId: "skill-wix-embedded-script",
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tg-wix-generate-blueprint",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: "Generate Blueprint",
    description: "All blueprint generation skills using different LLM providers (Gemini, Claude, GPT)",
    targets: [
      {
        id: "target-blueprint-gemini",
        type: "agent_skill",
        skillId: "skill-wix-blueprint-gemini",
      },
      {
        id: "target-blueprint-claude",
        type: "agent_skill",
        skillId: "skill-wix-blueprint-claude",
      },
      {
        id: "target-blueprint-gpt",
        type: "agent_skill",
        skillId: "skill-wix-blueprint-gpt",
      },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Wix Dashboard Improvement Runs
// ==========================================

export const WIX_IMPROVEMENT_RUNS: ImprovementRun[] = [
  {
    id: "improve-run-1",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetType: "prompt_agent",
    targetId: "pa-wix-chat-dashboard",
    targetName: "Wix Chat - Dashboard Expert",
    testSuiteId: "suite-dashboard-app-builder",
    testSuiteName: "Dashboard Page - App Builder",
    status: "completed",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-1-1",
        iterationNumber: 1,
        passRate: 62,
        passed: 5,
        failed: 3,
        changes: [],
        feedback: "Initial evaluation shows issues with loading state handling and accessibility. The system prompt lacks specific guidance on error boundaries and ARIA attributes.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Dashboard development expert...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-1-2",
        iterationNumber: 2,
        passRate: 78,
        passed: 7,
        failed: 2,
        changes: [
          {
            field: "systemPrompt",
            before: "...Follow Wix CLI best practices",
            after: "...Follow Wix CLI best practices\n\nAccessibility Requirements:\n- Always include ARIA labels on interactive elements\n- Implement focus management in modals\n- Use semantic HTML elements",
            reason: "Added explicit accessibility guidelines to improve a11y test pass rate",
          },
          {
            field: "temperature",
            before: "0.4",
            after: "0.2",
            reason: "Reduced temperature for more consistent output format",
          },
        ],
        feedback: "Improved accessibility handling. Still failing on complex state management scenarios. Adding more specific guidance on React Query patterns.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Dashboard development expert... (updated with a11y)",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-1-3",
        iterationNumber: 3,
        passRate: 91,
        passed: 8,
        failed: 1,
        changes: [
          {
            field: "systemPrompt",
            before: "...Use React Query or SWR for data fetching",
            after: "...Use React Query or SWR for data fetching\n\nState Management Patterns:\n- Use useQuery with proper staleTime and cacheTime\n- Implement optimistic updates with useMutation\n- Handle loading/error/success states explicitly",
            reason: "Added detailed React Query guidance to fix state management failures",
          },
        ],
        feedback: "Significant improvement achieved. The remaining failure is an edge case with very large datasets. Consider this acceptable for now.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Dashboard development expert... (final version)",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 62,
    finalPassRate: 91,
    improvement: 29,
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "improve-run-2",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetType: "skill",
    targetId: "skill-wix-dashboard-page",
    targetName: "Dashboard Page",
    testSuiteId: "suite-dashboard-app-builder",
    testSuiteName: "Dashboard Page - App Builder",
    status: "completed",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-2-1",
        iterationNumber: 1,
        passRate: 55,
        passed: 4,
        failed: 4,
        changes: [],
        feedback: "Initial evaluation shows the skill generates inconsistent file structures. Missing proper index.ts exports and CSS module patterns.",
        targetSnapshot: {
          skillMd: "# Wix Dashboard Page - Basic\n\nCreate basic dashboard pages...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-2-2",
        iterationNumber: 2,
        passRate: 72,
        passed: 6,
        failed: 2,
        changes: [
          {
            field: "skillMd",
            before: "## Output Structure\n\n```\nsrc/dashboard/pages/{PageName}/\n├── page.tsx\n├── page.module.css\n└── index.ts\n```",
            after: "## Output Structure\n\n```\nsrc/dashboard/pages/{PageName}/\n├── page.tsx        // Main page component\n├── page.module.css // Scoped styles using CSS modules\n└── index.ts        // Re-exports: export { default } from './page'\n```\n\n**IMPORTANT**: Always create the index.ts file with proper exports.",
            reason: "Added explicit file structure requirements with detailed comments",
          },
        ],
        feedback: "File structure is now consistent. Still seeing issues with Design System component usage. Some generated code uses custom components instead of @wix/design-system.",
        targetSnapshot: {
          skillMd: "# Wix Dashboard Page - Basic (v2)\n\nCreate basic dashboard pages...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "iter-2-3",
        iterationNumber: 3,
        passRate: 88,
        passed: 7,
        failed: 1,
        changes: [
          {
            field: "skillMd",
            before: "## Capabilities\n\n- Create dashboard pages with standard layouts",
            after: "## Capabilities\n\n- Create dashboard pages with standard layouts\n\n## Required Components\n\nYou MUST use these @wix/design-system components:\n- `Page`, `Page.Header`, `Page.Content` for layout\n- `Card` for content sections\n- `Table` for data display\n- `Button`, `IconButton` for actions\n- `Loader` for loading states\n\nDo NOT create custom components for these patterns.",
            reason: "Added explicit component requirements to enforce Design System usage",
          },
        ],
        feedback: "Excellent improvement. The skill now consistently uses Design System components and proper file structure.",
        targetSnapshot: {
          skillMd: "# Wix Dashboard Page - Basic (final)\n\nCreate basic dashboard pages...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.3, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 55,
    finalPassRate: 88,
    improvement: 33,
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "improve-run-3",
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    targetType: "prompt_agent",
    targetId: "pa-wix-chat-backend",
    targetName: "Wix Chat - Backend Expert",
    testSuiteId: "suite-generate-blueprint",
    testSuiteName: "Generate Blueprint",
    status: "running",
    maxIterations: 3,
    iterations: [
      {
        id: "iter-3-1",
        iterationNumber: 1,
        passRate: 68,
        passed: 6,
        failed: 3,
        changes: [],
        feedback: "Initial evaluation reveals issues with error handling patterns and input validation. The agent sometimes forgets to validate required parameters.",
        targetSnapshot: {
          systemPrompt: "You are a Wix Backend development expert...",
          modelConfig: { provider: "anthropic", model: "claude-3-5-sonnet-20241022", temperature: 0.2, maxTokens: 8192 },
        },
        evaluatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
    initialPassRate: 68,
    finalPassRate: 68,
    improvement: 0,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// Hand-Crafted Eval Runs for Wix App Builder
// Shows realistic trends: improvements, regressions, cost changes
// ==========================================

/**
 * Helper to create an EvalRun with specific metrics
 */
function createEvalRun(params: {
  id: string;
  name: string;
  skillId: string;
  skillName: string;
  scenarioId: string;
  scenarioName: string;
  daysAgo: number;
  hoursAgo?: number;
  passRate: number;
  passed: number;
  failed: number;
  totalDuration: number;
  costUsd: number;
  totalTokens: number;
  model: string;
  provider: "anthropic" | "openai" | "google";
  agentId?: string;
  agentName?: string;
}): EvalRun {
  const now = new Date();
  const startDate = new Date(now.getTime() - params.daysAgo * 24 * 60 * 60 * 1000 - (params.hoursAgo || 0) * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + params.totalDuration + 5000);

  return {
    id: params.id,
    projectId: WIX_APP_BUILDER_PROJECT_ID,
    name: params.name,
    skillId: params.skillId,
    skillName: params.skillName,
    config: {
      scenarioIds: [params.scenarioId],
      agentIds: params.agentId ? [params.agentId] : [],
      parallelism: 1,
      timeout: 60000,
    },
    status: "completed",
    progress: 100,
    results: [{
      id: `result-${params.id}`,
      skillVersionId: `${params.skillId}-v1`,
      modelConfig: { provider: params.provider, model: params.model, temperature: 0.3, maxTokens: 8192 },
      agentId: params.agentId,
      agentName: params.agentName,
      scenarioId: params.scenarioId,
      scenarioName: params.scenarioName,
      assertionResults: [],
      passed: params.passed,
      failed: params.failed,
      passRate: params.passRate,
      duration: params.totalDuration,
      metrics: {
        totalAssertions: params.passed + params.failed,
        passed: params.passed,
        failed: params.failed,
        skipped: 0,
        errors: 0,
        passRate: params.passRate,
        avgDuration: params.totalDuration / (params.passed + params.failed),
        totalDuration: params.totalDuration,
      },
    }],
    aggregateMetrics: {
      totalAssertions: params.passed + params.failed,
      passed: params.passed,
      failed: params.failed,
      skipped: 0,
      errors: 0,
      passRate: params.passRate,
      avgDuration: params.totalDuration / (params.passed + params.failed),
      totalDuration: params.totalDuration,
    },
    llmTraceSummary: {
      totalSteps: Math.floor(params.totalTokens / 800),
      totalDurationMs: params.totalDuration,
      totalTokens: {
        prompt: Math.floor(params.totalTokens * 0.7),
        completion: Math.floor(params.totalTokens * 0.3),
        total: params.totalTokens,
      },
      totalCostUsd: params.costUsd,
      stepTypeBreakdown: {
        completion: { count: 3, durationMs: params.totalDuration * 0.4, tokens: Math.floor(params.totalTokens * 0.5), costUsd: params.costUsd * 0.5 },
        tool_use: { count: 5, durationMs: params.totalDuration * 0.3, tokens: Math.floor(params.totalTokens * 0.3), costUsd: params.costUsd * 0.3 },
        thinking: { count: 2, durationMs: params.totalDuration * 0.3, tokens: Math.floor(params.totalTokens * 0.2), costUsd: params.costUsd * 0.2 },
      },
      modelBreakdown: {
        [params.model]: { count: 10, durationMs: params.totalDuration, tokens: params.totalTokens, costUsd: params.costUsd },
      },
      modelsUsed: [params.model],
    },
    startedAt: startDate.toISOString(),
    completedAt: endDate.toISOString(),
  };
}

export const WIX_EVAL_RUNS: EvalRun[] = [
  // ==========================================
  // Story A: Dashboard Page - Score Improvement
  // 65% → 78% → 88% over 14 days, cost stable ~$0.12
  // ==========================================
  createEvalRun({
    id: "eval-dash-1",
    name: "Dashboard Page - Analytics (baseline)",
    skillId: "skill-wix-dashboard-page",
    skillName: "Dashboard Page",
    scenarioId: "scenario-dashboard-analytics",
    scenarioName: "Analytics Dashboard",
    daysAgo: 14,
    passRate: 65,
    passed: 13,
    failed: 7,
    totalDuration: 42000,
    costUsd: 0.11,
    totalTokens: 12500,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-dash-2",
    name: "Dashboard Page - Analytics (improved prompts)",
    skillId: "skill-wix-dashboard-page",
    skillName: "Dashboard Page",
    scenarioId: "scenario-dashboard-analytics",
    scenarioName: "Analytics Dashboard",
    daysAgo: 7,
    passRate: 78,
    passed: 16,
    failed: 5,
    totalDuration: 44000,
    costUsd: 0.12,
    totalTokens: 13200,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-dash-3",
    name: "Dashboard Page - Analytics (optimized)",
    skillId: "skill-wix-dashboard-page",
    skillName: "Dashboard Page",
    scenarioId: "scenario-dashboard-analytics",
    scenarioName: "Analytics Dashboard",
    daysAgo: 2,
    passRate: 88,
    passed: 18,
    failed: 2,
    totalDuration: 43000,
    costUsd: 0.12,
    totalTokens: 13000,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // ==========================================
  // Story B: Backend API - Cost Optimization  
  // Cost: $0.18 → $0.14 → $0.09, score stable ~82%
  // Switched from Claude to GPT-4 Turbo (cheaper)
  // ==========================================
  createEvalRun({
    id: "eval-backend-1",
    name: "Backend API - Order Notification (Claude)",
    skillId: "skill-wix-backend-api",
    skillName: "Backend API",
    scenarioId: "scenario-blueprint-order-notification",
    scenarioName: "Order Notification",
    daysAgo: 10,
    passRate: 83,
    passed: 10,
    failed: 2,
    totalDuration: 38000,
    costUsd: 0.18,
    totalTokens: 18500,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-backend-2",
    name: "Backend API - Order Notification (GPT-4 Turbo)",
    skillId: "skill-wix-backend-api",
    skillName: "Backend API",
    scenarioId: "scenario-blueprint-order-notification",
    scenarioName: "Order Notification",
    daysAgo: 5,
    passRate: 81,
    passed: 10,
    failed: 2,
    totalDuration: 35000,
    costUsd: 0.14,
    totalTokens: 16200,
    model: "gpt-4-turbo",
    provider: "openai",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-backend-3",
    name: "Backend API - Order Notification (optimized)",
    skillId: "skill-wix-backend-api",
    skillName: "Backend API",
    scenarioId: "scenario-blueprint-order-notification",
    scenarioName: "Order Notification",
    daysAgo: 1,
    passRate: 82,
    passed: 10,
    failed: 2,
    totalDuration: 32000,
    costUsd: 0.09,
    totalTokens: 11800,
    model: "gpt-4-turbo",
    provider: "openai",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // ==========================================
  // Story C: Embedded Script - Duration Regression
  // Duration: 45s → 62s → 89s, score stable ~75%
  // New assertions added complexity
  // ==========================================
  createEvalRun({
    id: "eval-embed-1",
    name: "Embedded Script - Contact Form (v1)",
    skillId: "skill-wix-embedded-script",
    skillName: "Embedded Script",
    scenarioId: "scenario-widget-contact-form",
    scenarioName: "Contact Form Widget",
    daysAgo: 12,
    passRate: 75,
    passed: 6,
    failed: 2,
    totalDuration: 45000,
    costUsd: 0.08,
    totalTokens: 9200,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-embed-2",
    name: "Embedded Script - Contact Form (added tests)",
    skillId: "skill-wix-embedded-script",
    skillName: "Embedded Script",
    scenarioId: "scenario-widget-contact-form",
    scenarioName: "Contact Form Widget",
    daysAgo: 6,
    passRate: 74,
    passed: 9,
    failed: 3,
    totalDuration: 62000,
    costUsd: 0.10,
    totalTokens: 11500,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-embed-3",
    name: "Embedded Script - Contact Form (more assertions)",
    skillId: "skill-wix-embedded-script",
    skillName: "Embedded Script",
    scenarioId: "scenario-widget-contact-form",
    scenarioName: "Contact Form Widget",
    daysAgo: 3,
    passRate: 76,
    passed: 12,
    failed: 4,
    totalDuration: 89000,
    costUsd: 0.14,
    totalTokens: 15800,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // ==========================================
  // Story D: Generate Blueprint GPT - Score Degradation
  // Score: 91% → 84% → 72%, recent model issues
  // ==========================================
  createEvalRun({
    id: "eval-blueprint-gpt-1",
    name: "Generate Blueprint - Shift Manager (stable)",
    skillId: "skill-wix-blueprint-gpt",
    skillName: "Generate Blueprint - GPT",
    scenarioId: "scenario-blueprint-shift-manager",
    scenarioName: "Shift Manager",
    daysAgo: 8,
    passRate: 91,
    passed: 10,
    failed: 1,
    totalDuration: 28000,
    costUsd: 0.07,
    totalTokens: 8500,
    model: "gpt-4o",
    provider: "openai",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-blueprint-gpt-2",
    name: "Generate Blueprint - Shift Manager (after update)",
    skillId: "skill-wix-blueprint-gpt",
    skillName: "Generate Blueprint - GPT",
    scenarioId: "scenario-blueprint-shift-manager",
    scenarioName: "Shift Manager",
    daysAgo: 4,
    passRate: 84,
    passed: 9,
    failed: 2,
    totalDuration: 31000,
    costUsd: 0.08,
    totalTokens: 9200,
    model: "gpt-4o",
    provider: "openai",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-blueprint-gpt-3",
    name: "Generate Blueprint - Shift Manager (regression)",
    skillId: "skill-wix-blueprint-gpt",
    skillName: "Generate Blueprint - GPT",
    scenarioId: "scenario-blueprint-shift-manager",
    scenarioName: "Shift Manager",
    daysAgo: 1,
    hoursAgo: 3,
    passRate: 72,
    passed: 8,
    failed: 3,
    totalDuration: 34000,
    costUsd: 0.09,
    totalTokens: 10100,
    model: "gpt-4o",
    provider: "openai",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // ==========================================
  // Additional runs for variety
  // ==========================================
  
  // Blueprint comparison: Gemini vs Claude (same scenario)
  createEvalRun({
    id: "eval-blueprint-gemini-1",
    name: "Generate Blueprint - Event Countdown (Gemini)",
    skillId: "skill-wix-blueprint-gemini",
    skillName: "Generate Blueprint - Gemini",
    scenarioId: "scenario-blueprint-event-countdown",
    scenarioName: "Event Countdown",
    daysAgo: 5,
    passRate: 78,
    passed: 7,
    failed: 2,
    totalDuration: 22000,
    costUsd: 0.04,
    totalTokens: 7800,
    model: "gemini-2.0-flash",
    provider: "google",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-blueprint-claude-1",
    name: "Generate Blueprint - Event Countdown (Claude)",
    skillId: "skill-wix-blueprint-claude",
    skillName: "Generate Blueprint - Claude",
    scenarioId: "scenario-blueprint-event-countdown",
    scenarioName: "Event Countdown",
    daysAgo: 5,
    hoursAgo: 2,
    passRate: 89,
    passed: 8,
    failed: 1,
    totalDuration: 35000,
    costUsd: 0.11,
    totalTokens: 12200,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // Recent widget tests
  createEvalRun({
    id: "eval-widget-testimonials",
    name: "Site Widget - Testimonials Carousel",
    skillId: "skill-wix-embedded-script",
    skillName: "Embedded Script",
    scenarioId: "scenario-widget-testimonials",
    scenarioName: "Testimonials Carousel",
    daysAgo: 2,
    hoursAgo: 8,
    passRate: 85,
    passed: 11,
    failed: 2,
    totalDuration: 52000,
    costUsd: 0.11,
    totalTokens: 12800,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
  createEvalRun({
    id: "eval-widget-pricing",
    name: "Site Widget - Pricing Table",
    skillId: "skill-wix-embedded-script",
    skillName: "Embedded Script",
    scenarioId: "scenario-widget-pricing-table",
    scenarioName: "Pricing Table Widget",
    daysAgo: 1,
    hoursAgo: 12,
    passRate: 92,
    passed: 11,
    failed: 1,
    totalDuration: 48000,
    costUsd: 0.10,
    totalTokens: 11500,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // Dashboard settings test  
  createEvalRun({
    id: "eval-dash-settings",
    name: "Dashboard Page - Settings Form",
    skillId: "skill-wix-dashboard-page",
    skillName: "Dashboard Page",
    scenarioId: "scenario-dashboard-settings",
    scenarioName: "App Settings Page",
    daysAgo: 3,
    passRate: 81,
    passed: 9,
    failed: 2,
    totalDuration: 39000,
    costUsd: 0.10,
    totalTokens: 11200,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),

  // Most recent run (today)
  createEvalRun({
    id: "eval-dash-wizard",
    name: "Dashboard Page - Form Wizard",
    skillId: "skill-wix-dashboard-page",
    skillName: "Dashboard Page",
    scenarioId: "scenario-dashboard-form-wizard",
    scenarioName: "Multi-step Form Wizard",
    daysAgo: 0,
    hoursAgo: 2,
    passRate: 86,
    passed: 12,
    failed: 2,
    totalDuration: 55000,
    costUsd: 0.13,
    totalTokens: 14200,
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    agentId: "agent-wix-app-builder",
    agentName: "Wix App Builder",
  }),
].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());