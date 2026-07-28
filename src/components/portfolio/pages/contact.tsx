'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Instagram, Linkedin, Github, Play, ArrowRight, Send, Loader2, Copy, Check, HelpCircle, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageHeader } from '../page-header'
import { contactSocials, persona, faqs } from '@/lib/portfolio-data'
import { useTranslation } from '@/lib/i18n/context'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  tiktok: Play,
}

const iconColor: Record<string, string> = {
  mail: 'bg-rose-500/10 text-rose-500',
  instagram: 'bg-fuchsia-500/10 text-fuchsia-500',
  linkedin: 'bg-blue-500/10 text-blue-500',
  github: 'bg-neutral-500/10 text-neutral-500',
  tiktok: 'bg-pink-500/10 text-pink-500',
}

export function ContactPage() {
  const { t } = useTranslation()
  const [submitting, setSubmitting] = React.useState(false)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)
  const [faqCategory, setFaqCategory] = React.useState<string>('all')

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success(t.contact.copiedToast.replace('{text}', text))
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error(t.contact.copyFailed)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      subject: String(fd.get('subject') || ''),
      message: String(fd.get('message') || ''),
    }
    if (payload.name.length < 2) return toast.error(t.contact.nameError)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return toast.error(t.contact.emailError)
    if (payload.subject.length < 3) return toast.error(t.contact.subjectError)
    if (payload.message.length < 10) return toast.error(t.contact.messageError)

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || t.contact.messageFailed)
      form.reset()
      toast.success(t.contact.messageSent)
    } catch {
      toast.error(t.contact.messageFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-8 sm:py-12">
      <PageHeader title={t.contact.pageTitle} description={t.contact.pageDesc} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Email quick-copy banner */}
        <div className="lg:col-span-5">
          <Card className="overflow-hidden border-border/60 bg-primary/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{t.contact.emailDirect}</h3>
                  <p className="font-mono text-xs text-muted-foreground">{persona.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-full"
                  onClick={() => copyToClipboard(persona.email, 'email')}
                >
                  {copiedField === 'email' ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" />{t.contact.copied}</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" />{t.contact.copy}</>
                  )}
                </Button>
                <Button asChild size="sm" className="h-9 gap-2 rounded-full">
                  <a href={`mailto:${persona.email}`}>
                    <Send className="h-3.5 w-3.5" />
                    {t.contact.compose}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Social cards */}
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.contact.socialMedia}</h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.05, delayChildren: 0.05 },
              },
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {contactSocials.map((s) => {
              const Icon = iconMap[s.icon] ?? Mail
              return (
                <motion.div
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: {
                        type: 'spring',
                        stiffness: 50,
                        damping: 18,
                      },
                    },
                  }}
                >
                  <Card className="group h-full overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className={`grid h-11 w-11 place-items-center rounded-xl ${iconColor[s.icon] ?? 'bg-primary/10 text-primary'}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold">{s.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                      <div className="mt-3 flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm" className="h-7 justify-start gap-1.5 px-0 text-[11px] text-primary hover:px-2">
                          <a href={s.url} target="_blank" rel="noopener noreferrer">
                            {s.cta}
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(s.url, `social-${s.label}`)}
                          aria-label={`Copy ${s.label} link`}
                          title={t.common.copy}
                        >
                          {copiedField === `social-${s.label}` ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Message form */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.contact.sendMessage}</h2>
          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-5 sm:p-6">
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="ct-name" className="text-xs font-medium">{t.contact.nameLabel}</label>
                  <Input id="ct-name" name="name" placeholder={t.contact.namePlaceholder} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ct-email" className="text-xs font-medium">{t.contact.emailLabel}</label>
                  <Input id="ct-email" name="email" type="email" placeholder={t.contact.emailPlaceholder} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ct-subject" className="text-xs font-medium">{t.contact.subjectLabel}</label>
                  <Input id="ct-subject" name="subject" placeholder={t.contact.subjectPlaceholder} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ct-message" className="text-xs font-medium">{t.contact.messageLabel}</label>
                  <Textarea id="ct-message" name="message" rows={5} placeholder={t.contact.messagePlaceholder} required />
                </div>
                <Button type="submit" disabled={submitting} className="w-full gap-2 rounded-full">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{t.common.sending}</>
                  ) : (
                    <><Send className="h-4 w-4" />{t.contact.sendEmail}</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <FaqSection
        openFaq={openFaq}
        setOpenFaq={setOpenFaq}
        faqCategory={faqCategory}
        setFaqCategory={setFaqCategory}
        t={t}
      />
    </div>
  )
}

const faqCategoryColor: Record<string, string> = {
  Availability: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  Technical: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  Project: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  Collaboration: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
}

function FaqSection({
  openFaq,
  setOpenFaq,
  faqCategory,
  setFaqCategory,
  t,
}: {
  openFaq: number | null
  setOpenFaq: (v: number | null) => void
  faqCategory: string
  setFaqCategory: (v: string) => void
  t: ReturnType<typeof useTranslation>['t']
}) {
  const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category)))]
  const filtered = faqs.filter((f) => faqCategory === 'all' || f.category === faqCategory)

  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t.contact.faq}
          </h2>
          <p className="text-sm text-muted-foreground">{t.contact.faqDesc}</p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {filtered.length} {t.contact.questions}
        </Badge>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const isActive = faqCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setFaqCategory(cat)}
              className={
                isActive
                  ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground'
                  : 'rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground'
              }
            >
              {cat === 'all' ? t.common.all : cat}
            </button>
          )
        })}
      </div>

      {/* Accordion */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.03, delayChildren: 0.05 },
          },
        }}
        className="space-y-2"
      >
        {filtered.map((faq, idx) => {
          const isOpen = openFaq === idx
          return (
            <motion.div
              key={faq.question}
              variants={{
                hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 16,
                  },
                },
              }}
            >
              <Card className={`overflow-hidden border-border/60 transition-colors ${isOpen ? 'border-primary/40' : ''}`}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-[10px] font-medium ${faqCategoryColor[faq.category] ?? 'bg-primary/10 text-primary border-primary/30'}`}>
                      <HelpCircle className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-4 pb-4 pt-0">
                        <div className="border-t border-border/40 pt-3 pl-10">
                          <Badge variant="outline" className={`mb-2 border ${faqCategoryColor[faq.category] ?? 'border-primary/30 text-primary'} text-[9px]`}>
                            {faq.category}
                          </Badge>
                          <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
