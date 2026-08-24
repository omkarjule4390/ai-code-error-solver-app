import { supabase, isMockMode } from '@/supabaseClient'
import type { AiAnalysis, ErrorAnalysisPayload } from '@/types'

function getSimulatedAnalysis(payload: ErrorAnalysisPayload): AiAnalysis {
  const isJsTs = ['javascript', 'typescript'].includes(payload.programmingLanguage.toLowerCase())
  const isPython = payload.programmingLanguage.toLowerCase() === 'python'

  if (isJsTs) {
    return {
      errorType: 'TypeError',
      rootCause: 'Cannot read properties of undefined (reading \'map\')',
      explanation: 'You are attempting to call the `.map()` method on an object or variable that resolves to `undefined`. This commonly happens when a component attempts to render dynamic list data before the backend API returns it, or when there is a typo in the object key reference.',
      lineNumber: 5,
      fileName: 'DataList.tsx',
      originalError: payload.errorMessage,
      correctedCode: payload.codeSnippet.replace(/\.map\(/g, '?.map('),
      solutions: [
        {
          title: 'Use Optional Chaining',
          description: 'Add the optional chaining operator (?.) to verify that the array exists before mapping.',
          code: 'const itemsList = data?.items?.map(item => <li key={item.id}>{item.name}</li>) || [];',
          whenToUse: 'When rendering asynchronous/fetched data that might be null or undefined initially.'
        },
        {
          title: 'Provide Safe Default Initial State',
          description: 'Ensure the state variable is initialized to an empty array instead of undefined.',
          code: 'const [items, setItems] = useState<any[]>([]);',
          whenToUse: 'When setting up React state representing lists/arrays.'
        }
      ],
      bestRecommendation: 'Optional chaining is the quickest and safest inline defense when dealing with external API responses that may occasionally omit fields.',
      preventionTip: 'Enable stricter compiler flags in tsconfig.json (like strictNullChecks) so TypeScript warns you about uninitialized properties at edit time.',
      bestPractices: [
        'Initialize state variables with safe defaults.',
        'Use optional chaining for nested object lookups.',
        'Add defensive fallback UI components (like spinners) while loading.'
      ],
      relatedConcepts: [
        'Optional Chaining',
        'Nullish Coalescing',
        'Asynchronous Rendering',
        'Defensive Coding'
      ],
      severity: 'HIGH',
      confidenceScore: 0.95,
      tokensUsed: 380,
    }
  } else if (isPython) {
    return {
      errorType: 'KeyError',
      rootCause: 'Specified key does not exist in the dictionary.',
      explanation: 'You tried to retrieve a dictionary value using a key index that has not been defined in the dictionary object. Accessing dictionary values via bracket notation `dict[key]` directly raises a KeyError if the key is missing.',
      lineNumber: 3,
      fileName: 'process.py',
      originalError: payload.errorMessage,
      correctedCode: payload.codeSnippet.replace(/data\[['"]([^'"]+)['"]\]/g, 'data.get("$1")'),
      solutions: [
        {
          title: 'Use dictionary .get() method',
          description: 'Replace the bracket index access with `.get()`, which returns None or a specified default value instead of crashing.',
          code: 'user_email = user_data.get("email", "unknown@example.com")',
          whenToUse: 'When retrieving optional keys from dictionary structures.'
        }
      ],
      bestRecommendation: 'Always prefer using .get() with a default fallback value when retrieving values from untrusted external inputs like JSON configs or API payloads.',
      preventionTip: 'Validate input dictionaries using schema definition tools like Pydantic or check key existence using the "in" operator first.',
      bestPractices: [
        'Avoid direct bracket lookup for optional dictionary values.',
        'Use explicit default parameters in .get() calls.',
        'Write robust exception handling: try...except KeyError.'
      ],
      relatedConcepts: [
        'Dictionary methods',
        'Key validation',
        'Exception Handling',
        'Null safety in Python'
      ],
      severity: 'MEDIUM',
      confidenceScore: 0.92,
      tokensUsed: 320,
    }
  } else {
    // General fallback for other programming languages
    return {
      errorType: 'Syntax/Logical Error',
      rootCause: 'General execution error detected in the snippet.',
      explanation: `An issue was found in the submitted ${payload.programmingLanguage} code. Review syntax patterns, import paths, and correct types for key statements.`,
      lineNumber: null,
      fileName: null,
      originalError: payload.errorMessage,
      correctedCode: payload.codeSnippet + '\n// Code verified and formatting corrected.',
      solutions: [
        {
          title: 'Review syntax and signatures',
          description: 'Double check method signatures, types, bracket alignments, and statement terminators.',
          code: payload.codeSnippet,
          whenToUse: 'Always verify structure when syntax errors are thrown.'
        }
      ],
      bestRecommendation: 'Carefully compare the signature parameters with standard language documentations.',
      preventionTip: 'Integrate code linting plugins and IDE formatters to catch issues before execution.',
      bestPractices: [
        'Add proper unit test suites.',
        'Run linters on every commit.'
      ],
      relatedConcepts: [
        'Syntax checking',
        'Code debugging',
        'Clean Code guidelines'
      ],
      severity: 'LOW',
      confidenceScore: 0.88,
      tokensUsed: 210,
    }
  }
}

export const aiSolverApi = {
  /**
   * Calls the `solve-error` Supabase Edge Function, which securely holds the
   * OpenAI API key server-side (see supabase/functions/solve-error/index.ts)
   * and returns a structured AiAnalysis. This never exposes the AI provider
   * key to the browser.
   */
  async analyze(payload: ErrorAnalysisPayload): Promise<AiAnalysis> {
    if (isMockMode) {
      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return getSimulatedAnalysis(payload)
    }

    const { data, error } = await supabase.functions.invoke<AiAnalysis>('solve-error', {
      body: payload,
    })
    if (error) throw error
    if (!data) throw new Error('No response from AI solver')
    return data
  },
}

