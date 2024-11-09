'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SmilePlus,
  History,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
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
};

type FeelingsTabProps = {
  selectedEmojis: string[];
  setSelectedEmojis: Dispatch<SetStateAction<string[]>>;
  aiResponse: AIResponse | null;
  setAIResponse: Dispatch<SetStateAction<AIResponse | null>>;
  saveEmotion: (emojis: string[], response: AIResponse) => void;
};

type HistoryTabProps = {
  emotionHistory: Emotion[];
};

type SettingsTabProps = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
};

// AI response function
const getAIResponse = async (selectedEmojis: string[]): Promise<AIResponse> => {
  const prompt = `Based on the following emojis representing the user's current emotions: ${selectedEmojis.join(
    ' '
  )}, provide a short message of understanding (1-2 sentences) and a suggestion for an activity to improve their mood (1 sentence). Format the response as a JSON object with 'message' and 'suggestion' fields.`;

  console.log('Prompt sent:', prompt);

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
    console.log('API Response:', content);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw new Error('API request failed');
  }
};

const FeelingsTab: React.FC<FeelingsTabProps> = ({
  selectedEmojis,
  setSelectedEmojis,
  aiResponse,
  setAIResponse,
  saveEmotion,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const emojis = [
    '😄', '😢', '😡', '😊', '😔', '😰', '😴', '🤔', '😍', '🥳', '😎', '🤯', '🥰', '😤', '😇', '🤩', '😱', '🤗', '😌', '🙄', '😒', '🤪', '😳', '🥺',
  ];

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmojis((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  const handleGetSuggestion = async () => {
    if (selectedEmojis.length > 0) {
      setIsLoading(true);
      try {
        const response = await getAIResponse(selectedEmojis);
        setAIResponse(response);
        saveEmotion(selectedEmojis, response);
      } catch (error) {
        console.error('Failed to get AI suggestion:', error);
        setAIResponse({
          message: "Sorry, I couldn't process your request at this time.",
          suggestion: 'Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="flex flex-col text-2xl font-semibold text-black dark:text-white mb-4 items-center justify-between">
        How are you feeling?
      </h2>
      <ScrollArea className="h-48 w-full rounded-md border p-4">
        <div className="grid grid-cols-4 gap-4">
          {emojis.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmojiClick(emoji)}
              className={`text-4xl p-2 rounded-full ${
                selectedEmojis.includes(emoji)
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </ScrollArea>
      <Button
        onClick={handleGetSuggestion}
        className="w-full"
        disabled={isLoading || selectedEmojis.length === 0}
      >
        {isLoading ? 'Getting AI Suggestion...' : 'Get AI Suggestion'}
      </Button>
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-black rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                AI Suggestion
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAIResponse(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-black dark:text-white mb-2">
              {aiResponse.message}
            </p>
            <p className="text-black dark:text-white font-medium">
              {aiResponse.suggestion}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HistoryTab: React.FC<HistoryTabProps> = ({ emotionHistory }) => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  return (
    <div>
      <h2 className="flex flex-col items-center text-2xl font-semibold text-black dark:text-white mb-4">
        Emotion History
      </h2>
      {emotionHistory.length > 0 ? (
        <ul className="space-y-4">
          {emotionHistory.map((emotion, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-black rounded-lg shadow p-4"
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
                  className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded"
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
        <p className="text-black dark:text-white">
          No emotion history yet.
        </p>
      )}
    </div>
  );
};

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings }) => {
  const handleSettingChange = (key: keyof AppSettings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="flex flex-col items-center text-2xl font-semibold text-black dark:text-white mb-4">
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
            onCheckedChange={() => handleSettingChange('darkMode')}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="text-black dark:text-white">
            Enable Notifications
          </Label>
          <Switch
            id="notifications"
            checked={settings.notificationsEnabled}
            onCheckedChange={() => handleSettingChange('notificationsEnabled')}
          />
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
  });

  useEffect(() => {
    const storedHistory = localStorage.getItem('emotionHistory');
    if (storedHistory) {
      setEmotionHistory(JSON.parse(storedHistory));
    }

    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
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
    localStorage.setItem('emotionHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        settings.darkMode ? 'dark bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <main className="flex-grow p-4 pb-24 w-full">
        <h1 className="text-4xl font-black text-center mb-8">
          MoodMate
        </h1>
        <Tabs
          value={activeTab}
          className="w-full flex flex-col min-h-screen"
          onValueChange={setActiveTab}
        >
          <TabsList className="fixed bottom-0 right-0 left-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 w-full h-[55px] rounded-bl-none rounded-br-none">
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
          <TabsContent value="feelings" className="flex-grow">
            <FeelingsTab
              selectedEmojis={selectedEmojis}
              setSelectedEmojis={setSelectedEmojis}
              aiResponse={aiResponse}
              setAIResponse={setAIResponse}
              saveEmotion={saveEmotion}
            />
          </TabsContent>
          <TabsContent value="history" className="flex-grow">
            <HistoryTab emotionHistory={emotionHistory} />
          </TabsContent>
          <TabsContent value="settings" className="flex-grow">
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