import type { Member } from '@/types/members';

export default function MemberAvatar({ member, className = 'h-12 w-12 text-lg' }: { member: Member; className?: string }) {
  if (member.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa livre, sem remotePatterns
      <img src={member.photoUrl} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-start to-blue-end font-bold text-white ${className}`}
    >
      {member.name.charAt(0).toUpperCase()}
    </span>
  );
}
