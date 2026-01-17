import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCw, ArrowRight } from 'lucide-react';
import '../styles/App.css';


function Flashcards({ vocabulary, onBack }) {
    const [shuffledVocab, setShuffledVocab] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const shuffled = [...vocabulary]
            .filter(w => w.pl && w.de)
            .sort(() => 0.5 - Math.random());
        setShuffledVocab(shuffled);
    }, [vocabulary]);

    const currentWord = shuffledVocab[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % shuffledVocab.length);
        }, 200);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    if (!currentWord) return <div className="card">Loading...</div>;

    return (
        <div className="flashcard-container fade-in">
            <button className="secondary icon-btn" onClick={onBack} style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                <ArrowLeft size={18} /> Menu
            </button>

            <div className="progress-indicator">
                Card {currentIndex + 1} / {shuffledVocab.length}
            </div>

            <div className={`scene scene--card`}>
                <div className={`card-3d ${isFlipped ? 'is-flipped' : ''}`} onClick={handleFlip}>
                    <div className="card__face card__face--front">
                        <span className="card-label">Polish</span>
                        <div className="card-text">{currentWord.pl}</div>
                        <div className="instruction-hint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RotateCw size={14} /> Click to Flip</div>
                    </div>
                    <div className="card__face card__face--back">
                        <span className="card-label">German</span>
                        <div className="card-text">{currentWord.de}</div>
                    </div>
                </div>
            </div>

            <div className="controls">
                <button className="primary big-btn icon-btn" onClick={handleNext}>
                    Next Card <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}

export default Flashcards;
