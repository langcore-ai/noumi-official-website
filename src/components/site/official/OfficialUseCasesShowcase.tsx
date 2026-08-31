'use client'

import { useEffect, useRef, useState } from 'react'

type UseCase = {
  title: string
  prompt: string
  reply: string
  duration: string
  outputs: string[]
}

type Category = {
  icon: string
  label: string
  cases: UseCase[]
}

const CATEGORIES: Category[] = [
  {
    icon: '▤',
    label: 'Discover & Document',
    cases: [
      {
        title: 'Build BRD, FRD, User Stories & BPMN',
        prompt:
          'Consolidate the project materials, stakeholder inputs, pre-sales handover and previous cases. Identify gaps, then generate a consistent BRD, FRD, user stories and end-to-end process flow.',
        reply:
          'Consolidated all sources, flagged 4 open questions, and generated a consistent requirements package.',
        duration: '18m 42s',
        outputs: ['Requirements Package', 'BPMN process flow', 'BRD draft', 'FRD draft'],
      },
      {
        title: 'Client Research',
        prompt: 'Research Bosch and prepare me for an upcoming requirement elicitation meeting.',
        reply: 'Completed the company research, commercial context, and discovery agenda.',
        duration: '1m 20s',
        outputs: ['Robert Bosch GmbH Research Report'],
      },
      {
        title: 'Translate Docs Without Losing Formatting',
        prompt:
          'Translate the uploaded business documents into Japanese and German while preserving layout, typography and terminology.',
        reply: 'Translated all documents and kept their formatting presentation-ready.',
        duration: '8m 40s',
        outputs: ['Docs in Japanese', 'Docs in German', 'Translated slide deck'],
      },
      {
        title: 'Create Documents from a Template',
        prompt: 'Generate a Word document from the project blueprint using the supplied template.',
        reply: 'Generated the document with content mapped into the template structure and styles.',
        duration: '3m 12s',
        outputs: ['CRM Project Blueprint.docx'],
      },
    ],
  },
  {
    icon: '✓',
    label: 'Check & Validate',
    cases: [
      {
        title: 'Consistency Check before Sign-off',
        prompt:
          'Review the requirements package, API documentation and database. Find contradictions, ambiguities and traceability gaps.',
        reply: 'Found and organized the key inconsistencies and open questions for sign-off.',
        duration: '6m 05s',
        outputs: ['Consistency findings', 'Open questions'],
      },
      {
        title: 'Requirement Change Impact Analysis',
        prompt:
          'Trace a confirmed clarification across the requirements package and identify every downstream impact.',
        reply: 'Mapped the affected sections, required updates and traceability risks.',
        duration: '2m 47s',
        outputs: ['Impact analysis summary', 'Affected requirements'],
      },
    ],
  },
  {
    icon: '⌘',
    label: 'Diagram',
    cases: [
      {
        title: 'Turn Notes into a BPMN Diagram',
        prompt:
          'Generate an end-to-end process diagram from raw stakeholder notes, one lane per role.',
        reply: 'Built and visually reviewed a five-lane BPMN flow with eight decision gateways.',
        duration: '3m 40s',
        outputs: ['BPMN process diagram'],
      },
      {
        title: 'Generate ERDs from Database',
        prompt: 'Connect to the ERP database and generate a complete entity-relationship diagram.',
        reply: 'Mapped the database domains with primary and foreign keys labeled.',
        duration: '2m 12s',
        outputs: ['ERP database ERD'],
      },
      {
        title: 'Architecture & Deployment Diagrams',
        prompt: 'Turn the architecture document into product, deployment, and recovery diagrams.',
        reply: 'Generated all three architecture views with systems and traffic flows connected.',
        duration: '4m 05s',
        outputs: ['Product architecture', 'Network topology', 'Recovery architecture'],
      },
      {
        title: 'Project Gantt Chart & Timeline',
        prompt: 'Generate a Gantt chart and milestone timeline from the implementation plan.',
        reply: 'Mapped 20 tasks across six phases with dependencies and role assignments.',
        duration: '2m 15s',
        outputs: ['Project Gantt chart', 'Milestone timeline'],
      },
    ],
  },
  {
    icon: '▧',
    label: 'Image',
    cases: [
      {
        title: 'Visualize a Complex Solution',
        prompt:
          'Turn this solution into a clear, presentation-ready visual in one coherent diagram.',
        reply: 'Connected the processes, components, data flows, stakeholders and outcomes.',
        duration: '3m 20s',
        outputs: ['Product architecture visual'],
      },
      {
        title: 'Polish Diagrams',
        prompt:
          'Make these draft diagrams presentation-ready without changing their underlying logic.',
        reply: 'Rebuilt all diagrams with consistent typography, hierarchy and zone grouping.',
        duration: '4m 05s',
        outputs: ['Polished architecture', 'Polished topology', 'Polished recovery diagram'],
      },
      {
        title: 'Translate Text in an Image',
        prompt: 'Translate the image into Chinese while preserving its exact structure.',
        reply: 'Translated every label and kept the original visual composition intact.',
        duration: '1m 40s',
        outputs: ['Translated architecture diagram'],
      },
    ],
  },
  {
    icon: '▣',
    label: 'Prototype',
    cases: [
      {
        title: 'Interactive Prototype from FRD',
        prompt: 'Generate a usable interactive prototype from the FRD and reference UI.',
        reply: 'Built a navigable prototype matching the reference layout and visual style.',
        duration: '6m 30s',
        outputs: ['ProjectHub Prototype', 'Project dashboard', 'Project detail & Gantt'],
      },
    ],
  },
]

