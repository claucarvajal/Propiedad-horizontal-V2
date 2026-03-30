import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, FileText } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Set up pdfjs worker
//pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Document {
  nombre: string;
  file_url: string;
}

export function Chatbot({ complexId, complexName }: { complexId: string, complexName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `¡Hola! Soy tu asistente inteligente del conjunto ${complexName}. ¿En qué puedo ayudarte hoy?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [extractedContext, setExtractedContext] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [complexId]);

  const fetchDocuments = async () => {
    try {
      // Intentamos buscar por complex_id (ID real) o nombre_conjunto (por compatibilidad)
      const { data, error } = await supabase
        .from('documentos')
        .select('nombre, file_url')
        .or(`complex_id.eq.${complexId},nombre_conjunto.eq.${complexName}`);
      
      if (error) throw error;
      if (data) setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents for chatbot:", err);
    }
  };

  // Extract text only when documents change
  useEffect(() => {
    if (documents.length > 0) {
      prepareContext();
    }
  }, [documents]);

  const prepareContext = async () => {
    if (isExtracting || extractedContext) return;
    
    setIsExtracting(true);
    console.log("[Chatbot] Iniciando extracción de texto de PDFs...");
    try {
      const pdfTexts = await Promise.all(
        documents.map(async (doc) => {
          console.log(`[Chatbot] Procesando: ${doc.nombre}`);
          const text = await getPdfText(doc.file_url);
          return `--- DOCUMENTO: ${doc.nombre} ---\n${text}`;
        })
      );
      
      const fullContext = pdfTexts.filter(text => text.length > 50).join('\n\n');
      setExtractedContext(fullContext);
      console.log("[Chatbot] Extracción completada. Tamaño del contexto:", fullContext.length, "caracteres.");
    } catch (err) {
      console.error("[Chatbot] Error preparando contexto:", err);
    } finally {
      setIsExtracting(false);
    }
  };

const getPdfText = async (url: string) => {
  const pdf = await pdfjsLib.getDocument(url).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map((item: any) => item.str);
    text += strings.join(" ") + "\n";
  }

  return text;
};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (isExtracting) {
      setMessages(prev => [...prev, { role: 'model', text: "Todavía estoy procesando los manuales, por favor espera un momento..." }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY
      });
      
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { 
            role: 'user', 
            parts: [{ text: `CONTEXTO DE LOS MANUALES DEL CONJUNTO:\n${extractedContext || "No hay documentos disponibles."}\n\nPREGUNTA DEL RESIDENTE: ${userMessage}` }] 
          }
        ],
        config: {
          systemInstruction: `Eres un extractor de texto ultra-fiel para manuales de convivencia.
Tu ÚNICA misión es encontrar la respuesta a la pregunta del usuario dentro del CONTEXTO proporcionado y copiarla PALABRA POR PALABRA.

REGLAS ABSOLUTAS:
1. NO parafrasees. NO resumas. NO expliques. NO uses tus propias palabras.
2. COPIA Y PEGA el fragmento exacto del documento que responde a la pregunta.
3. Si la respuesta tiene varios puntos (ej. 4.1, 4.2, 4.3), inclúyelos todos exactamente como están escritos.
4. PROHIBIDO usar conocimiento externo, leyes de la Corte Constitucional, o cualquier dato que no esté en el CONTEXTO.
5. Si la información NO está en el CONTEXTO, responde únicamente: "Esta información es de carácter general y no se encuentra en los manuales del conjunto".
6. NO añadidas introducciones como "El manual dice..." o "Aquí tienes la información...". Responde directamente con el texto del manual.
7. respondame que día es hoy`,
        }
      });

      const aiText = response.text || "Lo siento, no pude procesar tu solicitud.";
      console.log("RESPUESTA IA:", aiText);
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Hubo un error al procesar tu mensaje. Por favor intenta de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-400" />
          <h3 className="font-medium">Asistente Inteligente</h3>
        </div>
        {documents.length > 0 && (
          <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-[10px] text-gray-400">
            <FileText size={12} />
            <span>{documents.length} Docs de contexto</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "max-w-[80%] p-3 rounded-2xl text-sm",
              msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
            )}>
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                <Markdown>
                  {msg.text}
                </Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
