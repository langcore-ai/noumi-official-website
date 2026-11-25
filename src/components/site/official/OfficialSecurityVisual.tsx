import styles from './OfficialSecurityVisual.module.css'

const cipherSample = `73af bc30 c732 908d f155 6c33 11d0 b8c4
efd9 5a30 09a1 07d9 d3e1 2cdf c030 07ab
89c0 210b eb46 f8ba 220d 7e59 ed21 0c29
9fa1 1461 c9d8 ae42 02c8 732f 107c c37b
0cf9 ed73 0fc1 91af 2a1e e030 8b62 b4c1
4e3c a9c0 316f 205c cf15 cad2 00f3 d809
5261 7cdf a45b a852 f18b 8b2a 0dcb e582
b429 1769 1c28 46f5 74dd 009a 151d 2a34
c475 852a 57a9 50a2 cd90 d350 8b61 378b
9cbf d27a f985 c1b2 8fdb a719 2e00 b455
915a f025 5390 f188 d06c 6293 0389 1a48`

export function OfficialSecurityVisual() {
  return (
    <figure className={styles.visual}>
      <div
        className={styles.sheet}
        role="img"
        aria-label="A client proposal turning into encrypted text along a moving line of light"
      >
        <div className={styles.paper} aria-hidden="true">
          <div className={styles.title}>
            Client
            <br />
            proposal
          </div>
          <div className={styles.excerpt}>
            <strong>Scope of work</strong>
            <span>Review requirements and plan the rollout.</span>
          </div>
        </div>
        <div className={styles.encrypted} aria-hidden="true">
          <div className={styles.label}>
            <svg
              viewBox="0 0 16 16"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <rect x="3.5" y="7" width="9" height="7" rx="1.6" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            Encrypted file
          </div>
          <pre>{cipherSample}</pre>
        </div>
        <div className={styles.light} aria-hidden="true" />
      </div>
      <figcaption className={styles.filename}>Client proposal.docx</figcaption>
    </figure>
  )
}
