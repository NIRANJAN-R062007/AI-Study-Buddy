import React, { useState } from 'react'
import { studyBuddyAPI } from '../../services/api'

export default function Flashcards() {
    const [topic, setTopic] = useState('')
    const [flashcards, setFlashcards] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleGenerate = async (e) => {
        e.preventDefault()
        if (!topic.trim()) return

        setIsLoading(true)
        setError(null)
        setFlashcards([])
        setCurrentIndex(0)
        setIsFlipped(false)

        try {
            const cards = await studyBuddyAPI.generateFlashcards(topic)
            if (cards && cards.length > 0) {
                setFlashcards(cards)
            } else {
                setError('No flashcards generated. Please try again.')
            }
        } catch (err) {
            setError('Failed to generate flashcards. Please try again.')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setIsFlipped(false)
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '2rem',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '3rem'
            }}>
                AI Flashcards
            </h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic (e.g., Photosynthesis, Python Lists)"
                        className="input-field"
                        style={{ flex: 1 }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="btn-primary"
                        style={{ minWidth: '120px' }}
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </form>
                {error && <p style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</p>}
            </div>

            {flashcards.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{
                            width: '100%',
                            height: '400px',
                            perspective: '1000px',
                            cursor: 'pointer',
                            marginBottom: '2rem'
                        }}
                    >
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            textAlign: 'center',
                            transition: 'transform 0.6s',
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}>
                            {/* Front */}
                            <div className="card" style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Question</h3>
                                <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>{flashcards[currentIndex].front}</p>
                                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>Click to flip</p>
                            </div>

                            {/* Back */}
                            <div className="card" style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-main)',
                                border: '2px solid var(--secondary-color)'
                            }}>
                                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Answer</h3>
                                <p style={{ fontSize: '1.25rem' }}>{flashcards[currentIndex].back}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="btn-primary"
                            style={{ background: currentIndex === 0 ? 'var(--text-light)' : 'var(--primary-gradient)' }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                            {currentIndex + 1} / {flashcards.length}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === flashcards.length - 1}
                            className="btn-primary"
                            style={{ background: currentIndex === flashcards.length - 1 ? 'var(--text-light)' : 'var(--primary-gradient)' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
