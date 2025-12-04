'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Crown, Clock, TrendingUp, AlertCircle, CheckCircle, AlertTriangle, ChevronRight, Zap, Target, Activity } from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { DashboardSummary } from '@/lib/dashboard/types'
import { CoachRickDrawer } from '@/components/coach-rick-drawer'
import { BarrelsButton } from '@/components/ui/barrels-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpBeacon } from '@/components/help/HelpBeacon'
import { FTUEModal } from '@/components/onboarding/ftue-modal'
import { MembershipUsageCard } from '@/components/membership-usage-card'
import { type MembershipTier } from '@/lib/membership-tiers'

interface DashboardClientProps {
  user: any
  summary: DashboardSummary
  membershipInfo: any
  vipOfferInfo: {
    assessmentCompletedAt: Date | null
    vipExpiresAt: Date | null
    vipActive: boolean
  }
}

export default function DashboardClient({
  user,
  summary,
  membershipInfo,
  vipOfferInfo,
}: DashboardClientProps) {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showFTUE, setShowFTUE] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<any>(null)

  // Check if user needs onboarding
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const response = await fetch('/api/onboarding/status');
        if (response.ok) {
          const data = await response.json();
          if (data.needsOnboarding) {
            setShowFTUE(true);
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      } finally {
        setOnboardingChecked(true);
      }
    }

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = () => {
    setShowFTUE(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-barrels-bg pb-24">
      <main className="p-4 space-y-6 max-w-4xl mx-auto pt-4 mt-4">
        
        {/* Header Strip */}
        <HeaderStrip user={user} membershipInfo={membershipInfo} />

        {/* VIP Banner (if active) */}
        {vipOfferInfo.vipActive && vipOfferInfo.vipExpiresAt && (
          <VIPBanner vipOfferInfo={vipOfferInfo} />
        )}

        {/* Start New Session CTA */}
        <StartNewSessionCTA />

        {/* Membership Usage Card */}
        <MembershipUsageCard
          tier={membershipInfo.tier as MembershipTier}
          sessionsUsedThisWeek={membershipInfo.sessionsThisWeek || 0}
          membershipStatus={membershipInfo.status}
          membershipExpiresAt={membershipInfo.expiresAt}
          podCreditsAvailable={membershipInfo.podCreditsAvailable}
          podCreditsUsed={membershipInfo.podCreditsUsed}
        />

        {/* Core Scores Row */}
        <CoreScoresRow scores={summary.coreScores} />

        {/* Traffic Light Summary */}
        <TrafficLightSummary
          strengths={summary.strengths}
          watchItems={summary.watchItems}
          priority={summary.priorityIssue}
          onMetricClick={setSelectedMetric}
        />

        {/* Flow Timeline Bar */}
        <FlowTimelineBar timingLeaks={summary.timingLeaks} />

        {/* Metric Cards Grid */}
        <MetricCardsGrid
          strengths={summary.strengths}
          watchItems={summary.watchItems}
          priority={summary.priorityIssue}
          drills={summary.suggestedDrills}
          onMetricClick={setSelectedMetric}
        />

        {/* Next 30 Days Plan */}
        <Next30DaysPlan plan={summary.next30Days} membershipInfo={membershipInfo} />

        {/* Help Beacon */}
        <HelpBeacon pageId="dashboard" />
      </main>

      {/* Coach Rick Drawer */}
      <CoachRickDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* FTUE Modal */}
      {showFTUE && (
        <FTUEModal
          open={showFTUE}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Metric Detail Drawer */}
      <MetricDetailDrawer
        metric={selectedMetric}
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        drills={summary.suggestedDrills}
      />
    </div>
  )
}

/**
 * Header Strip (logo, player name, plan badge)
 */
function HeaderStrip({ user, membershipInfo }: { user: any; membershipInfo: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Hey, {user?.name?.split(' ')[0] || 'Player'}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Let's check your hitting health
        </p>
      </div>
      <Badge variant="outline" className="text-barrels-gold border-barrels-gold">
        {membershipInfo.tier === 'elite' ? 'Elite' : membershipInfo.tier === 'pro' ? 'Pro' : 'Athlete'}
      </Badge>
    </motion.div>
  )
}

