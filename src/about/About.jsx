const { useState, useEffect } = wp.element;
import { marked } from 'marked';
import './About.scss';
// eslint-disable-next-line import/no-unresolved
import aboutMarkdown from 'bundle-text:./About.md';

const About = () => {
  const [feeds, setFeeds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        const res = await fetch('/wp-json/alpaca/v1/github-feeds');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (mounted) setFeeds(data);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFeeds();
    return () => {
      mounted = false;
    };
  }, []);

  const renderRelease = () => {
    const release = feeds && feeds.releases ? feeds.releases : null;
    if (!release)
      return (
        <div className="alpaca-widget-empty">No release info available.</div>
      );
    const updated = release.updated
      ? new Date(release.updated).toLocaleString()
      : '';
    return (
      <div className="alpaca-widget alpaca-widget--release">
        <h3 className="alpaca-widget-title">Latest Beta Release</h3>
        <div className="alpaca-widget-body">
          {release.link ? (
            <a
              href={release.link}
              target="_blank"
              rel="noreferrer noopener"
              className="alpaca-release-title"
            >
              {release.title}
            </a>
          ) : (
            <strong className="alpaca-release-title">{release.title}</strong>
          )}
          <div className="alpaca-release-updated">{updated}</div>
        </div>
      </div>
    );
  };

  const renderAnnouncement = () => {
    const ann = feeds && feeds.announcements ? feeds.announcements : null;
    if (!ann)
      return (
        <div className="alpaca-widget-empty">No announcements available.</div>
      );

    const truncateHtmlToText = (html, max = 300) => {
      if (!html) return '';
      const text = html
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length <= max) return text;
      let truncated = text.slice(0, max);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);
      return truncated + '…';
    };

    if (Array.isArray(ann)) {
      return (
        <div className="alpaca-widget alpaca-widget--announcement">
          <h3 className="alpaca-widget-title">Latest Announcements</h3>
          <div className="alpaca-widget-body">
            {ann.slice(0, 3).map((item, idx) => {
              const updated = item.updated
                ? new Date(item.updated).toLocaleString()
                : '';
              return (
                <div key={idx} className="alpaca-ann-item">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="alpaca-ann-title"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <strong className="alpaca-ann-title">{item.title}</strong>
                  )}
                  <div className="alpaca-ann-updated">{updated}</div>
                  <div className="alpaca-ann-excerpt">
                    {truncateHtmlToText(item.content, 300)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const updated = ann.updated ? new Date(ann.updated).toLocaleString() : '';
    return (
      <div className="alpaca-widget alpaca-widget--announcement">
        <h3 className="alpaca-widget-title">Latest Announcement</h3>
        <div className="alpaca-widget-body">
          {ann.link ? (
            <a
              href={ann.link}
              target="_blank"
              rel="noreferrer noopener"
              className="alpaca-ann-title"
            >
              {ann.title}
            </a>
          ) : (
            <strong className="alpaca-ann-title">{ann.title}</strong>
          )}
          <div className="alpaca-ann-updated">{updated}</div>
          <div className="alpaca-ann-excerpt">
            {truncateHtmlToText(ann.content, 300)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="alpaca-about-page layout-grid">
      <div className="alpaca-about-main">
        <div
          className="alpaca-about-page-content"
          dangerouslySetInnerHTML={{ __html: marked(aboutMarkdown) }}
        />
      </div>

      <aside className="alpaca-about-side">
        <div className="alpaca-widgets">
          {loading && (
            <div className="alpaca-loading">Loading GitHub data…</div>
          )}
          {error && <div className="alpaca-error">Error: {error}</div>}
          {!loading && !error && feeds && (
            <>
              {renderRelease()}
              {renderAnnouncement()}
            </>
          )}
          {!loading && !error && !feeds && (
            <div className="alpaca-widget-empty">No data.</div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default About;
