import { initLlama, loadLlamaModelInfo } from 'llama.rn';
import { Alert } from 'react-native';

class AIService {
  constructor() {
    this.context = null;
    this.isInitialized = false;
    this.isInitializing = false;
  }

  async initializeModel() {
    if (this.isInitialized || this.isInitializing) {
      return this.context;
    }

    try {
      this.isInitializing = true;
      
      // For now, we'll use a fallback approach since we need to download a model
      // In production, you would bundle a small GGUF model with the app
      // or download it on first launch
      
      console.log('AI Service: Model initialization would happen here');
      console.log('AI Service: Using fallback summarization for now');
      
      this.isInitialized = true;
      this.isInitializing = false;
      
      return { fallback: true };
      
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  async generateSummary(text, length = 'medium') {
    try {
      // Initialize model if not already done
      await this.initializeModel();

      // For now, we'll use a smart fallback approach
      // In production, this would use the actual llama.rn model
      return this.generateFallbackSummary(text, length);
      
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async generateTitle(text) {
    try {
      await this.initializeModel();
      
      // Extract potential title from first few sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const firstSentence = sentences[0]?.trim() || '';
      
      // Clean and truncate for title
      let title = firstSentence
        .replace(/[^\w\s-]/g, '')
        .trim()
        .substring(0, 50);
      
      if (title.length === 50) {
        title += '...';
      }
      
      return title || 'Document Summary';
      
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Document Summary';
    }
  }

  generateFallbackSummary(text, length) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let targetSentences;
    switch (length) {
      case 'short':
        targetSentences = Math.min(2, sentences.length);
        break;
      case 'large':
        targetSentences = Math.min(6, sentences.length);
        break;
      default: // medium
        targetSentences = Math.min(4, sentences.length);
    }
    
    // Select most important sentences (first few and any with keywords)
    const importantKeywords = [
      'important', 'key', 'main', 'primary', 'essential', 'critical',
      'summary', 'conclusion', 'result', 'finding', 'recommendation'
    ];
    
    const scoredSentences = sentences.map((sentence, index) => {
      let score = sentences.length - index; // Earlier sentences get higher score
      
      // Boost score for sentences with important keywords
      const lowerSentence = sentence.toLowerCase();
      importantKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword)) {
          score += 5;
        }
      });
      
      // Boost score for longer sentences (more content)
      if (sentence.length > 100) {
        score += 2;
      }
      
      return { sentence: sentence.trim(), score, index };
    });
    
    // Sort by score and take top sentences
    const selectedSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, targetSentences)
      .sort((a, b) => a.index - b.index) // Restore original order
      .map(item => item.sentence);
    
    return selectedSentences.join('. ') + '.';
  }

  // Method to initialize with actual llama.rn model (for future use)
  async initializeWithModel(modelPath) {
    try {
      console.log('Loading model info...');
      const modelInfo = await loadLlamaModelInfo(modelPath);
      console.log('Model Info:', modelInfo);

      console.log('Initializing Llama context...');
      this.context = await initLlama({
        model: modelPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 99, // Use GPU acceleration if available
      });

      this.isInitialized = true;
      console.log('AI model initialized successfully');
      return this.context;
      
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      throw error;
    }
  }

  // Method to use actual llama.rn for summarization (for future use)
  async generateAISummary(text, length = 'medium') {
    if (!this.context || this.context.fallback) {
      return this.generateFallbackSummary(text, length);
    }

    try {
      const lengthInstructions = {
        short: 'Write a brief 1-2 sentence summary.',
        medium: 'Write a concise 3-4 sentence summary.',
        large: 'Write a detailed 5-6 sentence summary.'
      };

      const prompt = `Please summarize the following text. ${lengthInstructions[length] || lengthInstructions.medium}

Text to summarize:
${text}

Summary:`;

      const stopWords = ['</s>', '<|end|>', '<|eot_id|>', '<|end_of_text|>', '<|im_end|>', '<|EOT|>', '<|END_OF_TURN_TOKEN|>', '<|end_of_turn|>', '<|endoftext|>'];

      const result = await this.context.completion(
        {
          prompt: prompt,
          n_predict: 200,
          stop: stopWords,
          temperature: 0.7,
          top_p: 0.9,
        },
        (data) => {
          // Partial completion callback
          console.log('AI generating:', data.token);
        }
      );

      return result.text.trim();
      
    } catch (error) {
      console.error('Error with AI summarization:', error);
      // Fallback to rule-based summarization
      return this.generateFallbackSummary(text, length);
    }
  }
}

// Export singleton instance
export default new AIService();
