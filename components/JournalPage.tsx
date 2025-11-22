import React, { useState, useRef } from 'react';
import { Journal } from '../types';
import { GoogleGenAI } from '@google/genai';
import { XMarkIcon } from './icons/XMarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

interface JournalPageProps {
  journals: Journal[];
  setJournals: React.Dispatch<React.SetStateAction<Journal[]>>;
  ai: GoogleGenAI;
}

type JournalFormData = Omit<Journal, 'id'>;

const JournalPage: React.FC<JournalPageProps> = ({ journals, setJournals, ai }) => {
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
  
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isSavingImageId, setIsSavingImageId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleContentBlur = async () => {
    if (formData.content.trim().length < 10) return;
    setIsRecognizing(true);
    try {
        const prompt = `다음 텍스트에서 주식 티커(예: AAPL, 005930.KS)와 암호화폐 심볼(예: BTC, ETH)을 모두 추출해서 쉼표로 구분된 단일 문자열로 반환해줘. 다른 설명은 필요 없어. 텍스트: "${formData.title} ${formData.content}"`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const symbolsText = response.text;
        const symbols = symbolsText.split(',').map(s => s.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
        setFormData(prev => ({...prev, linkedSymbols: symbols}));
    } catch (error) {
        console.error("Error recognizing symbols:", error);
    } finally {
        setIsRecognizing(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
        setFormData(prev => ({...prev, keywords: [...(prev.keywords || []), keywordInput.trim()]}));
        setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({...prev, keywords: prev.keywords?.filter(k => k !== keywordToRemove)}));
  };
  
  const handleRecommendKeywords = async () => {
    if (formData.content.trim().length < 10) return;
    setIsRecommending(true);
    try {
        const prompt = `다음 매매일지 내용의 핵심 키워드를 5개만 쉼표로 구분해서 제안해줘. 다른 설명은 필요 없어. 내용: "${formData.title} ${formData.content}"`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const keywordsText = response.text;
        const recommendedKeywords = keywordsText.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({...prev, keywords: [...new Set([...(prev.keywords || []), ...recommendedKeywords])]})); // Merge and remove duplicates
    } catch (error) {
        console.error("Error recommending keywords:", error);
    } finally {
        setIsRecommending(false);
    }
  };

  const handleAnalyzeJournal = async (journal: Journal) => {
    setAnalyzingId(journal.id);
    try {
        const prompt = `다음 매매일지를 분석해줘.
        일지 제목: ${journal.title}
        일지 내용: ${journal.content}

        분석 결과를 다음 JSON 형식으로 제공해줘. 각 항목은 한국어로 작성하고 2-3문장으로 요약해줘.
        {
            "technical": "기술적 분석 관점에서의 피드백",
            "mindset": "매매 심리 및 마인드셋 관점에서의 조언",
            "quote": "현재 상황에 영감을 줄 수 있는 투자 명언 한마디"
        }`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const analysisResult = JSON.parse(response.text);
        setJournals(prev => prev.map(j => j.id === journal.id ? {...j, analysis: analysisResult} : j));
    } catch (error) {
        console.error("Error analyzing journal:", error);
    } finally {
        setAnalyzingId(null);
    }
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  const handleSaveAnalysisAsImage = async (journal: Journal) => {
    if (!journal.analysis) return;
    setIsSavingImageId(journal.id);

    const width = 600;
    const height = 450;

    const cardHtml = `
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; width: 100%; height: 100%; display: flex; flex-direction: column; padding: 24px; color: #111827;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
            <div>
                <h2 style="font-size: 20px; font-weight: bold; margin: 0; color: #111827;">AI 매매일지 분석 리포트</h2>
                <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">${new Date(journal.date).toLocaleDateString()}</p>
            </div>
            <p style="font-size: 14px; font-weight: bold; color: #3b82f6; margin: 0;">TradingDiary<span style="color: #111827;">Pro</span></p>
        </div>
        <div style="flex-grow: 1; overflow: hidden;">
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${escapeHtml(journal.title)}</p>
            <div style="font-size: 14px; line-height: 1.6;">
                <div style="margin-bottom: 10px;">
                    <h4 style="font-weight: 600; color: #3b82f6; margin: 0 0 4px 0;">📈 기술적 분석</h4>
                    <p style="margin: 0; color: #6b7280;">${escapeHtml(journal.analysis.technical)}</p>
                </div>
                <div style="margin-bottom: 10px;">
                    <h4 style="font-weight: 600; color: #3b82f6; margin: 0 0 4px 0;">🧠 마음가짐</h4>
                    <p style="margin: 0; color: #6b7280;">${escapeHtml(journal.analysis.mindset)}</p>
                </div>
                <div>
                    <h4 style="font-weight: 600; color: #3b82f6; margin: 0 0 4px 0;">💬 오늘의 명언</h4>
                    <p style="margin: 0; color: #6b7280; font-style: italic;">"${escapeHtml(journal.analysis.quote)}"</p>
                </div>
            </div>
        </div>
      </div>
    `;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          ${cardHtml}
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `TradingDiaryPro_Analysis_${journal.date}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
        setIsSavingImageId(null);
    };
    img.onerror = () => {
        console.error("Failed to load SVG image");
        URL.revokeObjectURL(url);
        setIsSavingImageId(null);
    };
    img.src = url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJournalId) {
        // Update
        setJournals(prev => prev.map(j => j.id === editingJournalId ? {...formData, id: editingJournalId} : j));
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

  const handleJournalClick = (journal: Journal) => {
    setEditingJournalId(journal.id);
    setFormData({ ...journal });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingJournalId(null);
    setFormData(getInitialFormState());
    setKeywordInput('');
  };

  return (
    <div className="space-y-6">
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
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
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
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="일지 제목을 입력하세요" className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">내용</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} onBlur={handleContentBlur} rows={5} placeholder="매매 경험, 학습 내용, 시장 분석 등을 자유롭게 작성하세요." className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">연결된 주식 종목</label>
                    <div className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent min-h-[40px] text-sm flex flex-wrap gap-2 items-center">
                        {isRecognizing ? <span className="text-text-secondary">자동으로 인식 중...</span> : formData.linkedSymbols?.length ? formData.linkedSymbols.map(s => <span key={s} className="bg-accent text-xs text-highlight px-2 py-1 rounded-full">{s}</span>) : <span className="text-text-secondary">인식된 종목 없음</span>}
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
                                        <XMarkIcon className="w-3 h-3"/>
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
                        <button type="button" onClick={handleRecommendKeywords} disabled={isRecommending} className="flex-shrink-0 flex items-center justify-center space-x-2 bg-highlight/20 text-highlight hover:bg-highlight/30 font-medium py-2 px-3 rounded-md transition-colors text-sm disabled:opacity-50">
                            {isRecommending ? '생성중...' : <><SparklesIcon className="w-4 h-4"/><span>AI 키워드 추천</span></>}
                        </button>
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
                        <div key={journal.id} className="bg-primary p-4 rounded-md border border-accent transition-shadow hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="cursor-pointer flex-grow" onClick={() => handleJournalClick(journal)}>
                                    <p className="text-xs text-text-secondary">{new Date(journal.date).toLocaleDateString()} - {journal.category}</p>
                                    <h3 className="text-lg font-semibold text-text-primary">{journal.title}</h3>
                                </div>
                                <button onClick={() => handleDelete(journal.id)} className="text-danger hover:text-red-400 ml-4 flex-shrink-0">
                                    <XMarkIcon />
                                </button>
                            </div>
                            <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap cursor-pointer" onClick={() => handleJournalClick(journal)}>{journal.content.substring(0, 150)}{journal.content.length > 150 ? '...' : ''}</p>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                {journal.linkedSymbols?.map(symbol => (
                                    <span key={symbol} className="bg-accent text-xs text-highlight px-2 py-1 rounded-full">{symbol}</span>
                                ))}
                                {journal.keywords?.map(keyword => (
                                    <span key={keyword} className="bg-secondary text-xs text-text-secondary px-2 py-1 rounded-full">{keyword}</span>
                                ))}
                            </div>
                             <div className="mt-4 pt-4 border-t border-accent">
                                {journal.analysis ? (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-text-primary flex items-center">
                                                <SparklesIcon className="w-5 h-5 mr-2 text-highlight"/>
                                                AI 분석 결과
                                            </h4>
                                            <button
                                                onClick={() => handleSaveAnalysisAsImage(journal)}
                                                disabled={isSavingImageId === journal.id}
                                                className="text-text-secondary hover:text-text-primary p-1.5 rounded-full hover:bg-accent disabled:opacity-50"
                                                title="이미지로 저장"
                                            >
                                                {isSavingImageId === journal.id ? (
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                <ArrowDownTrayIcon />
                                                )}
                                            </button>
                                        </div>
                                        <div className="space-y-3 text-sm bg-primary p-3 rounded-md">
                                            <div>
                                                <h5 className="font-semibold text-highlight mb-1">📈 기술적 분석</h5>
                                                <p className="text-text-secondary">{journal.analysis.technical}</p>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-highlight mb-1">🧠 마음가짐</h5>
                                                <p className="text-text-secondary">{journal.analysis.mindset}</p>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-highlight mb-1">💬 오늘의 명언</h5>
                                                <p className="text-text-secondary italic">"{journal.analysis.quote}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => handleAnalyzeJournal(journal)} disabled={analyzingId === journal.id} className="flex items-center space-x-2 bg-highlight/20 text-highlight hover:bg-highlight/30 font-medium py-1.5 px-3 rounded-md transition-colors text-sm disabled:opacity-50">
                                         {analyzingId === journal.id ? '분석중...' : <><SparklesIcon className="w-4 h-4"/><span>Gemini로 분석하기</span></>}
                                    </button>
                                )}
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