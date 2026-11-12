'use client'
import { useState } from 'react'
const prices = {
  pro: { monthly: '14.99', yearly: '12.50', total: '149.99', saving: '29.89' },
  max: { monthly: '79.99', yearly: '66.67', total: '799.99', saving: '159.89' },
}
export function PricingPlans() {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly')
  const yearly = period === 'yearly'
  return (
    <main className="noumi-pricing">
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: '0', height: '0', overflow: 'hidden' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <symbol id="check" viewBox="0 0 20 20">
          <path
            d="m5 10 3.2 3.2L15 6.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="arrow" viewBox="0 0 20 20">
          <path
            d="M4 10h12m-5-5 5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
      </svg>

      <div className="pricing-main">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Plans &amp; pricing</p>
          <h1 id="page-title">Choose your Noumi plan</h1>
        </section>
        <div className="billing-control">
          <div className="switch" role="group" aria-label="Billing period">
            <button
              type="button"
              data-period="monthly"
              aria-pressed={period === 'monthly'}
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              data-period="yearly"
              aria-pressed={period === 'yearly'}
              onClick={() => setPeriod('yearly')}
            >
              Yearly <span className="discount-tag">Save 17%</span>
            </button>
          </div>
        </div>
        <div id="billing-announcement" className="sr-only" role="status" aria-live="polite">
          {yearly ? 'Yearly billing selected' : 'Monthly billing selected'}
        </div>
        <section className="cards" aria-label="Available plans">
          <article className="plan basic">
            <div className="plan-label">
              <h2>Basic</h2>
            </div>
            <p className="purpose">For getting started with Noumi.</p>
            <div className="price-area">
              <div className="price-summary">
                <div className="price">
                  <span className="amount">Free</span>
                </div>
                <p className="billing">No credit card required</p>
              </div>
            </div>
            <div className="action-wrap">
              <a className="cta" href="https://www.noumi.ai/auth">
                Get started free
              </a>
            </div>
            <div className="benefits">
              <h3>Included in Basic</h3>
              <ul>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>
                    <span className="quantity">500</span> credits / month
                  </span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span className="quantity">Basic AI models</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>1 Light System</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>1 CPU / 2 GB memory</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>5 GB sandbox storage</span>
                </li>
                <li className="muted-feature">
                  <span
                    className="check"
                    aria-hidden="true"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      fontSize: '20px',
                      lineHeight: '20px',
                    }}
                  >
                    −
                  </span>
                  <span>0 team seats included</span>
                </li>
              </ul>
            </div>
          </article>
          <article className="plan pro">
            <div className="plan-label">
              <h2>Pro</h2>
              <span className="plan-badge">
                <svg
                  className="popular-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M13 2c.6 3.9-1.2 5.6-3.1 7.6C8.6 8.9 8 7.7 8 6.5 5.6 9.1 4 11.7 4 15a8 8 0 0 0 16 0c0-4.8-2.7-9.3-7-13ZM12 12c-.1 1.8-2.5 2.8-2.5 5a2.5 2.5 0 0 0 5 0c0-1.8-1-3.4-2.5-5Z"
                    clipRule="evenodd"
                  />
                </svg>
                Most popular
              </span>
            </div>
            <p className="purpose">For more room to create and work.</p>
            <div className="price-area">
              <div className="price-summary">
                <div className="price">
                  <span className="amount" id="pro-price">{`$${prices.pro[period]}`}</span>
                  <span className="price-unit">/ month</span>
                </div>
                <p className="billing" id="pro-billing">
                  {yearly ? `$${prices.pro.total} billed yearly` : 'Billed monthly'}
                </p>
              </div>
              {yearly && (
                <p className="savings-badge" id="pro-saving">
                  <span className="savings-label">Save</span>{' '}
                  <span className="savings-value">
                    <strong>{`$${prices.pro.saving}`}</strong>
                    <span className="savings-period"> / year</span>
                  </span>
                </p>
              )}
            </div>
            <div className="action-wrap">
              <a className="cta primary" href="https://www.noumi.ai/auth">
                Get started{' '}
                <svg width="17" height="17" aria-hidden="true">
                  <use href="#arrow" />
                </svg>
              </a>
            </div>
            <div className="benefits">
              <h3>Included in Pro</h3>
              <ul>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>
                    <span className="quantity">2,000</span> credits / month
                  </span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span className="quantity">Advanced AI models</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>2 Light Systems</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>2 CPUs / 4 GB memory</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>10 GB sandbox storage</span>
                </li>
                <li className="muted-feature">
                  <span
                    className="check"
                    aria-hidden="true"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      fontSize: '20px',
                      lineHeight: '20px',
                    }}
                  >
                    −
                  </span>
                  <span>0 team seats included</span>
                </li>
              </ul>
            </div>
          </article>
          <article className="plan max">
            <div className="plan-label">
              <h2>Max</h2>
            </div>
            <p className="purpose">For higher usage and a small team.</p>
            <div className="price-area">
              <div className="price-summary">
                <div className="price">
                  <span className="amount" id="max-price">{`$${prices.max[period]}`}</span>
                  <span className="price-unit">/ month</span>
                </div>
                <p className="billing" id="max-billing">
                  {yearly ? `$${prices.max.total} billed yearly` : 'Billed monthly'}
                </p>
              </div>
              {yearly && (
                <p className="savings-badge" id="max-saving">
                  <span className="savings-label">Save</span>{' '}
                  <span className="savings-value">
                    <strong>{`$${prices.max.saving}`}</strong>
                    <span className="savings-period"> / year</span>
                  </span>
                </p>
              )}
            </div>
            <div className="action-wrap">
              <a className="cta" href="https://www.noumi.ai/auth">
                Get started
              </a>
            </div>
            <div className="benefits">
              <h3>Included in Max</h3>
              <ul>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>
                    <span className="quantity">10,000</span> credits / month
                  </span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span className="quantity">Advanced AI models</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>5 Light Systems</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>2 CPUs / 4 GB memory</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>20 GB sandbox storage</span>
                </li>
                <li>
                  <svg className="check" aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  <span>5 team seats included</span>
                </li>
              </ul>
            </div>
          </article>
        </section>

        <section className="enterprise-panel" id="enterprise" aria-labelledby="enterprise-title">
          <div className="enterprise-top">
            <div>
              <p className="eyebrow">Enterprise</p>
              <h2 id="enterprise-title">Bring your team into one workspace.</h2>
              <p className="enterprise-desc">
                Everything in Pro, with shared work, admin controls and dedicated support.
              </p>
            </div>
            <div className="enterprise-action">
              <a className="cta" href="mailto:official@noumi.ai">
                Contact sales <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="enterprise-groups">
            <div className="enterprise-group">
              <h3>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="9" cy="7" r="3" />
                  <path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5v2" />
                </svg>
                Work together
              </h3>
              <ul>
                <li>Team seats &amp; a shared workspace</li>
                <li>Shared team memory &amp; skills</li>
              </ul>
            </div>
            <div className="enterprise-group">
              <h3>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M3 10h18M10 10v11" />
                </svg>
                Manage your workspace
              </h3>
              <ul>
                <li>Admin dashboard &amp; access controls</li>
                <li>Onboarding &amp; setup support</li>
              </ul>
            </div>
            <div className="enterprise-group">
              <h3>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6zM8 12l3 3 5-6" />
                </svg>
                Get dedicated support
              </h3>
              <ul>
                <li>Dedicated account manager</li>
                <li>SLA &amp; priority response</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Pricing FAQ</h2>
          <div className="faq-list">
            <details>
              <summary>How is the yearly price calculated?</summary>
              <p>
                The monthly price is the yearly total divided by 12, rounded to two decimal places.
                The full yearly amount is charged at once: $149.99 for Pro and $799.99 for Max.
              </p>
            </details>
            <details>
              <summary>Do subscriptions renew automatically?</summary>
              <p>
                Yes. Monthly subscriptions renew every month, and yearly subscriptions renew every
                year.
              </p>
            </details>
            <details>
              <summary>Can I start for free?</summary>
              <p>
                Yes. Basic includes 500 credits per month, Basic AI models, one Light System, and 5
                GB of sandbox storage. No credit card is required to get started.
              </p>
            </details>
            <details>
              <summary>What’s included with Enterprise?</summary>
              <p>
                Enterprise includes everything in Pro, plus team seats and a shared workspace,
                shared memory and skills, admin and access controls, onboarding and setup support, a
                dedicated account manager, and an SLA with priority response.
              </p>
            </details>
          </div>
        </section>
      </div>
    </main>
  )
}
