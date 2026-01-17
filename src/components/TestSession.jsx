import React, { useState, useEffect } from 'react';
import { calculateSimilarity } from '../utils/stringUtils';
import { ArrowLeft, Check, X, Award, AlertCircle, PlayCircle } from 'lucide-react';

function TestSession({ vocabulary, sessionLength, onBack }) {
    const [sessionWords, setSessionWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const [waitingForCorrection, setWaitingForCorrection] = useState(false);

    const [recentCorrectIds, setRecentCorrectIds] = useState([]);

    const isEndless = sessionLength === 'endless';
    const actualLength = isEndless
        ? vocabulary.length
        : (sessionLength === 'all' ? vocabulary.length : Math.min(sessionLength, vocabulary.length));

    const getNextBatch = (currentWords, historyIds) => {
        let candidates = vocabulary.filter(w => w.pl && w.de);

        const upcomingIds = new Set(currentWords.slice(currentIndex + 1).map(w => w.id));
        candidates = candidates.filter(w => !upcomingIds.has(w.id));

        const ready = candidates.filter(w => !historyIds.includes(w.id));
        const cooldown = candidates.filter(w => historyIds.includes(w.id));

        const batchSize = 10;
        let batch = [];

        const shuffledReady = [...ready].sort(() => 0.5 - Math.random());
        const shuffledCooldown = [...cooldown].sort(() => 0.5 - Math.random());

        batch = [...shuffledReady.slice(0, batchSize)];

        if (batch.length < batchSize) {
            batch = [...batch, ...shuffledCooldown.slice(0, batchSize - batch.length)];
        }

        return batch;
    };

    useEffect(() => {
        if (isEndless) {
            const candidates = vocabulary.filter(w => w.pl && w.de);
            const startBatch = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 5);
            setSessionWords(startBatch);
            if (candidates.length > 5) {
            }
        } else {
            let selected = [];
            if (sessionLength === 'all') {
                selected = [...vocabulary]
                    .filter(w => w.pl && w.de)
                    .sort(() => 0.5 - Math.random());
            } else {
                selected = [...vocabulary]
                    .filter(w => w.pl && w.de)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, actualLength);
            }
            setSessionWords(selected);
        }
    }, [vocabulary, sessionLength, actualLength, isEndless]);

    useEffect(() => {
        if (isEndless && sessionWords.length > 0 && sessionWords.length - currentIndex < 5) {
            setSessionWords(prev => [...prev, ...getNextBatch(prev, recentCorrectIds)]);
        }
    }, [currentIndex, isEndless, sessionWords.length, recentCorrectIds, vocabulary]);


    const currentWord = sessionWords[currentIndex];
    const targetWord = currentWord?.de || "";
    const questionWord = currentWord?.pl || "";

    const checkAnswer = () => {
        if (feedback && !waitingForCorrection) return;

        const cleanInput = input.trim().toLowerCase();
        const cleanTarget = targetWord.trim().toLowerCase();
        const sanitizedTarget = cleanTarget.replace(/[.,;:]+$/, '');

        if (waitingForCorrection) {
            if (cleanInput === sanitizedTarget) {
                setWaitingForCorrection(false);
                nextWord();
            }
            return;
        }

        if (cleanInput === sanitizedTarget) {
            setFeedback({ type: 'correct', msg: 'Perfect!', percent: 100 });
            setScore(s => s + 1);

            if (isEndless) {
                setRecentCorrectIds(prev => {
                    const newHistory = [...prev, currentWord.id];
                    if (newHistory.length > 10) return newHistory.slice(newHistory.length - 10);
                    return newHistory;
                });
            }

        } else {
            const similarity = calculateSimilarity(cleanInput, sanitizedTarget);
            const percent = Math.round(similarity * 100);

            setFeedback({
                type: 'incorrect',
                msg: `Correct answer: ${targetWord}`,
                percent: percent
            });

            if (percent < 90) {
                setWaitingForCorrection(true);
                setInput('');
            }
        }
    };

    const nextWord = () => {
        if (!isEndless && currentIndex >= sessionWords.length - 1) {
            setIsFinished(true);
        } else {
            setFeedback(null);
            setInput('');
            setWaitingForCorrection(false);

            setCurrentIndex(i => i + 1);
        }
    };

    const handleSpecialChar = (char) => {
        setInput(prev => prev + char);
    };

    if (isFinished) {
        const percentage = Math.round((score / actualLength) * 100);
        let grade = "C";
        if (percentage >= 90) grade = "A";
        else if (percentage >= 80) grade = "B";
        else if (percentage >= 60) grade = "D";
        else grade = "F";

        return (
            <div className="card fade-in" style={{ textAlign: 'center' }}>
                <h1>Session Complete!</h1>
                <div style={{ fontSize: '4rem', margin: '1rem 0', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center' }}>
                    {grade === 'A' ? <Award size={64} /> : grade === 'F' ? <AlertCircle size={64} /> : <Check size={64} />}
                </div>
                <h2>Score: {score} / {actualLength}</h2>
                <p style={{ fontSize: '1.2rem', color: percentage >= 80 ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {percentage}% Correct
                </p>

                <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                    <p style={{ margin: 0 }}>Time to review your stats and keep improved!</p>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="primary big-btn icon-btn" onClick={() => window.location.reload()}>
                        <PlayCircle size={20} /> New Session
                    </button>
                    <button className="secondary big-btn icon-btn" onClick={onBack}>
                        <ArrowLeft size={20} /> Menu
                    </button>
                </div>
            </div>
        );
    }

    if (!currentWord) return <div className="card">Loading...</div>;

    const progress = isEndless ? 100 : ((currentIndex) / actualLength) * 100;

    return (
        <div className="card fade-in game-container">

            <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: isEndless ? 'var(--accent-hover)' : 'var(--accent-color)', transition: 'width 0.3s' }}></div>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <button className="secondary icon-btn" onClick={onBack} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                    <ArrowLeft size={16} /> Quit
                </button>
                {isEndless && <span>∞ Endless | Score: {score}</span>}
            </div>

            <p style={{ color: 'var(--text-secondary)' }}>Translate this word:</p>

            <div className="word-display">
                {questionWord}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (waitingForCorrection) {
                                checkAnswer();
                            } else if (feedback) {
                                nextWord();
                            } else {
                                checkAnswer();
                            }
                        }
                    }}
                    placeholder={waitingForCorrection ? "Type the correct answer to continue..." : "Type German word..."}
                    autoFocus
                    readOnly={!!feedback && !waitingForCorrection}
                    style={{
                        borderColor: waitingForCorrection ? 'var(--text-primary)' :
                            feedback?.type === 'correct' ? 'var(--success-color)' :
                                feedback?.type === 'incorrect' ? 'var(--error-color)' : ''
                    }}
                />

                {(!feedback || waitingForCorrection) && (
                    <div className="special-chars">
                        {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map(char => (
                            <button key={char} onClick={() => handleSpecialChar(char)} className="secondary">{char}</button>
                        ))}
                    </div>
                )}
            </div>

            {!feedback ? (
                <button onClick={checkAnswer} className="primary big-btn" style={{ width: '100%' }}>
                    Check Answer
                </button>
            ) : (
                <div className="fade-in">
                    <div className={`feedback-box ${feedback.type}`}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            {feedback.type === 'correct' ? <Check size={20} /> : <X size={20} />}
                            {feedback.type === 'correct' ? 'Correct!' : 'Incorrect'}
                        </h3>
                        <p>{feedback.msg}</p>
                        {feedback.type === 'incorrect' && (
                            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                                Similarity: {feedback.percent}%
                            </div>
                        )}
                    </div>

                    {waitingForCorrection ? (
                        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Please type the correct answer above to continue.
                        </div>
                    ) : (
                        <button onClick={nextWord} className="primary big-btn" style={{ width: '100%', marginTop: '1rem' }}>
                            Continue →
                        </button>
                    )}
                </div>
            )}

        </div>
    );
}

export default TestSession;
