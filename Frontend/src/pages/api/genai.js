import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

const inferExternalLink = (task) => {
  if (!task || typeof task !== 'object') return undefined;

  const explicit = typeof task.externalLink === 'string' ? task.externalLink.trim() : '';
  if (explicit && explicit.startsWith('http')) return explicit;

  const haystack = `${task.title || ''} ${task.description || ''}`.toLowerCase();

  if (/(leetcode|hackerrank|coding|programming|interview|dev practice|code challenge|software engineering|practice problems)/i.test(haystack)) {
    return 'https://leetcode.com/';
  }

  if (/(box breathing|deep breathing|breathwork|breathe|breathing|calm down|stress relief|panic)/i.test(haystack)) {
    return 'https://www.youtube.com/results?search_query=box+breathing+exercise';
  }

  if (/(anxiety|stress|overwhelmed|burnout|nervous|worry)/i.test(haystack)) {
    return 'https://www.calm.com/';
  }

  if (/(sleep|insomnia|tired)/i.test(haystack)) {
    return 'https://www.sleepfoundation.org/';
  }

  if (/(reading|article|learn|resource|study|research|informational)/i.test(haystack)) {
    return 'https://www.verywellmind.com/';
  }

  return undefined;
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { promptType, messages, diaryText, systemPrompt } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    let promptContents;

    if (promptType === 'orchestrator') {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array required for orchestrator' });
      }

      promptContents = [
        {
          type: 'text',
          text: `You are the You Matter wellness orchestrator. Support the user with empathy, practical next steps, and no diagnosis.
Only address mental health, emotional support, stress management, mindfulness, healthy habits, journaling, and the features available in this app.
Create no more than four small, optional actions. Use these task types only: meditation, journal, assessment, resources, custom.
Return ONLY valid JSON with this exact shape:
{
  "message": "short supportive response",
  "tasks": [
    {
      "id": "stable-kebab-case-id",
      "title": "short action title",
      "description": "why this may help",
      "type": "meditation|journal|assessment|resources|custom",
      "durationMinutes": 5,
      "status": "available",
      "externalLink": "https://example.com/optional-link"
    }
  ]
}
Use externalLink only for extra tasks that are not built-in app actions. For meditation, journal, assessment, and resources tasks, leave externalLink empty or omit it. If a task is custom and matches the user's context, choose a relevant public site like:
- coding/test stress -> https://leetcode.com/
- breathing/calming -> https://www.youtube.com/results?search_query=box+breathing+exercise or https://www.calm.com/
- general anxiety/stress -> https://www.calm.com/
- sleep issues -> https://www.sleepfoundation.org/
- learning/resource task -> https://www.verywellmind.com/
Do not invent clinical diagnoses or claim certainty. If the user expresses immediate danger or self-harm intent, prioritize emergency help and crisis resources instead of a normal plan.`
        },
        {
          type: 'text',
          text: messages.map((message) => `${message.role}: ${message.content}`).join('\n')
        }
      ];
    } else if (promptType === 'chat') {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array required for chat' });
      }
      promptContents = messages.map((msg) => ({ type: 'text', text: msg.content }));
    } else if (promptType === 'reflection') {
      if (!diaryText || !systemPrompt) {
        return res.status(400).json({ error: 'diaryText and systemPrompt are required for reflection' });
      }
      promptContents = [
        { type: 'text', text: systemPrompt },
        { type: 'text', text: diaryText },
      ];
    } else {
      return res.status(400).json({ error: 'Invalid prompt type' });
    }

    let responseText;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptContents,
      });
      responseText = response.text;
    } catch (err) {
      if (err?.message?.includes('503') || err?.message?.includes('high demand') || err?.status === 503 || err?.status === 'UNAVAILABLE') {
        console.warn('Fallback to Groq API due to high demand on gemini-3.6-flash', err?.message);

        if (!process.env.GROQ_API_KEY) {
          throw new Error("GROQ_API_KEY environment variable is missing for Groq fallback");
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        let groqMessages = [];
        if (promptType === 'orchestrator' || promptType === 'reflection') {
          groqMessages = [
            { role: 'system', content: promptContents[0].text },
            { role: 'user', content: promptContents[1].text }
          ];
        } else {
          groqMessages = messages.map(m => ({
            role: m.role === 'bot' ? 'assistant' : m.role,
            content: m.content
          }));
        }

        const groqResponse = await groq.chat.completions.create({
          messages: groqMessages,
          model: 'llama-3.1-8b-instant',
        });

        responseText = groqResponse.choices[0]?.message?.content;
      } else {
        throw err;
      }
    }

    if (promptType !== 'orchestrator') {
      return res.status(200).json({ text: responseText });
    }

    const rawText = responseText?.trim() || '';
    let jsonText = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    const plan = JSON.parse(jsonText);
    const tasks = Array.isArray(plan.tasks) ? plan.tasks.slice(0, 4).map((task, index) => {
      const normalizedTask = {
        id: typeof task.id === 'string' ? task.id : `wellness-task-${index + 1}`,
        title: typeof task.title === 'string' ? task.title : 'Small wellness step',
        description: typeof task.description === 'string' ? task.description : '',
        type: ['meditation', 'journal', 'assessment', 'resources', 'custom'].includes(task.type) ? task.type : 'custom',
        durationMinutes: Number.isFinite(task.durationMinutes) ? Math.max(1, Math.min(60, task.durationMinutes)) : undefined,
        status: 'available',
        completed: false,
      };

      return {
        ...normalizedTask,
        externalLink: inferExternalLink(normalizedTask),
      };
    }) : [];

    return res.status(200).json({
      text: typeof plan.message === 'string' ? plan.message : 'Here is a small plan for your next step.',
      tasks,
    });
  } catch (error) {
    console.error('GenAI API error:', error);
    const message = error?.message || 'Unknown error from GenAI API';
    return res.status(500).json({ error: message });
  }
};

export default handler;