/**
 * VIP Banner (Assessment → VIP Pricing)
 */
function VIPBanner({ vipOfferInfo }: { vipOfferInfo: any }) {
  const daysRemaining = vipOfferInfo.vipExpiresAt
    ? differenceInDays(new Date(vipOfferInfo.vipExpiresAt), new Date())
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-barrels-gold/20 via-barrels-gold-light/10 to-transparent border border-barrels-gold/30 p-6"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-barrels-gold" />
              <h3 className="text-lg font-bold text-white">Coach Rick VIP Access Unlocked</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              You completed an assessment! Upgrade to BARRELS Pro at the VIP rate.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-barrels-gold" />
                <span className="text-white font-medium">{daysRemaining} days left</span>
              </div>
              <div className="text-muted-foreground">
                VIP Rate: <span className="text-barrels-gold font-bold">$99/month</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Offer expires: {format(new Date(vipOfferInfo.vipExpiresAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <Link href="https://whop.com/barrels-pro/" target="_blank" rel="noopener noreferrer">
            <BarrelsButton variant="primary" size="sm">
              Upgrade to VIP Training
            </BarrelsButton>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Start New Session CTA
 */
function StartNewSessionCTA() {
  return (
    <Link href="/video/upload">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-barrels-gold via-barrels-gold-light to-barrels-gold p-6 cursor-pointer group"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-barrels-black mb-1">Start New Session</h3>
            <p className="text-sm text-barrels-black/80">Upload a video to analyze your swing</p>
          </div>
          <div className="bg-barrels-black/10 rounded-full p-3 group-hover:bg-barrels-black/20 transition-colors">
            <Upload className="w-6 h-6 text-barrels-black" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

/**
 * Core Scores Row (POWER / FLOW / CONTACT)
 */
function CoreScoresRow({ scores }: { scores: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {scores.map((score, index) => (
        <motion.div
          key={score.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-barrels-black-light border-gray-800 hover:border-barrels-gold/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Color ring */}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ring-4 ${
                    score.color === 'green'
                      ? 'ring-emerald-500/30 bg-emerald-500/10'
                      : score.color === 'yellow'
                      ? 'ring-yellow-500/30 bg-yellow-500/10'
                      : 'ring-red-500/30 bg-red-500/10'
                  }`}
                >
                  <span
                    className={`text-3xl font-bold ${
                      score.color === 'green'
                        ? 'text-emerald-500'
                        : score.color === 'yellow'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {score.score}
                  </span>
                </div>
                {/* Label */}
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1">
                  {score.label}
                </h3>
                {/* Tagline */}
                <p className="text-xs text-muted-foreground leading-tight">
                  {score.shortTagline}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Traffic Light Summary (Green/Yellow/Red sections)
 */
function TrafficLightSummary({
  strengths,
  watchItems,
  priority,
  onMetricClick,
}: {
  strengths: any[]
  watchItems: any[]
  priority: any
  onMetricClick: (metric: any) => void
}) {
  return (
    <div className="space-y-4">
      {/* Green - Strengths */}
      {strengths.length > 0 && (
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-emerald-500">What You're Doing Well</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onMetricClick({ ...item, status: 'strength' })}
                  className="flex items-start gap-2 cursor-pointer hover:bg-emerald-500/5 p-2 rounded transition-colors"
                >
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <div>
                    <span className="text-white font-medium">{item.title}</span>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Yellow - Watch Items */}
      {watchItems.length > 0 && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-yellow-500">What to Watch</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {watchItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onMetricClick({ ...item, status: 'watch' })}
                  className="flex items-start gap-2 cursor-pointer hover:bg-yellow-500/5 p-2 rounded transition-colors"
                >
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <div>
                    <span className="text-white font-medium">{item.title}</span>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Red - Priority Issue */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-500">Biggest Opportunity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onMetricClick({ ...priority, status: 'priority' })}
            className="cursor-pointer hover:bg-red-500/5 p-2 rounded transition-colors"
          >
            <h4 className="text-white font-bold mb-1">{priority.title}</h4>
            <p className="text-sm text-muted-foreground">{priority.description}</p>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Flow Timeline Bar (A → B → C)
 */
function FlowTimelineBar({ timingLeaks }: { timingLeaks: any[] }) {
  // Find the worst leak (red > yellow > green)
  const worstLeak = timingLeaks.reduce((worst, leak) => {
    if (leak.color === 'red') return leak;
    if (leak.color === 'yellow' && worst.color !== 'red') return leak;
    return worst;
  }, timingLeaks[0]);

  return (
    <Card className="bg-barrels-black-light border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-barrels-gold" />
          Flow Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Timeline Bar */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-700" />
          
          {/* Nodes */}
          <div className="relative flex justify-between px-4">
            {timingLeaks.map((leak, index) => (
              <div key={leak.phase} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ring-4 ${
                    leak.color === 'green'
                      ? 'ring-emerald-500/30 bg-emerald-500/20 text-emerald-500'
                      : leak.color === 'yellow'
                      ? 'ring-yellow-500/30 bg-yellow-500/20 text-yellow-500'
                      : 'ring-red-500/30 bg-red-500/20 text-red-500'
                  }`}
                >
                  {leak.phase}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{leak.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Summary */}
        <div className="mt-6 p-4 bg-barrels-black rounded-lg border border-gray-800">
          <p className="text-sm text-muted-foreground">
            <span className="text-white font-medium">Flow Issue: </span>
            {worstLeak.issueSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Metric Cards Grid
 */
function MetricCardsGrid({
  strengths,
  watchItems,
  priority,
  drills,
  onMetricClick,
}: {
  strengths: any[]
  watchItems: any[]
  priority: any
  drills: any[]
  onMetricClick: (metric: any) => void
}) {
  // Combine all metrics with status
  const allMetrics = [
    ...strengths.map((m) => ({ ...m, status: 'strength' })),
    ...watchItems.map((m) => ({ ...m, status: 'watch' })),
    { ...priority, status: 'priority' },
  ];

  // Group by category
  const powerMetrics = allMetrics.filter((m) => m.category === 'power');
  const flowMetrics = allMetrics.filter((m) => m.category === 'flow');
  const contactMetrics = allMetrics.filter((m) => m.category === 'contact');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Detailed Breakdown</h2>
      
      {/* POWER Category */}
      {powerMetrics.length > 0 && (
        <MetricCategorySection
          title="POWER"
          icon={<Zap className="w-5 h-5" />}
          metrics={powerMetrics}
          onMetricClick={onMetricClick}
        />
      )}

      {/* FLOW Category */}
      {flowMetrics.length > 0 && (
        <MetricCategorySection
          title="FLOW"
          icon={<Activity className="w-5 h-5" />}
          metrics={flowMetrics}
          onMetricClick={onMetricClick}
        />
      )}

      {/* CONTACT Category */}
      {contactMetrics.length > 0 && (
        <MetricCategorySection
          title="CONTACT"
          icon={<Target className="w-5 h-5" />}
          metrics={contactMetrics}
          onMetricClick={onMetricClick}
        />
      )}
    </div>
  )
}

function MetricCategorySection({
  title,
  icon,
  metrics,
  onMetricClick,
}: {
  title: string
  icon: React.ReactNode
  metrics: any[]
  onMetricClick: (metric: any) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-barrels-gold">{icon}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onMetricClick(metric)}
            className="cursor-pointer"
          >
            <Card className="bg-barrels-black-light border-gray-800 hover:border-barrels-gold/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          metric.status === 'strength'
                            ? 'border-emerald-500 text-emerald-500'
                            : metric.status === 'watch'
                            ? 'border-yellow-500 text-yellow-500'
                            : 'border-red-500 text-red-500'
                        }`}
                      >
                        {metric.category.toUpperCase()}
                      </Badge>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          metric.status === 'strength'
                            ? 'bg-emerald-500'
                            : metric.status === 'watch'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <h4 className="text-white font-medium mb-1">{metric.title}</h4>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/**
 * Next 30 Days Plan
 */
function Next30DaysPlan({ plan, membershipInfo }: { plan: any; membershipInfo: any }) {
  const currentTier = membershipInfo.tier;
  const needsUpgrade = plan.recommendedTier !== currentTier && 
    ((plan.recommendedTier === 'pro' && currentTier === 'athlete') ||
     (plan.recommendedTier === 'elite' && (currentTier === 'athlete' || currentTier === 'pro')));

  return (
    <Card className="bg-gradient-to-br from-barrels-gold/10 via-barrels-black-light to-barrels-black-light border-barrels-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-barrels-gold">
          <TrendingUp className="w-5 h-5" />
          Next 30 Days - Game Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sessions per week */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Recommended Frequency</p>
          <p className="text-lg font-bold text-white">
            {plan.sessionsPerWeek} sessions per week
          </p>
        </div>

        {/* Recommended tier */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Recommended Tier</p>
          <Badge
            variant="outline"
            className={`text-sm ${
              plan.recommendedTier === 'elite'
                ? 'border-purple-500 text-purple-500'
                : plan.recommendedTier === 'pro'
                ? 'border-barrels-gold text-barrels-gold'
                : 'border-blue-500 text-blue-500'
            }`}
          >
            {plan.recommendedTier.toUpperCase()}
          </Badge>
        </div>

        {/* Focus bullets */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Your Focus Areas</p>
          <ul className="space-y-2">
            {plan.focusBullets.map((bullet: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2"
              >
                <span className="text-barrels-gold mt-0.5">•</span>
                <span className="text-sm text-white">{bullet}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-gray-800">
          {needsUpgrade ? (
            <Link href="https://whop.com/barrels-pro/" target="_blank" rel="noopener noreferrer">
              <BarrelsButton variant="primary" className="w-full">
                Upgrade to {plan.recommendedTier.charAt(0).toUpperCase() + plan.recommendedTier.slice(1)}
              </BarrelsButton>
            </Link>
          ) : (
            <Link href="/video/upload">
              <BarrelsButton variant="primary" className="w-full">
                Book Your Next Session
              </BarrelsButton>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Metric Detail Drawer (modal for clicking metric cards)
 */
function MetricDetailDrawer({
  metric,
  isOpen,
  onClose,
  drills,
}: {
  metric: any
  isOpen: boolean
  onClose: () => void
  drills: any[]
}) {
  if (!metric) return null;

  // Filter drills by category
  const relatedDrills = drills.filter((drill) => drill.primaryCategory === metric.category).slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-barrels-black-light border-t border-gray-800 rounded-t-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        metric.status === 'strength'
                          ? 'border-emerald-500 text-emerald-500'
                          : metric.status === 'watch'
                          ? 'border-yellow-500 text-yellow-500'
                          : 'border-red-500 text-red-500'
                      }`}
                    >
                      {metric.category.toUpperCase()} - {metric.status === 'strength' ? 'GREEN' : metric.status === 'watch' ? 'YELLOW' : 'RED'}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{metric.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{metric.description}</p>

              {/* What it means */}
              <div className="p-4 bg-barrels-black rounded-lg border border-gray-800">
                <h4 className="text-sm font-bold text-white mb-2">What This Means</h4>
                <p className="text-sm text-muted-foreground">
                  {metric.status === 'strength'
                    ? `This is a major strength in your swing. Keep doing what you're doing and maintain this level of performance.`
                    : metric.status === 'watch'
                    ? `This area is decent but has room for improvement. Focus on consistency and refinement.`
                    : `This is your biggest opportunity for improvement. Prioritize drills and coaching in this area.`}
                </p>
              </div>

              {/* Related Drills */}
              {relatedDrills.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3">Recommended Drills</h4>
                  <div className="space-y-2">
                    {relatedDrills.map((drill, index) => (
                      <Link key={drill.id} href={`/drills/${drill.id}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 bg-barrels-black rounded-lg border border-gray-800 hover:border-barrels-gold/30 transition-colors flex items-center justify-between"
                        >
                          <span className="text-sm text-white font-medium">{drill.title}</span>
                          <ChevronRight className="w-4 h-4 text-barrels-gold" />
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Close button */}
              <BarrelsButton variant="secondary" onClick={onClose} className="w-full">
                Close
              </BarrelsButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