/** 原型 Use Cases iframe 的本站原生实现。 */
export function OfficialUseCasesShowcase() {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [caseIndex, setCaseIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const category = CATEGORIES[categoryIndex]
  const activeCase = category.cases[caseIndex]

  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      if (switchTimer.current) clearTimeout(switchTimer.current)
    },
    [],
  )

  const selectCase = (index: number) => {
    if (index === caseIndex) return
    setVisible(false)
    if (switchTimer.current) clearTimeout(switchTimer.current)
    switchTimer.current = setTimeout(() => {
      setCaseIndex(index)
      requestAnimationFrame(() => setVisible(true))
    }, 120)
  }

  const selectCategory = (index: number) => {
    if (index === categoryIndex) return
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    if (switchTimer.current) clearTimeout(switchTimer.current)
    setCategoryIndex(index)
    setCaseIndex(0)
    setVisible(true)
  }

  const handleHover = (index: number) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => selectCase(index), 60)
  }

  return (
    <div className="noumi-usecases">
      <nav aria-label="Use case categories" className="noumi-usecases__categories">
        {CATEGORIES.map((item, index) => (
          <button
            aria-pressed={index === categoryIndex}
            className={index === categoryIndex ? 'is-active' : ''}
            key={item.label}
            onClick={() => selectCategory(index)}
            type="button"
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="noumi-usecases__stage">
        <div
          aria-label={`${category.label} tasks`}
          className="noumi-usecases__sidebar"
          role="listbox"
        >
          {category.cases.map((item, index) => (
            <button
              aria-selected={index === caseIndex}
              className={index === caseIndex ? 'is-active' : ''}
              key={item.title}
              onClick={() => selectCase(index)}
              onFocus={() => selectCase(index)}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                event.preventDefault()
                const delta = event.key === 'ArrowDown' ? 1 : -1
                const nextIndex = Math.max(0, Math.min(category.cases.length - 1, index + delta))
                const buttons =
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')
                buttons?.item(nextIndex).focus()
              }}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => {
                if (hoverTimer.current) clearTimeout(hoverTimer.current)
              }}
              role="option"
              type="button"
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className={`noumi-usecases__content${visible ? ' is-visible' : ''}`}>
          <div className="noumi-usecases__prompt">{activeCase.prompt}</div>
          <div className="noumi-usecases__reply">
            <span aria-hidden="true" className="noumi-usecases__avatar">
              N
            </span>
            <p>{activeCase.reply}</p>
          </div>
          <div className="noumi-usecases__status">
            <span>DONE</span>
            Completed in {activeCase.duration}
          </div>
          <div className="noumi-usecases__outputs">
            {activeCase.outputs.map((output) => (
              <div key={output}>
                <span aria-hidden="true">FILE</span>
                {output}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
