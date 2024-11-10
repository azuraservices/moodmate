'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  SmilePlus,
  History,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  X,
} from 'lucide-react';
import axios from 'axios';

// Types
type Emotion = {
  emoji: string;
  timestamp: number;
  aiResponse: AIResponse | null;
};

type AIResponse = {
  message: string;
  suggestion: string;
};

type AppSettings = {
  darkMode: boolean;
  notificationsEnabled: boolean;
  language: 'en' | 'it';
};

type FeelingsTabProps = {
  selectedEmojis: string[];
  setSelectedEmojis: Dispatch<SetStateAction<string[]>>;
  aiResponse: AIResponse | null;
  setAIResponse: Dispatch<SetStateAction<AIResponse | null>>;
  saveEmotion: (emojis: string[], response: AIResponse) => void;
  language: 'en' | 'it';
};

type HistoryTabProps = {
  emotionHistory: Emotion[];
};

type SettingsTabProps = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
};

// AI Response Dialog Component
const AIResponseDialog = ({
  open,
  onOpenChange,
  aiResponse,
  selectedEmojis,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResponse: AIResponse | null;
  selectedEmojis: string[];
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-full h-full overflow-y-auto">
      <DialogHeader className='items-center justify-center'>
        <DialogTitle>Moodboard</DialogTitle>
        <DialogDescription className="flex flex-col items-center justify-center text-center my-4">
          <span>Based on your emotions:</span>
          <span className="text-5xl mt-6">{selectedEmojis.join(' ')}</span>
        </DialogDescription>
      </DialogHeader>
      {aiResponse && (
        <div className="space-y-4 py-4 p-4">
          <p className="text-black dark:text-white leading-relaxed">
            {aiResponse.message}
          </p>
          <p className="text-black dark:text-white font-bold">
            {aiResponse.suggestion}
          </p>
        </div>
      )}
      <DialogFooter className='items-center justify-center'>
        <Button
          onClick={() => onOpenChange(false)}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-7 w-7" aria-hidden="true" />
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// AI response function
const getAIResponse = async (selectedEmojis: string[], language: 'en' | 'it'): Promise<AIResponse> => {
  const englishPrompt = `Based on the following emojis representing the user's current emotions: ${selectedEmojis.join(
    ' '
  )}, provide a short message of understanding (1-2 sentences) and a suggestion for an activity to improve their mood (1 sentence). Format the response as a JSON object with 'message' and 'suggestion' fields. IMPORTANT JSON! NO OTHER TEXT!`;
  
  const italianPrompt = `Osserva il gruppo di emoji che rappresenta le emozioni attuali dell'utente: ${selectedEmojis.join(
    ' '
  )}. Interpreta questo gruppo come un insieme unico per dedurre l'emozione generale o l'atmosfera che potrebbe riflettere, senza analizzare ogni emoji singolarmente. Fornisci un breve messaggio di comprensione (1-2 frasi) che rifletta questa interpretazione complessiva e suggerisci un'attività specifica, creativa o particolare che possa migliorare il loro umore. Format il risultato come un oggetto JSON con i campi ‘message’ e ‘suggestion’. IMPORTANT JSON! NO OTHER TEXT!`;

  const prompt = language === 'en' ? englishPrompt : italianPrompt;

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    Authorization:
      'Bearer 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',
    'Content-Type': 'application/json',
  };
  const data = {
    model: 'llama-3.2-90b-text-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
    top_p: 1,
    stream: false,
  };

  try {
    const response = await axios.post(url, data, { headers });
    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error: any) {
    console.error('Error fetching AI response:', error);
    return {
      message: "An error occurred while processing your request.",
      suggestion: `Error details: ${error.response ? error.response.data : error.message}`
    };
  }
};

const FeelingsTab: React.FC<FeelingsTabProps> = ({
  selectedEmojis,
  setSelectedEmojis,
  aiResponse,
  setAIResponse,
  saveEmotion,
  language,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  const emojis = [
    '😀', '😢', '😡', '😱', '😃', '😰', '😴', '😊', '😍', '🥳',
    '😆', '😅', '😇', '🤗', '🤔', '😣', '🙄', '😕', '🤪', '😖', '😩', '🥵', '🥶', '😤', '😎', '😞', '😜', '🤫',
    '🤐', '😟', '🥺', '😴', '😌', '💔', '🤑', '😚', '🧐', '😋', '😶', '🤥', '😪', '🤧', '😱', '😲', '💩', '🥰',
    '😏', '😳', '🙃', '😬', '😒', '🤮', '😯', '😠', '🤯', '🥴', '💀', '👻', '👽', '👾', '😷', '🤒', '🤕', '🤢', 
    '💖', '💘', '💝', '💞', '💔', '💋', '💟', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '😇', '😺', '😸', 
    '😹', '😻', '😼', '🙀', '😾', '😿', '🐵', '🙈', '🙉', '🙊', '🤖', '👺', '👹', '☠️', '🧟', '💣', '💬', '🗯️'
  ];

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmojis((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  const handleResetSelection = () => {
    setSelectedEmojis([]);
  };

  const handleGetSuggestion = async () => {
    if (selectedEmojis.length === 0) return;
    setIsLoading(true);
    try {
      const response = await getAIResponse(selectedEmojis, language);
      setAIResponse(response);
      saveEmotion(selectedEmojis, response);
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-black dark:text-white text-center">
        How are you feeling?
      </h2>
      <p className='text-center text-gray-600 dark:text-gray-400 pb-2'>Choose one or multiple emojis</p>
      <ScrollArea className="h-[50vh] flex-grow rounded-[1.6rem] border p-4">
        <div className="grid grid-cols-4 gap-4">
          {emojis.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmojiClick(emoji)}
              className={`text-4xl p-2 rounded-full ${
                selectedEmojis.includes(emoji)
                  ? 'bg-red-100 dark:bg-gray-700'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </ScrollArea>
      <div className="border rounded-[1.6rem] p-2 flex w-full space-x-4">
        <Button
          onClick={handleResetSelection}
          className="p-8 flex space-x-1 w-[30%] bg-red-400"
          disabled={isLoading || selectedEmojis.length === 0}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          onClick={handleGetSuggestion}
          className="p-8 flex space-x-1 w-[70%] bg-black"
          disabled={isLoading || selectedEmojis.length === 0}
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      </div>

      <AIResponseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        aiResponse={aiResponse}
        selectedEmojis={selectedEmojis}
      />
    </div>
  );
};

const HistoryTab: React.FC<HistoryTabProps> = ({ emotionHistory }) => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-black dark:text-white text-center mb-4">
        Emotion History
      </h2>
      <ScrollArea className="flex-grow">
        {emotionHistory.length > 0 ? (
          <ul className="space-y-4">
            {emotionHistory.map((emotion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg border p-4"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedItem(expandedItem === index ? null : index)
                  }
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{emotion.emoji}</span>
                    <span className="text-black dark:text-white">
                      {formatDate(emotion.timestamp)}
                    </span>
                  </div>
                  {expandedItem === index ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {expandedItem === index && emotion.aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-black dark:text-white mb-2">
                      {emotion.aiResponse.message}
                    </p>
                    <p className="text-black dark:text-white font-medium">
                      {emotion.aiResponse.suggestion}
                    </p>
                  </motion.div>
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-black dark:text-white text-center">
            No emotion history yet.
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings }) => {
  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white text-center mb-4">
        Settings
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="text-black dark:text-white">
            Dark Mode
          </Label>
          <Switch
            id="dark-mode"
            checked={settings.darkMode}
            onCheckedChange={(value) => handleSettingChange('darkMode', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="language" className="text-black dark:text-white">
            Lingua
          </Label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value as 'en' | 'it')}
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-[0.8rem] px-2 py-1"
          >
            <option value="en">English</option>
            <option value="it">Italiano</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default function EmotionManagementApp() {
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<Emotion[]>([]);
  const [activeTab, setActiveTab] = useState<string>('feelings');
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    notificationsEnabled: true,
    language: 'en',
  });

  useEffect(() => {
    const storedHistory = localStorage.getItem('emotionHistory');
    if (storedHistory) {
      try {
        setEmotionHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Error loading emotion history:', error);
        localStorage.removeItem('emotionHistory');
      }
    }

    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
        localStorage.removeItem('appSettings');
      }
    }
  }, []);

  const saveEmotion = (emojis: string[], response: AIResponse) => {
    const newEmotion: Emotion = {
      emoji: emojis.join(''),
      timestamp: Date.now(),
      aiResponse: response,
    };
    const updatedHistory = [newEmotion, ...emotionHistory].slice(0, 10);
    setEmotionHistory(updatedHistory);
    try {
      localStorage.setItem('emotionHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving emotion history:', error);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'
      }`}
    >
      <main className="flex-grow p-4 flex flex-col">
        <h1 className="text-4xl font-black text-center mb-4">
          MoodMate
        </h1>
        <Tabs
          value={activeTab}
          className="flex-grow flex flex-col"
          onValueChange={setActiveTab}
        >
          <TabsList className="fixed bottom-0 right-0 left-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 w-full h-[55px] rounded-bl-none rounded-br-none z-50">
            <TabsTrigger value="feelings" className="flex flex-col items-center border-none">
              <SmilePlus className="h-6 w-6" />
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col items-center border-none">
              <History className="h-6 w-6" />
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col items-center border-none">
              <Settings className="h-6 w-6" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="feelings" className="flex-grow overflow-hidden h-full p-0 m-0">
            <FeelingsTab
              selectedEmojis={selectedEmojis}
              setSelectedEmojis={setSelectedEmojis}
              aiResponse={aiResponse}
              setAIResponse={setAIResponse}
              saveEmotion={saveEmotion}
              language={settings.language}
            />
          </TabsContent>
          <TabsContent value="history" className="flex-grow overflow-hidden">
            <HistoryTab emotionHistory={emotionHistory} />
          </TabsContent>
          <TabsContent value="settings" className="flex-grow overflow-hidden">
            <SettingsTab settings={settings} setSettings={setSettings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Utility function to format date
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}