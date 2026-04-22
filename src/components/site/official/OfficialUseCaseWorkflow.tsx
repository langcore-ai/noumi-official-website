'use client'

import { useState } from 'react'

import { MarkdownContent } from '@/components/site/MarkdownContent'
import type { OfficialUseCaseWorkflowStep } from '@/lib/site/official-cms'

/**
 * Use case workflow 交互区
 * @param props 组件参数
 * @returns workflow 节点
 */
export function OfficialUseCaseWorkflow(props: { steps: OfficialUseCaseWorkflowStep[] }) {
  const { steps } = props
  const [activeIndex, setActiveIndex] = useState(0)
  const activeStep = steps[activeIndex]

  if (!activeStep) {
    return null
  }

  return (
    <div className="workflow-layout reveal d1">
      <div aria-label="Workflow steps" className="workflow-steps" role="tablist">
        {steps.map((step, index) => (
          <button
            aria-selected={index === activeIndex}
            className={`wf-step${index === activeIndex ? ' active' : ''}`}
            key={step.title}
            onClick={() => setActiveIndex(index)}
            role="tab"
            type="button"
          >
            <span className="wf-num">{String(index + 1).padStart(2, '0')}</span>
            <span className="wf-title">{step.title}</span>
          </button>
        ))}
      </div>

      <div className="workflow-content">
        <div className="wf-panel active">
          <div className="wf-panel-text">
            <h3>{activeStep.panelTitle}</h3>
            {activeStep.panelDescription ? <p>{activeStep.panelDescription}</p> : null}
          </div>
          <div className="wf-demo">
            <div className="wf-demo-label">
              <span>Demo</span>
            </div>
            <div className="official-workflow-markdown">
              <MarkdownContent markdown={activeStep.panelMarkdown} />
            </div>
            {activeStep.footerLabel || activeStep.footerBadge ? (
              <div className="wf-demo-footer">
                {activeStep.footerLabel ? <span>{activeStep.footerLabel}</span> : null}
                {activeStep.footerBadge ? (
                  <span className="wf-demo-footer-badge">{activeStep.footerBadge}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
