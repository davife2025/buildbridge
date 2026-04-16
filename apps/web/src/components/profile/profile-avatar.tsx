interface ProfileAvatarProps {
  name: string | null;
  publicKey: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

function getInitials(name: string | null, publicKey: string): string {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  return publicKey.slice(0, 2).toUpperCase();
}

function getColor(publicKey: string): string {
  const colors = [
    'bg-brand-400/20 text-brand-400',
    'bg-purple-500/20 text-purple-400',
    'bg-amber-500/20 text-amber-400',
    'bg-blue-500/20 text-blue-400',
    'bg-pink-500/20 text-pink-400',
  ];
  const idx = publicKey.charCodeAt(0) % colors.length;
  return colors[idx]!;
}

export function ProfileAvatar({ name, publicKey, avatarUrl, size = 'md' }: ProfileAvatarProps) {
  const initials = getInitials(name, publicKey);
  const color = getColor(publicKey);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? publicKey}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${color} flex shrink-0 items-center justify-center rounded-full font-semibold`}
    >
      {initials}
    </div>
  );
}
