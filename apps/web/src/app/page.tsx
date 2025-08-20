"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { Button } from "@/components/common/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/common/dropdown-menu";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import VoiceRecorder from "@/components/VoiceRecorder";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const [reminderText, setReminderText] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newReminder, setNewReminder] = useState({ text: "", date: "", time: "", recurring: "none" });
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  // Convex queries
  const priorities = useQuery(api.priorities.list, user?.id ? { userId: user.id } : "skip");
  const reminders = useQuery(api.reminders.list, user?.id ? { userId: user.id } : "skip");

  // Convex mutations
  const createPriority = useMutation(api.priorities.create);
  const togglePriority = useMutation(api.priorities.toggle);
  const removePriority = useMutation(api.priorities.remove);
  const updatePriority = useMutation(api.priorities.update);
  const createReminder = useMutation(api.reminders.create);
  const removeReminder = useMutation(api.reminders.remove);
  const updateReminder = useMutation(api.reminders.update);

  const handleVoiceTranscription = (transcription: string) => {
    console.log("Voice transcription:", transcription);
  };

  const handleVoiceRecordingStopped = () => {
    console.log("Voice recording stopped");
  };

  // Handle AI response from VoiceRecorder
  const handleAIResponse = (aiResponse: string, transcription: string) => {
    console.log("AI Response:", aiResponse);
    console.log("Transcription:", transcription);
  };

  // Handle approval request from VoiceRecorder
  const handleApprovalRequest = (aiResponse: string, transcription: string) => {
    console.log("Approval requested for:", aiResponse);
    console.log("Original transcription:", transcription);
  };

  const handleRecordClick = () => {
    // This is handled by the VoiceRecorder component
    console.log("Record button clicked");
  };

  // Helper function to extract reminder info from voice input
  const extractReminderFromVoice = (text: string) => {
    const patterns = [
      {
        regex: /remind me to (.+?) (tomorrow|today|next week|next month|\d+ days? from now)(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
        extract: (matches: RegExpMatchArray) => ({
          text: matches[1].trim(),
          date: getDateFromText(matches[2]),
          time: extractTimeFromText(text) || "09:00",
          recurring: "none"
        })
      },
      {
        regex: /call (.+?) (tomorrow|today|next week|next month)(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
        extract: (matches: RegExpMatchArray) => ({
          text: `Call ${matches[1].trim()}`,
          date: getDateFromText(matches[2]),
          time: extractTimeFromText(text) || "15:00",
          recurring: "none"
        })
      },
      {
        regex: /schedule (.+?) (tomorrow|today|next week|next month)(?:\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i,
        extract: (matches: RegExpMatchArray) => ({
          text: `Schedule ${matches[1].trim()}`,
          date: getDateFromText(matches[2]),
          time: extractTimeFromText(text) || "09:00",
          recurring: "none"
        })
      }
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern.regex);
      if (matches) {
        const result = pattern.extract(matches);
        console.log('Extracted reminder:', result);
        return result;
      }
    }

    console.log('No pattern matched for text:', text);
    return null;
  };

  // Helper function to extract priority info from voice input
  const extractPriorityFromVoice = (text: string) => {
    let priority = "medium";
    if (text.includes("high priority") || text.includes("urgent") || text.includes("critical")) {
      priority = "high";
    } else if (text.includes("low priority")) {
      priority = "low";
    }

    const taskMatch = text.match(/(?:add priority|set priority|priority|urgent task)\s+(?:to\s+)?(.+?)(?:\s+with\s+\w+\s+priority|\s+urgent|\s+critical|$)/i);
    if (taskMatch) {
      return {
        text: taskMatch[1].trim(),
        priority
      };
    }

    return null;
  };

  // Helper function to extract time from text
  const extractTimeFromText = (text: string): string | null => {
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /at\s+(\d{1,2}):(\d{2})/i,
      /at\s+(\d{1,2})\s*(am|pm)/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3]?.toLowerCase();

        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    return null;
  };

  // Helper function to get date from text
  const getDateFromText = (dateText: string): string => {
    const today = new Date();
    
    switch (dateText.toLowerCase()) {
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      case "today":
        return today.toISOString().split('T')[0];
      case "next week":
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
      case "next month":
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth.toISOString().split('T')[0];
      default:
        const daysMatch = dateText.match(/(\d+)\s*days?\s*from\s*now/i);
        if (daysMatch) {
          const days = parseInt(daysMatch[1]);
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + days);
          return futureDate.toISOString().split('T')[0];
        }
        return today.toISOString().split('T')[0];
    }
  };

  const handleAddReminder = async (reminder: { text: string; date: string; time: string; recurring: string }) => {
    if (!user?.id) return;
    console.log('Adding reminder:', reminder);
    console.log('Date type:', typeof reminder.date, 'Value:', reminder.date);
    console.log('Time type:', typeof reminder.time, 'Value:', reminder.time);
    
    // Validate and format the date
    let formattedDate = reminder.date;
    try {
      const date = new Date(reminder.date);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
        console.log('Formatted date:', formattedDate);
      } else {
        console.error('Invalid date:', reminder.date);
        return;
      }
    } catch (error) {
      console.error('Date parsing error:', error);
      return;
    }
    
    await createReminder({
      text: reminder.text,
      date: formattedDate,
      time: reminder.time,
      recurring: reminder.recurring,
      userId: user.id,
    });
  };

  const handleAddPriority = async (priority: { text: string; priority: string }) => {
    if (!user?.id) return;
    await createPriority({
      text: priority.text,
      priority: priority.priority,
      userId: user.id,
    });
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !reminderText.trim()) return;
    await createReminder({
      text: reminderText,
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      recurring: "none",
      userId: user.id,
    });
    setReminderText("");
  };

  const handlePrioritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newPriority.trim()) return;
    await createPriority({
      text: newPriority,
      priority: "medium",
      userId: user.id,
    });
    setNewPriority("");
  };

  const handleReminderFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newReminder.text.trim() || !newReminder.date) return;
    await createReminder({
      text: newReminder.text,
      date: newReminder.date,
      time: newReminder.time,
      recurring: newReminder.recurring,
      userId: user.id,
    });
    setNewReminder({ text: "", date: "", time: "", recurring: "none" });
  };

  const handleTogglePriority = async (id: string) => {
    await togglePriority({ id: id as Id<"priorities"> });
  };

  const handleDeleteReminder = async (id: string) => {
    await removeReminder({ id: id as Id<"reminders"> });
  };

  const handleDeletePriority = async (id: string) => {
    await removePriority({ id: id as Id<"priorities"> });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-500 bg-red-50";
      case "medium": return "border-yellow-500 bg-yellow-50";
      case "low": return "border-green-500 bg-green-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Menu Bar */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LM</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">LifeMind</h1>
            </div>
            {/* Menu Bar */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setIsChatbotOpen(true)}>
                AI Assistant
              </Button>
              {isSignedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                        <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SignInButton mode="modal">
                  <Button>Sign In</Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Reminder Input */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">⚡</span>
                Quick Reminder
              </h3>
              <form onSubmit={handleReminderSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                  placeholder="Type a quick reminder..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isSignedIn}
                />
                <Button type="submit" className="px-6" disabled={!isSignedIn}>
                  Add
                </Button>
              </form>
            </div>

            {/* Priorities Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">!</span>
                Today&apos;s Priorities
              </h3>
              
              {/* Add Priority Form */}
              <form onSubmit={handlePrioritySubmit} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    placeholder="Add a priority..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isSignedIn}
                  />
                  <Button type="submit" className="px-4" disabled={!isSignedIn}>
                    Add
                  </Button>
                </div>
              </form>

              <div className="space-y-3">
                {!priorities && <div className="text-gray-400">Loading...</div>}
                {priorities && priorities.length === 0 && <div className="text-gray-400">No priorities yet.</div>}
                {priorities && priorities.map((priority: any) => (
                  <div
                    key={priority._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${getPriorityColor(priority.priority)}`}
                  >
                    <input
                      type="checkbox"
                      checked={priority.completed}
                      onChange={() => handleTogglePriority(priority._id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    {editingPriority === priority._id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          defaultValue={priority.text}
                          onBlur={(e) => {
                            updatePriority({
                              id: priority._id as Id<"priorities">,
                              text: e.target.value
                            });
                            setEditingPriority(null);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        />
                        <select
                          defaultValue={priority.priority}
                          onChange={(e) => {
                            updatePriority({
                              id: priority._id as Id<"priorities">,
                              priority: e.target.value
                            });
                            setEditingPriority(null);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 ${priority.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {priority.text}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          priority.priority === 'high' ? 'bg-red-100 text-red-800' :
                          priority.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {priority.priority}
                        </span>
                      </>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPriority(editingPriority === priority._id ? null : priority._id)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        {editingPriority === priority._id ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeletePriority(priority._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminders Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">⏰</span>
                Upcoming Reminders
              </h3>
              
              {/* Add Reminder Form */}
              <form onSubmit={handleReminderFormSubmit} className="mb-6 space-y-3">
                <input
                  type="text"
                  value={newReminder.text}
                  onChange={(e) => setNewReminder({...newReminder, text: e.target.value})}
                  placeholder="Reminder text..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isSignedIn}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isSignedIn}
                  />
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isSignedIn}
                  />
                </div>
                <select
                  value={newReminder.recurring}
                  onChange={(e) => setNewReminder({...newReminder, recurring: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isSignedIn}
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <Button type="submit" className="w-full" disabled={!isSignedIn}>
                  Add Reminder
                </Button>
              </form>

              <div className="space-y-3">
                {!reminders && <div className="text-gray-400">Loading...</div>}
                {reminders && reminders.length === 0 && <div className="text-gray-400">No reminders yet.</div>}
                {reminders && reminders.map((reminder: any) => (
                  <div
                    key={reminder._id}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    {editingReminder === reminder._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          defaultValue={reminder.text}
                          onBlur={(e) => {
                            updateReminder({
                              id: reminder._id as Id<"reminders">,
                              text: e.target.value
                            });
                            setEditingReminder(null);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            defaultValue={reminder.date}
                            onBlur={(e) => {
                              updateReminder({
                                id: reminder._id as Id<"reminders">,
                                date: e.target.value
                              });
                              setEditingReminder(null);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="time"
                            defaultValue={reminder.time}
                            onBlur={(e) => {
                              updateReminder({
                                id: reminder._id as Id<"reminders">,
                                time: e.target.value
                              });
                              setEditingReminder(null);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">{reminder.text}</span>
                          <div className="flex items-center gap-2">
                            {reminder.recurring !== "none" && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {reminder.recurring}
                              </span>
                            )}
                            <button
                              onClick={() => setEditingReminder(editingReminder === reminder._id ? null : reminder._id)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder._id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {(() => {
                            try {
                              const date = new Date(reminder.date);
                              if (isNaN(date.getTime())) {
                                return `Invalid date: ${reminder.date}`;
                              }
                              return `${date.toLocaleDateString()} at ${reminder.time}`;
                            } catch (error) {
                              return `Date error: ${reminder.date}`;
                            }
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chatbot */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-fit sticky top-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">🤖</span>
                AI Assistant
              </h3>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Powered by open-source Whisper + AI models
                </p>
                <Button 
                  onClick={() => setIsChatbotOpen(true)}
                  className="w-full"
                >
                  Open Full Chat
                </Button>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Voice Commands:</strong>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• &quot;Talk&quot; or &quot;AI&quot; - Open AI assistant</div>
                  <div>• &quot;Remind me to call mom tomorrow 10 am&quot;</div>
                  <div>• &quot;Call John next week at 3 pm&quot;</div>
                  <div>• &quot;Schedule meeting with team tomorrow 2:30 pm&quot;</div>
                  <div>• &quot;Add priority to complete project with high priority&quot;</div>
                  <div>• &quot;Urgent task to finish report&quot;</div>
                  <div className="text-xs text-blue-600 mt-2">🔒 Privacy-first, runs locally</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Chatbot Modal */}
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onAddReminder={handleAddReminder}
        onAddPriority={handleAddPriority}
      />
    </div>
  );
}
