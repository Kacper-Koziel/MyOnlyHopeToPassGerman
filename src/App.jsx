import React, { useState, useEffect } from 'react';
import initialVocabulary from './data/vocabulary.json';
import Game from './components/Game';
import WordList from './components/WordList';
import Flashcards from './components/Flashcards';
import TestSession from './components/TestSession';
import { BookOpen, CreditCard, GraduationCap, Settings } from 'lucide-react';
import './styles/App.css';

function App() {
    const [view, setView] = useState('menu');
    const [vocabulary, setVocabulary] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('vocabulary');
        if (saved) {
            let parsed = JSON.parse(saved);

            if (parsed.length > 0 && !parsed[0].chapter && initialVocabulary.length > 0 && initialVocabulary[0].chapter) {
                console.log("Migrating vocabulary to new structure...");
                parsed = initialVocabulary;
            }

            const existingIds = new Set(parsed.map(w => w.id));
            const newWords = initialVocabulary.filter(w => !existingIds.has(w.id));

            if (newWords.length > 0) {
                console.log(`Found ${newWords.length} new words. Merging...`);
                parsed = [...parsed, ...newWords];
            }

            setVocabulary(parsed);
            localStorage.setItem('vocabulary', JSON.stringify(parsed));
        } else {
            setVocabulary(initialVocabulary);
        }
    }, []);

    const saveVocabulary = (newVocab) => {
        setVocabulary(newVocab);
        localStorage.setItem('vocabulary', JSON.stringify(newVocab));
    };

    const [testLength, setTestLength] = useState(10);
    const [filterType, setFilterType] = useState('all');
    const [filterValue, setFilterValue] = useState('');
    const [targetMode, setTargetMode] = useState('test');

    const pages = [...new Set(vocabulary.map(v => v.page).filter(p => p && p !== 'Unknown'))];
    const lessons = [...new Set(vocabulary.map(v => v.lesson).filter(l => l && l !== 'Unknown'))];
    const chapters = [...new Set(vocabulary.map(v => v.chapter).filter(c => c && c !== 'Unknown'))];

    const startTest = (length) => {
        setTestLength(length);
        setView(targetMode);
    };

    const getFilteredVocabulary = () => {
        if (filterType === 'all') return vocabulary;
        return vocabulary.filter(v => {
            if (filterType === 'page') return v.page === filterValue;
            if (filterType === 'lesson') return v.lesson === filterValue;
            if (filterType === 'chapter') return v.chapter === filterValue;
            return true;
        });
    };

    const activeVocabulary = getFilteredVocabulary();

    const openSetup = (mode) => {
        setTargetMode(mode);
        setFilterType('all');
        setFilterValue('');
        setView('setup');
    };

    const menuCard = (
        <div className="card fade-in" style={{ textAlign: 'center' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <BookOpen size={32} /> German Learning
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Master your vocabulary every day.
            </p>

            <div style={{ display: 'grid', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                <button className="primary big-btn icon-btn" onClick={() => openSetup('flashcards')}>
                    <CreditCard size={20} /> Flashcards
                </button>
                <button className="primary big-btn icon-btn" onClick={() => openSetup('test')}>
                    <GraduationCap size={20} /> Take Test (Graded)
                </button>
                <button className="secondary icon-btn" onClick={() => setView('list')}>
                    <Settings size={18} /> Manage Vocabulary
                </button>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#475569' }}>
                {vocabulary.length} words loaded
            </p>
        </div>
    );

    const setupCard = (
        <div className="card fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h2>{targetMode === 'test' ? 'Test Setup' : 'Flashcards Setup'}</h2>

            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>1. Filter Scope</label>
                <select
                    value={filterType}
                    onChange={e => { setFilterType(e.target.value); setFilterValue(''); }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                    <option value="all">All Words ({vocabulary.length})</option>
                    <option value="page">By Page</option>
                    <option value="chapter">By Chapter</option>
                    <option value="lesson">By Lesson</option>
                </select>

                {filterType !== 'all' && (
                    <select
                        value={filterValue}
                        onChange={e => setFilterValue(e.target.value)}
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                        <option value="">Select...</option>
                        {filterType === 'page' && pages.map(p => <option key={p} value={p}>{p}</option>)}
                        {filterType === 'chapter' && chapters.map(c => <option key={c} value={c}>{c}</option>)}
                        {filterType === 'lesson' && lessons.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                )}
            </div>

            <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>2. {targetMode === 'test' ? 'Test Length' : 'Mode'}</label>
                {targetMode === 'test' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button className="secondary" onClick={() => startTest(10)}>10 Words</button>
                        <button className="secondary" onClick={() => startTest(50)}>50 Words</button>
                        <button className="secondary" onClick={() => startTest(100)}>100 Words</button>
                        <button className="secondary" onClick={() => startTest('all')}>All Selected</button>
                        <button className="primary" style={{ gridColumn: '1 / -1' }} onClick={() => startTest('endless')}>∞ Endless Mode</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <button className="primary" onClick={() => setView('flashcards')}>Start Flashcards</button>
                    </div>
                )}
            </div>

            <button className="secondary text-btn" onClick={() => setView('menu')}>Cancel</button>
        </div>
    );

    return (
        <div className="app-container">
            {view === 'menu' && menuCard}
            {view === 'setup' && setupCard}

            {view === 'test' && (
                <TestSession
                    vocabulary={activeVocabulary}
                    sessionLength={testLength}
                    onBack={() => setView('menu')}
                />
            )}

            {view === 'flashcards' && (
                <Flashcards
                    vocabulary={activeVocabulary}
                    onBack={() => setView('menu')}
                />
            )}

            {view === 'game' && (
                <Game
                    vocabulary={vocabulary}
                    onBack={() => setView('menu')}
                />
            )}

            {view === 'list' && (
                <WordList
                    vocabulary={vocabulary}
                    setVocabulary={saveVocabulary}
                    onBack={() => setView('menu')}
                />
            )}
        </div>
    );
}

export default App;
