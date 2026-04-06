import { GoogleGenAI, Type } from "@google/genai";
import { Language, ConsoleOutput, OutputType } from '../types';

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in .env.local.");
  }
  return new GoogleGenAI({ apiKey });
};

export const runCode = async (code: string, language: Language): Promise<ConsoleOutput> => {
  try {
    if (!code.trim()) {
      return { type: OutputType.Info, message: "No code to run." };
    }

    if (language === Language.HTML) {
      return { type: OutputType.Info, message: "HTML execution triggered. Please use the 'Web Preview' button in the header to view the rendered page." };
    }
    
    if (language === Language.CSS) {
      return { 
        type: OutputType.Info, 
        message: "CSS execution triggered. Please use the 'Web Preview' button to view styles alongside your HTML." 
      };
    }

    if (language === Language.JavaScript) {
       return new Promise((resolve) => {
         let output = '';
         const originalLog = console.log;
         const originalError = console.error;
         const originalWarn = console.warn;
         
         const capture = (...args: any[]) => {
            output += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
         };
         
         console.log = capture;
         console.error = capture;
         console.warn = capture;

         try {
           // eslint-disable-next-line no-new-func
           const func = new Function(code);
           func();
           resolve({ type: OutputType.Stdout, message: output.trim() || '[No output from script]' });
         } catch (e: any) {
           resolve({ type: OutputType.Error, message: String(e) });
         } finally {
           console.log = originalLog;
           console.error = originalError;
           console.warn = originalWarn;
         }
       });
    }

    const ai = getAiClient();
    const prompt = `
      You are an expert code execution engine. Analyze the following ${language} code.
      Based on your analysis, return a JSON object with two keys: "type" and "message".

      The "type" can be one of four strings: "stdout", "error", "warning", or "info".
      The "message" should contain the corresponding output, error description, warning, or informational text.

      Rules:
      1. If the code executes successfully and produces standard output, set "type" to "stdout" and "message" to the output.
      2. If the code has clear syntax or runtime errors, set "type" to "error" and "message" to a concise error description.
      3. If the code has potential issues, uses deprecated features, or has other non-critical problems but would still run, set "type" to "warning" and "message" to a description of the warning.
      4. If the code executes successfully but produces no output (e.g., only defines a function), set "type" to "info" and "message" to "[No output]".
      5. Return ONLY the raw JSON object. Do not wrap it in markdown backticks or add any other text.

      Code to analyze:
      \`\`\`${language}
      ${code}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: [OutputType.Stdout, OutputType.Error, OutputType.Warning, OutputType.Info]
                },
                message: { type: Type.STRING }
              },
              required: ['type', 'message']
            }
        }
    });
    
    const result = JSON.parse(response.text);

    if (result && typeof result === 'object' && 'type' in result && 'message' in result) {
        return result as ConsoleOutput;
    }

    throw new Error("Invalid response format from API.");

  } catch (error) {
    console.error("Error executing code with Gemini API:", error);
    let errorMessage = "An unknown error occurred while communicating with the API.";
    if (error instanceof Error) {
        errorMessage = `API Error: ${error.message}`;
    }
     if (error instanceof SyntaxError) {
      errorMessage = "API Error: Failed to parse the response from the model. It might not be valid JSON.";
    }
    return { type: OutputType.Error, message: errorMessage };
  }
};

export const formatCode = async (code: string, language: Language): Promise<string> => {
    try {
        const ai = getAiClient();
        if (!code.trim()) {
            return code;
        }

        const prompt = `
            You are an expert code formatter.
            Reformat the following ${language} code to improve readability and adhere to standard style conventions for that language.
            
            Rules:
            1. Return ONLY the formatted code.
            2. Do not add any comments, explanations, or markdown backticks around the code.
            3. Ensure the core logic and functionality of the code remains identical.

            Code to format:
            \`\`\`${language}
            ${code}
            \`\`\`
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });

        // Clean up potential markdown fences from the response
        let formattedCode = response.text;
        const codeBlockRegex = new RegExp(`^\`\`\`(${language})?\\s*([\\s\\S]*?)\`\`\`$`);
        const match = formattedCode.match(codeBlockRegex);

        if (match && match[2]) {
            return match[2].trim();
        }
        
        return formattedCode.trim();

    } catch (error) {
        console.error("Error formatting code with Gemini API:", error);
        throw new Error("Failed to format code. Please try again.");
    }
};

export const getAiAssistantResponse = async (
  prompt: string, 
  allFileContents: string,
  history: any[] = []
) => {
  try {
    const ai = getAiClient();
    
    const fullPrompt = `
      You are an expert AI Coding Assistant named "Code Assistant". 
      You have access to the entire workspace content provided below.
      
      WORKSPACE CONTEXT:
      ${allFileContents}

      USER QUESTION:
      ${prompt}
      
      Respond as a helpful coding assistant. Use the workspace context above to provide specific answers.
    `;

    // Matching the existing pattern from runCode (line 80)
    const response = await (ai as any).models.generateContent({
        model: 'gemini-1.5-flash',
        contents: fullPrompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error in AI Assistant:", error);
    throw error;
  }
};
