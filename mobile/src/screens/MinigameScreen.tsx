import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../theme';

const { width, height } = Dimensions.get('window');

// Minigame types
type MinigameType = 'quiz' | 'sequence' | 'scramble' | 'qte';

interface MinigameProps {
  type: MinigameType;
  classId: string;
  difficulty: number;
  maskBonus?: number;
  onComplete: (score: number, passed: boolean) => void;
  onExit: () => void;
}

// Quiz Game Component
const QuizGame: React.FC<{
  difficulty: number;
  maskBonus: number;
  onComplete: (score: number) => void;
}> = ({ difficulty, maskBonus, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Mock questions
  const questions = [
    {
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'],
      correct: 1,
    },
    {
      question: 'What is 15 × 7?',
      options: ['95', '105', '115', '85'],
      correct: 1,
    },
    {
      question: 'Who wrote "Romeo and Juliet"?',
      options: ['Dickens', 'Shakespeare', 'Austen', 'Hemingway'],
      correct: 1,
    },
  ];

  const currentQ = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);

    if (index === currentQ.correct) {
      setScore(s => s + 10 + maskBonus);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(c => c + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        onComplete(score + (index === currentQ.correct ? 10 + maskBonus : 0));
      }
    }, 1000);
  };

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.questionNumber}>
        Question {currentQuestion + 1}/{questions.length}
      </Text>
      <Text style={styles.questionText}>{currentQ.question}</Text>
      
      <View style={styles.optionsContainer}>
        {currentQ.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              answered && index === currentQ.correct && styles.optionCorrect,
              answered && selectedAnswer === index && index !== currentQ.correct && styles.optionWrong,
            ]}
            onPress={() => handleAnswer(index)}
            disabled={answered}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.scoreText}>Score: {score}</Text>
    </View>
  );
};

// Sequence Memory Game
const SequenceGame: React.FC<{
  difficulty: number;
  maskBonus: number;
  onComplete: (score: number) => void;
}> = ({ difficulty, maskBonus, onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const colors4 = [colors.danger, colors.success, colors.warning, colors.info];

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setIsPlaying(true);

    // Play sequence
    newSequence.forEach((btn, index) => {
      setTimeout(() => {
        setActiveButton(btn);
        setTimeout(() => setActiveButton(null), 400);
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, (newSequence.length + 1) * 600);
  };

  const handleButtonPress = (index: number) => {
    if (isPlaying || gameOver) return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);
    setActiveButton(index);
    setTimeout(() => setActiveButton(null), 200);

    // Check if correct
    if (index !== sequence[playerSequence.length]) {
      setGameOver(true);
      const score = (round - 1) * 10 + maskBonus;
      setTimeout(() => onComplete(score), 1000);
      return;
    }

    // Check if round complete
    if (newPlayerSequence.length === sequence.length) {
      setRound(r => r + 1);
      setTimeout(() => {
        if (round >= 5) {
          onComplete(50 + maskBonus);
        } else {
          startNewRound();
        }
      }, 500);
    }
  };

  return (
    <View style={styles.sequenceContainer}>
      <Text style={styles.roundText}>Round {round}</Text>
      <Text style={styles.instructionText}>
        {isPlaying ? 'Watch the sequence...' : 'Repeat the sequence!'}
      </Text>

      <View style={styles.buttonGrid}>
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sequenceButton,
              { backgroundColor: colors4[index] },
              activeButton === index && styles.sequenceButtonActive,
            ]}
            onPress={() => handleButtonPress(index)}
            disabled={isPlaying}
          />
        ))}
      </View>

      {gameOver && (
        <Text style={styles.gameOverText}>Game Over! Rounds completed: {round - 1}</Text>
      )}
    </View>
  );
};

