import React, { useState, useEffect, useRef } from 'react'
import { studyBuddyAPI } from '../../services/api'
import './Quiz.css'

export default function Quiz() {
    // Game State
    const [gameState, setGameState] = useState('setup') // setup, playing, results
    const [topic, setTopic] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [difficulty, setDifficulty] = useState('medium')
    const [questions, setQuestions] = useState([])
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [timeLeft, setTimeLeft] = useState(15)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Gamification State
    const [leaderboard, setLeaderboard] = useState([])

    // Lifelines
    const [lifelines, setLifelines] = useState({
        fiftyFifty: true
    })
    const [hiddenOptions, setHiddenOptions] = useState([])

    // Answer State
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [userAnswers, setUserAnswers] = useState([]) // For review

    const timerRef = useRef(null)

    // --- Game Logic ---

    const startGame = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic')
            return
        }
        if (numQuestions < 1 || numQuestions > 20) {
            setError('Please choose between 1 and 20 questions')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await studyBuddyAPI.generateQuiz(topic, difficulty, numQuestions)
            if (data && data.length > 0) {
                setQuestions(data)
                setGameState('playing')
                resetQuestionState()
            } else {
                setError('Failed to generate questions. Please try again.')
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const resetQuestionState = () => {
        setCurrentQIndex(0)
        setScore(0)
        setStreak(0)
        setLifelines({ fiftyFifty: true })
        setUserAnswers([])
        resetTurn()
    }

    const resetTurn = () => {
        setTimeLeft(15)
        setSelectedAnswer(null)
        setIsAnswered(false)
        setHiddenOptions([])
        startTimer()
    }

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeOut()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleTimeOut = () => {
        clearInterval(timerRef.current)
        handleAnswer(null, true) // Treat as incorrect
    }

    const handleAnswer = (answer, isTimeOut = false) => {
        if (isAnswered) return
        clearInterval(timerRef.current)
        setIsAnswered(true)
        setSelectedAnswer(answer)

        const currentQ = questions[currentQIndex]
        const isCorrect = answer === currentQ.correct_answer

        // Update Score & Streak
        if (isCorrect) {
            const timeBonus = Math.floor(timeLeft / 2) * 10
            const streakBonus = streak * 50
            const points = 100 + timeBonus + streakBonus
            setScore(prev => prev + points)
            setStreak(prev => prev + 1)
        } else {
            setStreak(0)
        }

        // Record Answer
        setUserAnswers(prev => [...prev, {
            question: currentQ,
            userAnswer: answer,
            isCorrect,
            isTimeOut
        }])

        // Auto-advance
        setTimeout(() => {
            if (currentQIndex + 1 < questions.length) {
                setCurrentQIndex(prev => prev + 1)
                resetTurn()
            } else {
                finishGame()
            }
        }, 2000)
    }

    const finishGame = () => {
        setGameState('results')
        updateLeaderboard()
    }

    // --- Gamification Logic ---

    const updateLeaderboard = () => {
        const savedLeaderboard = JSON.parse(localStorage.getItem('quiz_leaderboard') || '[]')
        const newEntry = {
            topic: topic,
            score: score,
            date: new Date().toLocaleDateString()
        }

        const updatedLeaderboard = [...savedLeaderboard, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Keep top 5

        setLeaderboard(updatedLeaderboard)
        localStorage.setItem('quiz_leaderboard', JSON.stringify(updatedLeaderboard))
    }

    // --- Lifelines ---

    const useFiftyFifty = () => {
        if (!lifelines.fiftyFifty || isAnswered) return

        const currentQ = questions[currentQIndex]
        const wrongOptions = currentQ.options.filter(opt => opt !== currentQ.correct_answer)
        const toHide = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2)

        setHiddenOptions(toHide)
        setLifelines(prev => ({ ...prev, fiftyFifty: false }))
    }

    // --- Render Helpers ---

    const getOptionClass = (option) => {
        if (!isAnswered) return ''
        const currentQ = questions[currentQIndex]
        if (option === currentQ.correct_answer) return 'correct'
        if (option === selectedAnswer) return 'incorrect'
        return ''
    }

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // --- Views ---

    if (gameState === 'setup') {
        return (
            <div className="quiz-container">
                <div className="quiz-card quiz-setup">
                    <h1 className="quiz-title">NEON QUIZ ⚡</h1>

                    {error && <div className="error-banner" style={{ color: '#ff0055', marginBottom: '1rem' }}>{error}</div>}

                    < div className="input-group" >
                        <label className="input-label">Topic</label>
                        <input
                            type="text"
                            className="quiz-input"
                            placeholder="e.g., Cyberpunk History..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div >

                    <div className="input-group">
                        <label className="input-label">Questions (1-20)</label>
                        <input
                            type="number"
                            className="quiz-input"
                            min="1"
                            max="20"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                        />
                    </div>

                    <div className="setup-section">
                        <label className="input-label" style={{ marginBottom: '1rem' }}>Difficulty</label>
                        <div className="setup-grid">
                            {['Easy', 'Medium', 'Hard'].map(d => (
                                <div
                                    key={d}
                                    className={`setup-option ${difficulty === d.toLowerCase() ? 'selected' : ''}`}
                                    onClick={() => setDifficulty(d.toLowerCase())}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="start-btn"
                        onClick={startGame}
                        disabled={loading}
                    >
                        {loading ? 'INITIALIZING...' : 'START MISSION'}
                    </button>
                </div >
            </div >
        )
    }

    if (gameState === 'playing') {
        const currentQ = questions[currentQIndex]
        return (
            <div className="quiz-container">
                <div className="quiz-card">
                    <div className="quiz-header">
                        <div className={`timer-badge ${timeLeft <= 5 ? 'warning' : ''}`}>
                            ⏱️ {timeLeft}s
                        </div>
                        <div className="progress-text" style={{ color: '#888' }}>
                            Q {currentQIndex + 1} / {questions.length}
                        </div>
                        <div className="score-badge">
                            💎 {score}
                            {streak > 1 && <span className="streak-badge">🔥 {streak}x</span>}
                        </div>
                    </div>

                    <div className="question-text">
                        {currentQ.question}
                    </div>

                    <div className="options-grid">
                        {currentQ.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={`option-btn ${getOptionClass(opt)}`}
                                onClick={() => handleAnswer(opt)}
                                disabled={isAnswered || hiddenOptions.includes(opt)}
                                style={{ visibility: hiddenOptions.includes(opt) ? 'hidden' : 'visible' }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <div className="lifelines">
                        <button
                            className="lifeline-btn"
                            onClick={useFiftyFifty}
                            disabled={!lifelines.fiftyFifty || isAnswered}
                            title="50/50 Protocol"
                        >
                            ✂️
                        </button>
                    </div>

                    <div className="progress-container">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        )
    }

    if (gameState === 'results') {
        const percentage = Math.round((userAnswers.filter(a => a.isCorrect).length / questions.length) * 100)

        return (
            <div className="quiz-container">
                <div className="quiz-card results-container">
                    <h2 className="quiz-title">MISSION COMPLETE</h2>

                    <div className="score-circle" style={{ '--percentage': `${percentage}%` }}>
                        <div className="score-text">
                            {score}
                            <div style={{ fontSize: '1rem', opacity: 0.7, color: '#fff' }}>SCORE</div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-title">Accuracy</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--quiz-primary)' }}>{percentage}%</div>
                        </div>
                    </div>

                    <div className="stat-box" style={{ marginBottom: '2rem' }}>
                        <div className="stat-title">Top Agents (Local)</div>
                        {leaderboard.map((entry, i) => (
                            <div key={i} className="leaderboard-item">
                                <span>{i + 1}. {entry.topic}</span>
                                <span style={{ color: 'var(--quiz-primary)' }}>{entry.score}</span>
                            </div>
                        ))}
                    </div>

                    <div className="review-section">
                        <h3 style={{ marginBottom: '1rem' }}>Debriefing</h3>
                        {userAnswers.map((ans, idx) => (
                            <div key={idx} className={`review-item ${ans.isCorrect ? 'correct' : 'incorrect'}`}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Q: {ans.question.question}</div>
                                <div style={{ fontSize: '0.9rem', color: '#888' }}>Your Answer: {ans.userAnswer || 'Time Out'}</div>
                                {!ans.isCorrect && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--quiz-success)' }}>Correct: {ans.question.correct_answer}</div>
                                )}
                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic', color: '#aaa' }}>
                                    {ans.question.explanation}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="start-btn" onClick={() => setGameState('setup')} style={{ marginTop: '2rem' }}>
                        NEW MISSION
                    </button>
                </div>
            </div>
        )
    }

    return null
}
