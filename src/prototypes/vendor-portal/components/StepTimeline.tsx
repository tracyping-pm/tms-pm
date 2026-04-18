import React from 'react';

interface Props {
  steps: string[];
  current: number;
}

function StepTimeline({ steps, current }: Props) {
  return (
    <div className="step-timeline">
      {steps.map((label, idx) => {
        const state: 'done' | 'current' | 'todo' =
          idx < current ? 'done' : idx === current ? 'current' : 'todo';
        return (
          <React.Fragment key={label}>
            <div className="step-timeline-node">
              <div className={`step-timeline-dot ${state}`}>
                {state === 'done' ? '✓' : idx + 1}
              </div>
              <div className={`step-timeline-label ${state}`}>{label}</div>
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-timeline-line ${idx < current ? 'done' : 'todo'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepTimeline;
