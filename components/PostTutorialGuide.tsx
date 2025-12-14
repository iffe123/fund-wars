import React, { useState, memo } from 'react';

interface PostTutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const PostTutorialGuide: React.FC<PostTutorialGuideProps> = memo(({ isOpen, onClose, onContinue }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "IOI Submitted Successfully",
      icon: "fa-check-circle",
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-950/50",
      content: (
        <>
          <p className="text-slate-300 mb-4">
            You've submitted an <span className="text-emerald-400 font-bold">Indication of Interest</span> for PackFancy Inc.
            This signals to the seller you're serious about acquiring the company.
          </p>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-amber-400 text-sm italic">
              "An IOI is like asking someone to prom. The CIM is their dating profile.
              Now comes the awkward dance of due diligence and negotiation."
            </p>
            <p className="text-slate-500 text-xs mt-1">— Machiavelli</p>
          </div>
        </>
      ),
    },
    {
      title: "Choose Your Deal Structure",
      icon: "fa-sitemap",
      iconColor: "text-purple-400",
      bgColor: "bg-purple-950/50",
      content: (
        <>
          <p className="text-slate-300 mb-4">
            Now you need to decide <span className="text-purple-400 font-bold">how</span> to structure the acquisition.
            Each approach has different risk/reward profiles:
          </p>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-purple-900/30 border border-purple-700/30 rounded">
              <span className="text-purple-400 font-bold">LBO (Leveraged Buyout)</span>
              <p className="text-slate-400 text-xs mt-1">High debt, high control. Classic PE play. You're betting you can cut costs and pay down debt.</p>
            </div>
            <div className="p-2 bg-emerald-900/30 border border-emerald-700/30 rounded">
              <span className="text-emerald-400 font-bold">Growth Equity</span>
              <p className="text-slate-400 text-xs mt-1">Minority stake, focus on growth. Less control but less debt. Bet on the founder.</p>
            </div>
            <div className="p-2 bg-blue-900/30 border border-blue-700/30 rounded">
              <span className="text-blue-400 font-bold">Venture Capital</span>
              <p className="text-slate-400 text-xs mt-1">Equity only, moonshot bet. 90% fail, 10% become unicorns. Pure optimism.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Game Tips",
      icon: "fa-lightbulb",
      iconColor: "text-amber-400",
      bgColor: "bg-amber-950/50",
      content: (
        <>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                <i className="fas fa-bolt text-cyan-400 text-sm"></i>
              </div>
              <div>
                <p className="text-cyan-400 font-bold text-sm">Action Points (AP)</p>
                <p className="text-slate-400 text-xs">You have 2 AP per week. Everything costs AP. Choose wisely.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <i className="fas fa-user-secret text-purple-400 text-sm"></i>
              </div>
              <div>
                <p className="text-purple-400 font-bold text-sm">Ask Machiavelli</p>
                <p className="text-slate-400 text-xs">Your AI advisor gives cynical but useful advice. Hover on choices to see his take.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <i className="fas fa-balance-scale text-amber-400 text-sm"></i>
              </div>
              <div>
                <p className="text-amber-400 font-bold text-sm">Ethics Matter</p>
                <p className="text-slate-400 text-xs">Your ethics stat affects available scenarios. Too low = SEC investigation. Too high = missed opportunities.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <i className="fas fa-heart-pulse text-red-400 text-sm"></i>
              </div>
              <div>
                <p className="text-red-400 font-bold text-sm">Watch Your Health</p>
                <p className="text-slate-400 text-xs">High stress + low energy = bad decisions. Take breaks or risk cardiac events.</p>
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onContinue();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className={`p-4 ${currentStep.bgColor} border-b border-slate-700/50`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-900/50 flex items-center justify-center">
              <i className={`fas ${currentStep.icon} ${currentStep.iconColor} text-xl`}></i>
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                Step {step + 1} of {steps.length}
              </div>
              <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
            >
              <i className="fas fa-times text-slate-400 hover:text-white"></i>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep.content}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 flex justify-between items-center">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              Skip Guide
            </button>
          )}

          <button
            onClick={handleNext}
            className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
              isLastStep
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white'
            }`}
          >
            {isLastStep ? (
              <>
                <i className="fas fa-play"></i>
                Start Deal Structuring
              </>
            ) : (
              <>
                Continue
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

PostTutorialGuide.displayName = 'PostTutorialGuide';

export default PostTutorialGuide;
