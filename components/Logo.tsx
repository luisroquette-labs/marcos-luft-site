import { BASE } from '@/app/base';
import { person } from '@/app/content';

export default function Logo() {
  return (
    <img
      src={`${BASE}/logo-primary.svg`}
      alt={person.name}
      loading="eager"
    />
  );
}
