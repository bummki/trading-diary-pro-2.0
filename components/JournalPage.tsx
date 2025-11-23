import React, { useState, useRef } from 'react';
import { Journal } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import ArticleView from './ArticleView';

interface JournalPageProps {
    journals: Journal[];
    setJournals: React.Dispatch<React.SetStateAction<Journal[]>>;
}

type JournalFormData = Omit<Journal, 'id'>;

const JournalPage: React.FC<JournalPageProps> = ({ journals, setJournals }) => {
    const getInitialFormState = (): JournalFormData => ({
        date: new Date().toISOString().split('T')[0],
        category: '매매복기',
        title: '',
        content: '',
        linkedSymbols: [],
        keywords: [],
        analysis: undefined,
    });

    const [formData, setFormData] = useState<JournalFormData>(getInitialFormState());
    const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
    const [keywordInput, setKeywordInput] = useState('');

    const formRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
            setFormData(prev => ({ ...prev, keywords: [...(prev.keywords || []), keywordInput.trim()] }));
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keywordToRemove: string) => {
        setFormData(prev => ({ ...prev, keywords: prev.keywords?.filter(k => k !== keywordToRemove) }));
    };



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingJournalId) {
            // Update
            setJournals(prev => prev.map(j => j.id === editingJournalId ? { ...formData, id: editingJournalId } : j));
        } else {
            // Create
            const newJournal: Journal = {
                id: new Date().toISOString() + Math.random(),
                ...formData,
            };
            setJournals(prev => [newJournal, ...prev]);
        }
        handleCancelEdit();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('이 일지를 삭제하시겠습니까?')) {
            setJournals(journals.filter(j => j.id !== id));
            if (id === editingJournalId) {
                handleCancelEdit();
            }
        }
    };

    const [viewingJournal, setViewingJournal] = useState<Journal | null>(null);

    const handleJournalClick = (journal: Journal) => {
        setViewingJournal(journal);
    };

    const handleEditClick = (e: React.MouseEvent, journal: Journal) => {
        e.stopPropagation();
        setEditingJournalId(journal.id);
        setFormData({ ...journal });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCloseArticle = () => {
        setViewingJournal(null);
    };

    return (
        <div className="space-y-6">
            {viewingJournal && (
                <ArticleView
                    journal={viewingJournal}
                    onClose={handleCloseArticle}
                    allJournals={journals}
                    onJournalClick={setViewingJournal}
                />
            )}
            <div ref={formRef} className="bg-secondary p-6 rounded-lg scroll-mt-20">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold mb-4">{editingJournalId ? '일지 수정' : '새 일지 작성'}</h2>
                    {editingJournalId && (
                        <button onClick={handleCancelEdit} className="text-sm text-text-secondary hover:text-text-primary">취소</button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">날짜</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">카테고리</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent">
                                <option>매매복기</option>
                                <option>매매전략</option>
                                <option>시장 분석</option>
                                <option>학습 내용</option>
                                <option>감정 기록</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">제목</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="일지 제목을 입력하세요" className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">내용</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows={5} placeholder="매매 경험, 학습 내용, 시장 분석 등을 자유롭게 작성하세요." className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">연결된 주식 종목</label>
                        <div className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent min-h-[40px] text-sm flex flex-wrap gap-2 items-center">
                            {formData.linkedSymbols?.length ? formData.linkedSymbols.map(s => <span key={s} className="bg-accent text-xs text-highlight px-2 py-1 rounded-full">{s}</span>) : <span className="text-text-secondary">인식된 종목 없음 (직접 입력 기능은 추후 제공)</span>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">키워드</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-grow flex items-center bg-primary border border-accent rounded-md p-1 flex-wrap gap-1">
                                {formData.keywords?.map(keyword => (
                                    <span key={keyword} className="flex items-center bg-secondary text-xs text-text-secondary px-2 py-1 rounded-full">
                                        {keyword}
                                        <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="ml-1.5 text-text-secondary hover:text-danger">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                                    placeholder={formData.keywords?.length === 0 ? "키워드 입력 후 Enter" : ""}
                                    className="bg-transparent outline-none flex-grow p-1 text-sm"
                                />
                            </div>

                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-highlight hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors">{editingJournalId ? '수정 완료' : '저장'}</button>
                    </div>
                </form>
            </div>
            <div className="bg-secondary p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">일지 목록 ({journals.length})</h2>
                {journals.length === 0 ? (
                    <p className="text-text-secondary">작성된 일지가 없습니다. 첫 번째 일지를 작성해보세요!</p>
                ) : (
                    <div className="space-y-4">
                        {journals.map(journal => (
                            <div key={journal.id} className="bg-primary p-4 rounded-md border border-accent transition-shadow hover:shadow-lg cursor-pointer" onClick={() => handleJournalClick(journal)}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <p className="text-xs text-text-secondary">{new Date(journal.date).toLocaleDateString()} - {journal.category}</p>
                                        <h3 className="text-lg font-semibold text-text-primary">{journal.title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => handleEditClick(e, journal)} className="text-text-secondary hover:text-highlight flex-shrink-0 text-sm">
                                            수정
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(journal.id); }} className="text-danger hover:text-red-400 flex-shrink-0">
                                            <XMarkIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap">{journal.content.substring(0, 150)}{journal.content.length > 150 ? '...' : ''}</p>
                                <div className="mt-3 flex flex-wrap gap-2 items-center">
                                    {journal.linkedSymbols?.map(symbol => (
                                        <span key={symbol} className="bg-accent text-xs text-highlight px-2 py-1 rounded-full">{symbol}</span>
                                    ))}
                                    {journal.keywords?.map(keyword => (
                                        <span key={keyword} className="bg-secondary text-xs text-text-secondary px-2 py-1 rounded-full">{keyword}</span>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-accent">

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalPage;