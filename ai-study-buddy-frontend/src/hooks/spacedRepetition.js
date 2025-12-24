export class SpacedRepetitionSystem {
  constructor() {
    this.intervals = [1, 3, 7, 14, 30, 60]; // Days between reviews
  }

  calculateNextReview(performance, currentInterval = 1) {
    let newInterval;
    
    if (performance === 'easy') {
      newInterval = currentInterval * 2.5;
    } else if (performance === 'medium') {
      newInterval = currentInterval * 1.5;
    } else { // hard
      newInterval = Math.max(1, currentInterval * 0.8);
    }

    // Find the closest interval from our predefined intervals
    const closestInterval = this.intervals.find(interval => interval >= newInterval) || 
                           this.intervals[this.intervals.length - 1];
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + closestInterval);
    
    return {
      interval: closestInterval,
      nextReview: nextReviewDate,
      performance
    };
  }

  getDueQuestions(questions) {
    const now = new Date();
    return questions.filter(question => {
      if (!question.spacedRepetition) return true; // New questions are due
      return new Date(question.spacedRepetition.nextReview) <= now;
    });
  }
}

// Enhanced Quiz component with spaced repetition
export function useSpacedRepetition() {
  const [questions, setQuestions] = useState([]);

  const updateQuestionPerformance = (questionId, performance) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const srs = new SpacedRepetitionSystem();
        const spacedRepetition = srs.calculateNextReview(
          performance, 
          q.spacedRepetition?.interval || 1
        );
        
        return {
          ...q,
          spacedRepetition,
          lastReviewed: new Date(),
          reviewCount: (q.reviewCount || 0) + 1
        };
      }
      return q;
    }));
  };

  const getDueQuestions = () => {
    const srs = new SpacedRepetitionSystem();
    return srs.getDueQuestions(questions);
  };

  return {
    questions,
    setQuestions,
    updateQuestionPerformance,
    getDueQuestions
  };
}