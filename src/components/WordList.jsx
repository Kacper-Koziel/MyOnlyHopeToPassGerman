import React, { useState } from 'react';
import { ArrowLeft, Plus, RefreshCw, Trash2, Search } from 'lucide-react';

function WordList({ vocabulary, setVocabulary, onBack }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleUpdate = (id, field, value) => {
        const newVocab = vocabulary.map(word =>
            word.id === id ? { ...word, [field]: value } : word
        );
        setVocabulary(newVocab);
    };

    const handleDelete = (id) => {
        if (confirm('Delete word?')) {
            setVocabulary(vocabulary.filter(w => w.id !== id));
        }
    };

    const handleSwap = (id) => {
        const newVocab = vocabulary.map(word =>
            word.id === id ? { ...word, pl: word.de, de: word.pl } : word
        );
        setVocabulary(newVocab);
    }

    const handleAdd = () => {
        const newId = Math.max(...vocabulary.map(v => v.id), 0) + 1;
        setVocabulary([{ id: newId, pl: '', de: '' }, ...vocabulary]);
    }

    const filtered = vocabulary.filter(w =>
        (w.pl && w.pl.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (w.de && w.de.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button className="secondary icon-btn" onClick={onBack}><ArrowLeft size={18} /> Back</button>
                <h2>Editor</h2>
                <button className="primary icon-btn" onClick={handleAdd}><Plus size={18} /> New</button>
            </div>

            <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2rem' }}
                />
            </div>

            <div className="list-container">
                {filtered.map(word => (
                    <div key={word.id} className="list-item">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '30px' }}>DE</span>
                                <input
                                    value={word.de}
                                    onChange={(e) => handleUpdate(word.id, 'de', e.target.value)}
                                    placeholder="German Word"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', width: '30px' }}>PL</span>
                                <input
                                    value={word.pl}
                                    onChange={(e) => handleUpdate(word.id, 'pl', e.target.value)}
                                    placeholder="Polish Translation"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button className="action-btn" title="Swap Languages" onClick={() => handleSwap(word.id)}>
                                <RefreshCw size={14} />
                            </button>
                            <button className="action-btn" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }} onClick={() => handleDelete(word.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WordList;
