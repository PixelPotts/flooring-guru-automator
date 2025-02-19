import * as tf from '@tensorflow/tfjs';
import localforage from 'localforage';

interface CommandPattern {
  pattern: string;
  action: string;
  parameters: Record<string, any>;
  frequency: number;
  lastUsed: number;
  successRate: number;
  contextualHints: string[];
}

interface UserContext {
  timeOfDay: string;
  location: string;
  previousCommands: string[];
  frequentActions: Record<string, number>;
}

class VoiceLearningService {
  private patterns: CommandPattern[] = [];
  private model: tf.LayersModel | null = null;
  private readonly storageKey = 'voice_learning_patterns';
  private readonly modelStorageKey = 'voice_learning_model';

  constructor() {
    this.loadPatterns();
    this.initializeModel();
  }

  private async loadPatterns() {
    try {
      const savedPatterns = await localforage.getItem<CommandPattern[]>(this.storageKey);
      if (savedPatterns) {
        this.patterns = savedPatterns;
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  }

  private async savePatterns() {
    try {
      await localforage.setItem(this.storageKey, this.patterns);
    } catch (error) {
      console.error('Error saving patterns:', error);
    }
  }

  private async initializeModel() {
    try {
      // Try to load existing model
      const savedModel = await localforage.getItem(this.modelStorageKey);
      if (savedModel) {
        this.model = await tf.loadLayersModel(tf.io.fromMemory(savedModel));
      } else {
        // Create new model if none exists
        this.model = tf.sequential({
          layers: [
            tf.layers.dense({ units: 64, activation: 'relu', inputShape: [10] }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 32, activation: 'relu' }),
            tf.layers.dense({ units: 16, activation: 'softmax' })
          ]
        });

        this.model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
      }
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  }

  private async saveModel() {
    if (!this.model) return;
    try {
      const modelData = await this.model.save(tf.io.withSaveHandler(async (artifacts) => {
        await localforage.setItem(this.modelStorageKey, artifacts);
        return { modelArtifactsInfo: { dateSaved: new Date() } };
      }));
      console.log('Model saved:', modelData);
    } catch (error) {
      console.error('Error saving model:', error);
    }
  }

  private extractFeatures(command: string, context: UserContext): number[] {
    // Convert command and context into numerical features
    const features = [
      // Time-based features
      this.getTimeFeature(context.timeOfDay),
      // Command length
      command.length / 100,
      // Word count
      command.split(' ').length / 10,
      // Previous command similarity
      this.calculateSimilarity(command, context.previousCommands),
      // Action frequency
      this.getActionFrequency(context.frequentActions),
      // Location relevance
      this.getLocationRelevance(context.location),
      // Command complexity
      this.getCommandComplexity(command),
      // Pattern matching score
      this.getPatternMatchingScore(command),
      // Context relevance
      this.getContextRelevance(command, context),
      // Historical success rate
      this.getHistoricalSuccessRate(command)
    ];

    return features;
  }

  private getTimeFeature(timeOfDay: string): number {
    const hours = parseInt(timeOfDay.split(':')[0]);
    return hours / 24;
  }

  private calculateSimilarity(command: string, previousCommands: string[]): number {
    if (previousCommands.length === 0) return 0;
    
    const words = command.toLowerCase().split(' ');
    const previousWords = previousCommands.join(' ').toLowerCase().split(' ');
    
    const commonWords = words.filter(word => previousWords.includes(word));
    return commonWords.length / words.length;
  }

  private getActionFrequency(frequentActions: Record<string, number>): number {
    const values = Object.values(frequentActions);
    if (values.length === 0) return 0;
    return Math.max(...values) / 100;
  }

  private getLocationRelevance(location: string): number {
    // Simplified location relevance scoring
    const relevantLocations = ['office', 'site', 'warehouse', 'showroom'];
    return relevantLocations.includes(location.toLowerCase()) ? 1 : 0;
  }

  private getCommandComplexity(command: string): number {
    const words = command.split(' ');
    const uniqueWords = new Set(words).size;
    return uniqueWords / words.length;
  }

  private getPatternMatchingScore(command: string): number {
    const matches = this.patterns.filter(pattern => 
      command.toLowerCase().includes(pattern.pattern.toLowerCase())
    );
    return matches.length > 0 ? Math.max(...matches.map(m => m.successRate)) : 0;
  }

  private getContextRelevance(command: string, context: UserContext): number {
    const contextKeywords = [
      ...context.previousCommands,
      context.location,
      context.timeOfDay
    ].join(' ').toLowerCase().split(' ');
    
    const commandWords = command.toLowerCase().split(' ');
    const relevantWords = commandWords.filter(word => contextKeywords.includes(word));
    
    return relevantWords.length / commandWords.length;
  }

  private getHistoricalSuccessRate(command: string): number {
    const relevantPatterns = this.patterns.filter(pattern =>
      command.toLowerCase().includes(pattern.pattern.toLowerCase())
    );
    
    if (relevantPatterns.length === 0) return 0.5;
    return relevantPatterns.reduce((acc, p) => acc + p.successRate, 0) / relevantPatterns.length;
  }

  public async learnFromInteraction(
    command: string,
    action: string,
    parameters: Record<string, any>,
    success: boolean,
    context: UserContext
  ) {
    // Update patterns
    const existingPattern = this.patterns.find(p => p.pattern === command);
    
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.lastUsed = Date.now();
      existingPattern.successRate = (existingPattern.successRate * (existingPattern.frequency - 1) + (success ? 1 : 0)) / existingPattern.frequency;
      existingPattern.contextualHints = [...new Set([...existingPattern.contextualHints, ...Object.values(context)])];
    } else {
      this.patterns.push({
        pattern: command,
        action,
        parameters,
        frequency: 1,
        lastUsed: Date.now(),
        successRate: success ? 1 : 0,
        contextualHints: Object.values(context)
      });
    }

    // Train model with new data
    if (this.model) {
      const features = this.extractFeatures(command, context);
      const label = this.patterns.findIndex(p => p.pattern === command);
      
      if (label !== -1) {
        const xs = tf.tensor2d([features], [1, features.length]);
        const ys = tf.oneHot(tf.tensor1d([label], 'int32'), this.patterns.length);
        
        await this.model.fit(xs, ys, {
          epochs: 1,
          verbose: 0
        });
        
        xs.dispose();
        ys.dispose();
      }
    }

    await this.savePatterns();
    await this.saveModel();
  }

  public async predictNextAction(command: string, context: UserContext): Promise<{
    action: string;
    parameters: Record<string, any>;
    confidence: number;
  }> {
    if (!this.model || this.patterns.length === 0) {
      return {
        action: '',
        parameters: {},
        confidence: 0
      };
    }

    const features = this.extractFeatures(command, context);
    const prediction = this.model.predict(tf.tensor2d([features], [1, features.length])) as tf.Tensor;
    const probabilities = await prediction.data();
    prediction.dispose();

    const maxProbIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
    const predictedPattern = this.patterns[maxProbIndex];

    if (!predictedPattern) {
      return {
        action: '',
        parameters: {},
        confidence: 0
      };
    }

    return {
      action: predictedPattern.action,
      parameters: predictedPattern.parameters,
      confidence: probabilities[maxProbIndex]
    };
  }

  public async getRelevantSuggestions(context: UserContext): Promise<string[]> {
    return this.patterns
      .sort((a, b) => {
        // Score based on frequency, recency, and success rate
        const scoreA = (a.frequency * 0.4) + 
                      (1 / (Date.now() - a.lastUsed) * 0.3) +
                      (a.successRate * 0.3);
        const scoreB = (b.frequency * 0.4) + 
                      (1 / (Date.now() - b.lastUsed) * 0.3) +
                      (b.successRate * 0.3);
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map(pattern => pattern.pattern);
  }
}

export const voiceLearningService = new VoiceLearningService();