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
  const github = demo.github || project.link

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="eyebrow">{project.category} · walkthrough</p>
        <h2 className="modal-title">{project.title.split(':')[0]}</h2>
        <p className="modal-sub">{project.excerpt}</p>

        <div className="modal-chips">
          {project.stack.split(' · ').map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {demo.howItWorks?.length > 0 && (
          <>
            <h3 className="modal-section-head">How it works</h3>
            <ol className="how-steps">
              {demo.howItWorks.map((step) => (
                <li key={step.title} className="how-step">
                  <p className="how-step-title">
                    <span className="how-step-num">{step.step}</span>
                    {step.title}
                  </p>
                  <p className="how-step-desc">{step.desc}</p>
                </li>
              ))}
            </ol>
          </>
        )}

        {demo.flow && (
          <p className="demo-flow">
            <span className="demo-flow-label">Flow</span>
            {demo.flow}
          </p>
        )}

        {demo.tryLocal?.length > 0 && (
          <>
            <h3 className="modal-section-head">Try it locally (from README)</h3>
            <pre className="demo-code demo-code--run">{demo.tryLocal.join('\n')}</pre>
          </>
        )}

        {demo.type === 'api' && demo.endpoints?.length > 0 && (
          <>
            <h3 className="modal-section-head">Main API endpoints</h3>
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
          </>
        )}

        {demo.type === 'app' && demo.screens?.length > 0 && (
          <>
            <h3 className="modal-section-head">What you see in the app</h3>
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

        {demo.sample && (
          <>
            <h3 className="modal-section-head">{demo.sampleLabel || 'Example'}</h3>
            <pre className="demo-code">{demo.sample}</pre>
          </>
        )}

        {demo.highlights?.length > 0 && (
          <>
            <h3 className="modal-section-head">Under the hood</h3>
            <ul className="highlight-list">
              {demo.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </>
        )}

        {github && github !== '#' && (
          <a className="modal-github" href={github} target="_blank" rel="noreferrer">
            View source on GitHub →
          </a>
        )}
      </div>
    </div>
  )
}
