import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './ScrollProgress.css';

interface ScrollProgressProps {
  sections: React.RefObject<HTMLDivElement>;
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({ sections }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const trainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!sections.current || !progressRef.current) return;

    const dots = Array.from(progressRef.current.querySelectorAll('.dot')) as HTMLElement[];
    if (dots.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.to(trainRef.current, {
        scrollTrigger: {
          trigger: sections.current,
          scrub: 1,
          start: 'top top',
          end: 'bottom bottom',
        },
        y: progressRef.current.offsetHeight - trainRef.current.offsetHeight,
        ease: 'none',
      });

      dots.forEach((dot, index) => {
        const panel = sections.current?.children[index] as HTMLElement;
        if (!panel) return;
        gsap.to(dot, {
          scrollTrigger: {
            trigger: panel,
            start: 'top center',
            end: 'bottom center',
            toggleClass: 'active',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [sections]);

  const numSections = sections.current ? sections.current.querySelectorAll('.panel').length : 0;

  return (
    <div className="scroll-progress" ref={progressRef}>
      <div className="train" ref={trainRef}></div>
      {Array.from({ length: numSections }, (_, i) => (
        <div key={i} className="dot"></div>
      ))}
    </div>
  );
};

export default ScrollProgress;