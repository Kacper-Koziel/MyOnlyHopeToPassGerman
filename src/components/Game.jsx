import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, SkipForward } from 'lucide-react';

function Game({ vocabulary, onBack }) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [shuffledVocab, setShuffledVocab] = useState([]);

    useEffect(() => {
        const shuffled = [...vocabulary]
            .filter(w => w.pl && w.de)
            .sort(() => 0.5 - Math.random());
        setShuffledVocab(shuffled);
    }, [vocabulary]);

    const currentWord = shuffledVocab[currentWordIndex];

    const targetWord = currentWord?.de || "";
    const questionWord = currentWord?.pl || "";

    const checkAnswer = () => {
        if (!targetWord) return;

        const cleanInput = input.trim().toLowerCase();
        const cleanTarget = targetWord.trim().toLowerCase();

        const sanitizedTarget = cleanTarget.replace(/[.,;:]+$/, '');

        if (cleanInput === sanitizedTarget) {
            setFeedback('correct');
            setScore(s => s + 1);
            setTimeout(nextWord, 1000);
        } else {
            setFeedback('incorrect');
        }
    };

    const nextWord = () => {
        setFeedback(null);
        setInput('');
        setCurrentWordIndex(i => (i + 1) % shuffledVocab.length);
    };

    const handleSpecialChar = (char) => {
        setInput(prev => prev + char);
    };

    if (!currentWord) return <div className="card">Loading or No Valid Words... <button onClick={onBack}>Back</button></div>;

    return (
        <div className="card fade-in game-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <button className="secondary icon-btn" onClick={onBack}><ArrowLeft size={16} /> Exit</button>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Score: {score}</span>
            </div>

            <p style={{ color: 'var(--text-secondary)' }}>Translate to German:</p>

            <div className="word-display">
                {questionWord}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    placeholder="Type German word..."
                    autoFocus
                    className={feedback === 'incorrect' ? 'shake' : ''}
                    style={{
                        borderColor: feedback === 'correct' ? 'var(--success-color)' :
                            feedback === 'incorrect' ? 'var(--error-color)' : ''
                    }}
                />

                <div className="special-chars">
                    {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map(char => (
                        <button key={char} onClick={() => handleSpecialChar(char)} className="secondary">{char}</button>
                    ))}
                </div>
            </div>

            <button onClick={checkAnswer} className="primary" style={{ width: '100%' }}>
                Check Answer
            </button>

            {feedback === 'incorrect' && (
                <div className="feedback" style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <X size={18} /> Incorrect! Try again.
                </div>
            )}
            {feedback === 'correct' && (
                <div className="feedback" style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <Check size={18} /> Correct!
                </div>
            )}

            <div style={{ marginTop: '1rem' }}>
                <button className="secondary icon-btn" style={{ fontSize: '0.8rem' }} onClick={() => {
                    setFeedback('incorrect');
                    alert(`Answer: ${targetWord}`);
                    nextWord();
                }}>
                    <SkipForward size={14} /> I don't know (Skip)
                </button>
            </div>

        </div>
    );
}

export default Game;
