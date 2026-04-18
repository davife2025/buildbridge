interface ProfileAvatarProps { name:string|null; publicKey:string; avatarUrl?:string|null; size?:'sm'|'md'|'lg'|'xl'; }
const sizes={sm:'h-8 w-8 text-xs',md:'h-12 w-12 text-sm',lg:'h-16 w-16 text-xl',xl:'h-24 w-24 text-3xl'};
const PALETTES=[{bg:'#ECFDF9',text:'#00927C'},{bg:'#F3E8FF',text:'#7C3AED'},{bg:'#FEF9C3',text:'#A16207'},{bg:'#DBEAFE',text:'#1D4ED8'},{bg:'#FCE7F3',text:'#BE185D'}];
// Dark mode palettes
const DARK_PALETTES=[{bg:'rgba(0,194,168,0.15)',text:'#00C2A8'},{bg:'rgba(139,92,246,0.15)',text:'#A78BFA'},{bg:'rgba(245,158,11,0.15)',text:'#FCD34D'},{bg:'rgba(59,130,246,0.15)',text:'#93C5FD'},{bg:'rgba(236,72,153,0.15)',text:'#F9A8D4'}];

function getInitials(name:string|null,publicKey:string){
  if(name) return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return publicKey.slice(0,2).toUpperCase();
}

export function ProfileAvatar({name,publicKey,avatarUrl,size='md'}:ProfileAvatarProps) {
  const initials=getInitials(name,publicKey);
  const idx=publicKey.charCodeAt(0)%PALETTES.length;
  const light=PALETTES[idx]!;
  const dark=DARK_PALETTES[idx]!;

  if(avatarUrl) return <img src={avatarUrl} alt={name??publicKey} className={`${sizes[size]} rounded-full border border-gray-200 dark:border-[#1E3050] object-cover shadow-sm`}/>;

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full border border-white dark:border-[#1E3050] font-bold shadow-sm`}
      style={{background:light.bg,color:light.text}}
    >
      {initials}
    </div>
  );
}
