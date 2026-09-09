'use client'

import { useLayoutEffect } from 'react'
import type { MotionConfig, MotionItem, MotionTarget, PageMotion } from '@/lib/site/prototype/types'
import { HOME_MOTION, installPrototypeMotion } from '@/lib/site/prototype-motion'

const easing = (value?: string) =>
  ({
    outQuart: 'cubic-bezier(.165,.84,.44,1)',
    inOutQuart: 'cubic-bezier(.77,0,.175,1)',
    ease: 'ease',
    outCubic: 'cubic-bezier(.215,.61,.355,1)',
  })[value || ''] || 'linear'

export function PrototypeEffects({ motion }: { motion: PageMotion }): null {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-prototype-source]')
    if (!root) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const cleanup: (() => void)[] = []
    const active = new Map<HTMLElement, Map<string, Animation>>()
    const transforms = new WeakMap<HTMLElement, Record<string, string>>()
    const select = (target: MotionTarget, trigger?: HTMLElement): HTMLElement[] => {
      if (target.useEventTarget === true) return trigger ? [trigger] : []
      if (target.selector) {
        const scope = target.useEventTarget ? trigger : root
        return [...(scope?.querySelectorAll<HTMLElement>(target.selector) || [])]
      }
      const id = target.id?.split('|').at(-1)
      return id ? [...root.querySelectorAll<HTMLElement>(`[data-w-id="${CSS.escape(id)}"]`)] : []
    }
    const properties = (item: MotionItem, element: HTMLElement): Record<string, string> => {
      const c = item.config
      const color =
        (c.globalSwatchId && getComputedStyle(root).getPropertyValue(c.globalSwatchId).trim()) ||
        `rgba(${c.rValue ?? 0},${c.gValue ?? 0},${c.bValue ?? 0},${c.aValue ?? 1})`
      const axis = (key: 'x' | 'y' | 'z', fallback: number) =>
        `${c[`${key}Value`] ?? fallback}${(c[`${key}Unit`] || 'px').toLowerCase()}`
      const transform = transforms.get(element) || {}
      switch (item.actionTypeId) {
        case 'STYLE_OPACITY':
          return { opacity: String(c.value ?? 1) }
        case 'STYLE_TEXT_COLOR':
          return { color }
        case 'STYLE_BACKGROUND_COLOR':
          return { backgroundColor: color }
        case 'STYLE_BORDER':
          return { borderColor: color }
        case 'STYLE_SIZE': {
          const result: Record<string, string> = {}
          if (c.widthValue !== undefined)
            result.width = `${c.widthValue}${(c.widthUnit || 'px').toLowerCase()}`
          if (c.heightUnit === 'AUTO') result.height = `${element.scrollHeight}px`
          else if (c.heightValue !== undefined)
            result.height = `${c.heightValue}${(c.heightUnit || 'px').toLowerCase()}`
          return result
        }
        case 'STYLE_FILTER':
          return {
            filter: (c.filters || []).map((f) => `${f.type}(${f.value}${f.unit || '%'})`).join(' '),
          }
        case 'TRANSFORM_MOVE':
          transform.move = `translate3d(${axis('x', 0)},${axis('y', 0)},${axis('z', 0)})`
          break
        case 'TRANSFORM_ROTATE':
          transform.rotate = `rotateX(${c.xValue || 0}deg) rotateY(${c.yValue || 0}deg) rotateZ(${c.zValue || 0}deg)`
          break
        case 'TRANSFORM_SCALE':
          transform.scale = `scale3d(${c.xValue ?? 1},${c.yValue ?? 1},${c.zValue ?? 1})`
          break
        default:
          return {}
      }
      transforms.set(element, transform)
      return {
        transform: [transform.move, transform.rotate, transform.scale].filter(Boolean).join(' '),
      }
    }
    const apply = (
      el: HTMLElement,
      props: Record<string, string>,
      c: MotionConfig,
      initial = false,
      offset = 0,
    ) => {
      const records = active.get(el) || new Map<string, Animation>()
      active.set(el, records)
      for (const [property, value] of Object.entries(props)) {
        const from = getComputedStyle(el)[property as keyof CSSStyleDeclaration] as string
        records.get(property)?.cancel()
        if (initial || reduced.matches) {
          Object.assign(el.style, { [property]: value })
          continue
        }
        const animation = el.animate([{ [property]: from }, { [property]: value }], {
          duration: c.duration ?? 300,
          delay: offset + (c.delay || 0),
          easing: easing(c.easing),
          fill: 'both',
        })
        records.set(property, animation)
        animation.onfinish = () => {
          Object.assign(el.style, { [property]: value })
          animation.cancel()
          records.delete(property)
        }
      }
    }
    const seenInitial = new Set<string>()
    const observed = new Map<Element, (() => void)[]>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            observed.get(entry.target)?.forEach((fn) => fn())
            observer.unobserve(entry.target)
          }
      },
      { threshold: 0 },
    )
    for (const event of motion.events) {
      for (const element of select(event.target)) {
        const list = motion.lists[event.action.config.actionListId]
        if (
          event.eventTypeId === 'MOUSE_MOVE' &&
          !reduced.matches &&
          matchMedia('(hover: hover)').matches
        ) {
          const distance = event.action.config.actionListId === 'a-64' ? 4 : 10
          let x = 0,
            y = 0,
            tx = 0,
            ty = 0,
            frame = 0
          const render = () => {
            x += (tx - x) * 0.1
            y += (ty - y) * 0.1
            element.style.transform = `translate3d(${x}%,${y}%,0)`
            frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.01 ? requestAnimationFrame(render) : 0
          }
          const move = (event: PointerEvent) => {
            const bounds = (element.parentElement || element).getBoundingClientRect()
            tx =
              (Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)) * 2 - 1) *
              distance
            ty =
              (Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)) * 2 - 1) *
              distance
            if (!frame) frame = requestAnimationFrame(render)
          }
          const leave = () => {
            tx = ty = 0
            if (!frame) frame = requestAnimationFrame(render)
          }
          element.addEventListener('pointermove', move)
          element.addEventListener('pointerleave', leave)
          cleanup.push(() => {
            cancelAnimationFrame(frame)
            element.removeEventListener('pointermove', move)
            element.removeEventListener('pointerleave', leave)
          })
          continue
        }
        const groups = list?.actionItemGroups || []
        const run = () => {
          let offset = 0
          for (const group of groups.slice(list?.useFirstGroupAsInitialState ? 1 : 0)) {
            for (const item of group.actionItems)
              for (const target of select(item.config.target, element))
                apply(target, properties(item, target), item.config, false, offset)
            offset += Math.max(
              0,
              ...group.actionItems.map(
                (item) => (item.config.delay || 0) + (item.config.duration || 0),
              ),
            )
          }
        }
        if (
          list?.useFirstGroupAsInitialState &&
          !seenInitial.has(event.action.config.actionListId + element.dataset.wId)
        ) {
          seenInitial.add(event.action.config.actionListId + element.dataset.wId)
          for (const item of groups[0]?.actionItems || [])
            for (const target of select(item.config.target, element))
              apply(target, properties(item, target), item.config, true)
        }
        if (event.eventTypeId === 'SCROLL_INTO_VIEW') {
          const config = Array.isArray(event.config) ? {} : event.config
          let reveal = run
          if (!list) {
            const type = event.action.actionTypeId
            const from =
              type === 'GROW_EFFECT'
                ? 'scale(.75)'
                : type === 'SLIDE_EFFECT'
                  ? `translate${['LEFT', 'RIGHT'].includes(config.direction || '') ? 'X' : 'Y'}(${['TOP', 'LEFT'].includes(config.direction || '') ? '-' : ''}100px)`
                  : 'none'
            if (!reduced.matches) Object.assign(element.style, { opacity: '0', transform: from })
            reveal = () => {
              element.dataset.prototypeMotion = 'playing'
              apply(
                element,
                { opacity: '1', transform: 'none' },
                { target: {}, duration: 1000, delay: config.delay || 0, easing: 'outQuart' },
              )
            }
          }
          if (reduced.matches) reveal()
          else {
            observed.set(element, [...(observed.get(element) || []), reveal])
            observer.observe(element)
          }
        } else if (['DROPDOWN_OPEN', 'DROPDOWN_CLOSE'].includes(event.eventTypeId)) {
          const name = event.eventTypeId === 'DROPDOWN_OPEN' ? 'prototype-open' : 'prototype-close'
          element.addEventListener(name, run)
          cleanup.push(() => element.removeEventListener(name, run))
        } else if (['MOUSE_OVER', 'MOUSE_OUT'].includes(event.eventTypeId)) {
          const enter = event.eventTypeId === 'MOUSE_OVER'
          const name = enter ? 'pointerenter' : 'pointerleave'
          element.addEventListener(name, run)
          cleanup.push(() => element.removeEventListener(name, run))
          const focusName = enter ? 'focusin' : 'focusout'
          element.addEventListener(focusName, run)
          cleanup.push(() => element.removeEventListener(focusName, run))
        }
      }
    }
    // Native markup works without JS; hydrated toggles replay the source's 300ms action lists.
    root.querySelectorAll<HTMLDetailsElement>('details[data-prototype-faq]').forEach((details) => {
      const summary = details.querySelector('summary')
      if (!summary) return
      let expanded = details.open
      let timer: ReturnType<typeof setTimeout>
      const toggle = (event: MouseEvent) => {
        event.preventDefault()
        clearTimeout(timer)
        expanded = !expanded
        if (expanded) details.open = true
        details.dispatchEvent(new Event(expanded ? 'prototype-open' : 'prototype-close'))
        if (!expanded)
          timer = setTimeout(
            () => {
              details.open = false
            },
            reduced.matches ? 0 : 300,
          )
      }
      summary.addEventListener('click', toggle)
      cleanup.push(() => {
        clearTimeout(timer)
        summary.removeEventListener('click', toggle)
      })
    })
    root.querySelectorAll<HTMLElement>('.w-tabs').forEach((tabs) => {
      const buttons = [...tabs.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
      const panes = [...tabs.querySelectorAll<HTMLElement>('.w-tab-pane')]
      buttons.forEach((button, index) => {
        const activate = () => {
          buttons.forEach((b) => {
            const selected = b === button
            b.classList.toggle('w--current', selected)
            b.setAttribute('aria-selected', String(selected))
            b.tabIndex = selected ? 0 : -1
          })
          panes.forEach((p) => {
            const selected = p.dataset.wTab === button.dataset.wTab
            p.classList.toggle('w--tab-active', selected)
            p.hidden = !selected
            if (selected && !reduced.matches)
              p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
          })
        }
        const key = (e: KeyboardEvent) => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
            e.preventDefault()
            const next =
              e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? buttons.length - 1
                  : (index + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length
            buttons[next].click()
            buttons[next].focus()
          }
        }
        button.addEventListener('click', activate)
        button.addEventListener('keydown', key)
        cleanup.push(() => {
          button.removeEventListener('click', activate)
          button.removeEventListener('keydown', key)
        })
      })
    })
    root.querySelectorAll<HTMLElement>('.w-slider').forEach((slider) => {
      const slides = [...slider.querySelectorAll<HTMLElement>('.w-slide')]
      let index = 0
      const show = (next: number) => {
        index = (next + slides.length) % slides.length
        slides.forEach((slide, i) => {
          slide.style.transform = `translateX(${-index * 100}%)`
          slide.style.transition = reduced.matches
            ? 'none'
            : `transform ${slider.dataset.duration || 500}ms ease`
          slide.setAttribute('aria-hidden', String(i !== index))
          slide.inert = i !== index
        })
      }
      slider.querySelectorAll<HTMLElement>('[role="button"]').forEach((button) => {
        const click = () =>
          show(index + (button.classList.contains('w-slider-arrow-left') ? -1 : 1))
        const key = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            click()
          }
        }
        button.addEventListener('click', click)
        button.addEventListener('keydown', key)
        cleanup.push(() => {
          button.removeEventListener('click', click)
          button.removeEventListener('keydown', key)
        })
      })
      show(0)
      if (slider.dataset.autoplay === 'true' && !reduced.matches) {
        const timer = setInterval(
          () => {
            if (!slider.matches(':hover,:focus-within') && !document.hidden) show(index + 1)
          },
          Number(slider.dataset.delay) || 4000,
        )
        cleanup.push(() => clearInterval(timer))
      }
    })
    const playVideo = (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-video-id]')
      if (!button) return
      const frame = document.createElement('iframe')
      frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.videoId}?autoplay=1`
      frame.title = 'Noumi product demonstration'
      frame.allow = 'autoplay; encrypted-media; picture-in-picture'
      frame.allowFullscreen = true
      frame.className = 'prototype-video-frame'
      button.replaceWith(frame)
    }
    root.addEventListener('click', playVideo)
    const footer = installPrototypeMotion(
      HOME_MOTION.filter(([, selector]) => selector.startsWith('.site-footer')),
    )
    return () => {
      observer.disconnect()
      cleanup.forEach((fn) => fn())
      active.forEach((map) => map.forEach((a) => a.cancel()))
      root.removeEventListener('click', playVideo)
      footer()
    }
  }, [motion])
  return null
}
