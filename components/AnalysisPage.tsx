import React from 'react';
import EmptyState from './EmptyState';

const AnalysisPage: React.FC = () => {
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">분석</h2>
        </div>
        <EmptyState
            title="분석 기능 준비중"
            message="거래 데이터를 기반으로 한 심층 분석 리포트가 제공될 예정입니다."
        />
    </div>
  );
};

export default AnalysisPage;
