import Avatar from 'boring-avatars';

import { createAvatar } from '@dicebear/core';
import { thumbs, shapes, pixelArt, glass } from '@dicebear/collection';

interface UserAvatarProps {
  name: string;
  variant ?: string;
  className ?: string;
}

export default function UserAvatar({ name, variant, className }: UserAvatarProps) {
  return (
    <Avatar
      size={64}
      name={name}
      // variant={variant ? variant : "beam"}
      // className={className}
      colors={['#F97316', '#A855F7', '#F59E0B', '#6366F1', '#EC4899']}
    />
  );
}

export function AccountAvatar({ seed, className }: { seed: string, className: string }) {
  const avatar = createAvatar(thumbs, { seed });
  const svg = avatar.toString();
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <img
      src={dataUri}
      alt="avatar"
      className={`w-10 rounded-full border border-gray-200 ${className}`}
    />
  );
}

export function ProjectAvatar({ seed }: { seed: string }) {
  const avatar = createAvatar(shapes, { seed });
  const svg = avatar.toString();
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <img
      src={dataUri}
      alt="avatar"
      className="w-8 rounded-full"
    />
  );
}

export function ProfileAvatar({ seed }: { seed: string }) {
  const avatar = createAvatar(glass, { seed, backgroundColor: ["0000ff"], radius: 50 });
  const svg = avatar.toString();
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    <img
      src={dataUri}
      alt="avatar"
      className="w-6 rounded-full"
    />
  );
}
