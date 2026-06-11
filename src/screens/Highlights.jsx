import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    async function loadHighlights() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('highlight_date', { ascending: false });

      if (!error) {
        setHighlights(
          data.map((item) => ({
            id: item.id,
            matchLabel: item.match_label,
            youtubeId: item.youtube_id,
            description: item.description,
            date: item.highlight_date,
          })),
        );
      }
    }

    loadHighlights();
  }, []);

  return (
    <section className="stack">
      <div className="section-title">
        <div>
          <span className="eyebrow">Highlights</span>
          <h2>Clips worth arguing about</h2>
        </div>
      </div>
      <div className="highlight-grid">
        {highlights.length ? highlights
          .slice()
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((highlight) => (
            <article className="card cursor-target highlight-card" key={highlight.id}>
              <iframe
                title={highlight.matchLabel}
                src={`https://www.youtube.com/embed/${highlight.youtubeId}`}
                allowFullScreen
              />
              <h3>{highlight.matchLabel}</h3>
              <p>{highlight.description}</p>
              <p className="mono">{highlight.date}</p>
            </article>
          )) : <article className="card highlight-card"><p className="muted">No highlights added yet. Use the admin page after Supabase is configured.</p></article>}
      </div>
    </section>
  );
}
