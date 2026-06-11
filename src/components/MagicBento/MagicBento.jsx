import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

export default function MagicBento({ cards }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const items = rootRef.current.querySelectorAll('.magic-card');
    gsap.fromTo(items, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, ease: 'power2.out' });
  }, [cards]);

  return (
    <section ref={rootRef} className="magic-bento">
      {cards.map((card) => (
        <article key={card.title} className={`card magic-card cursor-target ${card.span ?? ''}`}>
          <span className="eyebrow">{card.kicker}</span>
          <h3>{card.title}</h3>
          <div>{card.children}</div>
        </article>
      ))}
    </section>
  );
}
