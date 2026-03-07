'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Badge, Input } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  PenLine,
  Sparkles,
  FileText,
  CheckCircle2,
  RefreshCw,
  Download,
  Copy,
  Clock,
  BookOpen,
  MessageSquare,
  Settings,
  TrendingUp,
  User,
  Mic,
  Loader2,
} from 'lucide-react';
import type {
  ContentTemplate,
  GeneratedContent,
  StyleGuide,
  VoiceFramework,
  AudiencePersona,
  CustomVoice,
} from '@/lib/types/content-writer';
import { TONE_OPTIONS, CONTENT_CATEGORIES } from '@/lib/types/content-writer';

export default function ContentWriterPage() {
  // State management
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedStyleGuide, setSelectedStyleGuide] = useState<string>('');
  const [selectedVoiceFramework, setSelectedVoiceFramework] = useState<string>('');
  const [selectedCustomVoice, setSelectedCustomVoice] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(500);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Data from database
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [styleGuides, setStyleGuides] = useState<StyleGuide[]>([]);
  const [voiceFrameworks, setVoiceFrameworks] = useState<VoiceFramework[]>([]);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [personas, setPersonas] = useState<AudiencePersona[]>([]);
  const [history, setHistory] = useState<GeneratedContent[]>([]);

  // Active tab
  const [activeTab, setActiveTab] = useState('generate');

  // Proofreading state
  const [proofreadText, setProofreadText] = useState('');
  const [proofreadResult, setProofreadResult] = useState<any>(null);
  const [isProofreading, setIsProofreading] = useState(false);

  // Summarization state
  const [summarizeText, setSummarizeText] = useState('');
  const [summarizeLength, setSummarizeLength] = useState<'brief' | 'moderate' | 'detailed'>('moderate');
  const [summarizeFormat, setSummarizeFormat] = useState<'paragraph' | 'bullet_points' | 'key_takeaways'>('paragraph');
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Voice analysis state
  const [voiceSample, setVoiceSample] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);

  // Rewrite state
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteTone, setRewriteTone] = useState<string>('professional');
  const [rewriteStyle, setRewriteStyle] = useState<string>('');
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadTemplates();
    loadStyleGuides();
    loadVoiceFrameworks();
    loadCustomVoices();
    loadPersonas();
    loadHistory();
  }, []);

  // Load functions
  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/content-writer/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadStyleGuides = async () => {
    try {
      const response = await fetch('/api/content-writer/style-guides');
      if (response.ok) {
        const data = await response.json();
        setStyleGuides(data.style_guides || []);
      }
    } catch (error) {
      console.error('Error loading style guides:', error);
    }
  };

  const loadVoiceFrameworks = async () => {
    try {
      const response = await fetch('/api/content-writer/voice-frameworks');
      if (response.ok) {
        const data = await response.json();
        setVoiceFrameworks(data.voice_frameworks || []);
      }
    } catch (error) {
      console.error('Error loading voice frameworks:', error);
    }
  };

  const loadCustomVoices = async () => {
    try {
      const response = await fetch('/api/content-writer/custom-voices');
      if (response.ok) {
        const data = await response.json();
        setCustomVoices(data.custom_voices || []);
      }
    } catch (error) {
      console.error('Error loading custom voices:', error);
    }
  };

  const loadPersonas = async () => {
    try {
      const response = await fetch('/api/content-writer/personas');
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
      }
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/content-writer/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Generate content
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/content-writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          template_id: selectedTemplate || undefined,
          style_guide_id: selectedStyleGuide || undefined,
          voice_framework_id: selectedVoiceFramework || undefined,
          custom_voice_id: selectedCustomVoice || undefined,
          persona_id: selectedPersona || undefined,
          tone: selectedTone,
          word_count: wordCount,
          additional_instructions: additionalInstructions || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content.generated_text);
      toast.success('Content generated successfully!');
      loadHistory();
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Proofread content
  const handleProofread = async () => {
    if (!proofreadText.trim()) {
      toast.error('Please enter text to proofread');
      return;
    }

    setIsProofreading(true);
    try {
      const response = await fetch('/api/content-writer/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: proofreadText,
          style_guide_id: selectedStyleGuide || undefined,
          apply_corrections: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to proofread content');
      }

      const data = await response.json();
      setProofreadResult(data.result);
      toast.success(`Found and fixed ${data.result.corrections_made} issues!`);
    } catch (error) {
      console.error('Error proofreading content:', error);
      toast.error('Failed to proofread content');
    } finally {
      setIsProofreading(false);
    }
  };

  // Summarize content
  const handleSummarize = async () => {
    if (!summarizeText.trim()) {
      toast.error('Please enter text to summarize');
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/content-writer/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: summarizeText,
          length: summarizeLength,
          format: summarizeFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize content');
      }

      const data = await response.json();
      setSummaryResult(data);
      toast.success('Content summarized successfully!');
    } catch (error) {
      console.error('Error summarizing content:', error);
      toast.error('Failed to summarize content');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Analyze voice
  const handleAnalyzeVoice = async () => {
    if (!voiceSample.trim() || !voiceName.trim()) {
      toast.error('Please provide a writing sample and name');
      return;
    }

    setIsAnalyzingVoice(true);
    try {
      const response = await fetch('/api/content-writer/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writing_sample: voiceSample,
          name: voiceName,
          description: voiceDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze voice');
      }

      const data = await response.json();
      toast.success('Voice analyzed and saved!');
      setVoiceName('');
      setVoiceDescription('');
      setVoiceSample('');
      loadCustomVoices();
    } catch (error) {
      console.error('Error analyzing voice:', error);
      toast.error('Failed to analyze voice');
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  // Rewrite content
  const handleRewrite = async () => {
    if (!rewriteText.trim()) {
      toast.error('Please enter text to rewrite');
      return;
    }

    setIsRewriting(true);
    try {
      const response = await fetch('/api/content-writer/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rewriteText,
          tone: rewriteTone,
          style: rewriteStyle || undefined,
          voice_framework_id: selectedVoiceFramework || undefined,
          custom_voice_id: selectedCustomVoice || undefined,
          persona_id: selectedPersona || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite content');
      }

      const data = await response.json();
      setRewriteResult(data);
      toast.success('Content rewritten successfully!');
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to rewrite content');
    } finally {
      setIsRewriting(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Content Writer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Expert-level content generation with 20+ years of writing experience
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Configuration */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </h3>

              <div className="space-y-4">
                {/* Tone Selection */}
                <div>
                  <Label>Tone</Label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone} value={tone}>
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Selection */}
                <div>
                  <Label>Content Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {CONTENT_CATEGORIES.map((category) => (
                        <div key={category.value}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                            {category.icon} {category.label}
                          </div>
                          {templates
                            .filter((t) => t.category === category.value)
                            .map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Guide Selection */}
                <div>
                  <Label>Style Guide (Optional)</Label>
                  <Select value={selectedStyleGuide} onValueChange={setSelectedStyleGuide}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style guide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {styleGuides.map((guide) => (
                        <SelectItem key={guide.id} value={guide.id}>
                          {guide.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Framework Selection */}
                <div>
                  <Label>Voice Framework (Optional)</Label>
                  <Select value={selectedVoiceFramework} onValueChange={setSelectedVoiceFramework}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {voiceFrameworks.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Voice Selection */}
                <div>
                  <Label>Custom Voice (Optional)</Label>
                  <Select value={selectedCustomVoice} onValueChange={setSelectedCustomVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select custom voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {customVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Persona Selection */}
                <div>
                  <Label>Audience Persona (Optional)</Label>
                  <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {personas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Word Count */}
                <div>
                  <Label>Target Word Count</Label>
                  <Input
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    min={50}
                    max={5000}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Generated Today</span>
                  <Badge>{history.filter(h =>
                    new Date(h.created_at).toDateString() === new Date().toDateString()
                  ).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Content</span>
                  <Badge variant="secondary">{history.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Custom Voices</span>
                  <Badge variant="outline">{customVoices.length}</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="generate">
                    <PenLine className="h-4 w-4 mr-2" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="proofread">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Proofread
                  </TabsTrigger>
                  <TabsTrigger value="summarize">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Summarize
                  </TabsTrigger>
                  <TabsTrigger value="voice">
                    <Mic className="h-4 w-4 mr-2" />
                    Voice
                  </TabsTrigger>
                  <TabsTrigger value="rewrite">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rewrite
                  </TabsTrigger>
                </TabsList>

                {/* Generate Tab */}
                <TabsContent value="generate" className="space-y-4">
                  <div>
                    <Label>What would you like to write about?</Label>
                    <Textarea
                      placeholder="Enter your content prompt... (e.g., 'Write a blog post about the benefits of AI in healthcare')"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Additional Instructions (Optional)</Label>
                    <Textarea
                      placeholder="Any specific requirements or guidelines..."
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      rows={2}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Expert Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>

                  {generatedContent && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Generated Content</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedContent)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const blob = new Blob([generatedContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'content.txt';
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        rows={15}
                        className="font-mono"
                      />
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>Words: {generatedContent.split(/\s+/).length}</span>
                        <span>Characters: {generatedContent.length}</span>
                        <span>Reading Time: {Math.ceil(generatedContent.split(/\s+/).length / 200)} min</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Proofread Tab */}
                <TabsContent value="proofread" className="space-y-4">
                  <div>
                    <Label>Text to Proofread</Label>
                    <Textarea
                      placeholder="Paste your text here for proofreading..."
                      value={proofreadText}
                      onChange={(e) => setProofreadText(e.target.value)}
                      rows={8}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleProofread}
                    disabled={isProofreading}
                    className="w-full"
                  >
                    {isProofreading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Proofreading...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Proofread & Correct
                      </>
                    )}
                  </Button>

                  {proofreadResult && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Corrected Text</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(proofreadResult.corrected_text)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          value={proofreadResult.corrected_text}
                          rows={10}
                          readOnly
                          className="bg-green-50 dark:bg-green-900/20"
                        />
                      </div>

                      {proofreadResult.issues_found && proofreadResult.issues_found.length > 0 && (
                        <div>
                          <Label>Issues Found ({proofreadResult.issues_found.length})</Label>
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                            {proofreadResult.issues_found.map((issue: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg border bg-white dark:bg-gray-800"
                              >
                                <div className="flex items-start gap-2">
                                  <Badge
                                    variant={
                                      issue.severity === 'error'
                                        ? 'destructive'
                                        : issue.severity === 'warning'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="mt-0.5"
                                  >
                                    {issue.type}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{issue.message}</p>
                                    <div className="mt-1 text-xs">
                                      <span className="text-red-600 line-through">{issue.original}</span>
                                      {' → '}
                                      <span className="text-green-600">{issue.suggestion}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Summarize Tab */}
                <TabsContent value="summarize" className="space-y-4">
                  <div>
                    <Label>Text to Summarize</Label>
                    <Textarea
                      placeholder="Paste lengthy content here to summarize..."
                      value={summarizeText}
                      onChange={(e) => setSummarizeText(e.target.value)}
                      rows={8}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Length</Label>
                      <Select value={summarizeLength} onValueChange={(value: any) => setSummarizeLength(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief (2-3 sentences)</SelectItem>
                          <SelectItem value="moderate">Moderate (1-2 paragraphs)</SelectItem>
                          <SelectItem value="detailed">Detailed (3-4 paragraphs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Format</Label>
                      <Select value={summarizeFormat} onValueChange={(value: any) => setSummarizeFormat(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paragraph">Paragraphs</SelectItem>
                          <SelectItem value="bullet_points">Bullet Points</SelectItem>
                          <SelectItem value="key_takeaways">Key Takeaways</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="w-full"
                  >
                    {isSummarizing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Summarize Content
                      </>
                    )}
                  </Button>

                  {summaryResult && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Summary</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(summaryResult.summary)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={summaryResult.summary}
                        rows={8}
                        readOnly
                        className="bg-blue-50 dark:bg-blue-900/20"
                      />
                      {summaryResult.key_points && summaryResult.key_points.length > 0 && (
                        <div className="mt-4">
                          <Label>Key Points</Label>
                          <ul className="mt-2 space-y-1">
                            {summaryResult.key_points.map((point: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Voice Analysis Tab */}
                <TabsContent value="voice" className="space-y-4">
                  <div>
                    <Label>Voice Name</Label>
                    <Input
                      placeholder="e.g., My Professional Voice"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Description (Optional)</Label>
                    <Input
                      placeholder="Brief description of this voice..."
                      value={voiceDescription}
                      onChange={(e) => setVoiceDescription(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Writing Sample</Label>
                    <Textarea
                      placeholder="Paste a sample of your writing (at least 200 words for best results)..."
                      value={voiceSample}
                      onChange={(e) => setVoiceSample(e.target.value)}
                      rows={10}
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Words: {voiceSample.split(/\s+/).filter(w => w).length} (recommended: 200+)
                    </p>
                  </div>

                  <Button
                    onClick={handleAnalyzeVoice}
                    disabled={isAnalyzingVoice}
                    className="w-full"
                  >
                    {isAnalyzingVoice ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Voice...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Analyze & Save Voice
                      </>
                    )}
                  </Button>

                  {customVoices.length > 0 && (
                    <div className="mt-6">
                      <Label>Your Custom Voices ({customVoices.length})</Label>
                      <div className="mt-2 space-y-2">
                        {customVoices.map((voice) => (
                          <div
                            key={voice.id}
                            className="p-3 rounded-lg border bg-white dark:bg-gray-800"
                          >
                            <div className="font-medium">{voice.name}</div>
                            {voice.description && (
                              <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {voice.tone_profile.dominant_tone && (
                                <Badge variant="outline">{voice.tone_profile.dominant_tone}</Badge>
                              )}
                              {voice.structure_profile.avg_sentence_length && (
                                <Badge variant="secondary">
                                  {voice.structure_profile.avg_sentence_length} words/sentence
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Rewrite Tab */}
                <TabsContent value="rewrite" className="space-y-4">
                  <div>
                    <Label>Text to Rewrite</Label>
                    <Textarea
                      placeholder="Paste text to rewrite with different tone or style..."
                      value={rewriteText}
                      onChange={(e) => setRewriteText(e.target.value)}
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Tone</Label>
                      <Select value={rewriteTone} onValueChange={setRewriteTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map((tone) => (
                            <SelectItem key={tone} value={tone}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Style Transform</Label>
                      <Select value={rewriteStyle} onValueChange={setRewriteStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="expand">Expand</SelectItem>
                          <SelectItem value="shorten">Shorten</SelectItem>
                          <SelectItem value="simplify">Simplify</SelectItem>
                          <SelectItem value="formalize">Formalize</SelectItem>
                          <SelectItem value="casualize">Casualize</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleRewrite}
                    disabled={isRewriting}
                    className="w-full"
                  >
                    {isRewriting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Rewrite Content
                      </>
                    )}
                  </Button>

                  {rewriteResult && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Rewritten Text</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(rewriteResult.rewritten_text)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          value={rewriteResult.rewritten_text}
                          rows={10}
                          readOnly
                          className="bg-purple-50 dark:bg-purple-900/20"
                        />
                      </div>

                      {rewriteResult.changes_summary && (
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Label>Changes Made</Label>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {rewriteResult.changes_summary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
