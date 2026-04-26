require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const API_URL = process.env.API_URL || 'http://localhost:3001';
const MOBILE_DIR = path.join(__dirname, '../mobile/src');
const BACKEND_DIR = path.join(__dirname, '../backend/src');

// ─── Tool definitions ────────────────────────────────────────────────────────

const tools = [
  {
    name: 'http_request',
    description: 'Make an HTTP request to the SuperDate backend API. Use this to test endpoints.',
    input_schema: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], description: 'HTTP method' },
        path: { type: 'string', description: 'API path e.g. /health or /auth/login' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
        token: { type: 'string', description: 'JWT bearer token if authenticated request' },
      },
      required: ['method', 'path'],
    },
  },
  {
    name: 'read_source_file',
    description: 'Read a source file from the SuperDate project (mobile or backend).',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string', enum: ['mobile', 'backend'], description: 'Which part of the project' },
        relative_path: { type: 'string', description: 'Path relative to src/ e.g. screens/main/DiscoverScreen.tsx' },
      },
      required: ['location', 'relative_path'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in a directory of the SuperDate project.',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string', enum: ['mobile', 'backend'], description: 'Which part of the project' },
        relative_path: { type: 'string', description: 'Path relative to src/ e.g. screens/main or controllers' },
      },
      required: ['location'],
    },
  },
  {
    name: 'write_report',
    description: 'Write the final test results and improvement recommendations to a report file.',
    input_schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Full markdown report content' },
      },
      required: ['content'],
    },
  },
];

// ─── Tool execution ───────────────────────────────────────────────────────────

async function executeTool(name, input) {
  if (name === 'http_request') {
    const { method, path: urlPath, body, token } = input;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const resp = await axios({ method, url: `${API_URL}${urlPath}`, data: body, headers, timeout: 8000 });
      return { status: resp.status, ok: true, data: resp.data };
    } catch (err) {
      const e = err.response;
      return { status: e?.status || 0, ok: false, data: e?.data || { error: err.message } };
    }
  }

  if (name === 'read_source_file') {
    const base = input.location === 'mobile' ? MOBILE_DIR : BACKEND_DIR;
    const filePath = path.join(base, input.relative_path);
    if (!fs.existsSync(filePath)) return { error: `File not found: ${filePath}` };
    const content = fs.readFileSync(filePath, 'utf8');
    return { content: content.slice(0, 6000) }; // limit size
  }

  if (name === 'list_files') {
    const base = input.location === 'mobile' ? MOBILE_DIR : BACKEND_DIR;
    const dir = input.relative_path ? path.join(base, input.relative_path) : base;
    if (!fs.existsSync(dir)) return { error: `Directory not found: ${dir}` };
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return { files: entries.map(e => `${e.isDirectory() ? '[DIR]' : '[FILE]'} ${e.name}`) };
  }

  if (name === 'write_report') {
    const reportPath = path.join(__dirname, 'report.md');
    fs.writeFileSync(reportPath, input.content, 'utf8');
    return { saved: reportPath };
  }

  return { error: `Unknown tool: ${name}` };
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────

async function runAgent() {
  console.log('🤖 SuperDate Testing Agent starting...\n');

  const messages = [
    {
      role: 'user',
      content: `You are a senior QA engineer and product advisor testing the SuperDate dating app.

SuperDate is an Israeli dating app with a unique flow:
1. Swipe (LIKE/PASS) → Match
2. Schedule a 7-minute video "Vibe Check" via Daily.co
3. Both confirm the vibe → Choose a venue & each pays half
4. Chat unlocks only after both pay

Your job:
1. **Test the API** — systematically test all backend endpoints. Start with /health, then register/login test users, test swiping/matching, test the vibe-check flow, test venues, test superdate proposals, test chat (should be locked before payment).
2. **Review the code** — read key mobile screens and backend controllers to identify bugs, UX issues, and missing features.
3. **Write a report** — use write_report to save a comprehensive markdown report with:
   - ✅ Tests that passed
   - ❌ Tests that failed (with details)
   - 🐛 Bugs found in code review
   - 💡 Top 10 improvement recommendations (ranked by impact)

Be thorough. Test edge cases. The API base URL is ${API_URL}.
Start now — run the tests systematically, don't ask for confirmation.`,
    },
  ];

  let iteration = 0;
  const MAX_ITERATIONS = 50;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    process.stdout.write(`\n[Turn ${iteration}] Thinking...`);

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      tools,
      messages,
    });

    // Print assistant text
    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        process.stdout.write('\n' + block.text);
      }
    }

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      console.log('\n\n✅ Agent finished.');
      break;
    }

    if (response.stop_reason !== 'tool_use') break;

    // Process tool calls
    const toolResults = [];
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      process.stdout.write(`\n  🔧 ${block.name}(${JSON.stringify(block.input).slice(0, 80)}...)`);
      const result = await executeTool(block.name, block.input);

      if (block.name === 'write_report') {
        console.log(`\n  📄 Report saved to: ${result.saved}`);
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  if (iteration >= MAX_ITERATIONS) {
    console.log('\n⚠️  Max iterations reached.');
  }

  const reportPath = path.join(__dirname, 'report.md');
  if (fs.existsSync(reportPath)) {
    console.log(`\n📋 Full report: ${reportPath}`);
    console.log('\n' + '─'.repeat(60));
    console.log(fs.readFileSync(reportPath, 'utf8'));
  }
}

runAgent().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
