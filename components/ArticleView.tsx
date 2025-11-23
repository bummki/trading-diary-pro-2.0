import React, { useEffect, useMemo } from 'react';
import { Journal } from '../types';
import AdSenseBanner from './AdSenseBanner';
import { XMarkIcon } from './icons/XMarkIcon';

interface ArticleViewProps {
    journal: Journal;
    onClose: () => void;
    allJournals: Journal[];
    onJournalClick: (journal: Journal) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ journal, onClose, allJournals, onJournalClick }) => {

    // SEO: Update Title & Meta Description
    useEffect(() => {
        document.title = `${journal.title} - Trading Diary Pro`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', journal.content.substring(0, 150));
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = journal.content.substring(0, 150);
            document.head.appendChild(meta);
        }

        // Cleanup
        return () => {
            document.title = 'Trading Diary Pro';
        };
    }, [journal]);

    // Generate TOC
    const toc = useMemo(() => {
        // Simple regex to find h2 and h3. 
        // Note: This assumes content is plain text or simple markdown-like. 
        // If content is HTML, we'd need a parser. 
        // Given the prompt implies HTML structure (h3, button-wrapper), we'll assume content MIGHT be HTML or we need to parse it.
        // For now, let's assume the user enters text but we might render it with some structure.
        // However, the prompt explicitly asks to insert ads after <h3>. 
        // If the current input is just a textarea, we might not have <h3> tags yet.
        // But to fulfill the request, I will implement the logic assuming the content *could* have these tags.
        // If it's plain text, we might need a markdown parser or similar. 
        // For this implementation, I'll assume the content is rendered as HTML.
        return [];
    }, [journal.content]);

    // Related Posts
    const relatedPosts = useMemo(() => {
        return allJournals

        export default ArticleView;
