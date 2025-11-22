
import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-text-secondary text-sm p-8 mt-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-text-primary mb-2">TradingDiaryPro 소개</h4>
          <p className="text-xs">
            TradingDiaryPro는 암호화폐 및 주식 투자자를 위한 올인원 매매일지 및 분석 도구입니다. 복잡한 시장 데이터를 한눈에 파악하고, 개인의 투자 기록을 체계적으로 관리하며, 심층적인 분석을 통해 투자 전략을 개선할 수 있도록 돕습니다.
          </p>
        </div>
        <div>
            <h4 className="font-bold text-text-primary mb-2">주요 기능</h4>
            <ul className="space-y-2 text-xs">
                <li className="flex items-start"><CheckCircleIcon className="mr-2 text-highlight flex-shrink-0" /> 실시간 코인 가격</li>
                <li className="flex items-start"><CheckCircleIcon className="mr-2 text-highlight flex-shrink-0" /> 매매일지 작성 및 관리</li>
                <li className="flex items-start"><CheckCircleIcon className="mr-2 text-highlight flex-shrink-0" /> 성과 지표 대시보드</li>
                <li className="flex items-start"><CheckCircleIcon className="mr-2 text-highlight flex-shrink-0" /> 데이터 내보내기/가져오기</li>
            </ul>
        </div>
        <div>
          <h4 className="font-bold text-text-primary mb-2">TradingDiaryPro 사용법</h4>
          <p className="text-xs">
            별도의 회원가입 없이 바로 사용할 수 있으며, 모든 데이터는 로컬 브라우저에 안전하게 저장됩니다. 상단 메뉴를 통해 대시보드, 거래 내역, 매매일지 등 다양한 기능을 탐색하고 당신의 투자 여정을 기록하세요.
          </p>
        </div>
         <div>
          <h4 className="font-bold text-text-primary mb-2">문의 및 지원</h4>
          <p className="text-xs">
            사용 중 궁금한 점이나 기술적인 문제가 발생하면 언제든지 다음 이메일 주소로 문의해 주세요: tradingdiarypro521@gmail.com
          </p>
        </div>
      </div>
      <div className="text-center mt-8 pt-4 border-t border-accent text-xs">
        © 2025 TradingDiaryPro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
