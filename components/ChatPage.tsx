
import React, { useState, useEffect, useRef } from 'react';
import { CommunityMessage, UserProfile } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

// Inline PaperAirplaneIcon since it might be missing from the file system
const PaperAirplaneIconComponent = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);

const CHANNELS = [
    { id: 'general', name: '자유게시판', desc: '자유롭게 이야기를 나누세요' },
    { id: 'profit', name: '수익인증', desc: '오늘의 수익을 자랑해보세요' },
    { id: 'qna', name: '질문답변', desc: '궁금한 점을 물어보세요' },
    { id: 'strategy', name: '매매전략', desc: '자신만의 매매 전략 공유' },
];

const STORAGE_KEY_MESSAGES = 'community_messages_v1';
const STORAGE_KEY_PROFILE = 'community_profile_v1';

const ChatPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [nicknameInput, setNicknameInput] = useState('');
    const [currentChannelId, setCurrentChannelId] = useState('general');
    const [messages, setMessages] = useState<CommunityMessage[]>([]);
    const [input, setInput] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load initial data
    useEffect(() => {
        const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        }

        const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    // Listen for storage events to sync messages across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY_MESSAGES && e.newValue) {
                setMessages(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentChannelId]);

    const handleSetNickname = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nicknameInput.trim()) return;
        
        const newProfile: UserProfile = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            nickname: nicknameInput.trim()
        };
        
        setProfile(newProfile);
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !profile) return;

        const newMessage: CommunityMessage = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            channelId: currentChannelId,
            userId: profile.id,
            nickname: profile.nickname,
            text: input.trim(),
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updatedMessages));
        setInput('');
    };

    const handleClearChat = () => {
        if(window.confirm("현재 채널의 모든 대화 내용을 삭제하시겠습니까? (나에게만 삭제됩니다)")) {
            const filtered = messages.filter(m => m.channelId !== currentChannelId);
            setMessages(filtered);
            localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(filtered));
        }
    };

    const handleArchiveChat = () => {
        const channelMessages = messages.filter(m => m.channelId === currentChannelId);
        if (channelMessages.length === 0) {
            alert('저장할 대화 내용이 없습니다.');
            return;
        }

        const currentChannel = CHANNELS.find(c => c.id === currentChannelId);
        const title = `TradingDiaryPro_${currentChannel?.name}_Chat_Archive`;
        const content = channelMessages.map(m => 
            `[${new Date(m.timestamp).toLocaleString()}] ${m.nickname}: ${m.text}`
        ).join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredMessages = messages.filter(m => m.channelId === currentChannelId);

    if (!profile) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col justify-center items-center bg-secondary rounded-lg shadow-lg p-8">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
                    <UserGroupIcon />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">트레이더 커뮤니티</h2>
                <p className="text-text-secondary mb-8 text-center max-w-md">
                    다른 트레이더들과 실시간으로 소통하고 정보를 공유하세요.<br/>
                    대화에 참여하기 위해 닉네임을 설정해주세요.
                </p>
                <form onSubmit={handleSetNickname} className="w-full max-w-xs flex flex-col space-y-4">
                    <input 
                        type="text" 
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        placeholder="사용할 닉네임 입력" 
                        className="w-full p-3 bg-primary border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-highlight"
                        autoFocus
                        maxLength={10}
                    />
                    <button 
                        type="submit"
                        disabled={!nicknameInput.trim()} 
                        className="w-full bg-highlight hover:bg-teal-500 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50"
                    >
                        입장하기
                    </button>
                </form>
            </div>
        );
    }

    const currentChannelInfo = CHANNELS.find(c => c.id === currentChannelId);

    return (
        <div className="flex h-[calc(100vh-140px)] bg-secondary rounded-lg overflow-hidden shadow-lg border border-accent">
            {/* Sidebar (Channel List) */}
            <div className="w-1/4 md:w-1/5 border-r border-accent bg-primary flex flex-col">
                <div className="p-4 border-b border-accent">
                    <h3 className="font-bold text-text-primary flex items-center">
                        <UserGroupIcon />
                        <span className="ml-2 hidden md:inline">채널 목록</span>
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                        {profile.nickname}님 접속중
                    </p>
                </div>
                <div className="flex-grow overflow-y-auto py-2">
                    {CHANNELS.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => setCurrentChannelId(channel.id)}
                            className={`w-full text-left px-4 py-3 transition-colors flex flex-col ${
                                currentChannelId === channel.id 
                                    ? 'bg-secondary border-l-4 border-highlight text-highlight shadow-sm' 
                                    : 'text-text-secondary hover:bg-accent/50 hover:text-text-primary'
                            }`}
                        >
                            <span className="font-medium text-sm">{channel.name}</span>
                            <span className="text-[10px] opacity-70 hidden md:block truncate">{channel.desc}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-accent">
                     <button 
                        onClick={() => setProfile(null)}
                        className="text-xs text-text-secondary hover:text-danger underline"
                     >
                        로그아웃 (닉네임 변경)
                     </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-grow flex flex-col bg-secondary relative">
                {/* Channel Header */}
                <div className="p-4 border-b border-accent bg-secondary flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h3 className="font-bold text-text-primary text-lg"># {currentChannelInfo?.name}</h3>
                        <p className="text-xs text-text-secondary">{currentChannelInfo?.desc}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleArchiveChat}
                            className="text-text-secondary hover:text-highlight p-2 rounded-full hover:bg-accent"
                            title="대화 내용 아카이브(다운로드)"
                        >
                            <ArrowDownTrayIcon />
                        </button>
                        <button 
                            onClick={handleClearChat}
                            className="text-text-secondary hover:text-danger p-2 rounded-full hover:bg-accent"
                            title="대화 내용 지우기"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-primary/30">
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-60">
                            <UserGroupIcon />
                            <p className="mt-2 text-sm">이 채널의 첫 번째 메시지를 남겨보세요!</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => {
                            const isMyMessage = msg.userId === profile.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-end max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                            {!isMyMessage && (
                                                <span className="text-xs text-text-secondary mb-1 ml-1 font-medium">{msg.nickname}</span>
                                            )}
                                            <div
                                                className={`p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm break-all ${
                                                    isMyMessage
                                                        ? 'bg-highlight text-white rounded-br-none'
                                                        : 'bg-white text-text-primary border border-accent rounded-bl-none'
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-text-secondary mt-1 mx-1 opacity-70">
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-accent">
                    <div className="relative flex items-end border border-accent rounded-xl bg-primary focus-within:ring-2 focus-within:ring-highlight focus-within:border-transparent transition-all">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`${profile.nickname}(으)로 메시지 보내기...`}
                            className="w-full max-h-32 p-3 bg-transparent border-none focus:ring-0 text-text-primary placeholder-text-secondary resize-none text-sm"
                            rows={1}
                            style={{minHeight: '44px'}}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim()}
                            className="p-3 text-highlight hover:text-teal-600 disabled:text-gray-300 transition-colors"
                        >
                            <PaperAirplaneIconComponent />
                        </button>
                    </div>
                     <div className="text-center mt-2 text-[10px] text-text-secondary">
                        대화 내용은 브라우저에 저장(아카이브)되며, 같은 브라우저의 다른 탭과 실시간 동기화됩니다.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