// QTE (Quick Time Event) Game
const QTEGame: React.FC<{
  difficulty: number;
  maskBonus: number;
  onComplete: (score: number) => void;
}> = ({ difficulty, maskBonus, onComplete }) => {
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; active: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    // Spawn targets periodically
    const spawnInterval = setInterval(() => {
      if (!gameActive) return;
      
      const newTarget = {
        id: Date.now(),
        x: Math.random() * (width - 100) + 20,
        y: Math.random() * (height * 0.4) + 50,
        active: true,
      };
      
      setTargets(t => [...t.slice(-5), newTarget]);
      
      // Remove target after 2 seconds
      setTimeout(() => {
        setTargets(t => t.filter(target => target.id !== newTarget.id));
      }, 2000);
    }, 1000);

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          clearInterval(timer);
          clearInterval(spawnInterval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!gameActive) {
      onComplete(score);
    }
  }, [gameActive]);

  const handleTargetHit = (id: number) => {
    setTargets(t => t.filter(target => target.id !== id));
    setScore(s => s + 10 + Math.floor(maskBonus / 2));
  };

  return (
    <View style={styles.qteContainer}>
      <View style={styles.qteHeader}>
        <Text style={styles.qteScore}>Score: {score}</Text>
        <Text style={styles.qteTimer}>⏱ {timeLeft}s</Text>
      </View>

      <View style={styles.qteArea}>
        {targets.map((target) => (
          <TouchableOpacity
            key={target.id}
            style={[
              styles.qteTarget,
              { left: target.x, top: target.y },
            ]}
            onPress={() => handleTargetHit(target.id)}
          >
            <Text style={styles.qteTargetText}>🎯</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!gameActive && (
        <View style={styles.qteGameOver}>
          <Text style={styles.gameOverText}>Time's up!</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
        </View>
      )}
    </View>
  );
};

// Main Minigame Screen
const MinigameScreen: React.FC<MinigameProps> = ({
  type,
  classId,
  difficulty,
  maskBonus = 0,
  onComplete,
  onExit,
}) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    const passed = score >= difficulty * 10;
    setTimeout(() => onComplete(score, passed), 2000);
  };

  const getGameTitle = () => {
    const titles: Record<MinigameType, string> = {
      quiz: 'Quick Quiz',
      sequence: 'Memory Sequence',
      scramble: 'Word Scramble',
      qte: 'Reaction Test',
    };
    return titles[type];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getGameTitle()}</Text>
        {maskBonus > 0 && (
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusText}>+{maskBonus} Mask Bonus</Text>
          </View>
        )}
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {!gameStarted ? (
          <View style={styles.startScreen}>
            <Text style={styles.startTitle}>Ready?</Text>
            <Text style={styles.startDescription}>
              Difficulty: {difficulty}/3
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setGameStarted(true)}
            >
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        ) : finalScore !== null ? (
          <View style={styles.resultsScreen}>
            <Text style={styles.resultsTitle}>Complete!</Text>
            <Text style={styles.resultsScore}>{finalScore}</Text>
            <Text style={styles.resultsLabel}>points</Text>
          </View>
        ) : (
          <>
            {type === 'quiz' && (
              <QuizGame
                difficulty={difficulty}
                maskBonus={maskBonus}
                onComplete={handleGameComplete}
              />
            )}
            {type === 'sequence' && (
              <SequenceGame
                difficulty={difficulty}
                maskBonus={maskBonus}
                onComplete={handleGameComplete}
              />
            )}
            {type === 'qte' && (
              <QTEGame
                difficulty={difficulty}
                maskBonus={maskBonus}
                onComplete={handleGameComplete}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    color: colors.text,
    fontSize: fontSizes.lg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  bonusBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bonusText: {
    color: colors.text,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  startScreen: {
    alignItems: 'center',
  },
  startTitle: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  startDescription: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  startButtonText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  resultsScreen: {
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: spacing.md,
  },
  resultsScore: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultsLabel: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
  // Quiz styles
  quizContainer: {
    width: '100%',
  },
  questionNumber: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontSize: fontSizes.xl,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}20`,
  },
  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: `${colors.danger}20`,
  },
  optionText: {
    fontSize: fontSizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: fontSizes.lg,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  // Sequence styles
  sequenceContainer: {
    alignItems: 'center',
  },
  roundText: {
    fontSize: fontSizes.xl,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 220,
    gap: spacing.md,
  },
  sequenceButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    opacity: 0.6,
  },
  sequenceButtonActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  gameOverText: {
    fontSize: fontSizes.xl,
    color: colors.danger,
    marginTop: spacing.xl,
  },
  // QTE styles
  qteContainer: {
    flex: 1,
    width: '100%',
  },
  qteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  qteScore: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontWeight: '600',
  },
  qteTimer: {
    fontSize: fontSizes.lg,
    color: colors.warning,
    fontWeight: '600',
  },
  qteArea: {
    flex: 1,
    position: 'relative',
  },
  qteTarget: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qteTargetText: {
    fontSize: 40,
  },
  qteGameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  finalScoreText: {
    fontSize: fontSizes.xl,
    color: colors.text,
    marginTop: spacing.md,
  },
});

export default MinigameScreen;

