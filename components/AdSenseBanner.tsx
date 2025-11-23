import React from 'react';

const AdSenseBanner: React.FC<{ className?: string }> = ({ className }) => {
    const adRef = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Load 200px before it comes into view
        );

        if (adRef.current) {
            observer.observe(adRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={adRef}
            className={`adsense-container my-6 flex justify-center items-center bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[250px] ${className || ''}`}
        >
            <div className="text-center w-full">
                <p className="text-xs text-gray-400 mb-1">ADVERTISEMENT</p>
                {isVisible ? (
                    <>
                        <ins className="adsbygoogle"
                            style={{ display: 'block' }}
                            data-ad-client="ca-pub-2695727848475573"
                            data-ad-slot="7932374339"
                            data-ad-format="auto"
                            data-full-width-responsive="true"></ins>
                        <script>
                            (adsbygoogle = window.adsbygoogle || []).push({ });
                        </script>
                    </>
                ) : (
                    <div className="h-[200px] w-full bg-gray-100 animate-pulse rounded"></div>
                )}
            </div>
        </div>
    );
};

export default AdSenseBanner;
