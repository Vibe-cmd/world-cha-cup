import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

export default function TargetCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const move = (event) => {
      gsap.to(cursor, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.18,
        ease: 'power3.out',
      });
    };

    const enter = () => cursor.classList.add('is-locked');
    const leave = () => cursor.classList.remove('is-locked');
    const targets = document.querySelectorAll('.cursor-target');

    window.addEventListener('pointermove', move);
    targets.forEach((target) => {
      target.addEventListener('pointerenter', enter);
      target.addEventListener('pointerleave', leave);
    });

    return () => {
      window.removeEventListener('pointermove', move);
      targets.forEach((target) => {
        target.removeEventListener('pointerenter', enter);
        target.removeEventListener('pointerleave', leave);
      });
    };
  });

  return <div ref={cursorRef} className="target-cursor" aria-hidden="true" />;
}
