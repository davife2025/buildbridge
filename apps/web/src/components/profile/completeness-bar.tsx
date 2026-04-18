interface CompletenessBarProps { score: number }
const TIPS=[{threshold:15,tip:'Add your name'},{threshold:30,tip:'Write a bio'},{threshold:40,tip:'Add your location'},{threshold:50,tip:'Upload a photo'},{threshold:60,tip:'Add social links'},{threshold:70,tip:'Add your website'},{threshold:90,tip:'Complete a pitch'},{threshold:100,tip:'Record a milestone on-chain'}];
function getNextTip(score:number){return TIPS.find(t=>score<t.threshold)?.tip??null;}

export function CompletenessBar({score}:CompletenessBarProps) {
  const color=score>=80?'#00C2A8':score>=50?'#F59E0B':'#8B5CF6';
  const nextTip=getNextTip(score);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Profile completeness</h3>
        <span className="text-sm font-extrabold" style={{color}}>{score}%</span>
      </div>
      <div className="progress-track mb-3">
        <div className="progress-fill" style={{width:`${score}%`,backgroundColor:color}} />
      </div>
      {nextTip&&<p className="text-xs text-gray-400 dark:text-gray-500">Next: <span className="font-semibold text-gray-600 dark:text-gray-300">{nextTip}</span></p>}
      {score===100&&<p className="text-xs font-semibold" style={{color:'#00927C'}}>✓ Profile complete — you&apos;re investor-ready!</p>}
    </div>
  );
}
