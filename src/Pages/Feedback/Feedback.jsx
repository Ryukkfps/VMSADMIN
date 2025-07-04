import React, { useEffect, useState } from 'react';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use VITE_API_BASE_URL from env
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${baseUrl}/feedback`);
        if (!response.ok) throw new Error('Failed to fetch feedbacks');
        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>User Feedbacks</h2>
      {loading && <p>Loading feedbacks...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {feedbacks.length === 0 && <li>No feedbacks found.</li>}
          {feedbacks.map((fb, idx) => (
            <li key={fb.id || idx} style={{ borderBottom: '1px solid #ddd', marginBottom: '1rem', paddingBottom: '1rem' }}>
              <strong>{fb.user || 'Anonymous'}</strong>
              <p>{fb.message}</p>
              {fb.createdAt && <small>{new Date(fb.createdAt).toLocaleString()}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feedback