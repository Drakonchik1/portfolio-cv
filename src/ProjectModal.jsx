import { useEffect } from 'react'

const METHOD_COLOR = { GET: '#4caf50', POST: '#2196f3', PUT: '#ff9800', PATCH: '#9c27b0', DELETE: '#f44336' }

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!project?.demo) return null
  const { demo } = project

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="eyebrow">{project.category} · Private Demo</p>
        <h2 className="modal-title">{project.title.split(':')[0]}</h2>
        <p className="modal-sub">{project.excerpt}</p>

        <div className="modal-chips">
          {project.stack.split(' · ').map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {demo.type === 'api' && (
          <>
            <h3 className="modal-section-head">Endpoints</h3>
            <div className="endpoint-list">
              {demo.endpoints.map((ep) => (
                <div key={ep.path + ep.method} className="endpoint-row">
                  <span className="ep-method" style={{ background: METHOD_COLOR[ep.method] }}>
                    {ep.method}
                  </span>
                  <span className="ep-path">{ep.path}</span>
                  <span className="ep-desc">{ep.desc}</span>
                </div>
              ))}
            </div>
            <h3 className="modal-section-head">Sample Response</h3>
            <pre className="demo-code">{demo.sample}</pre>
          </>
        )}

        {demo.type === 'app' && (
          <>
            <h3 className="modal-section-head">App Screens</h3>
            <div className="screen-grid">
              {demo.screens.map((s) => (
                <div key={s.label} className="screen-card">
                  <p className="screen-label">{s.label}</p>
                  <p className="screen-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <h3 className="modal-section-head">Key Technical Highlights</h3>
        <ul className="highlight-list">
          {demo.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
