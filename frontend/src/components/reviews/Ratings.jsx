import { useState } from "react";
import { Star } from "lucide-react";

export function RatingStars({ value, size = 28 }) {
  return <span className="eh-rating-stars" role="img" aria-label={`${value.toFixed(2)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(n => <span className="eh-rating-star" key={n} style={{ width: size, height: size }}>
      <Star size={size} fill="currentColor" className="eh-star-empty" />
      <span className="eh-star-fill" style={{ width: `${Math.max(0, Math.min(1, value - n + 1)) * 100}%` }}><Star size={size} fill="currentColor" /></span>
    </span>)}
  </span>;
}

export function RatingSummary({ reviews, selected, onSelect }) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach(r => { const n = Number(r.rating); if (Number.isInteger(n) && n >= 1 && n <= 5) counts[n - 1]++; });
  const total = counts.reduce((sum, n) => sum + n, 0);
  const average = total ? counts.reduce((sum, n, i) => sum + n * (i + 1), 0) / total : 0;
  return <section className="eh-rating-summary" aria-label="Overall rating">
    <h3 className="eh-rating-heading">Overall Rating</h3>
    <div className="eh-rating-summary-body">
      <div className="eh-rating-overall">
        <div className="eh-rating-score"><strong>{average.toFixed(2)}</strong><RatingStars value={average} size={36}/></div>
        <p>{total ? `Based on ${total} Review${total === 1 ? "" : "s"}` : "No ratings yet"}</p>
        <span className="eh-rating-caption">Reviews from verified purchases</span>
      </div>
      <div className="eh-rating-distribution"><h3>Ratings Distribution</h3>
        {[5, 4, 3, 2, 1].map(n => <button type="button" key={n} className={`eh-rating-bar-row${selected === n ? " is-selected" : ""}`} aria-pressed={selected === n} aria-label={`Show ${n} star reviews: ${counts[n - 1]}`} onClick={() => onSelect(selected === n ? 0 : n)}>
          <span>{n} Star</span><span className="eh-rating-track"><span style={{ width: `${total ? counts[n - 1] / total * 100 : 0}%` }}/></span><b>{counts[n - 1]}</b>
        </button>)}
      </div>
    </div>
    <div className="eh-rating-filter"><span aria-live="polite">{selected ? `Showing ${selected} star reviews` : "Showing all reviews"}</span>{selected > 0 && <button type="button" onClick={() => onSelect(0)}>Clear filter</button>}</div>
  </section>;
}

export function RatingPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return <fieldset className="eh-rating-picker"><legend>Your rating</legend>
    <div className="eh-rating-picker-options" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => <label key={n} onMouseEnter={() => setHover(n)}>
        <input type="radio" name="product-rating" value={n} checked={value === n} onChange={() => onChange(n)} aria-label={`${n} star${n === 1 ? "" : "s"} — ${labels[n - 1]}`}/>
        <Star size={34} className={n <= (hover || value) ? "is-filled" : ""} fill="currentColor" aria-hidden="true"/>
      </label>)}
      <span>{labels[(hover || value) - 1]}</span>
    </div>
  </fieldset>;
}
