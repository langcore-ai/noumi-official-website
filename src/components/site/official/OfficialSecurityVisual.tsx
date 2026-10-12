/** Decorative workspace illustration from the approved homepage design. */
export function OfficialSecurityVisual() {
  return (
    <div
      className="redesign-feature__visual security-visual security-html-visual"
      role="img"
      aria-label="Noumi workspace with encrypted tasks and encoded symbols"
    >
      <div className="cipher-glow" aria-hidden="true"></div>
      <div className="encrypted-composer">
        <div className="encrypted-heading">
          <span className="noumi-eyes" aria-hidden="true">
            <svg className="nx-eyes" viewBox="0 0 50 40" fill="none">
              <g className="blink">
                <ellipse
                  cx="17.5"
                  cy="21"
                  rx="9"
                  ry="12.5"
                  transform="rotate(-9 17.5 21)"
                  fill="#fff"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                ></ellipse>
                <ellipse
                  cx="33.5"
                  cy="19.5"
                  rx="9.5"
                  ry="13"
                  transform="rotate(7 33.5 19.5)"
                  fill="#fff"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                ></ellipse>
                <circle className="pu" cx="19.5" cy="15.5" r="3.7" fill="currentColor"></circle>
                <circle className="pu" cx="36" cy="14" r="3.9" fill="currentColor"></circle>
                <circle className="hl" cx="16.2" cy="19.5" r="1.25" fill="#fff"></circle>
                <circle className="hl" cx="32.1" cy="18" r="1.3" fill="#fff"></circle>
              </g>
            </svg>
          </span>
          <span>{'What should we deliver?'}</span>
        </div>
        <div className="encrypted-empty" aria-hidden="true">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="encrypted-input">
          <span className="encrypted-placeholder">
            <span className="task-typing">
              {
                'Review AsterVale’s RFP and Checklist against Noumi’s product materials. Produce an '
              }
              <strong>{'Excel requirements matrix'}</strong>
              {' covering both the RFP body and Checklist'}
            </span>
            <span className="task-caret" aria-hidden="true">
              {'|'}
            </span>
          </span>
          <div className="composer-attachments">
            <span className="composer-attachment" title="AsterVale_RFP.docx">
              <img
                src="/assets/homepage/word-attachment.f689d094fc.webp"
                alt="Word document"
                loading="lazy"
                width="17"
                height="17"
              />
              <span>{'AsterVale_RFP.docx'}</span>
            </span>
            <span className="composer-attachment" title="AsterVale_Specifications_Checklist.xlsx">
              <img
                src="/assets/homepage/excel-attachment.c6d4c00afb.webp"
                alt="Excel workbook"
                loading="lazy"
                width="17"
                height="17"
              />
              <span>{'AsterVale_…Checklist.xlsx'}</span>
            </span>
          </div>
          <div className="encrypted-toolbar">
            <span className="composer-tools">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9"></path>
              </svg>
              <span>{'@'}</span>
              <span className="composer-model">{'Noumi'}</span>
            </span>
            <span className="composer-send">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="m4 11 16-7-7 16-2-7-7-2Z"></path>
                <path d="m11 13 9-9"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div className="cipher-band" aria-hidden="true">
        <span className="cipher-tail cipher-tail-left">{'&%^{*'}</span>
        <span className="cipher-label">
          <svg
            className="cipher-lock-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="3"></rect>
            <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
            <path d="M12 14v3"></path>
          </svg>
          {'Encrypted Tasks'}
        </span>
        <span className="cipher-tail cipher-tail-right">{'%^{*/ 8b &0#'}</span>
      </div>
    </div>
  )
}
