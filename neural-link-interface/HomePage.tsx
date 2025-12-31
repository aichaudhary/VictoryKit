import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HomePage.css';

import ScrollProgress from './components/ScrollProgress';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const main = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      if (!self.selector) return;
      const sections = self.selector('.panel');
      sections.forEach((section: HTMLElement) => {
        gsap.fromTo(
          section.querySelector('.content'),
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top center',
              end: 'center center',
              scrub: 1,
            },
          }
        );
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            pin: true,
            pinSpacing: false,
            scrub: 1,
          },
        });
      });
    }, main);
    return () => ctx.revert();
  }, []);

  // We need to re-render when the ref is set to pass it to the child
  const [refReady, setRefReady] = React.useState(false);
  useLayoutEffect(() => {
    if (main.current) {
      setRefReady(true);
    }
  }, []);

  return (
    <div ref={main}>
      {refReady && <ScrollProgress sections={main} />}
      <div className="description panel blue">
        <div>
          <h1>Creative Services</h1>
          <p>We are a creative agency that specializes in building unique and innovative digital experiences.</p>
          <div className="scroll-down">
            Scroll down
            <div className="arrow"></div>
          </div>
        </div>
      </div>

      <section className="panel red">
        <div className="content">
          <h2>Section One</h2>
          <p>This is the content for the first section.</p>
        </div>
      </section>
      <section className="panel orange">
        <div className="content">
          <h2>Section Two</h2>
          <p>This is the content for the second section.</p>
        </div>
      </section>
      <section className="panel purple">
        <div className="content">
          <h2>Section Three</h2>
          <p>This is the content for the third section.</p>
        </div>
      </section>
      <section className="panel green">
        <div className="content">
          <h2>Section Four</h2>
          <p>This is the content for the fourth section.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
