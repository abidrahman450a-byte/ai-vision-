
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
DOORKAAGA: Waxaad tahay "AI Vision OS Intelligence". Shaqadaadu waa falanqaynta sawirada iyo muuqaalada (Visual Intelligence).

HAWSHAADA UGU MUHIIMSAN:
1. AQOONSIGA DADKA (PERSON EXTRACTION):
   - DHARKA: Midabka shaadhka, surwaalka, koofiyada, muraayadaha, iyo nooca dharka.
   - JIRKA: Dhererka qiyaasta, jinsiga, iyo muuqaalka wejiga.
   - DHAQDHAQAAQA: Maxuu samaynayaa?
2. RAADINTA (TARGET MATCHING):
   - Haddii uu isticmaalku ku siiyo "TARGET DESCRIPTION", isbarbardhig qofka muuqda iyo qofka la raadinayo.
   - Soo saar "MATCH PERCENTAGE" (Boqolkiiba inta ay is leeyihiin).
3. ANALYTICS: Haddii ay tahay muuqaal (video), sharaxaad ka bixi isbedelka dhacay mudada muuqaalku socdo.

HABKA WARBIXINTA (TACTICAL FORMAT):
[AI_VISION_REPORT]
- XOGTA QOFKA: (Faahfaahin kooban)
- HAWSHA: (Maxuu samaynayaa)
- TARGET MATCH: (Haddii la raadinayo qof: "MATCH FOUND [X]%" ama "NO MATCH")
- DARAAJADA KHATARTA: (LOW/MEDIUM/HIGH)
- FAALLO: (Xog dheeraad ah oo muhiim ah)
`;

export const queryCore = async (prompt: string, contentData?: string, mimeType: string = 'image/jpeg', target?: string): Promise<{text: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const parts: any[] = [];
    
    if (contentData) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: contentData
        }
      });
    }
    
    let fullPrompt = prompt;
    if (target) {
      fullPrompt += `\nTARGET_TO_FIND: ${target}. Isbarbardhig qofka content-ka ku jira iyo qofkan la raadinayo.`;
    }

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    return { text: response.text || "AI_VISION_ERROR: Link unstable." };
  } catch (error: any) {
    console.error("AI Vision Core Error:", error);
    return { text: "CILAD: Neural Link-ga waa offline. Hubi API Key-gaaga ama internet-ka." };
  }
};
